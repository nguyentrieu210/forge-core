#!/usr/bin/env node
/** Install the reusable scope catalogue used by Alumdoor Pricing Rules. */
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const [tenantArg, outputArg] = process.argv.slice(2);
if (!tenantArg || !outputArg) throw new Error("usage: node build-alumdoor-pricing-scope-ui-local.mjs <tenant> <output.sql>");

const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const json = (value) => `json(${quote(JSON.stringify(value))})`;
const tenant = quote(tenantArg);
const now = quote(new Date().toISOString());
const permissions = [
  { role: "System Manager", read: true, write: true, create: true, delete: true, report: true, export: true },
  { role: "Chủ xưởng", read: true, write: true, create: true, delete: true, report: true, export: true },
  { role: "Kinh doanh", read: true, report: true, export: true },
];

const pricingScopeMember = {
  name: "Pricing Scope Member", kind: "child_table", label: "Thành phần phạm vi", module: "Alumdoor",
  is_child: true, is_tree: false, is_single: false, is_submittable: false, track_changes: true,
  allow_rename: false, autoname: "autoincrement", title_field: "item_code",
  fields: [
    { fieldname: "member_type", label: "Áp dụng theo", fieldtype: "Select", options: "Item\nItem Group", default: "Item", required: true, in_list_view: true, surface: "quick", idx: 1 },
    { fieldname: "item_code", label: "Mặt hàng", fieldtype: "Link", options: "Item", depends_on: 'eval:doc.member_type == "Item"', link_filters: '{"disabled":0}', in_list_view: true, surface: "quick", idx: 2 },
    { fieldname: "item_group", label: "Nhóm hàng", fieldtype: "Link", options: "Item Group", depends_on: 'eval:doc.member_type == "Item Group"', link_filters: '{"is_group":0,"disabled":0}', in_list_view: true, surface: "quick", idx: 3 },
  ],
  viewPolicy: { list: { enabled: false, columns: ["member_type", "item_code", "item_group"] }, form: { enabled: false, fields: ["member_type", "item_code", "item_group"] }, quickEntry: { enabled: false, fields: [] }, kanban: { enabled: false }, calendar: { enabled: false }, gantt: { enabled: false }, chart: { enabled: false }, mobile: {} },
  permissions,
};

const pricingScope = {
  name: "Pricing Scope", label: "Phạm vi áp dụng chính sách", module: "Alumdoor",
  is_child: false, is_tree: false, is_single: false, is_submittable: false, track_changes: true,
  allow_rename: true, autoname: "field:scope_name", title_field: "scope_name",
  fields: [
    { fieldname: "scope_name", label: "Tên phạm vi", fieldtype: "Data", required: true, unique: true, in_list_view: true, in_standard_filter: true, search_index: true, surface: "quick", idx: 1 },
    { fieldname: "members", label: "Mặt hàng / nhóm hàng áp dụng", fieldtype: "Table", options: "Pricing Scope Member", required: true, surface: "quick", form_region: "full", description: "Thêm từng mặt hàng hoặc nhóm hàng được áp dụng cùng một chính sách.", idx: 2 },
    { fieldname: "disabled", label: "Ngừng dùng", fieldtype: "Check", default: false, in_list_view: true, in_standard_filter: true, surface: "expanded", idx: 3 },
  ],
  viewPolicy: { list: { enabled: true, columns: ["scope_name", "disabled"] }, form: { enabled: true, fields: ["scope_name", "members", "disabled"] }, quickEntry: { enabled: false, fields: ["scope_name"] }, kanban: { enabled: false }, calendar: { enabled: false }, gantt: { enabled: false }, chart: { enabled: false }, mobile: {} },
  permissions,
};

const sql = [
  "-- Alumdoor local reusable pricing scopes. Safe to rerun.",
  `INSERT INTO doctype_definitions(tenant_id,doctype,module,is_custom,is_submittable,is_child,revision,metadata_json,disabled,modified_by,modified_at)
VALUES(${tenant},'Pricing Scope Member','Alumdoor',1,0,1,1,${json(pricingScopeMember)},0,'codex-local',${now})
ON CONFLICT(tenant_id,doctype) DO UPDATE SET module=excluded.module,is_custom=excluded.is_custom,is_submittable=excluded.is_submittable,is_child=excluded.is_child,revision=doctype_definitions.revision+1,metadata_json=excluded.metadata_json,disabled=0,modified_by='codex-local',modified_at=${now};`,
  `INSERT INTO doctype_definitions(tenant_id,doctype,module,is_custom,is_submittable,is_child,revision,metadata_json,disabled,modified_by,modified_at)
VALUES(${tenant},'Pricing Scope','Alumdoor',1,0,0,1,${json(pricingScope)},0,'codex-local',${now})
ON CONFLICT(tenant_id,doctype) DO UPDATE SET module=excluded.module,is_custom=excluded.is_custom,is_submittable=excluded.is_submittable,is_child=excluded.is_child,revision=doctype_definitions.revision+1,metadata_json=excluded.metadata_json,disabled=0,modified_by='codex-local',modified_at=${now};`,
];

await writeFile(resolve(outputArg), `${sql.join("\n\n")}\n`, "utf8");
console.log(JSON.stringify({ tenant: tenantArg, doctypes: ["Pricing Scope", "Pricing Scope Member"], output: resolve(outputArg) }));
