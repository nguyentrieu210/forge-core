#!/usr/bin/env node
/** Build a bounded local-D1 patch so business forms select only leaf warehouses/groups. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { compileBrief } from "./lib/compile-brief.mjs";

const [briefArg, tenantArg, outputArg] = process.argv.slice(2);
if (!briefArg || !tenantArg || !outputArg) {
  throw new Error("usage: node build-alumdoor-leaf-link-metadata-local.mjs <brief.json> <tenant> <output.sql>");
}

const manifest = compileBrief(JSON.parse(await readFile(resolve(briefArg), "utf8")));
if (manifest.id !== "alumdoor") throw new Error(`Expected alumdoor, received ${manifest.id}`);

const targets = new Set(["Warehouse", "Item Group"]);
const parents = new Set(["parent_warehouse", "parent_item_group"]);
const leafFilters = JSON.stringify({ is_group: 0, disabled: 0 });
const isLeafLink = (field) => field.fieldtype === "Link"
  && targets.has(field.options)
  && !parents.has(field.fieldname);

const doctypes = manifest.doctypes.filter((doctype) => (doctype.fields ?? []).some(isLeafLink));
for (const doctype of doctypes) {
  for (const field of doctype.fields.filter(isLeafLink)) {
    if (field.link_filters !== leafFilters) throw new Error(`${doctype.name}.${field.fieldname} is missing the leaf filter`);
  }
}
const customFields = manifest.custom_fields.filter((entry) => isLeafLink(entry.field));

const sqlString = (value) => value == null ? "NULL" : `'${String(value).replaceAll("'", "''")}'`;
const tenant = sqlString(tenantArg);
const now = sqlString(new Date().toISOString());
const statements = [];

for (const doctype of doctypes) {
  const name = sqlString(doctype.name);
  const nextRevision = `COALESCE((SELECT revision + 1 FROM doctype_definitions WHERE tenant_id=${tenant} AND doctype=${name}), 1)`;
  statements.push(`INSERT INTO doctype_definitions(
  tenant_id,doctype,module,is_custom,is_submittable,is_child,revision,
  metadata_json,disabled,modified_by,modified_at
)
VALUES(
  ${tenant},${name},${sqlString(doctype.module)},
  ${doctype.custom ? 1 : 0},${doctype.is_submittable ? 1 : 0},${doctype.is_child ? 1 : 0},
  ${nextRevision},
  json_set(json(${sqlString(JSON.stringify(doctype))}),'$.revision',${nextRevision}),
  0,'codex-local',${now}
)
ON CONFLICT(tenant_id,doctype) DO UPDATE SET
  module=excluded.module,is_custom=excluded.is_custom,is_submittable=excluded.is_submittable,
  is_child=excluded.is_child,revision=excluded.revision,metadata_json=excluded.metadata_json,
  disabled=0,modified_by=excluded.modified_by,modified_at=excluded.modified_at;`);
}

for (const customField of customFields) {
  statements.push(`INSERT INTO custom_fields(
  tenant_id,name,dt,fieldname,metadata_json,insert_after,modified_by,modified_at
)
VALUES(
  ${tenant},${sqlString(customField.name)},${sqlString(customField.dt)},${sqlString(customField.fieldname)},
  ${sqlString(JSON.stringify(customField.field))},${sqlString(customField.insert_after)},'codex-local',${now}
)
ON CONFLICT(tenant_id,name) DO UPDATE SET
  dt=excluded.dt,fieldname=excluded.fieldname,metadata_json=excluded.metadata_json,
  insert_after=excluded.insert_after,modified_by=excluded.modified_by,modified_at=excluded.modified_at;`);
  statements.push(`INSERT INTO customization_revisions(tenant_id,doctype,revision,modified_at)
VALUES(${tenant},${sqlString(customField.dt)},1,${now})
ON CONFLICT(tenant_id,doctype) DO UPDATE SET revision=revision+1,modified_at=excluded.modified_at;`);
}

await writeFile(resolve(outputArg), `${statements.join("\n\n")}\n`, "utf8");
console.log(JSON.stringify({
  app: `${manifest.id}@${manifest.version}`,
  tenant: tenantArg,
  doctypes: doctypes.length,
  customFields: customFields.length,
  output: resolve(outputArg),
}));
