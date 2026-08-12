#!/usr/bin/env node
/**
 * Build a local-only operator UI patch for Pricing Rule.
 *
 * Pricing Rule remains the single server-side authority for price overrides,
 * discounts and surcharges. This script only exposes its already-supported
 * fields as a compact Vietnamese form and retires unpriced seed options.
 */
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const [tenantArg, outputArg] = process.argv.slice(2);
if (!tenantArg || !outputArg) {
  throw new Error("usage: node build-alumdoor-pricing-rule-ui-local.mjs <tenant> <output.sql>");
}

const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const json = (value) => `json(${quote(JSON.stringify(value))})`;
const sqlValue = (value) => typeof value === "boolean"
  ? (value ? "json('true')" : "json('false')")
  : typeof value === "number" ? String(value) : quote(value);
const tenant = quote(tenantArg);
const now = quote(new Date().toISOString());
const sql = ["-- Alumdoor local Pricing Rule operator UI. Safe to rerun."];

const appendField = (field) => {
  sql.push(`UPDATE doctype_definitions
SET metadata_json=json_insert(metadata_json,'$.fields[#]',${json(field)}),
    revision=revision+1,modified_by='codex-local',modified_at=${now}
WHERE tenant_id=${tenant} AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND NOT EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')=${quote(field.fieldname)});`);
};

[
  { fieldname: "pricing_scope", label: "Phạm vi áp dụng", fieldtype: "Link", options: "Pricing Scope" },
  { fieldname: "item_group", label: "Nhóm sản phẩm", fieldtype: "Link", options: "Item Group" },
  { fieldname: "currency", label: "Tiền tệ", fieldtype: "Link", options: "Currency" },
  { fieldname: "effect_type", label: "Loại áp dụng", fieldtype: "Select", options: "RATE_OVERRIDE\nDISCOUNT_PERCENT\nDISCOUNT_AMOUNT\nADJUSTMENT", default: "RATE_OVERRIDE", required: true },
  { fieldname: "discount_amount", label: "Số tiền giảm", fieldtype: "Currency", non_negative: true },
  { fieldname: "adjustment_basis", label: "Tính phụ thu theo", fieldtype: "Select", options: "FIXED\nPRICED_QTY\nAREA_SQM\nLENGTH_M\nSET_COUNT", default: "FIXED" },
  { fieldname: "adjustment_rate", label: "Đơn giá phụ thu", fieldtype: "Currency", non_negative: true },
  { fieldname: "exclusive_group", label: "Nhóm loại trừ", fieldtype: "Data" },
  { fieldname: "taxable", label: "Tính thuế", fieldtype: "Check", default: true },
  { fieldname: "discountable", label: "Được chiết khấu", fieldtype: "Check", default: false },
  { fieldname: "conditions", label: "Điều kiện bổ sung", fieldtype: "JSON" },
].forEach(appendField);

const patchFields = {
  title: { label: "Tên chính sách", surface: "quick" },
  effect_type: { label: "Loại áp dụng", default: "RATE_OVERRIDE", required: true, surface: "quick", description: "Chọn giá riêng, giảm giá hoặc phụ thu." },
  price_list: { label: "Chỉ áp cho bảng giá", surface: "quick" },
  pricing_scope: { label: "Phạm vi áp dụng", surface: "quick", description: "Chọn danh sách mặt hàng hoặc nhóm hàng đã khai báo ở Danh mục." },
  item_code: { label: "Mặt hàng riêng (cũ)", hidden: true, read_only: false, surface: "expanded" },
  item_group: { label: "Nhóm hàng riêng (cũ)", hidden: true, read_only: false, surface: "expanded" },
  party_type: { hidden: true, read_only: false, default: "Customer", surface: "expanded" },
  party: { label: "Chỉ áp cho khách hàng", surface: "expanded" },
  customer_group: { label: "Chỉ áp cho nhóm khách", surface: "expanded" },
  min_qty: { hidden: true, read_only: false, surface: "expanded" },
  max_qty: { hidden: true, read_only: false, surface: "expanded" },
  valid_from: { label: "Hiệu lực từ", surface: "expanded" },
  valid_upto: { label: "Hiệu lực đến", surface: "expanded" },
  rate: { label: "Giá riêng", depends_on: 'eval:doc.effect_type == "RATE_OVERRIDE"', surface: "expanded" },
  discount_percentage: { label: "Tỷ lệ giảm (%)", depends_on: 'eval:doc.effect_type == "DISCOUNT_PERCENT"', surface: "expanded" },
  discount_amount: { label: "Số tiền giảm", depends_on: 'eval:doc.effect_type == "DISCOUNT_AMOUNT"', surface: "expanded" },
  adjustment_basis: { label: "Tính phụ thu theo", depends_on: 'eval:doc.effect_type == "ADJUSTMENT"', surface: "expanded" },
  adjustment_rate: { label: "Đơn giá phụ thu", depends_on: 'eval:doc.effect_type == "ADJUSTMENT"', surface: "expanded", description: "Mức phụ thu cho mỗi đơn vị đã chọn." },
  conditions: { label: "Điều kiện bổ sung", hidden: false, surface: "expanded", form_region: "full", description: "Ví dụ: diện tích ≥ 10 m², màu = Vân gỗ." },
  exclusive_group: { label: "Nhóm loại trừ", depends_on: 'eval:doc.effect_type == "ADJUSTMENT"', surface: "expanded", description: "Các phụ thu cùng nhóm chỉ lấy luật ưu tiên nhất." },
  taxable: { hidden: true, read_only: false, default: true, surface: "expanded" },
  discountable: { hidden: true, read_only: false, default: false, surface: "expanded" },
  priority: { label: "Độ ưu tiên", read_only: false, default: 0, hidden: true, surface: "expanded" },
  disabled: { label: "Ngừng áp dụng", surface: "expanded" },
};

