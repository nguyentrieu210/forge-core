#!/usr/bin/env node
/**
 * Build the bounded local-D1 patch for Alumdoor price variants and sales options.
 *
 * The shared pricing engine remains authoritative: Item Price stores price_variant,
 * while the operator chooses a Sales Option. This patch only supplies Alumdoor's
 * presentation, link filtering and initial option catalog.
 */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { compileBrief } from "./lib/compile-brief.mjs";

const [briefArg, tenantArg, outputArg] = process.argv.slice(2);
if (!briefArg || !tenantArg || !outputArg) {
  throw new Error(
    "usage: node build-alumdoor-pricing-option-metadata-local.mjs <brief.json> <tenant> <output.sql>",
  );
}

const manifest = compileBrief(JSON.parse(await readFile(resolve(briefArg), "utf8")));
if (manifest.id !== "alumdoor") throw new Error(`Expected alumdoor, received ${manifest.id}`);

const itemPrice = manifest.doctypes.find((entry) => entry.name === "Item Price");
if (!itemPrice) throw new Error("Missing DocType Item Price");
for (const fieldname of ["item_group", "sales_option", "price_variant"]) {
  if (!itemPrice.fields.some((field) => field.fieldname === fieldname)) {
    throw new Error(`Item Price.${fieldname} is required by the price-option contract`);
  }
}
if (itemPrice.autoname !== "format:{price_list}:{item_code}:{uom}:{price_variant}") {
  throw new Error(`Unexpected Item Price autoname: ${itemPrice.autoname}`);
}

// Historical scaffolding only. These examples are deliberately no longer inserted:
// an option without an approved Item Price and, when applicable, Sales Package is
// misleading on the selling form.
const retiredOptions = [
  {
    option_code: "DUC-CHI-LA",
    option_label: "Chỉ lá",
    item_group: "Cửa CN Đức",
    price_variant: "STANDARD",
    discount_basis_variant: "STANDARD",
    is_default: true,
    priority: 100,
  },
  {
    option_code: "DUC-TANG-RAY",
    option_label: "Tặng ray",
    item_group: "Cửa CN Đức",
    price_variant: "WITH_RAIL",
    discount_basis_variant: "STANDARD",
    priority: 90,
  },
  {
    option_code: "UC-KEO-TAY",
    option_label: "Kéo tay",
    item_group: "Cửa tấm liền Úc",
    price_variant: "HAND_PULL",
    discount_basis_variant: "HAND_PULL",
    is_default: true,
    priority: 100,
  },
  {
    option_code: "UC-MOTOR-NGOAI",
    option_label: "Motor ngoài",
    item_group: "Cửa tấm liền Úc",
    price_variant: "EXTERNAL_MOTOR",
    discount_basis_variant: "EXTERNAL_MOTOR",
    priority: 90,
  },
  {
    option_code: "DL-TACH-MON",
    option_label: "Tách món",
    item_group: "Cửa Đài Loan",
    price_variant: "STANDARD",
    discount_basis_variant: "STANDARD",
    is_default: true,
    priority: 100,
  },
  {
    option_code: "DL-TRON-BO",
    option_label: "Trọn bộ",
    item_group: "Cửa Đài Loan",
    price_variant: "FULL_SET",
    discount_basis_variant: "FULL_SET",
    priority: 90,
  },
  {
    option_code: "LUOI-CHUA-PHU-KIEN",
    option_label: "Chưa phụ kiện",
    item_group: "Cửa Lưới",
    price_variant: "STANDARD",
    discount_basis_variant: "STANDARD",
    is_default: true,
    priority: 100,
  },
  {
    option_code: "LUOI-CO-PHU-KIEN",
    option_label: "Có phụ kiện",
    item_group: "Cửa Lưới",
    price_variant: "WITH_ACCESSORIES",
    discount_basis_variant: "WITH_ACCESSORIES",
    priority: 90,
  },
];
const options = [];

const sqlString = (value) => `'${String(value).replaceAll("'", "''")}'`;
const sqlJson = (value) => `json(${sqlString(JSON.stringify(value))})`;
const sqlValue = (value) => typeof value === "boolean"
  ? (value ? "json('true')" : "json('false')")
  : typeof value === "number" ? String(value) : sqlString(value);
const tenant = sqlString(tenantArg);
const nowValue = new Date().toISOString();
const now = sqlString(nowValue);
const itemPriceName = sqlString(itemPrice.name);
const itemPriceRevision = `COALESCE((SELECT revision + 1 FROM doctype_definitions WHERE tenant_id=${tenant} AND doctype=${itemPriceName}), 1)`;

const sql = [];
sql.push(`-- Alumdoor local price-option metadata and initial operator catalog.`);
sql.push(`INSERT INTO doctype_definitions(
  tenant_id,doctype,module,is_custom,is_submittable,is_child,revision,
  metadata_json,disabled,modified_by,modified_at
)
VALUES(
  ${tenant},${itemPriceName},${sqlString(itemPrice.module)},
  ${itemPrice.custom ? 1 : 0},${itemPrice.is_submittable ? 1 : 0},${itemPrice.is_child ? 1 : 0},
  ${itemPriceRevision},
  json_set(${sqlJson(itemPrice)},'$.revision',${itemPriceRevision}),
  0,'codex-local',${now}
)
ON CONFLICT(tenant_id,doctype) DO UPDATE SET
  module=excluded.module,is_custom=excluded.is_custom,is_submittable=excluded.is_submittable,
  is_child=excluded.is_child,revision=excluded.revision,metadata_json=excluded.metadata_json,
  disabled=0,modified_by=excluded.modified_by,modified_at=excluded.modified_at;`);

