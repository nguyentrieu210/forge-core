#!/usr/bin/env node
/**
 * Build the bounded local-D1 presentation patch for Alumdoor Sales Package.
 *
 * Sales Package is fulfillment composition, not pricing and not a manufacturing BOM.
 * This patch keeps the generic resolver contract intact while presenting only the fields
 * an Alumdoor operator needs to define the physical items promised with one sales line.
 */
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const [tenantArg, outputArg] = process.argv.slice(2);
if (!tenantArg || !outputArg) {
  throw new Error("usage: node build-alumdoor-sales-package-metadata-local.mjs <tenant> <output.sql>");
}

const sqlString = (value) => `'${String(value).replaceAll("'", "''")}'`;
const sqlJson = (value) => `json(${sqlString(JSON.stringify(value))})`;
const sqlValue = (value) => typeof value === "boolean"
  ? (value ? "json('true')" : "json('false')")
  : typeof value === "number" ? String(value) : sqlString(value);
const tenant = sqlString(tenantArg);
const nowValue = new Date().toISOString();
const now = sqlString(nowValue);
const sql = ["-- Alumdoor local Sales Package operator metadata. No package records are seeded."];

const patchFields = (doctype, fields) => {
  for (const [fieldname, patch] of Object.entries(fields)) {
    const path = `'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')=${sqlString(fieldname)} LIMIT 1) || ']'`;
    const args = Object.entries(patch).map(([key, value]) =>
      `${path} || ${sqlString(`.${key}`)},${sqlValue(value)}`);
    sql.push(`UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,${args.join(",")})
WHERE tenant_id=${tenant} AND doctype=${sqlString(doctype)} AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')=${sqlString(fieldname)});`);
  }
};

patchFields("Sales Package", {
  package_code: {
    label: "Mã gói",
    read_only: false,
    read_only_depends_on: "eval: !doc.__islocal",
    in_list_view: false,
    surface: "expanded",
    description: "Hệ thống tự sinh; dùng để liên kết ổn định với phương án bán.",
  },
  package_name: { label: "Tên gói", surface: "quick" },
  item_code: {
    label: "Mặt hàng bán áp dụng",
    required: true,
    surface: "quick",
    link_filters: '[["Item","inventory_mode","=","Thành phẩm theo m2"],["Item","is_sales_item","=",1],["Item","disabled","=",0]]',
    description: "Một gói gắn với đúng một mã hàng để giao và trả hàng không bị nhầm.",
  },
  item_group: {
    label: "Nhóm sản phẩm",
    fetch_from: "item_code.item_group",
    read_only: true,
    depends_on: "eval:false",
    in_list_view: false,
    in_standard_filter: false,
    surface: "internal",
    link_filters: '{"is_group":0,"disabled":0}',
  },
  selection_mode: {
    label: "Cách giao",
    default: "ALL",
    read_only: true,
    depends_on: "eval:false",
    in_list_view: false,
    surface: "internal",
  },
  valid_from: { label: "Hiệu lực từ", hidden: true, surface: "internal" },
  valid_upto: { label: "Hiệu lực đến", hidden: true, surface: "internal" },
  disabled: { label: "Ngừng dùng", surface: "expanded" },
  items: {
    label: "Các món phải giao",
    surface: "quick",
    description: "Khai cả mặt hàng chính và mọi món giao kèm. Đây không phải định mức sản xuất.",
  },
});

patchFields("Sales Package Item", {
  component_key: {
    label: "Mã dòng",
    depends_on: "eval:false",
    surface: "internal",
    description: "Hệ thống tự sinh để theo dõi giao/đổi/trả đúng thành phần.",
  },
  item_code: {
    label: "Mặt hàng giao",
    surface: "quick",
    link_filters: '[["Item","is_sales_item","=",1],["Item","disabled","=",0]]',
  },
  uom: {
    label: "ĐVT giao",
    surface: "quick",
    description: "Tự điền theo mặt hàng; có thể đổi khi cách giao dùng ĐVT khác.",
  },
  qty_basis: {
    label: "Tính số lượng theo",
    surface: "quick",
    description: "Cố định, theo kích thước cửa, diện tích, số bộ hoặc số lá.",
  },
  factor: {
    label: "Hệ số / số lượng",
    surface: "quick",
    description: "Cố định: nhập số lượng. Theo kích thước: nhập hệ số nhân.",
  },
  required: { label: "Bắt buộc giao", default: 1, depends_on: "eval:false", surface: "internal" },
  default_selected: { label: "Chọn sẵn", default: 1, depends_on: "eval:false", surface: "internal" },
  role: { label: "Vai trò kỹ thuật", hidden: true, surface: "internal" },
});

patchFields("Sales Option", {
  option_code: { in_list_view: false },
  conditions: {
    label: "Điều kiện áp dụng",
    hidden: false,
    surface: "expanded",
    form_region: "full",
    description: "Khai luật để phương án chỉ áp dụng đúng trường hợp, ví dụ diện tích từ 10 m².",
  },
  sales_package: {
    label: "Gói giao kèm",
    hidden: false,
    depends_on: "eval:doc.item_code",
    surface: "expanded",
    in_list_view: true,
    in_standard_filter: true,
    link_filters: '[["Sales Package","item_code","=","eval:doc.item_code"],["Sales Package","disabled","=",0]]',
    description: "Chỉ chọn khi phương án áp dụng cho một mã hàng cụ thể.",
  },
});

