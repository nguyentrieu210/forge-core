import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { DatabaseSync } from "node:sqlite";

const TENANT = "demo";
const APP = "alumdoor";
const TARGET_VERSION = "2.3.0";
const PREVIEW = "C:\\alumdoor-hardcode-preview";
const ACTIVE_SERVER = "C:\\alumdoor\\server";
const D1_ROOT = join(ACTIVE_SERVER, "apps", "tenant-worker", ".wrangler", "state", "v3", "d1");
const TARGET_DOCTYPES = new Set([
  "Item",
  "Measurement Profile",
  "Geometry Field",
  "Geometry Profile Scope",
  "Geometry Profile Field",
  "Geometry Profile",
]);
const TARGET_MASTER_TYPES = new Set(["Measurement Profile", "Geometry Field", "Geometry Profile"]);

function sortValue(value) {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map(sortValue);
  if (typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value).sort()) if (value[key] !== undefined) out[key] = sortValue(value[key]);
    return out;
  }
  return String(value);
}
const stableStringify = (value) => JSON.stringify(sortValue(value));
const sha256 = (value) => createHash("sha256").update(typeof value === "string" ? value : stableStringify(value)).digest("hex");

function walkSqlite(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkSqlite(full, out);
    else if (entry.isFile() && entry.name.endsWith(".sqlite")) out.push(full);
  }
  return out;
}

function findActiveDb() {
  const matches = [];
  for (const file of walkSqlite(D1_ROOT)) {
    let db;
    try {
      db = new DatabaseSync(file);
      const row = db.prepare("SELECT version FROM installed_apps WHERE tenant_id=? AND app_id=?").get(TENANT, APP);
      if (row) matches.push({ file, version: row.version, mtime: statSync(file).mtimeMs });
    } catch {
      // Not the tenant DB.
    } finally {
      try { db?.close(); } catch {}
    }
  }
  if (!matches.length) throw new Error("Không tìm thấy active D1 có installed app alumdoor/demo");
  matches.sort((a, b) => b.mtime - a.mtime);
  return matches[0];
}

function rowsHash(db, sql, ...params) {
  return sha256(db.prepare(sql).all(...params));
}

const briefPath = join(PREVIEW, "server", "briefs", "alumdoor-v2.json");
const compilerPath = join(PREVIEW, "server", "scripts", "lib", "compile-brief-app-factory.mjs");
const parserPath = join(ACTIVE_SERVER, "dist", "packages", "app-registry", "src", "manifest.js");
const brief = JSON.parse(readFileSync(briefPath, "utf8"));
if (brief.version !== TARGET_VERSION) throw new Error(`Preview brief version ${brief.version}, expected ${TARGET_VERSION}`);
const { compileBrief } = await import(`${pathToFileURL(compilerPath).href}?v=${Date.now()}`);
const pkg = compileBrief(brief);
const { parseAppManifest } = await import(`${pathToFileURL(parserPath).href}?v=${Date.now()}`);
const manifest = parseAppManifest(pkg);
if (manifest.version !== TARGET_VERSION) throw new Error(`Compiled manifest version ${manifest.version}, expected ${TARGET_VERSION}`);

const canonicalDoctypes = new Map(manifest.doctypes.map((dt) => [dt.name, dt]));
for (const name of TARGET_DOCTYPES) if (!canonicalDoctypes.has(name)) throw new Error(`Compiled manifest thiếu DocType ${name}`);
const canonicalFixtures = manifest.fixtures.filter((fx) => TARGET_MASTER_TYPES.has(fx.record_type));
const fixtureCounts = Object.fromEntries([...TARGET_MASTER_TYPES].map((type) => [type, canonicalFixtures.filter((fx) => fx.record_type === type).length]));
if (fixtureCounts["Measurement Profile"] !== 7 || fixtureCounts["Geometry Field"] !== 8 || fixtureCounts["Geometry Profile"] !== 5) {
  throw new Error(`Sai fixture counts: ${JSON.stringify(fixtureCounts)}`);
}

const { file: dbPath, version: detectedVersion } = findActiveDb();
const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys=ON");
const appRow = db.prepare("SELECT version,content_hash,manifest_json FROM installed_apps WHERE tenant_id=? AND app_id=?").get(TENANT, APP);
if (!appRow) throw new Error("Alumdoor chưa được cài trên demo");
if (!["2.2.5", TARGET_VERSION].includes(appRow.version)) throw new Error(`Version local ngoài precondition: ${appRow.version}`);

const unrelatedDocsBefore = rowsHash(db, `SELECT doctype,name,payload_json FROM documents WHERE tenant_id=? AND doctype NOT IN ('Measurement Profile','Geometry Field','Geometry Profile') ORDER BY doctype,name`, TENANT);
const unrelatedMetaBefore = rowsHash(db, `SELECT doctype,revision,metadata_json,disabled FROM doctype_definitions WHERE tenant_id=? AND doctype NOT IN ('Item','Measurement Profile','Geometry Field','Geometry Profile Scope','Geometry Profile Field','Geometry Profile') ORDER BY doctype`, TENANT);
const unrelatedMasterBefore = rowsHash(db, `SELECT record_type,name,data_json,disabled FROM master_records WHERE tenant_id=? AND record_type NOT IN ('Measurement Profile','Geometry Field','Geometry Profile') ORDER BY record_type,name`, TENANT);

