#!/usr/bin/env node
/**
 * Local-only completion seed for Alumdoor selling.
 *
 * Inputs are the source catalogue converted from the original workbook and the
 * item-only import SQL. The six 31/07/2026 price sheets take precedence where
 * they overlap the catalogue (notably German doors, motors and rail parts).
 */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const [tenantArg, catalogueArg, itemSqlArg, outputArg] = process.argv.slice(2);
if (!tenantArg || !catalogueArg || !itemSqlArg || !outputArg) {
  throw new Error("usage: node seed-alumdoor-sales-completion-local.mjs <tenant> <catalogue.md> <item-import.sql> <output.sql>");
}

const tenant = String(tenantArg).trim();
const now = new Date().toISOString();
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const json = (value) => `json(${quote(JSON.stringify(value))})`;
const sql = ["-- Alumdoor selling completion, sourced from the six price sheets dated 31/07/2026."];

function normalize(value) {
  return String(value ?? "").normalize("NFC").trim().toLocaleUpperCase("vi");
}

function amount(value) {
  const digits = String(value ?? "").replace(/[^0-9]/g, "");
  return digits ? Number(digits) : null;
}

function normalizeUom(value) {
  const raw = normalize(value);
  if (raw === "M²" || raw === "M2") return "m2";
  if (raw === "M" || raw === "MÉT") return "Mét";
  if (raw === "BỘ") return "Bộ";
  if (raw === "CÁI") return "Cái";
  if (raw === "CẶP") return "Cặp";
  if (raw === "KG") return "Kg";
  if (raw === "CON") return "Con";
  if (raw === "CÂY") return "Cây";
  if (raw === "TẤM") return "Tấm";
  return String(value ?? "").trim();
}

function upsert(doctype, name, data, title = name, content = "") {
  sql.push(`INSERT INTO documents(tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json)
VALUES(${quote(tenant)},${quote(`${doctype}:${name}`)},${quote(doctype)},${quote(name)},'codex-local',0,'Draft',1,${quote(now)},${quote(now)},'codex-local',${json(data)})
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET payload_json=excluded.payload_json,version=documents.version+1,modified_at=excluded.modified_at,modified_by=excluded.modified_by;`);
  sql.push(`INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES(${quote(tenant)},${quote(doctype)},${quote(name)},${quote(title)},${quote(content || `${name} ${title}`)},${quote(now)})
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;`);
}

