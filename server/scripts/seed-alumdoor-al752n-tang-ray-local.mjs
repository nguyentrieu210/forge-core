#!/usr/bin/env node
/**
 * Seed one verified local-only commercial package for review.
 *
 * Evidence in docs/source-data/danh-muc-san-pham.md:
 * - TP-TD-AL752N: standard 1,626,000 VND/m²; with rail 1,701,000 VND/m².
 * - PK_TANGRAY: gift rail for German doors from 10 m², UOM Mét.
 *
 * The package fulfills one door by its billed area and two rail lengths by height.
 * It intentionally has no cutting deduction: that production-cut rule is still a
 * separate, unconfirmed policy and must not be invented in commercial fulfillment.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const [tenantArg, outputArg] = process.argv.slice(2);
if (!tenantArg || !outputArg) {
  throw new Error("usage: node seed-alumdoor-al752n-tang-ray-local.mjs <tenant> <output.sql>");
}

const tenant = String(tenantArg);
const now = new Date().toISOString();
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const json = (value) => `json(${quote(JSON.stringify(value))})`;
const sql = ["-- Local review seed: Đức AL752N tặng ray. Safe to rerun."];

function upsertDocument(doctype, name, payload, title, content) {
  sql.push(`INSERT INTO documents(
  tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json
)
VALUES(
  ${quote(tenant)},${quote(`${doctype}:${name}`)},${quote(doctype)},${quote(name)},'dev@example.com',0,'Draft',1,
  ${quote(now)},${quote(now)},'codex-local',
  json_set(${json(payload)},'$._metadata_revision',COALESCE((SELECT revision FROM doctype_definitions WHERE tenant_id=${quote(tenant)} AND doctype=${quote(doctype)}),1))
)
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET
  payload_json=excluded.payload_json,modified_at=excluded.modified_at,modified_by=excluded.modified_by,
  version=documents.version+1;`);
  sql.push(`INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES(${quote(tenant)},${quote(doctype)},${quote(name)},${quote(title)},${quote(content)},${quote(now)})
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET
  title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;`);
}

const packageName = "PKG-DUC-AL752N-TANG-RAY";
upsertDocument("Sales Package", packageName, {
  package_code: packageName,
  package_name: "Đức AL752N – Tặng ray (thử)",
  item_code: "TP-TD-AL752N",
  item_group: "Cửa CN Đức",
  selection_mode: "ALL",
  items: [
    {
      component_key: "MON-001",
      item_code: "TP-TD-AL752N",
      uom: "m2",
      qty_basis: "AREA",
      factor: 1,
      required: true,
      default_selected: true,
      role: "Cửa bán",
    },
    {
      component_key: "MON-002",
      item_code: "PK_TANGRAY",
      uom: "Mét",
      qty_basis: "HEIGHT",
      factor: 2,
      required: true,
      default_selected: true,
      role: "Ray tặng — 2 cây theo chiều cao",
    },
  ],
  disabled: false,
  _seed_source: "verified-local-review-2026-08-12",
}, "Đức AL752N – Tặng ray (thử)", "TP-TD-AL752N; cửa theo diện tích; ray tặng 2 × chiều cao; áp dụng từ 10 m² qua phương án bán.");

upsertDocument("Sales Option", "DUC-AL752N-TANG-RAY-10M2", {
  option_code: "DUC-AL752N-TANG-RAY-10M2",
  option_label: "Tặng ray (từ 10 m²)",
  item_code: "TP-TD-AL752N",
  item_group: "Cửa CN Đức",
  conditions: [{ field: "billable_area_sqm", op: "gte", value: 10 }],
  price_variant: "WITH_RAIL",
  discount_basis_variant: "STANDARD",
  sales_package: packageName,
  priority: 100,
  disabled: false,
  _seed_source: "verified-local-review-2026-08-12",
}, "Tặng ray (từ 10 m²)", "TP-TD-AL752N; bảng giá có ray; tự giao cửa và ray khi diện tích từ 10 m².");

for (const [variant, rate, option] of [
  ["STANDARD", 1626000, "DUC-CHI-LA"],
  ["WITH_RAIL", 1701000, "DUC-AL752N-TANG-RAY-10M2"],
]) {
  const name = `Bảng giá 31/07/2026:TP-TD-AL752N:m2:${variant}`;
  upsertDocument("Item Price", name, {
    price_list: "Bảng giá 31/07/2026",
    item_code: "TP-TD-AL752N",
    item_group: "Cửa CN Đức",
    uom: "m2",
    sales_option: option,
    price_variant: variant,
    rate,
    currency: "VND",
    valid_from: "2026-01-01",
    note: "Nguồn danh mục sản phẩm 2026; seed thử combo Đức AL752N – tặng ray.",
    disabled: false,
    _seed_source: "verified-local-review-2026-08-12",
  }, `Đức AL752N – ${variant === "STANDARD" ? "Chỉ lá" : "Tặng ray"}`, `Bảng giá 31/07/2026; TP-TD-AL752N; ${variant}; ${rate} VND/m².`);
}

const output = resolve(outputArg);
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${sql.join("\n\n")}\n`, "utf8");
console.log(JSON.stringify({ tenant, package: packageName, output }));
