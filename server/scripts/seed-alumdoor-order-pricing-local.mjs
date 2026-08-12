#!/usr/bin/env node
/**
 * Resolve the previously ambiguous small-door freight rule as an ORDER aggregate.
 * Run after seed-alumdoor-sales-completion-local.mjs. Safe to rerun.
 */
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const [tenantArg, outputArg] = process.argv.slice(2);
if (!tenantArg || !outputArg) throw new Error("usage: node seed-alumdoor-order-pricing-local.mjs <tenant> <output.sql>");
const tenant = String(tenantArg).trim();
const now = new Date().toISOString();
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const json = (value) => `json(${quote(JSON.stringify(value))})`;
const ruleName = "PHỤ THU CỬA NHỎ <8M2";
const title = "Phụ thu vận chuyển cửa Đức/lưới khi tổng diện tích đơn dưới 8 m² +300.000";
const data = {
  title,
  rule_level: "ORDER",
  effect_type: "ORDER_ADJUSTMENT",
  price_list: "Bảng giá 31/07/2026",
  pricing_scope: "CỬA NHỎ ÁP DỤNG PHỤ THU",
  aggregate_function: "SUM",
  aggregate_field: "billable_area_sqm",
  aggregate_operator: "lt",
  aggregate_value: 8,
  adjustment_basis: "FIXED",
  adjustment_rate: 300000,
  priority: 100,
  exclusive_group: "VẬN CHUYỂN CỬA NHỎ",
  taxable: true,
  discountable: false,
  conditions: [],
  note: "Cộng diện tích tất cả dòng Cửa CN Đức/Cửa Lưới trong đơn. Đủ 8 m² trở lên thì miễn phụ thu.",
  disabled: false,
};
const sql = [`-- ORDER aggregate freight rule. Safe to rerun.`];
sql.push(`INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES(${quote(tenant)},${quote(`Pricing Rule:${ruleName}`)},'Pricing Rule',${quote(ruleName)},'codex-local',0,'Draft',1,${quote(now)},${quote(now)},'codex-local',${json(data)})
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;`);
sql.push(`INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES(${quote(tenant)},'Pricing Rule',${quote(ruleName)},${quote(title)},${quote("Cửa CN Đức; Cửa Lưới; SUM billable_area_sqm < 8; 300000 VND một lần/đơn")},${quote(now)})
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;`);
await writeFile(resolve(outputArg), `${sql.join("\n\n")}\n`, "utf8");
console.log(JSON.stringify({ tenant, rule: ruleName, scope: data.pricing_scope, aggregate: "SUM(billable_area_sqm) < 8", adjustment_rate: 300000, output: resolve(outputArg) }));
