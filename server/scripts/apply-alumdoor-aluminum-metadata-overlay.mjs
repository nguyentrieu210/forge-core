#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const input = path.resolve(args.find((arg) => !arg.startsWith("--")) ?? "briefs/alumdoor-v2.json");
const outputArg = args.find((arg) => arg.startsWith("--out="));
const output = outputArg ? path.resolve(outputArg.slice("--out=".length)) : input;
const check = args.includes("--check");

const brief = JSON.parse(await readFile(input, "utf8"));
if (brief.id !== "alumdoor") throw new Error(`expected alumdoor brief, got ${brief.id ?? "?"}`);

const item = brief.doctypes?.find((doctype) => doctype?.name === "Item");
if (!item || !Array.isArray(item.fields)) throw new Error("Alumdoor Item metadata not found");
const technicalFields = [
  { fieldname: "purchase_stock_qty_field", fieldtype: "Data", label: "Trường SL tồn mua", hidden: true, read_only: true },
  { fieldname: "purchase_allocation_qty_field", fieldtype: "Data", label: "Trường SL phân bổ mua", hidden: true, read_only: true },
  { fieldname: "purchase_allocation_uom", fieldtype: "Link", options: "UOM", label: "ĐVT phân bổ mua", hidden: true, read_only: true },
];
for (const field of technicalFields) {
  if (!item.fields.some((existing) => typeof existing === "object" && existing?.fieldname === field.fieldname)) item.fields.push(field);
}

const profile = brief.fixtures?.find((fixture) => fixture?.type === "Measurement Profile" && fixture?.name === "Nhôm cây/lá");
if (!profile?.data) throw new Error("Measurement Profile Nhôm cây/lá fixture not found");
profile.data.stock_uom = "Cây";
profile.data.track_dimension_lot = true;
profile.data.require_piece_qty = true;
profile.data._desc = "Tồn nhôm theo số cây/lá có Batch và chiều dài; Kg là catch weight/đơn vị mua-định giá, không phải số lượng tồn.";

for (const fixture of brief.fixtures ?? []) {
  if (fixture?.type !== "Item" || fixture?.data?.inventory_mode !== "Nhôm cây/lá") continue;
  fixture.data.stock_uom = "Cây";
  fixture.data.default_purchase_uom = "Kg";
  fixture.data.has_batch_no = 1;
  fixture.data.has_catch_weight = 1;
  fixture.data.weight_uom = "Kg";
  fixture.data.purchase_stock_qty_field = "qty_bar";
  fixture.data.purchase_allocation_qty_field = "qty_bar";
  fixture.data.purchase_allocation_uom = "Cây";
  fixture.data.allow_negative_stock = 0;
  fixture.data.uom_conversions = [];
}

const rendered = `${JSON.stringify(brief, null, 2)}\n`;
if (check) {
  const current = await readFile(input, "utf8");
  if (current !== rendered) {
    console.error("ALUMDOOR_ALUMINUM_METADATA_DRIFT");
    process.exit(1);
  }
  console.log("ALUMDOOR_ALUMINUM_METADATA_PASS");
} else {
  await writeFile(output, rendered, "utf8");
  console.log(`ALUMDOOR_ALUMINUM_METADATA_WRITTEN ${output}`);
}
