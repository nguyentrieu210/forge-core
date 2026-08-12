#!/usr/bin/env node
/**
 * Build a bounded local-D1 metadata patch for Alumdoor material tracking.
 *
 * This intentionally updates only the three DocTypes involved in separating
 * stock tracking from technical/cutting specifications. It does not change the
 * installed app version or package hash.
 */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { compileBrief } from "./lib/compile-brief.mjs";

const [briefArg, tenantArg, outputArg] = process.argv.slice(2);
if (!briefArg || !tenantArg || !outputArg) {
  throw new Error(
    "usage: node build-alumdoor-tracking-metadata-local.mjs <brief.json> <tenant> <output.sql>",
  );
}

const brief = JSON.parse(await readFile(resolve(briefArg), "utf8"));
const manifest = compileBrief(brief);
if (manifest.id !== "alumdoor") {
  throw new Error(`Expected alumdoor, received ${manifest.id}`);
}

const targetNames = [
  "Measurement Profile",
  "Material Specification",
  "Cutting Policy",
];
const targets = targetNames.map((name) => {
  const doctype = manifest.doctypes.find((entry) => entry.name === name);
  if (!doctype) throw new Error(`Missing DocType ${name}`);
  return doctype;
});

const sqlString = (value) => `'${String(value).replaceAll("'", "''")}'`;
const tenant = sqlString(tenantArg);
const now = sqlString(new Date().toISOString());

const statements = targets.map((doctype) => {
  const name = sqlString(doctype.name);
  const nextRevision = `COALESCE((SELECT revision + 1 FROM doctype_definitions WHERE tenant_id=${tenant} AND doctype=${name}), 1)`;
  return `INSERT INTO doctype_definitions(
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
  module=excluded.module,
  is_custom=excluded.is_custom,
  is_submittable=excluded.is_submittable,
  is_child=excluded.is_child,
  revision=excluded.revision,
  metadata_json=excluded.metadata_json,
  disabled=0,
  modified_by=excluded.modified_by,
  modified_at=excluded.modified_at;`;
});

await writeFile(resolve(outputArg), `${statements.join("\n\n")}\n`, "utf8");
console.log(JSON.stringify({
  app: `${manifest.id}@${manifest.version}`,
  tenant: tenantArg,
  doctypes: targetNames,
  output: resolve(outputArg),
}));
