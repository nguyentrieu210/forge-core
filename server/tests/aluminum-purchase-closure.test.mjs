import test from "node:test";
import assert from "node:assert/strict";
import {
  aluminumItemContract,
  canonicalizeAluminumPurchaseLine,
} from "../dist/apps-src/alumdoor-worker/src/aluminum-purchase-closure.js";

const canonicalItem = {
  inventory_mode: "Nhôm cây/lá",
  stock_uom: "Cây",
  default_purchase_uom: "Kg",
  has_batch_no: 1,
  has_catch_weight: 1,
  weight_uom: "Kg",
  purchase_stock_qty_field: "qty_bar",
  purchase_allocation_qty_field: "qty_bar",
  purchase_allocation_uom: "Cây",
  allow_negative_stock: 0,
};

test("aluminum item contract rejects the historical Kg-stock model", () => {
  const result = aluminumItemContract({
    ...canonicalItem,
    stock_uom: "Kg",
    has_batch_no: 0,
    has_catch_weight: 0,
    purchase_stock_qty_field: "",
    purchase_allocation_qty_field: "",
    purchase_allocation_uom: "",
  });
  assert.equal(result.ok, false);
  assert.match(result.issues.join(" | "), /stock_uom/i);
  assert.match(result.issues.join(" | "), /has_batch_no/i);
  assert.match(result.issues.join(" | "), /purchase_stock_qty_field/i);
});

test("receipt line keeps Kg as priced quantity while counted bars become stock quantity", () => {
  const normalized = canonicalizeAluminumPurchaseLine({
    row_id: "FIFO-1",
    item_code: "AL71",
    qty: 568.7,
    actual_weight_kg: 568.7,
    qty_bar: 200,
    length_m: 7.2,
    uom: "Kg",
    stock_uom: "Kg",
    stock_qty: 568.7,
    conversion_factor: 1,
    rate: 100000,
    color: "GS",
    is_stamped: "Có",
    warehouse: "KHO-NHOM",
  }, canonicalItem, "Purchase Receipt");

  assert.equal(normalized.qty, 568.7);
  assert.equal(normalized.rate_uom, "Kg");
  assert.equal(normalized.actual_weight_kg, 568.7);
  assert.equal(normalized.qty_bar, 200);
  assert.equal(normalized.stock_uom, "Cây");
  assert.equal(normalized.stock_qty, 200);
  assert.equal(normalized.purchase_stock_qty_field, "qty_bar");
  assert.equal(normalized.purchase_allocation_qty_field, "qty_bar");
  assert.equal(normalized.purchase_allocation_uom, "Cây");
  assert.equal(Object.hasOwn(normalized, "conversion_factor"), false, "legacy static factor must be removed");
});

test("Receipt Kg must equal the actual scale reading", () => {
  assert.throws(() => canonicalizeAluminumPurchaseLine({
    item_code: "AL71",
    qty: 560.16,
    actual_weight_kg: 568.7,
    qty_bar: 200,
    length_m: 7.2,
    uom: "Kg",
    rate: 100000,
    color: "GS",
    is_stamped: "Có",
  }, canonicalItem, "Purchase Receipt"), /phải bằng Tổng kg thực cân/i);
});

test("Material Request can express shortage in counted stock UOM without inventing Kg", () => {
  const normalized = canonicalizeAluminumPurchaseLine({
    item_code: "AL71",
    qty: 12,
    qty_bar: 12,
    length_m: 7.2,
    uom: "Cây",
    color: "GS",
    is_stamped: "Có",
  }, canonicalItem, "Material Request");
  assert.equal(normalized.qty, 12);
  assert.equal(normalized.stock_qty, 12);
  assert.equal(normalized.uom, "Cây");
  assert.equal(normalized.actual_weight_kg, undefined);
});
