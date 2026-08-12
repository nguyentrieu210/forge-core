#!/usr/bin/env node
/**
 * Seed the locally approved Alumdoor surcharge catalogue.
 *
 * This intentionally excludes freight: freight is assessed per Sales Order,
 * whereas these records are line-item adjustments resolved by Pricing Rule.
 */
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const [tenantArg, outputArg] = process.argv.slice(2);
if (!tenantArg || !outputArg) throw new Error("usage: node seed-alumdoor-pricing-surcharges-local.mjs <tenant> <output.sql>");

const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const json = (value) => `json(${quote(JSON.stringify(value))})`;
const tenant = quote(tenantArg);
const now = quote(new Date().toISOString());
const actor = quote("codex-local");

const scopes = [
  {
    name: "CỬA ÁP DỤNG SƠN VÂN GỖ",
    data: {
      scope_name: "CỬA ÁP DỤNG SƠN VÂN GỖ",
      members: [
        { member_type: "Item Group", item_group: "Cửa CN Đức" },
        { member_type: "Item Group", item_group: "Cửa tấm liền Úc" },
        { member_type: "Item Group", item_group: "Cửa siêu trường" },
        { member_type: "Item Group", item_group: "Cửa Đài Loan" },
      ],
      disabled: false,
      _metadata_revision: 1,
    },
  },
  {
    name: "RAY TD ÁP DỤNG PHỤ THU SƠN",
    data: {
      scope_name: "RAY TD ÁP DỤNG PHỤ THU SƠN",
      members: [
        { member_type: "Item", item_code: "TP-RAYHOP" },
        { member_type: "Item", item_code: "TP-RAY HỘP TD U100" },
        { member_type: "Item", item_code: "TP-TD87A1 GS" },
        { member_type: "Item", item_code: "NVL-TOLE1.2x190-KRON" },
      ],
      disabled: false,
      _metadata_revision: 1,
    },
  },
  {
    name: "V4 V5 SƠN TĨNH ĐIỆN",
    data: {
      scope_name: "V4 V5 SƠN TĨNH ĐIỆN",
      members: [
        { member_type: "Item", item_code: "NVL-V4_KEM_STD" },
        { member_type: "Item", item_code: "NVL-V5_KEM_STD-02" },
      ],
      disabled: false,
      _metadata_revision: 1,
    },
  },
];

const color = {
  color_code: "VÂN GỖ",
  color_name: "VÂN GỖ",
  finish: "Sơn vân gỗ",
  applies_to_groups: [
    { row_id: "SCOPE-01", item_group: "Cửa CN Đức" },
    { row_id: "SCOPE-02", item_group: "Cửa tấm liền Úc" },
    { row_id: "SCOPE-03", item_group: "Cửa siêu trường" },
    { row_id: "SCOPE-04", item_group: "Cửa Đài Loan" },
  ],
  note: "Màu/bề mặt dùng để tính phụ thu sơn vân gỗ.",
  disabled: false,
  usage_scope: "Mua & bán",
  _metadata_revision: 2,
};

const priceList = "Bảng giá 31/07/2026";
const rules = [
  {
    name: "PHỤ THU SƠN VÂN GỖ CỬA",
    data: {
      title: "Phụ thu sơn vân gỗ cửa +465.000/m²",
      effect_type: "ADJUSTMENT",
      price_list: priceList,
      pricing_scope: "CỬA ÁP DỤNG SƠN VÂN GỖ",
      adjustment_basis: "AREA_SQM",
      adjustment_rate: 465000,
      priority: 100,
      conditions: [{ field: "color", operator: "eq", value: "VÂN GỖ" }],
      taxable: true,
      discountable: false,
      disabled: false,
      _metadata_revision: 28,
    },
  },
  {
    name: "PHỤ THU RAY VÂN GỖ",
    data: {
      title: "Phụ thu ray sơn vân gỗ +55.000/m",
      effect_type: "ADJUSTMENT",
      price_list: priceList,
      pricing_scope: "RAY TD ÁP DỤNG PHỤ THU SƠN",
      adjustment_basis: "LENGTH_M",
      adjustment_rate: 55000,
      priority: 110,
      exclusive_group: "MÀU RAY",
      conditions: [{ field: "color", operator: "eq", value: "VÂN GỖ" }],
      taxable: true,
      discountable: false,
      disabled: false,
      _metadata_revision: 28,
    },
  },
  {
    name: "PHỤ THU RAY MÀU KHÁC",
    data: {
      title: "Phụ thu ray màu khác +15.000/m",
      effect_type: "ADJUSTMENT",
      price_list: priceList,
      pricing_scope: "RAY TD ÁP DỤNG PHỤ THU SƠN",
      adjustment_basis: "LENGTH_M",
      adjustment_rate: 15000,
      priority: 100,
      exclusive_group: "MÀU RAY",
      conditions: [
        { field: "color", operator: "neq", value: "" },
        { field: "color", operator: "neq", value: "VÀNG KEM" },
        { field: "color", operator: "neq", value: "GHI SẦN" },
        { field: "color", operator: "neq", value: "VÂN GỖ" },
      ],
      taxable: true,
      discountable: false,
      disabled: false,
      _metadata_revision: 28,
    },
  },
  {
    name: "PHỤ THU V4 V5 SƠN TĨNH ĐIỆN",
    data: {
      title: "Phụ thu V4/V5 sơn tĩnh điện +15.000/m",
      effect_type: "ADJUSTMENT",
      price_list: priceList,
      pricing_scope: "V4 V5 SƠN TĨNH ĐIỆN",
      adjustment_basis: "LENGTH_M",
      adjustment_rate: 15000,
      priority: 100,
      taxable: true,
      discountable: false,
      disabled: false,
      _metadata_revision: 28,
    },
  },
];

const upsertDocument = (doctype, name, data) => `INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,payload_json,modified_by)
VALUES(${tenant},${quote(`${doctype}:${name}`)},${quote(doctype)},${quote(name)},${actor},0,'Draft',1,${now},${now},${json(data)},${actor})
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;`;

const sql = ["-- Approved Alumdoor local pricing surcharge seed. Safe to rerun."];
for (const scope of scopes) sql.push(upsertDocument("Pricing Scope", scope.name, scope.data));
sql.push(upsertDocument("Item Color", "VÂN GỖ", color));
for (const rule of rules) sql.push(upsertDocument("Pricing Rule", rule.name, rule.data));

await writeFile(resolve(outputArg), `${sql.join("\n\n")}\n`, "utf8");
console.log(JSON.stringify({ tenant: tenantArg, scopes: scopes.map(({ name }) => name), color: "VÂN GỖ", rules: rules.map(({ name }) => name), output: resolve(outputArg) }));
