import fs from "node:fs";

const target = new URL("../packages/views/src/form/ChildGrid.tsx", import.meta.url);
let source = fs.readFileSync(target, "utf8");
function replace(before, after, label) {
  if (source.includes(after)) return;
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one anchor, found ${count}`);
  source = source.replace(before, after);
}

replace(
`const SALES_COMPACT_FIELDS = [
  "item_code", "color", "sales_mode", "height_m", "width_m", "set_count", "has_butterfly_bracket",
  "length_m", "qty_bar", "uom", "qty", "rate", "discount_percentage", "amount",
];`,
`const SALES_COMPACT_FIELDS = [
  "item_code", "sales_option", "color", "height_m", "width_m", "set_count", "has_butterfly_bracket",
  "length_m", "qty_bar", "uom", "qty", "rate", "discount_amount", "adjustment_amount", "net_amount",
];`, "compact sales fields");

replace(
`  "item_code", "door_type", "color", "sales_mode", "height_m", "width_m", "mesh_height_m", "set_count",`,
`  "item_code", "door_type", "sales_option", "color", "sales_mode", "height_m", "width_m", "mesh_height_m", "set_count",`, "full sales option");
replace(
`  "length_m", "qty_bar", "uom", "qty", "rate", "discount_percentage", "amount", "motor_model", "accessories", "install_note", "warehouse",`,
`  "length_m", "qty_bar", "uom", "qty", "rate", "discount_amount", "adjustment_amount", "net_amount", "motor_model", "accessories", "install_note", "warehouse",`, "full money fields");
replace(
`  "availability_status", "install_note",
]);`,
`  "availability_status", "install_note", "sales_mode", "discount_percentage", "sales_qty_basis",
  "price_variant", "discount_basis_variant", "sales_package", "sales_package_snapshot",
]);`, "hidden technical fields");

replace(
`    const plan: Array<[string, string[]]> = [
      ["stock_uom", ["stock_uom"]],`,
`    const plan: Array<[string, string[]]> = [
      ["stock_uom", ["stock_uom"]],
      ["sales_qty_basis", ["sales_qty_basis"]],`, "item quantity basis load");

const discountBlock = `        // Chính sách bán chuẩn: Cửa Đức giảm 15%, mọi mặt hàng khác không giảm.
        // Chỉ mồi khi đổi mặt hàng (ô cũ đã được reset phía trên), không ghi đè mức giảm
        // mà người dùng chủ động sửa để đơn đó đi vào luồng cần duyệt.
        if (childMeta.name === "Sales Order Item" && has("discount_percentage")) {
          patch.discount_percentage = defaultSalesDiscountPercent({
            ...base[rowIdx],
            item_code: itemCode,
            item_group: salesContext.item_group,
            inventory_mode: salesContext.inventory_mode,
            door_type: salesContext.door_type,
          });
        }
`;
replace(discountBlock, `        // Monetary discount/adjustment is resolved only by the canonical server Pricing Rule engine.
`, "remove client discount policy");

replace(
`      "stock_uom", "inventory_mode", "measurement_profile", "material_specification",
      "item_name", "description", "min_area_sqm", "theoretical_kg_per_m",`,
`      "stock_uom", "inventory_mode", "sales_qty_basis", "measurement_profile", "material_specification",
      "item_name", "description", "min_area_sqm", "theoretical_kg_per_m",`, "authoritative quantity basis");

replace(
`      if (field.fieldname === "discount_percentage") {
        return { ...field, label: "Chiết khấu\\n(%)" };
      }
      if (field.fieldname === "amount") {
        return { ...field, label: "Thành tiền\\n(VNĐ)" };
      }`,
`      if (field.fieldname === "sales_option") return { ...field, label: "Phương án bán" };
      if (field.fieldname === "discount_percentage") return { ...field, hidden: 1, read_only: 1 };
      if (field.fieldname === "discount_amount") return { ...field, label: "Tiền CK\\n(VNĐ)", read_only: 1 };
      if (field.fieldname === "adjustment_amount") return { ...field, label: "Phụ thu\\n(VNĐ)", read_only: 1 };
      if (field.fieldname === "net_amount" || field.fieldname === "amount") {
        return { ...field, label: "Thành tiền\\n(VNĐ)", read_only: 1 };
      }`, "commercial labels");

replace(
`        const standardAmount = Math.round(qty * rate);
        const percent = Math.min(100, Math.max(0, Number(next.discount_percentage) || 0));
        const discountAmount = Math.round(standardAmount * percent / 100);
        next.standard_amount = standardAmount;
        next.discount_amount = discountAmount;
        next.amount = standardAmount;`,
`        const standardAmount = Math.round(qty * rate);
        next.standard_amount = standardAmount;
        // Client may show gross immediately, but never derives policy money. Server response owns
        // discount_amount, adjustment_amount and net_amount.
        next.amount = standardAmount;
        if (next.net_amount == null) next.net_amount = standardAmount;`, "remove client discount math");

replace(
`          const standardAmount = Math.round(billable * rate);
          const percent = Math.min(100, Math.max(0, Number(adjusted.discount_percentage) || 0));
          const discountAmount = Math.round(standardAmount * percent / 100);
          adjusted.standard_amount = standardAmount;
          adjusted.discount_amount = discountAmount;
          adjusted.amount = standardAmount;`,
`          const standardAmount = Math.round(billable * rate);
          adjusted.standard_amount = standardAmount;
          adjusted.amount = standardAmount;
          if (adjusted.net_amount == null) adjusted.net_amount = standardAmount;`, "remove formula discount math");

fs.writeFileSync(target, source);
console.log("sales commercial ChildGrid patches applied");