const salesOptionLabels = {
  option_code: { label: "Mã phương án", surface: "quick" },
  option_label: { label: "Tên phương án", surface: "quick" },
  item_code: { label: "Chỉ áp dụng cho mặt hàng", surface: "expanded" },
  item_group: { label: "Nhóm sản phẩm áp dụng", surface: "quick" },
  conditions: {
    label: "Điều kiện áp dụng",
    hidden: false,
    surface: "expanded",
    form_region: "full",
    description: "Khai luật để phương án chỉ áp dụng đúng trường hợp, ví dụ diện tích từ 10 m².",
  },
  price_variant: { label: "Mã giá", hidden: true, surface: "internal" },
  discount_basis_variant: { label: "Giá gốc tính chiết khấu", hidden: true, surface: "internal" },
  sales_mode: { label: "Chế độ bán", hidden: true, surface: "internal" },
  sales_package: { label: "Gói bán hàng", hidden: true, surface: "internal" },
  is_default: { label: "Mặc định", surface: "expanded" },
  priority: { label: "Độ ưu tiên", hidden: true, surface: "internal" },
  disabled: { label: "Ngừng dùng", surface: "expanded" },
};

for (const [fieldname, patch] of Object.entries(salesOptionLabels)) {
  const pathPrefix = `'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')=${sqlString(fieldname)} LIMIT 1) || ']'`;
  const jsonSetArgs = Object.entries(patch).map(([key, value]) =>
    `${pathPrefix} || ${sqlString(`.${key}`)},${sqlValue(value)}`);
  sql.push(`UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,${jsonSetArgs.join(",")})
WHERE tenant_id=${tenant} AND doctype='Sales Option' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')=${sqlString(fieldname)});`);
}

const optionViewPolicy = {
  list: { enabled: true, columns: ["option_label", "item_group", "item_code", "is_default", "disabled"] },
  form: { enabled: true, fields: ["option_code", "option_label", "item_group", "item_code", "conditions", "is_default", "disabled"] },
  quickEntry: { enabled: true, fields: ["option_code", "option_label", "item_group"] },
  kanban: { enabled: false },
  calendar: { enabled: false },
  gantt: { enabled: false },
  chart: { enabled: false },
};
const optionPermissions = [
  { role: "Chủ xưởng", read: true, write: true, create: true, print: true, report: true, import: true, export: true },
  { role: "Kinh doanh", read: true, write: false, create: false, print: true, report: true, export: true },
  { role: "Kế toán", read: true, write: false, create: false, print: true, report: true, export: true },
  { role: "System Manager", read: true, write: true, create: true, print: true, report: true, import: true, export: true },
];
sql.push(`UPDATE doctype_definitions
SET revision=revision+1,
    metadata_json=json_set(metadata_json,'$.label','Phương án bán','$.viewPolicy',${sqlJson(optionViewPolicy)},'$.permissions',${sqlJson(optionPermissions)}),
    modified_by='codex-local',modified_at=${now}
WHERE tenant_id=${tenant} AND doctype='Sales Option' AND json_valid(metadata_json);`);
sql.push(`UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.revision',revision)
WHERE tenant_id=${tenant} AND doctype IN ('Item Price','Sales Option') AND json_valid(metadata_json);`);

for (const option of options) {
  const name = option.option_code;
  const payload = { ...option, disabled: false };
  sql.push(`INSERT INTO documents(
  tenant_id,doc_key,doctype,name,owner,docstatus,status,version,created_at,modified_at,modified_by,payload_json
)
VALUES(
  ${tenant},${sqlString(`Sales Option:${name}`)},'Sales Option',${sqlString(name)},'dev@example.com',0,'Draft',1,
  ${now},${now},'codex-local',
  json_set(${sqlJson(payload)},'$._metadata_revision',(SELECT revision FROM doctype_definitions WHERE tenant_id=${tenant} AND doctype='Sales Option'))
)
ON CONFLICT(tenant_id,doc_key) DO UPDATE SET
  payload_json=excluded.payload_json,modified_at=excluded.modified_at,modified_by=excluded.modified_by,
  version=documents.version+1;`);
  sql.push(`INSERT INTO document_search(tenant_id,doctype,name,title,content,modified_at)
VALUES(${tenant},'Sales Option',${sqlString(name)},${sqlString(option.option_label)},${sqlString(`${option.option_code} ${option.option_label} ${option.item_group}`)},${now})
ON CONFLICT(tenant_id,doctype,name) DO UPDATE SET
  title=excluded.title,content=excluded.content,modified_at=excluded.modified_at;`);
}

await writeFile(resolve(outputArg), `${sql.join("\n\n")}\n`, "utf8");
console.log(JSON.stringify({
  app: `${manifest.id}@${manifest.version}`,
  tenant: tenantArg,
  doctypes: ["Item Price", "Sales Option"],
  sales_options: options.map((option) => option.option_code),
  output: resolve(outputArg),
}));