// `conditions` uses the dedicated Sales Option renderer selected by its doctype + fieldname.
// Remove an obsolete experimental ui_control marker so metadata remains server-valid.
sql.push(`UPDATE doctype_definitions
SET metadata_json=json_remove(metadata_json,'$.fields[' || (SELECT key FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions' LIMIT 1) || '].ui_control')
WHERE tenant_id=${tenant} AND doctype='Sales Option' AND json_valid(metadata_json)
  AND EXISTS (SELECT 1 FROM json_each(metadata_json,'$.fields') WHERE json_extract(value,'$.fieldname')='conditions');`);

const packagePolicy = {
  list: { enabled: true, columns: ["package_name", "item_code", "disabled"] },
  form: {
    enabled: true,
    fields: ["package_code", "package_name", "item_code", "item_group", "selection_mode", "items", "disabled"],
  },
  quickEntry: { enabled: false, fields: ["package_name", "item_code", "items"] },
  kanban: { enabled: false },
  calendar: { enabled: false },
  gantt: { enabled: false },
  chart: { enabled: false },
};
const packagePermissions = [
  { role: "Chủ xưởng", read: true, write: true, create: true, print: true, report: true, import: true, export: true },
  { role: "Kinh doanh", read: true, write: false, create: false, print: true, report: true, export: true },
  { role: "Kế toán", read: true, write: false, create: false, print: true, report: true, export: true },
  { role: "System Manager", read: true, write: true, create: true, print: true, report: true, import: true, export: true },
];
sql.push(`UPDATE doctype_definitions
SET revision=revision+1,
    metadata_json=json_set(metadata_json,'$.label','Gói bán hàng','$.viewPolicy',${sqlJson(packagePolicy)},'$.permissions',${sqlJson(packagePermissions)}),
    modified_by='codex-local',modified_at=${now}
WHERE tenant_id=${tenant} AND doctype='Sales Package' AND json_valid(metadata_json);`);

const childPolicy = {
  list: { enabled: false, columns: ["item_code", "uom", "qty_basis", "factor"] },
  form: { enabled: false, fields: ["component_key", "item_code", "uom", "qty_basis", "factor", "required", "default_selected"] },
  quickEntry: { enabled: false, fields: ["item_code", "uom", "qty_basis", "factor"] },
  kanban: { enabled: false },
  calendar: { enabled: false },
  gantt: { enabled: false },
  chart: { enabled: false },
};
sql.push(`UPDATE doctype_definitions
SET revision=revision+1,
    metadata_json=json_set(metadata_json,'$.label','Món trong gói','$.viewPolicy',${sqlJson(childPolicy)}),
    modified_by='codex-local',modified_at=${now}
WHERE tenant_id=${tenant} AND doctype='Sales Package Item' AND json_valid(metadata_json);`);

const optionPolicy = {
  list: { enabled: true, columns: ["option_label", "item_group", "item_code", "sales_package", "is_default", "disabled"] },
  form: { enabled: true, fields: ["option_code", "option_label", "item_group", "item_code", "conditions", "sales_package", "is_default", "disabled"] },
  quickEntry: { enabled: true, fields: ["option_code", "option_label", "item_group"] },
  kanban: { enabled: false },
  calendar: { enabled: false },
  gantt: { enabled: false },
  chart: { enabled: false },
};
sql.push(`UPDATE doctype_definitions
SET revision=revision+1,
    metadata_json=json_set(metadata_json,'$.viewPolicy',${sqlJson(optionPolicy)}),
    modified_by='codex-local',modified_at=${now}
WHERE tenant_id=${tenant} AND doctype='Sales Option' AND json_valid(metadata_json);`);

const translations = {
  ALL: "Giao tất cả",
  SELECTABLE: "Cho chọn từng món",
  FIXED: "Số lượng cố định",
  HEIGHT: "Theo chiều cao",
  WIDTH: "Theo chiều rộng",
  CUT_WIDTH: "Theo rộng cắt lá",
  AREA: "Theo diện tích",
  SET_COUNT: "Theo số bộ",
  LEAF_COUNT: "Theo số lá",
};
for (const [source, translated] of Object.entries(translations)) {
  sql.push(`INSERT INTO translations(tenant_id,language,source_text,translated_text,context,modified_at)
VALUES(${tenant},'vi',${sqlString(source)},${sqlString(translated)},'',${now})
ON CONFLICT(tenant_id,language,context,source_text) DO UPDATE SET
  translated_text=excluded.translated_text,modified_at=excluded.modified_at;`);
}

sql.push(`UPDATE doctype_definitions
SET metadata_json=json_set(metadata_json,'$.revision',revision)
WHERE tenant_id=${tenant} AND doctype IN ('Sales Package','Sales Package Item','Sales Option') AND json_valid(metadata_json);`);

await writeFile(resolve(outputArg), `${sql.join("\n\n")}\n`, "utf8");
console.log(JSON.stringify({
  tenant: tenantArg,
  doctypes: ["Sales Package", "Sales Package Item", "Sales Option"],
  seeded_packages: 0,
  output: resolve(outputArg),
}));
