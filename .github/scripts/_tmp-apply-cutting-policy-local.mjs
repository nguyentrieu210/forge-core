import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';

const preview = String.raw`C:\alumdoor-hardcode-preview`;
const local = String.raw`C:\alumdoor`;
const expectedHead = 'f1677d988fe5e90c9de88ce49c0fae09496543b7';
const dbPath = String.raw`C:\alumdoor\server\apps\tenant-worker\.wrangler\state\v3\d1\miniflare-D1DatabaseObject\0f70e06fc007ec84591c21ca1daaf09474ca2074a0d42ba21eb2a3fcdbb2cdf8.sqlite`;
const tenant = 'demo';
const appId = 'alumdoor';
const actor = 'admin';
const now = '2026-08-17T00:20:00.000+07:00';

const run = (file,args) => execFileSync(file,args,{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
run('git',['-C',preview,'fetch','origin','main']);
run('git',['-C',preview,'reset','--hard','origin/main']);
const head = run('git',['-C',preview,'rev-parse','HEAD']);
if (head !== expectedHead) throw new Error(`forge main drift: ${head}`);
if (!fs.existsSync(dbPath)) throw new Error(`D1 sqlite missing: ${dbPath}`);

const readBriefUrl = pathToFileURL(path.join(preview,'server','scripts','lib','read-brief-source.mjs')).href;
const compileUrl = pathToFileURL(path.join(preview,'server','scripts','lib','compile-brief.mjs')).href;
const parserCandidates = [
  path.join(local,'server','dist','packages','app-registry','src','manifest.js'),
  path.join(preview,'server','dist','packages','app-registry','src','manifest.js'),
];
const parserPath = parserCandidates.find(fs.existsSync);
if (!parserPath) throw new Error('manifest parser dist not found');
const parserUrl = pathToFileURL(parserPath).href;
const { readBriefSource } = await import(readBriefUrl);
const { compileBrief } = await import(compileUrl);
const { parseAppManifest } = await import(parserUrl);
const brief = await readBriefSource(path.join(preview,'server','briefs','alumdoor-v2.json'));
const packageValue = compileBrief(brief);
const manifest = parseAppManifest(packageValue);
if (manifest.id !== appId || manifest.version !== '2.4.0') throw new Error(`unexpected manifest ${manifest.id}@${manifest.version}`);

function sortValue(value) {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map(sortValue);
  if (typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) if (value[key] !== undefined) out[key] = sortValue(value[key]);
    return out;
  }
  return String(value);
}
const stableStringify = (value) => JSON.stringify(sortValue(value));
const sha256 = (text) => createHash('sha256').update(text).digest('hex');
const contentHash = sha256(stableStringify(packageValue));
const manifestJson = JSON.stringify(manifest);
const targetDoctypes = ['Cutting Policy','Cutting Policy Rule'];
const dtByName = new Map(manifest.doctypes.map((dt)=>[dt.name,dt]));
for (const name of targetDoctypes) if (!dtByName.has(name)) throw new Error(`manifest missing ${name}`);
const cpFixtures = manifest.fixtures.filter((f)=>f.record_type === 'Cutting Policy');
if (cpFixtures.length !== 8) throw new Error(`expected 8 Cutting Policy fixtures, got ${cpFixtures.length}`);
const active = cpFixtures.filter((f)=>!f.data?.disabled && String(f.name).endsWith('— công thức chuẩn'));
if (active.length !== 6) throw new Error(`expected 6 active canonical policies, got ${active.length}`);
const totalRules = active.reduce((n,f)=>n+(Array.isArray(f.data?.geometry_rules)?f.data.geometry_rules.length:0),0);
if (totalRules !== 18) throw new Error(`expected 18 geometry rules, got ${totalRules}`);

const db = new DatabaseSync(dbPath);
const all = (sql,...params) => db.prepare(sql).all(...params);
const first = (sql,...params) => db.prepare(sql).get(...params);
const stableRows = (rows) => rows.map((r)=>JSON.stringify(r)).join('\n');
const hashRows = (rows) => sha256(stableRows(rows));
function scopeHashes() {
  return {
    docs: hashRows(all(`SELECT doctype,name,payload_json,docstatus,status,version FROM documents WHERE tenant_id=? AND doctype NOT IN ('Cutting Policy','Cutting Policy Rule') ORDER BY doctype,name`,tenant)),
    masters: hashRows(all(`SELECT record_type,name,disabled,data_json,modified_at FROM master_records WHERE tenant_id=? AND record_type NOT IN ('Cutting Policy','Cutting Policy Rule') ORDER BY record_type,name`,tenant)),
    doctypes: hashRows(all(`SELECT doctype,module,is_custom,is_submittable,is_child,revision,metadata_json,disabled FROM doctype_definitions WHERE tenant_id=? AND doctype NOT IN ('Cutting Policy','Cutting Policy Rule') ORDER BY doctype`,tenant)),
    ownership: hashRows(all(`SELECT app_id,object_type,object_name,object_scope FROM app_objects WHERE tenant_id=? AND NOT (app_id=? AND object_name IN ('Cutting Policy','Cutting Policy Rule')) ORDER BY app_id,object_type,object_name,object_scope`,tenant,appId)),
    search: hashRows(all(`SELECT doctype,name,title,content,modified_at FROM document_search WHERE tenant_id=? AND doctype NOT IN ('Cutting Policy','Cutting Policy Rule') ORDER BY doctype,name`,tenant)),
  };
}
const before = scopeHashes();
const installed = first(`SELECT version FROM installed_apps WHERE tenant_id=? AND app_id=?`,tenant,appId);
if (!installed || installed.version !== '2.3.0') throw new Error(`local app must be 2.3.0 before migration, got ${installed?.version}`);
const preCpCount = first(`SELECT count(*) AS c FROM master_records WHERE tenant_id=? AND record_type='Cutting Policy'`,tenant).c;
if (Number(preCpCount) !== 8) throw new Error(`expected 8 existing Cutting Policy master records, got ${preCpCount}`);

const tx = db;
try {
  tx.exec('BEGIN IMMEDIATE');

  for (const name of targetDoctypes) {
    const dt = dtByName.get(name);
    const current = first(`SELECT revision FROM doctype_definitions WHERE tenant_id=? AND doctype=?`,tenant,name);
    const revision = Number(current?.revision ?? 0) + 1;
    const normalized = { ...dt, revision };
    tx.prepare(`INSERT INTO doctype_definitions(tenant_id,doctype,module,is_custom,is_submittable,is_child,revision,metadata_json,modified_by,modified_at)
      VALUES(?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(tenant_id,doctype) DO UPDATE SET module=excluded.module,is_custom=excluded.is_custom,is_submittable=excluded.is_submittable,is_child=excluded.is_child,revision=excluded.revision,metadata_json=excluded.metadata_json,disabled=0,modified_by=excluded.modified_by,modified_at=excluded.modified_at`)
      .run(tenant,name,dt.module,dt.custom?1:0,dt.is_submittable?1:0,dt.is_child?1:0,revision,JSON.stringify(normalized),actor,now);
    tx.prepare(`INSERT INTO app_objects(tenant_id,app_id,object_type,object_name,object_scope) VALUES(?,?,?,?,?) ON CONFLICT(tenant_id,app_id,object_type,object_name,object_scope) DO NOTHING`)
      .run(tenant,appId,'DocType',name,'');
  }

  const upsertFixture = tx.prepare(`INSERT INTO master_records(tenant_id,record_type,name,data_json,modified_at) VALUES(?,?,?,?,?)
    ON CONFLICT(tenant_id,record_type,name) DO UPDATE SET data_json=excluded.data_json,disabled=0,modified_at=excluded.modified_at`);
  for (const fixture of cpFixtures) upsertFixture.run(tenant,fixture.record_type,fixture.name,JSON.stringify(fixture.data),now);

  tx.prepare(`UPDATE installed_apps SET app_name=?,version=?,content_hash=?,manifest_json=?,modified_at=? WHERE tenant_id=? AND app_id=?`)
    .run(manifest.name,manifest.version,contentHash,manifestJson,now,tenant,appId);

  const during = scopeHashes();
  for (const key of Object.keys(before)) if (before[key] !== during[key]) throw new Error(`outside-scope hash changed inside transaction: ${key}`);

  const cpDt = JSON.parse(first(`SELECT metadata_json FROM doctype_definitions WHERE tenant_id=? AND doctype='Cutting Policy'`,tenant).metadata_json);
  const ruleDt = JSON.parse(first(`SELECT metadata_json FROM doctype_definitions WHERE tenant_id=? AND doctype='Cutting Policy Rule'`,tenant).metadata_json);
  const cpFields = new Map(cpDt.fields.map((f)=>[f.fieldname,f]));
  if (cpFields.get('geometry_profile')?.options !== 'Geometry Profile') throw new Error('Cutting Policy geometry_profile missing');
  if (cpFields.get('geometry_rules')?.options !== 'Cutting Policy Rule') throw new Error('Cutting Policy geometry_rules missing');
  if (!String(cpFields.get('ray_type')?.options ?? '').includes('Ray hộp/đơn U76')) throw new Error('Cutting Policy ray_type missing U76 option');
  const childFields = new Set(ruleDt.fields.map((f)=>f.fieldname));
  for (const field of ['rule_code','target_field','source_field','operator','operand_m','customer_group','ray_type','has_butterfly_bracket','priority','sequence','note']) if (!childFields.has(field)) throw new Error(`Cutting Policy Rule missing ${field}`);
  const ownCount = Number(first(`SELECT count(*) AS c FROM app_objects WHERE tenant_id=? AND app_id=? AND object_type='DocType' AND object_name IN ('Cutting Policy','Cutting Policy Rule')`,tenant,appId).c);
  if (ownCount !== 2) throw new Error(`Cutting Policy ownership count ${ownCount}`);

  const stored = all(`SELECT name,data_json FROM master_records WHERE tenant_id=? AND record_type='Cutting Policy' ORDER BY name`,tenant).map((r)=>({name:r.name,data:JSON.parse(r.data_json)}));
  if (stored.length !== 8) throw new Error(`stored Cutting Policy count ${stored.length}`);
  const storedActive = stored.filter((r)=>!r.data.disabled && r.name.endsWith('— công thức chuẩn'));
  if (storedActive.length !== 6) throw new Error(`stored active canonical count ${storedActive.length}`);
  const storedRules = storedActive.reduce((n,r)=>n+(Array.isArray(r.data.geometry_rules)?r.data.geometry_rules.length:0),0);
  if (storedRules !== 18) throw new Error(`stored geometry rule count ${storedRules}`);
  const legacy = stored.filter((r)=>['Cửa Đức — khách lẻ','Cửa Đức — đại lý'].includes(r.name));
  if (legacy.length !== 2 || legacy.some((r)=>r.data.disabled !== true)) throw new Error('legacy German policies must remain disabled in data_json');

  const byName = new Map(stored.map((r)=>[r.name,r.data]));
  const duc = byName.get('Cửa Đức — công thức chuẩn');
  if (duc.geometry_profile !== 'GP-CUA-DUC') throw new Error('German geometry profile mismatch');
  const dealer = duc.geometry_rules.find((r)=>r.rule_code==='DUC-RCL-DL');
  const retail = duc.geometry_rules.find((r)=>r.rule_code==='DUC-RCL-LE');
  if (dealer?.source_field!=='PB_NHUA_RONG' || dealer?.operand_m!==0.02 || dealer?.customer_group!=='Đại lý') throw new Error('German dealer formula mismatch');
  if (retail?.source_field!=='PB_RAY_RONG' || retail?.operand_m!==0.08 || retail?.customer_group!=='Lẻ') throw new Error('German retail formula mismatch');
  const tluc = byName.get('Cửa tấm liền Úc — công thức chuẩn');
  const tlRules = tluc.geometry_rules.filter((r)=>r.target_field==='CAT_LA_RONG');
  if (tlRules.length!==2 || tlRules.some((r)=>!r.ray_type)) throw new Error('Tấm liền Úc must have exactly two ray-conditioned width rules');
  const app = first(`SELECT version,content_hash,length(manifest_json) manifest_len FROM installed_apps WHERE tenant_id=? AND app_id=?`,tenant,appId);
  if (app.version!=='2.4.0' || app.content_hash!==contentHash) throw new Error('installed app metadata mismatch');

  tx.exec('COMMIT');
} catch (error) {
  try { tx.exec('ROLLBACK'); } catch {}
  throw error;
}

const after = scopeHashes();
for (const key of Object.keys(before)) if (before[key] !== after[key]) throw new Error(`outside-scope hash changed after commit: ${key}`);

// Converge local source only after the database transaction has passed all assertions.
const filesToCopy = [
  'server/apps-src/alumdoor-worker/src/geometry-policy.ts',
  'server/packages/frappe-api/src/vietnamese-enum-translations.ts',
  'server/briefs/alumdoor-v2.json',
  'server/briefs/alumdoor-v2.integrations.json',
  'server/scripts/build-alumdoor-v2-brief.mjs',
  'server/scripts/lib/alumdoor-cutting-policy-catalog.mjs',
];
for (const rel of filesToCopy) {
  const src = path.join(preview,...rel.split('/'));
  const dst = path.join(local,...rel.split('/'));
  fs.mkdirSync(path.dirname(dst),{recursive:true});
  fs.copyFileSync(src,dst);
  if (sha256(fs.readFileSync(src)) !== sha256(fs.readFileSync(dst))) throw new Error(`copy hash mismatch: ${rel}`);
}

function tcp(port,host) {
  return new Promise((resolve,reject)=>{
    const socket=net.createConnection({port,host});
    const timer=setTimeout(()=>{socket.destroy();reject(new Error(`timeout ${host}:${port}`));},5000);
    socket.once('connect',()=>{clearTimeout(timer);socket.destroy();resolve();});
    socket.once('error',(e)=>{clearTimeout(timer);reject(e);});
  });
}
await tcp(8799,'127.0.0.1');
await tcp(5173,'::1').catch(()=>tcp(5173,'127.0.0.1'));
const desk = await fetch('http://localhost:5173/');
if (!desk.ok) throw new Error(`Desk HTTP ${desk.status}`);

console.log('LOCAL_CUTTING_POLICY_APPLY_PASS');
console.log('FORGE_MAIN',head);
console.log('ALUMDOOR_VERSION','2.4.0');
console.log('CUTTING_POLICY_COUNT',8);
console.log('CANONICAL_POLICY_COUNT',6);
console.log('GEOMETRY_RULE_COUNT',18);
console.log('CONTENT_HASH',contentHash);
for (const [key,value] of Object.entries(after)) console.log(`HASH_${key.toUpperCase()}`,value);
console.log('LOCAL_8799_PASS');
console.log('LOCAL_5173_PASS');