const canonicalMeasurementNames = new Set(canonicalFixtures.filter((fx) => fx.record_type === "Measurement Profile").map((fx) => fx.name));
const currentMeasurementNames = db.prepare("SELECT name FROM documents WHERE tenant_id=? AND doctype='Measurement Profile' ORDER BY name").all(TENANT).map((row) => row.name);
const unexpectedProfiles = currentMeasurementNames.filter((name) => !canonicalMeasurementNames.has(name) && name !== "d");
if (unexpectedProfiles.length) throw new Error(`Có Measurement Profile ngoài canonical, không tự xóa: ${unexpectedProfiles.join(", ")}`);

const now = new Date().toISOString();
const contentHash = sha256(pkg);
let changed = false;
try {
  db.exec("BEGIN IMMEDIATE");

  if (appRow.version !== TARGET_VERSION) {
    for (const name of TARGET_DOCTYPES) {
      const doctype = canonicalDoctypes.get(name);
      const current = db.prepare("SELECT revision FROM doctype_definitions WHERE tenant_id=? AND doctype=?").get(TENANT, name);
      const revision = Number(current?.revision ?? 0) + 1;
      const normalized = { ...doctype, revision };
      db.prepare(`INSERT INTO doctype_definitions(
          tenant_id,doctype,module,is_custom,is_submittable,is_child,revision,metadata_json,modified_by,modified_at
        ) VALUES(?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(tenant_id,doctype) DO UPDATE SET
          module=excluded.module,is_custom=excluded.is_custom,is_submittable=excluded.is_submittable,
          is_child=excluded.is_child,revision=excluded.revision,metadata_json=excluded.metadata_json,
          disabled=0,modified_by=excluded.modified_by,modified_at=excluded.modified_at`)
        .run(TENANT, name, doctype.module, doctype.custom ? 1 : 0, doctype.is_submittable ? 1 : 0,
          doctype.is_child ? 1 : 0, revision, JSON.stringify(normalized), "admin", now);

      const owner = db.prepare("SELECT app_id FROM app_objects WHERE tenant_id=? AND object_type='DocType' AND object_scope='' AND object_name=?").get(TENANT, name);
      if (owner && owner.app_id !== APP) throw new Error(`DocType ${name} đang thuộc app ${owner.app_id}`);
      db.prepare(`INSERT INTO app_objects(tenant_id,app_id,object_type,object_name,object_scope)
                  VALUES(?,?,'DocType',?,'') ON CONFLICT(tenant_id,object_type,object_scope,object_name)
                  DO UPDATE SET app_id=excluded.app_id`).run(TENANT, APP, name);
    }

    db.prepare(`UPDATE installed_apps SET version=?,content_hash=?,manifest_json=?,modified_at=?
                WHERE tenant_id=? AND app_id=?`)
      .run(TARGET_VERSION, contentHash, JSON.stringify(manifest), now, TENANT, APP);
    changed = true;
  }

  for (const fixture of canonicalFixtures) {
    db.prepare(`INSERT INTO master_records(tenant_id,record_type,name,data_json,modified_at,disabled)
                VALUES(?,?,?,?,?,0)
                ON CONFLICT(tenant_id,record_type,name) DO UPDATE SET
                  data_json=excluded.data_json,disabled=0,modified_at=excluded.modified_at`)
      .run(TENANT, fixture.record_type, fixture.name, JSON.stringify(fixture.data), now);
    const owner = db.prepare("SELECT app_id FROM app_objects WHERE tenant_id=? AND object_type='Master Record' AND object_scope=? AND object_name=?")
      .get(TENANT, fixture.record_type, fixture.name);
    if (owner && owner.app_id !== APP) throw new Error(`${fixture.record_type}:${fixture.name} đang thuộc app ${owner.app_id}`);
    db.prepare(`INSERT INTO app_objects(tenant_id,app_id,object_type,object_name,object_scope)
                VALUES(?,?,'Master Record',?,?) ON CONFLICT(tenant_id,object_type,object_scope,object_name)
                DO UPDATE SET app_id=excluded.app_id`).run(TENANT, APP, fixture.name, fixture.record_type);

    const payload = JSON.stringify(fixture.data);
    db.prepare(`INSERT INTO documents
      (tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
      VALUES(?,?,?,?,?,0,'Draft',1,?,?,?,?)
      ON CONFLICT(tenant_id,doc_key) DO UPDATE SET
        payload_json=excluded.payload_json,modified_at=excluded.modified_at,modified_by=excluded.modified_by,
        version=documents.version+1
      WHERE documents.payload_json<>excluded.payload_json`)
      .run(TENANT, `${fixture.record_type}:${fixture.name}`, fixture.record_type, fixture.name, "admin", now, now, "admin", payload);
    db.prepare(`INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
                VALUES(?,?,?,?,?,?)
                ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET
                  title=excluded.title,content=excluded.content,modified_at=excluded.modified_at`)
      .run(TENANT, fixture.record_type, fixture.name, fixture.data.profile_name ?? fixture.data.field_name ?? fixture.data.profile_name ?? fixture.name,
        `${fixture.name} ${fixture.data.profile_name ?? ""} ${fixture.data.field_name ?? ""} ${fixture.data.profile_name ?? ""}`.trim(), now);
  }

  db.prepare("DELETE FROM document_search WHERE tenant_id=? AND doctype='Measurement Profile' AND name='d'").run(TENANT);
  db.prepare("DELETE FROM documents WHERE tenant_id=? AND doctype='Measurement Profile' AND name='d'").run(TENANT);

  const unrelatedDocsAfter = rowsHash(db, `SELECT doctype,name,payload_json FROM documents WHERE tenant_id=? AND doctype NOT IN ('Measurement Profile','Geometry Field','Geometry Profile') ORDER BY doctype,name`, TENANT);
  const unrelatedMetaAfter = rowsHash(db, `SELECT doctype,revision,metadata_json,disabled FROM doctype_definitions WHERE tenant_id=? AND doctype NOT IN ('Item','Measurement Profile','Geometry Field','Geometry Profile Scope','Geometry Profile Field','Geometry Profile') ORDER BY doctype`, TENANT);
  const unrelatedMasterAfter = rowsHash(db, `SELECT record_type,name,data_json,disabled FROM master_records WHERE tenant_id=? AND record_type NOT IN ('Measurement Profile','Geometry Field','Geometry Profile') ORDER BY record_type,name`, TENANT);
  if (unrelatedDocsBefore !== unrelatedDocsAfter) throw new Error("UNRELATED_DOCUMENTS_CHANGED");
  if (unrelatedMetaBefore !== unrelatedMetaAfter) throw new Error("UNRELATED_METADATA_CHANGED");
  if (unrelatedMasterBefore !== unrelatedMasterAfter) throw new Error("UNRELATED_MASTER_RECORDS_CHANGED");

  const counts = Object.fromEntries(db.prepare(`SELECT doctype,count(*) AS n FROM documents WHERE tenant_id=? AND doctype IN ('Measurement Profile','Geometry Field','Geometry Profile') GROUP BY doctype`).all(TENANT).map((row) => [row.doctype, row.n]));
  if (Number(counts["Measurement Profile"] ?? 0) !== 7 || Number(counts["Geometry Field"] ?? 0) !== 8 || Number(counts["Geometry Profile"] ?? 0) !== 5) throw new Error(`Sai document counts: ${JSON.stringify(counts)}`);
  const testGarbage = db.prepare("SELECT count(*) AS n FROM documents WHERE tenant_id=? AND doctype='Measurement Profile' AND name='d'").get(TENANT).n;
  if (Number(testGarbage) !== 0) throw new Error("Profile test d vẫn còn");
  const definitionCount = db.prepare(`SELECT count(*) AS n FROM doctype_definitions WHERE tenant_id=? AND doctype IN ('Measurement Profile','Geometry Field','Geometry Profile Scope','Geometry Profile Field','Geometry Profile','Item') AND disabled=0`).get(TENANT).n;
  if (Number(definitionCount) !== 6) throw new Error(`Thiếu target definitions: ${definitionCount}/6`);
  const brokenFields = db.prepare(`SELECT count(*) AS n FROM documents p, json_each(json_extract(p.payload_json,'$.fields')) f
    WHERE p.tenant_id=? AND p.doctype='Geometry Profile'
      AND NOT EXISTS(SELECT 1 FROM documents gf WHERE gf.tenant_id=p.tenant_id AND gf.doctype='Geometry Field' AND gf.name=json_extract(f.value,'$.geometry_field'))`).get(TENANT).n;
  if (Number(brokenFields) !== 0) throw new Error(`Geometry Profile có ${brokenFields} field link hỏng`);
  const versionNow = db.prepare("SELECT version FROM installed_apps WHERE tenant_id=? AND app_id=?").get(TENANT, APP).version;
  if (versionNow !== TARGET_VERSION) throw new Error(`Version sau migration = ${versionNow}`);

  db.exec("COMMIT");
  console.log(JSON.stringify({
    status: "PASS",
    dbPath,
    detectedVersion,
    version: versionNow,
    changed,
    counts,
    definitions: Number(definitionCount),
    brokenGeometryFieldLinks: Number(brokenFields),
    unrelatedDocsHash: unrelatedDocsAfter,
    unrelatedMetadataHash: unrelatedMetaAfter,
    unrelatedMasterRecordsHash: unrelatedMasterAfter,
    contentHash,
  }, null, 2));
} catch (error) {
  try { db.exec("ROLLBACK"); } catch {}
  throw error;
} finally {
  db.close();
}