const itemSql = await readFile(resolve(itemSqlArg), "utf8");
const itemCodes = new Set([...itemSql.matchAll(/\('demo','Item:((?:''|[^'])+)'/g)].map((match) => match[1].replaceAll("''", "'")));
if (itemCodes.size < 270) throw new Error(`Unexpected imported item set: ${itemCodes.size}`);

const codeOverrides = new Map([
  ["NVL-V5_KEM_STD", ["NVL-V5_KEM_STD", "NVL-V5_KEM_STD-02"]],
  ["RNHUA/LONG-CR", ["RNHUA/LONG-CR", "RNHUA/LONG-CR-02"]],
  ["TP-BUOMSAT", ["TP-BUOMSAT", "TP-BUOMSAT-02"]],
  ["TP-CUAST1LY_MM", ["TP-CUAST1LY_MM", "TP-CUAST1.2LY_MM", "TP-CUAST1.3LY_MM"]],
  ["TP-CUAST1.2LY_MM", ["TP-CUAST1.4LY_MM", "TP-CUAST1.5LY_MM"]],
  ["TP-CUAST8-9D_MM", ["TP-CUAST1.1LY_MM"]],
  ["TP-CUAST1.3LY_MM", ["TP-CUAST1.6LY_MM"]],
]);
const missingCodes = new Map([
  ["LONG ĐÈN", "NVL_Longden"],
  ["HOA KHẾ", "NVL_Hoakhe"],
  ["CỘT TRỤC 140", "NVL_Cottruc140"],
]);
const occurrences = new Map();

const imageRateByName = new Map([
  ["ĐỨC AL595", [1020000, 1095000]], ["ĐỨC AL71N", [1095000, 1170000]],
  ["ĐỨC AL503N", [1200000, 1275000]], ["ĐỨC AL548N", [1287000, 1362000]],
  ["ĐỨC AL501N", [1371000, 1446000]], ["ĐỨC AL652", [1431000, 1506000]],
  ["ĐỨC AL552N", [1540000, 1615000]], ["ĐỨC AL752N", [1566000, 1641000]],
  ["ĐỨC AL50", [1685000, 1760000]], ["ĐỨC AL-VIP50", [1778000, 1853000]],
  ["ĐỨC AL-VIPST500", [2108000, 2183000]], ["ĐỨC AL-VIPST700", [2223000, 2298000]],
  ["ĐỨC AL70 (2 LỚP)", [843000, 918000]], ["ĐỨC AL70 (1 LỚP)", [1146000, 1221000]],
  ["ĐỨC AL75", [1303000, 1378000]],
  ["MOTOR JG 300KG", [3550000]], ["MOTOR JG 400KG", [4050000]],
  ["MOTOR JG 600KG", [4250000]], ["MOTOR JG 800KG", [5250000]],
  ["MOTOR JG 1000KG", [7650000]], ["MOTOR JG 1500KG", [8050000]],
  ["MOTOR YHLD 300KG", [2750000]], ["MOTOR YHLD 500KG", [2850000]],
  ["MOTOR YHLD 800KG", [5900000]], ["MOTOR YHLD 1000KG", [7000000]],
  ["MOTOR ALUMAX 400KG", [2200000]], ["MOTOR ALUMAX 600KG", [2300000]],
  ["MOTOR TANKER 400KG", [1750000]], ["MOTOR TANKER 600KG", [1850000]],
  ["MOTOR TANKER 800KG", [3700000]],
  ["RAY HỘP TD U76", [175000]], ["RAY ĐƠN TD U76", [145000]],
  ["RAY HỘP TD U100", [230000]], ["HỆ THỐNG TỰ DỪNG", [80000]],
  ["CON LĂN LỚN", [100000]], ["PULY 114 NHỎ", [22000]], ["PULY 114 LỚN", [30000]],
  ["PULY 140", [33000]], ["CÒI BÁO ĐỘNG", [70000]],
  ["TRỤC 114 (1.8MM)", [170000]], ["TRỤC 114 (2.1MM)", [190000]],
  ["TRỤC 140 (2.5MM)", [290000]], ["TRỤC 168 (4.0MM)", [520000]],
  ["V4_STĐ", [55000]], ["V4_KẼM", [75000]],
]);

const germanRailCodes = [];
const catalogue = await readFile(resolve(catalogueArg), "utf8");
for (const line of catalogue.split(/\r?\n/)) {
  if (!line.startsWith("|")) continue;
  const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
  if (cells.length < 6 || cells[0] === "Mã SP" || /^-+$/.test(cells[0])) continue;
  const sourceCode = cells[0];
  const sourceName = cells[1];
  if (sourceCode.startsWith("TRU-") || sourceCode === "TP-BO3LADAY" || sourceCode === "RONNHUA_INOX") continue;
  const occurrence = occurrences.get(sourceCode) ?? 0;
  occurrences.set(sourceCode, occurrence + 1);
  const resolvedCode = sourceCode
    ? (codeOverrides.get(sourceCode)?.[occurrence] ?? sourceCode)
    : missingCodes.get(normalize(sourceName));
  if (!resolvedCode || !itemCodes.has(resolvedCode)) continue;
  const listRate = amount(cells[4]);
  const withRailRate = amount(cells[5]);
  if (!listRate || listRate <= 0) continue;
  const override = imageRateByName.get(normalize(sourceName));
  const standardRate = override?.[0] ?? listRate;
  const uom = normalizeUom(cells[3]);
  const group = cells[2];
  upsert("Item Price", `Bảng giá 31/07/2026:${resolvedCode}:${uom}:STANDARD`, {
    price_list: "Bảng giá 31/07/2026", item_code: resolvedCode, item_group: group, uom,
    price_variant: "STANDARD", rate: standardRate, currency: "VND", valid_from: "2026-07-31",
    note: "Nguồn danh mục sản phẩm và bảng giá gốc 31/07/2026.", disabled: false,
  }, sourceName, `${resolvedCode}; STANDARD; ${standardRate} VND; 31/07/2026`);
  if (override?.[1]) {
    germanRailCodes.push({ code: resolvedCode, name: sourceName, group, uom, rate: override[1] });
  } else if (withRailRate && withRailRate > 0 && normalize(sourceName).startsWith("ĐỨC ")) {
    germanRailCodes.push({ code: resolvedCode, name: sourceName, group, uom, rate: withRailRate });
  }
}

if (germanRailCodes.length !== 15) throw new Error(`Expected 15 verified German door variants, received ${germanRailCodes.length}`);

upsert("Price List", "Bảng giá 31/07/2026", {
  price_list_name: "Bảng giá 31/07/2026", currency: "VND", valid_from: "2026-07-31",
  note: "Bảng giá tiền mặt, áp dụng từ 31/07/2026.", disabled: false,
}, "Bảng giá 31/07/2026", "Bảng giá tiền mặt Alumdoor, áp dụng 31/07/2026.");

for (const door of germanRailCodes) {
  const packageName = door.code === "TP-TD-AL752N" ? "PKG-DUC-AL752N-TANG-RAY" : `PKG-DUC-TANG-RAY:${door.code}`;
  const optionName = door.code === "TP-TD-AL752N" ? "DUC-AL752N-TANG-RAY-10M2" : `DUC-TANG-RAY-8M2:${door.code}`;
  upsert("Sales Package", packageName, {
    package_code: packageName, package_name: `${door.name} – Tặng ray`, item_code: door.code,
    item_group: "Cửa CN Đức", selection_mode: "ALL", valid_from: "2026-07-31",
    items: [
      { component_key: "DOOR", item_code: door.code, uom: "m2", qty_basis: "AREA", factor: 1, required: true, default_selected: true, role: "Cửa bán" },
      { component_key: "GIFT_RAIL", item_code: "PK_TANGRAY", uom: "Mét", qty_basis: "HEIGHT", factor: 2, required: true, default_selected: true, role: "Ray tặng, hai bên theo chiều cao" },
    ], disabled: false,
  }, `${door.name} – Tặng ray`, `${door.code}; cửa theo diện tích, ray tặng = 2 × chiều cao; từ 8 m².`);
  upsert("Sales Option", optionName, {
    option_code: `DUC-TANG-RAY-8M2:${door.code}`, option_label: "Tặng ray (từ 8 m²)",
    item_code: door.code, item_group: "Cửa CN Đức", conditions: [{ field: "billable_area_sqm", op: "gte", value: 8 }],
    price_variant: "WITH_RAIL", discount_basis_variant: "STANDARD", sales_package: packageName,
    priority: 90, disabled: false,
  }, `Tặng ray – ${door.name}`, `${door.code}; dùng giá tặng ray từ 8 m² và chốt ray tặng trên đơn.`);
  upsert("Item Price", `Bảng giá 31/07/2026:${door.code}:m2:WITH_RAIL`, {
    price_list: "Bảng giá 31/07/2026", item_code: door.code, item_group: "Cửa CN Đức", uom: "m2",
    sales_option: optionName, price_variant: "WITH_RAIL", rate: door.rate, currency: "VND", valid_from: "2026-07-31",
    note: "Bảng giá cửa Đức 31/07/2026; tặng ray từ 8 m².", disabled: false,
  }, `${door.name} – Tặng ray`, `${door.code}; WITH_RAIL; ${door.rate} VND/m²; từ 8 m².`);
}

const scopes = [
  ["CỬA NHỎ ÁP DỤNG PHỤ THU", ["Cửa CN Đức", "Cửa Lưới"]],
  ["CỬA ÚC ÁP DỤNG PHỤ THU", ["Cửa tấm liền Úc"]],
  ["CỬA ĐÀI LOAN VÀ LƯỚI THEO KHỔ", ["Cửa Đài Loan", "Cửa Lưới"]],
];
for (const [name, groups] of scopes) {
  upsert("Pricing Scope", name, {
    scope_name: name, members: groups.map((item_group) => ({ member_type: "Item Group", item_group })), disabled: false,
  }, name, groups.join("; "));
}

const rules = [
  ["PHỤ THU CỬA NHỎ <8M2", "Phụ thu vận chuyển cửa Đức/lưới dưới 8 m² +300.000/bộ", "CỬA NHỎ ÁP DỤNG PHỤ THU", "SET_COUNT", 300000, [{ field: "billable_area_sqm", operator: "lt", value: 8 }]],
  ["PHỤ THU CỬA ÚC 4-7M2", "Phụ thu cửa Úc trên 4 và dưới 7 m² +300.000/bộ", "CỬA ÚC ÁP DỤNG PHỤ THU", "SET_COUNT", 300000, [{ field: "billable_area_sqm", operator: "gt", value: 4 }, { field: "billable_area_sqm", operator: "lt", value: 7 }]],
  ["PHỤ THU KHỔ CỬA 6-7.5M", "Phụ thu khổ ngang trên 6 đến dưới 7,5 m +40.000/m²", "CỬA ĐÀI LOAN VÀ LƯỚI THEO KHỔ", "AREA_SQM", 40000, [{ field: "width_m", operator: "gt", value: 6 }, { field: "width_m", operator: "lt", value: 7.5 }]],
  ["PHỤ THU KHỔ CỬA 7.5-9M", "Phụ thu khổ ngang trên 7,5 đến dưới 9 m +60.000/m²", "CỬA ĐÀI LOAN VÀ LƯỚI THEO KHỔ", "AREA_SQM", 60000, [{ field: "width_m", operator: "gt", value: 7.5 }, { field: "width_m", operator: "lt", value: 9 }]],
];
for (const [name, title, pricing_scope, adjustment_basis, adjustment_rate, conditions] of rules) {
  upsert("Pricing Rule", name, {
    title, effect_type: "ADJUSTMENT", price_list: "Bảng giá 31/07/2026", pricing_scope,
    adjustment_basis, adjustment_rate, conditions, priority: 100, taxable: true, discountable: false, disabled: false,
  }, title, `${pricing_scope}; ${adjustment_rate} VND; ${adjustment_basis}`);
}

// Rails in "Phụ kiện CN Đức" need the same colour choices as their German doors.
// Keep raw/THÔ untouched and do not broaden unrelated colour families.
sql.push(`UPDATE documents
SET payload_json=json_set(payload_json,'$.applies_to_groups',(
  SELECT json_group_array(json_object('row_id','SCOPE-' || item_group, 'item_group',item_group))
  FROM (
    SELECT DISTINCT item_group FROM (
      SELECT json_extract(value,'$.item_group') AS item_group
      FROM json_each(documents.payload_json,'$.applies_to_groups')
      UNION ALL SELECT 'Phụ kiện CN Đức'
    )
  )
)) , version=version+1,modified_at=${quote(now)},modified_by='codex-local'
WHERE tenant_id=${quote(tenant)} AND doctype='Item Color' AND name<>'THÔ'
  AND EXISTS (SELECT 1 FROM json_each(documents.payload_json,'$.applies_to_groups') WHERE json_extract(value,'$.item_group')='Cửa CN Đức');`);

await writeFile(resolve(outputArg), `${sql.join("\n\n")}\n`, "utf8");
console.log(JSON.stringify({ tenant, price_list: "Bảng giá 31/07/2026", german_door_options: germanRailCodes.length, output: resolve(outputArg) }));
