#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * READ-ONLY cutover planner.
 *
 * Input is an exported JSON snapshot, never a live tenant connection:
 * {
 *   items: [{ name|item_code, inventory_mode, stock_uom, ... }],
 *   stock: [{ item_code, warehouse, batch_no?, qty, weight_kg?, stock_value? }],
 *   legacy_lots: [{ name, profile|item_code, width_m|length_m, sheet_count, warehouse, colour|color, generation|condition }]
 * }
 *
 * The planner deliberately refuses to invent piece balances from Kg. It emits a patch plan for
 * master data and a list of reconciliation blockers that must be resolved with counted/batch evidence
 * before any production migration can be authorized.
 */

const argv = process.argv.slice(2);
const inputArg = argv.find((arg) => arg.startsWith("--input="));
const outputArg = argv.find((arg) => arg.startsWith("--output="));
if (!inputArg) {
  console.error("Usage: node scripts/alumdoor-aluminum-inventory-cutover-plan.mjs --input=export.json [--output=plan.json]");
  process.exit(2);
}

const inputPath = resolve(process.cwd(), inputArg.slice("--input=".length));
const outputPath = outputArg ? resolve(process.cwd(), outputArg.slice("--output=".length)) : null;
const source = JSON.parse(await readFile(inputPath, "utf8"));

const text = (value) => String(value ?? "").normalize("NFC").trim();
const norm = (value) => text(value).toLocaleLowerCase("vi");
const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const checked = (value) => value === true || value === 1 || value === "1" || ["có", "co", "true", "yes"].includes(norm(value));
const countedUoms = new Set(["cây", "cay", "lá", "la", "đoạn", "doan"]);

const items = Array.isArray(source.items) ? source.items : [];
const stock = Array.isArray(source.stock) ? source.stock : [];
const legacyLots = Array.isArray(source.legacy_lots) ? source.legacy_lots : [];

const aluminumItems = items.filter((item) => text(item.inventory_mode) === "Nhôm cây/lá");
const patches = [];
const blockers = [];
const evidence = [];

for (const item of aluminumItems) {
  const code = text(item.item_code ?? item.name);
  const itemStock = stock.filter((row) => text(row.item_code) === code && Math.abs(number(row.qty)) > 1e-9);
  const itemLots = legacyLots.filter((row) => text(row.profile ?? row.item_code) === code && number(row.sheet_count) > 0);
  const currentUom = text(item.stock_uom);
  const hasCanonicalBatchStock = itemStock.some((row) => text(row.batch_no) && countedUoms.has(norm(currentUom)));

  patches.push({
    doctype: "Item",
    name: code,
    expected_current: {
      inventory_mode: "Nhôm cây/lá",
      stock_uom: currentUom,
    },
    target_contract: {
      stock_uom: countedUoms.has(norm(currentUom)) ? currentUom : "<CHOOSE_FROM_COUNT_EVIDENCE:Cây|Lá|Đoạn>",
      default_purchase_uom: "Kg",
      has_batch_no: 1,
      has_catch_weight: 1,
      weight_uom: "Kg",
      purchase_stock_qty_field: "qty_bar",
      purchase_allocation_qty_field: "qty_bar",
      purchase_allocation_uom: countedUoms.has(norm(currentUom)) ? currentUom : "<SAME_AS_STOCK_UOM>",
      allow_negative_stock: 0,
      uom_conversions: [],
    },
  });

  if (itemStock.length === 0 && itemLots.length === 0) {
    evidence.push({ item_code: code, status: "NO_OPENING_STOCK", action: "master contract can be changed after normal config review" });
    continue;
  }

  if (hasCanonicalBatchStock) {
    evidence.push({
      item_code: code,
      status: "CANONICAL_BATCH_STOCK_PRESENT",
      positions: itemStock.length,
      batches: [...new Set(itemStock.map((row) => text(row.batch_no)).filter(Boolean))].length,
    });
    continue;
  }

  if (norm(currentUom) === "kg" && itemStock.length > 0) {
    blockers.push({
      severity: "CRITICAL",
      item_code: code,
      code: "KG_OPENING_BALANCE_WITHOUT_COUNTED_BATCH_AUTHORITY",
      stock_positions: itemStock.map((row) => ({
        warehouse: text(row.warehouse),
        qty_kg: number(row.qty),
        weight_kg: row.weight_kg == null ? null : number(row.weight_kg),
        stock_value: row.stock_value == null ? null : number(row.stock_value),
      })),
      legacy_lot_count: itemLots.length,
      rule: "Do not divide Kg by kg/m to invent a piece count. Count physical bars/sheets or reconcile to trusted lot evidence first.",
    });
  }

  if (itemLots.length > 0) {
    const lotCount = itemLots.reduce((sum, row) => sum + number(row.sheet_count), 0);
    blockers.push({
      severity: "CRITICAL",
      item_code: code,
      code: "LEGACY_ALUMINIUM_LOT_REQUIRES_OPENING_RECONCILIATION",
      legacy_piece_count: lotCount,
      lots: itemLots.map((row) => ({
        legacy_lot: text(row.name),
        warehouse: text(row.warehouse),
        length_m: number(row.length_m ?? row.width_m),
        qty: number(row.sheet_count),
        color: text(row.color ?? row.colour),
        condition: text(row.condition ?? row.generation),
      })),
      rule: "Legacy lot rows are evidence candidates only. Opening Batch + Stock Reconciliation must be explicitly approved; do not copy sheet_count into a second live balance store.",
    });
  }
}

const plan = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  source_file: inputPath,
  mode: "READ_ONLY_PLAN",
  invariant: "Batch owns identity; Stock Ledger owns quantity, catch weight and value",
  item_count: aluminumItems.length,
  patches,
  evidence,
  blockers,
  can_auto_apply: false,
  production_mutation_authorized: false,
  next_gate: blockers.length
    ? "Resolve counted-piece/batch opening evidence and approve Stock Reconciliation plan."
    : "Review target master patches; production mutation still requires explicit authorization.",
};

const json = `${JSON.stringify(plan, null, 2)}\n`;
if (outputPath) {
  await writeFile(outputPath, json, "utf8");
  console.log(`Wrote ${outputPath}`);
} else {
  process.stdout.write(json);
}
