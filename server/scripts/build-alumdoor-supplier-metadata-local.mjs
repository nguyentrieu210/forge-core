#!/usr/bin/env node
/** Build a bounded local-D1 metadata patch for the Alumdoor Supplier form. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { compileBrief } from "./lib/compile-brief.mjs";

const [briefArg, tenantArg, outputArg] = process.argv.slice(2);
if (!briefArg || !tenantArg || !outputArg) {
  throw new Error(
    "usage: node build-alumdoor-supplier-metadata-local.mjs <brief.json> <tenant> <output.sql>",
  );
}

const manifest = compileBrief(JSON.parse(await readFile(resolve(briefArg), "utf8")));
if (manifest.id !== "alumdoor") {
  throw new Error(`Expected alumdoor, received ${manifest.id}`);
}

const supplier = manifest.doctypes.find((entry) => entry.name === "Supplier");
if (!supplier) throw new Error("Missing DocType Supplier");
if (supplier.fields.some((field) => field.fieldname === "account_manager")) {
  throw new Error("Supplier.account_manager must not remain on the simplified form");
}

const sqlString = (value) => `'${String(value).replaceAll("'", "''")}'`;
const tenant = sqlString(tenantArg);
const doctype = sqlString(supplier.name);
const now = sqlString(new Date().toISOString());
const nextRevision = `COALESCE((SELECT revision + 1 FROM doctype_definitions WHERE tenant_id=${tenant} AND doctype=${doctype}), 1)`;

const statement = `INSERT INTO doctype_definitions(
  tenant_id,doctype,module,is_custom,is_submittable,is_child,revision,
  metadata_json,disabled,modified_by,modified_at
)
VALUES(
  ${tenant},${doctype},${sqlString(supplier.module)},
  ${supplier.custom ? 1 : 0},${supplier.is_submittable ? 1 : 0},${supplier.is_child ? 1 : 0},
  ${nextRevision},
  json_set(json(${sqlString(JSON.stringify(supplier))}),'$.revision',${nextRevision}),
  0,'codex-local',${now}
)
ON CONFLICT(tenant_id,doctype) DO UPDATE SET
  module=excluded.module,
  is_custom=excluded.is_custom,
  is_submittable=excluded.is_submittable,
  is_child=excluded.is_child,
  revision=excluded.revision,
  metadata_json=excluded.metadata_json,
  disabled=0,
  modified_by=excluded.modified_by,
  modified_at=excluded.modified_at;`;

await writeFile(resolve(outputArg), `${statement}\n`, "utf8");
console.log(JSON.stringify({
  app: `${manifest.id}@${manifest.version}`,
  tenant: tenantArg,
  doctype: supplier.name,
  fields: supplier.fields.map((field) => field.fieldname),
  output: resolve(outputArg),
}));
