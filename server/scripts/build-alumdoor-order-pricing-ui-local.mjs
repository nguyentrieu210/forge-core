#!/usr/bin/env node
/**
 * Follow-up UI patch for order-level Pricing Rule configuration.
 * Run after build-alumdoor-pricing-rule-ui-local.mjs. Safe to rerun.
 */
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const [tenantArg, outputArg] = process.argv.slice(2);
if (!tenantArg || !outputArg) throw new Error("usage: node build-alumdoor-order-pricing-ui-local.mjs <tenant> <output.sql>");
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const json = (value) => `json(${quote(JSON.stringify(value))})`;
const tenant = quote(tenantArg);
const now = quote(new Date().toISOString());
const sql = ["-- Alumdoor order-level Pricing Rule UI. Run after the base Pricing Rule UI patch."];

const fields = [
  { fieldname: "rule_level", label: "Cấp áp dụng", fieldtype: "Select", options: "LINE\nORDER", default: "LINE", in_standard_filter: true },
  { fieldname: "aggregate_function", label: "Cách tổng hợp", fieldtype: "Select", options: "SUM", default: "SUM", depends_on: 'eval:doc.rule_level == "ORDER"' },
  { fieldname: "aggregate_field", label: "Trường cần cộng", fieldtype: "Select", options: "billable_area_sqm\nset_count\nlength_m\npriced_qty", depends_on: 'eval:doc.rule_level == "ORDER"' },
  { fieldname: "aggregate_operator", label: "Điều kiện tổng", fieldtype: "Select", options: "lt\nlte\ngt\ngte\neq\nneq", depends_on: 'eval:doc.rule_level == "ORDER"' },
  { fieldname: "aggregate_value", label: "Ngưỡng", fieldtype: "Float", non_negative: true, depends_on: 'eval:doc.rule_level == "ORDER"' },
];
for (const field of fields) {
  sql.push(`UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',${json(field)}),revision=revision+1,modified_by='codex-local',modified_at=${now}
WHERE tenant_id=${tenant} AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')=${quote(field.fieldname)});`);
}

sql.push(`UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,
  '$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='effect_type' LIMIT 1) || '].options',
  'RATE_OVERRIDE\nDISCOUNT_PERCENT\nDISCOUNT_AMOUNT\nADJUSTMENT\nORDER_ADJUSTMENT')
WHERE tenant_id=${tenant} AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='effect_type');`);

const policy = {
  list: { enabled: true, columns: ["title", "rule_level", "effect_type", "price_list", "pricing_scope", "valid_upto", "disabled"] },
  form: {
    enabled: true,
    fields: ["title", "rule_level", "effect_type", "price_list", "pricing_scope", "party", "customer_group", "valid_from", "valid_upto", "aggregate_function", "aggregate_field", "aggregate_operator", "aggregate_value", "rate", "discount_percentage", "discount_amount", "adjustment_basis", "adjustment_rate", "conditions", "exclusive_group", "disabled"],
  },
  quickEntry: { enabled: false, fields: ["title", "rule_level", "effect_type"] },
  kanban: { enabled: false }, calendar: { enabled: false }, gantt: { enabled: false }, chart: { enabled: false },
};
sql.push(`UPDATE doctype_definitions
SET revision=revision+1,metadata_json=json_set(metadata_json,'$.viewPolicy',${json(policy)}),modified_by='codex-local',modified_at=${now}
WHERE tenant_id=${tenant} AND doctype='Pricing Rule' AND json_valid(metadata_json);`);
sql.push(`UPDATE doctype_definitions SET metadata_json=json_set(metadata_json,'$.revision',revision)
WHERE tenant_id=${tenant} AND doctype='Pricing Rule' AND json_valid(metadata_json);`);

for (const [source, translated] of Object.entries({
  LINE: "Dòng hàng", ORDER: "Toàn đơn", ORDER_ADJUSTMENT: "Phụ thu toàn đơn", SUM: "Cộng tổng",
  billable_area_sqm: "Diện tích tính tiền (m²)", set_count: "Số bộ", length_m: "Chiều dài (m)", priced_qty: "Số lượng tính giá",
  lt: "Nhỏ hơn", lte: "Nhỏ hơn hoặc bằng", gt: "Lớn hơn", gte: "Lớn hơn hoặc bằng", eq: "Bằng", neq: "Khác",
})) {
  sql.push(`INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES(${tenant},'vi',${quote(source)},${quote(translated)},'',${now})
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET translated_text=excluded.translated_text,modified_at=excluded.modified_at;`);
}

await writeFile(resolve(outputArg), `${sql.join("\n\n")}\n`, "utf8");
console.log(JSON.stringify({ tenant: tenantArg, doctype: "Pricing Rule", fields: fields.map((field) => field.fieldname), output: resolve(outputArg) }));
