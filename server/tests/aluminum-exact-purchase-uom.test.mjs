import test from "node:test";
import assert from "node:assert/strict";
import { applyUomConversion } from "../dist/packages/clouderp-core/src/uom.js";

function context(master) {
  return {
    command: {
      tenant_id: "demo",
      document: {},
    },
    reader: {
      async getMasterRecordData(_tenant, doctype, name) {
        if (doctype === "Item" && name === "AL71") return master;
        return null;
      },
    },
  };
}

const canonicalMaster = {
  item_code: "AL71",
  inventory_mode: "Nhôm cây/lá",
  stock_uom: "Cây",
  default_purchase_uom: "Kg",
  has_batch_no: 1,
  has_catch_weight: 1,
  weight_uom: "Kg",
  purchase_stock_qty_field: "qty_bar",
  purchase_allocation_qty_field: "qty_bar",
  purchase_allocation_uom: "Cây",
};

test("exact purchase stock quantity derives the per-line factor without a static kg-to-bar conversion", async () => {
  const [line] = await applyUomConversion(context(canonicalMaster), [{
    item_code: "AL71",
    qty: "568.700000",
    qty_bar: "200",
    uom: "Kg",
    actual_weight_kg: "568.700000",
    rate: "100000",
  }], { transactionKind: "purchase" });

  assert.equal(line.stock_uom, "Cây");
  assert.equal(line.stock_qty, "200.000000");
  assert.equal(line.stock_qty_micros, 200_000_000);
  assert.equal(line.priced_qty_micros, 568_700_000);
  assert.equal(line.actual_weight_micros, 568_700_000);
  assert.equal(line.purchase_stock_qty_field, "qty_bar");
  assert.equal(line.purchase_allocation_qty_field, "qty_bar");
  assert.equal(line.purchase_allocation_uom, "Cây");
  assert.equal(line.conversion_factor, "0.351679");
});

test("a stale client conversion factor cannot override the exact observed stock quantity", async () => {
  const master = {
    item_code: "AL71",
    inventory_mode: "Nhôm cây/lá",
    stock_uom: "Cây",
    default_purchase_uom: "Kg",
    purchase_stock_qty_field: "qty_bar",
  };
  await assert.rejects(
    applyUomConversion(context(master), [{
      item_code: "AL71",
      qty: "568.700000",
      qty_bar: "200",
      uom: "Kg",
      conversion_factor: "1",
    }], { transactionKind: "purchase" }),
    /hệ số quy đổi không khớp qty_bar/i,
  );
});

test("shortage Material Request can demand counted bars without fabricating actual Kg", async () => {
  const [line] = await applyUomConversion(context(canonicalMaster), [{
    item_code: "AL71",
    qty: "12",
    qty_bar: "12",
    uom: "Cây",
    length_m: "7.2",
    warehouse: "KHO-NHOM",
  }], { transactionKind: "purchase" });

  assert.equal(line.stock_uom, "Cây");
  assert.equal(line.stock_qty, "12.000000");
  assert.equal(line.stock_qty_micros, 12_000_000);
  assert.equal(line.priced_qty_micros, 12_000_000);
  assert.equal(line.actual_weight_micros, undefined);
  assert.equal(line.purchase_allocation_qty_field, "qty_bar");
  assert.equal(line.purchase_allocation_uom, "Cây");
});