for (const [fieldname, patch] of Object.entries(patchFields)) {
  const path = `'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')=${quote(fieldname)} LIMIT 1) || ']'`;
  const args = Object.entries(patch).map(([key, value]) => `${path} || ${quote(`.${key}`)},${sqlValue(value)}`);
  sql.push(`UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,${args.join(",")})
WHERE tenant_id=${tenant} AND doctype='Pricing Rule' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')=${quote(fieldname)});`);
}

// The generic runtime renders fields in metadata order. Keep the commercial choice
// before its value fields so an operator never sees a misleading "Giá riêng" first.
sql.push(`UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.fields',(
  SELECT json_group_array(json(value))
  FROM (
    SELECT value FROM json_each(doctype_definitions.metadata_json,'$.fields')
    ORDER BY CASE json_extract(value,'$.fieldname')
      WHEN 'title' THEN 10 WHEN 'effect_type' THEN 20
      WHEN 'price_list' THEN 30 WHEN 'pricing_scope' THEN 40 WHEN 'item_code' THEN 50 WHEN 'item_group' THEN 60
      WHEN 'party_type' THEN 70 WHEN 'party' THEN 80 WHEN 'customer_group' THEN 90
      WHEN 'valid_from' THEN 90 WHEN 'valid_upto' THEN 100
      WHEN 'rate' THEN 110 WHEN 'discount_percentage' THEN 120 WHEN 'discount_amount' THEN 130
      WHEN 'adjustment_basis' THEN 140 WHEN 'adjustment_rate' THEN 150 WHEN 'conditions' THEN 160
      WHEN 'exclusive_group' THEN 170 WHEN 'disabled' THEN 180
      ELSE 900 END, key
  )
))
WHERE tenant_id=${tenant} AND doctype='Pricing Rule' AND json_valid(metadata_json);`);

const policy = {
  list: { enabled: true, columns: ["title", "effect_type", "price_list", "pricing_scope", "valid_upto", "disabled"] },
  form: {
    enabled: true,
    fields: ["title", "effect_type", "price_list", "pricing_scope", "party", "customer_group", "valid_from", "valid_upto", "rate", "discount_percentage", "discount_amount", "adjustment_basis", "adjustment_rate", "conditions", "exclusive_group", "disabled"],
  },
  quickEntry: { enabled: false, fields: ["title", "effect_type"] },
  kanban: { enabled: false }, calendar: { enabled: false }, gantt: { enabled: false }, chart: { enabled: false },
};
sql.push(`UPDATE doctype_definitions
SET revision=revision+1,
    metadata_json=json_set(metadata_json,'$.label','Chính sách giá','$.viewPolicy',${json(policy)}),
    modified_by='codex-local',modified_at=${now}
WHERE tenant_id=${tenant} AND doctype='Pricing Rule' AND json_valid(metadata_json);`);
sql.push(`UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.revision',revision)
WHERE tenant_id=${tenant} AND doctype='Pricing Rule' AND json_valid(metadata_json);`);

for (const [source, translated] of Object.entries({
  RATE_OVERRIDE: "Giá riêng", DISCOUNT_PERCENT: "Giảm theo %", DISCOUNT_AMOUNT: "Giảm tiền", ADJUSTMENT: "Phụ thu",
  FIXED: "Mức cố định", PRICED_QTY: "Số lượng bán", AREA_SQM: "Diện tích", LENGTH_M: "Chiều dài", SET_COUNT: "Số bộ",
})) {
  sql.push(`INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES(${tenant},'vi',${quote(source)},${quote(translated)},'',${now})
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET translated_text=excluded.translated_text,modified_at=excluded.modified_at;`);
}

const dormantOptions = ["DUC-TANG-RAY", "UC-KEO-TAY", "UC-MOTOR-NGOAI", "DL-TACH-MON", "DL-TRON-BO", "LUOI-CHUA-PHU-KIEN", "LUOI-CO-PHU-KIEN"];
sql.push(`UPDATE documents
SET payload_json=json_set(payload_json,'$.disabled',json('true'),'$._cleanup_reason','Chưa có đơn giá hoặc gói bán được duyệt'),
    version=version+1,modified_at=${now},modified_by='codex-local'
WHERE tenant_id=${tenant} AND doctype='Sales Option' AND name IN (${dormantOptions.map(quote).join(",")})
  AND COALESCE(json_extract(payload_json,'$.disabled'),0)=0;`);

await writeFile(resolve(outputArg), `${sql.join("\n\n")}\n`, "utf8");
console.log(JSON.stringify({ tenant: tenantArg, doctypes: ["Pricing Rule", "Sales Option"], disabled_seed_options: dormantOptions, output: resolve(outputArg) }));
