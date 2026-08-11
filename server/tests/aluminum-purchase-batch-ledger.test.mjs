import test from "node:test";
import assert from "node:assert/strict";
import { createO2CControllerRegistry } from "../dist/packages/clouderp-selling/src/index.js";
import { registerErpCoreControllers } from "../dist/packages/clouderp-core/src/index.js";
import { registerStockControllers } from "../dist/packages/clouderp-stock/src/index.js";
import { DocumentKernel, InMemoryMutationStore } from "../dist/packages/document-kernel/src/index.js";
import { createAndSubmit, mutate } from "./helpers.mjs";

const NOW = "2026-08-11T03:00:00.000Z";

function setup() {
  const store = new InMemoryMutationStore();
  store.seedO2CMasters({
    company: "ALUMDOOR",
    customer: "CUST-1",
    currency: "VND",
    items: ["AL71"],
    warehouses: ["KHO-NHOM"],
    accounts: ["HANG-TON-KHO", "HANG-NHAN-CHO-HOA-DON"],
  });
  store.seedMaster("Supplier", "TIEN-DAT", "demo", { supplier_name: "TIẾN ĐẠT" });
  store.seedMaster("Item", "AL71", "demo", {
    item_code: "AL71",
    item_name: "Nhôm AL71",
    item_nature: "Hàng tồn kho",
    material_stage: "Nguyên vật liệu",
    supply_type: "Mua ngoài",
    is_stock_item: 1,
    is_purchase_item: 1,
    inventory_mode: "Nhôm cây/lá",
    measurement_profile: "Nhôm cây/lá",
    stock_uom: "Cây",
    default_purchase_uom: "Kg",
    has_batch_no: 1,
    has_catch_weight: 1,
    weight_uom: "Kg",
    purchase_stock_qty_field: "qty_bar",
    purchase_allocation_qty_field: "qty_bar",
    purchase_allocation_uom: "Cây",
    valuation_method: "FIFO",
    allow_negative_stock: 0,
  });
  store.seedMaster("Warehouse", "KHO-NHOM", "demo", { company: "ALUMDOOR", stock_role: "Kho chính", is_group: 0 });
  store.seedMaster("Batch", "LO-AL71-001", "demo", {
    batch_id: "LO-AL71-001",
    item: "AL71",
    item_code: "AL71",
    color: "GS",
    condition: "Đã sơn",
    length_m: "7.200000",
    intake_qty: "200",
    intake_kg: "568.7",
    source_voucher_type: "Purchase Receipt",
    source_voucher_no: "PR-AL-001",
    received_warehouse: "KHO-NHOM",
  });
  const registry = registerStockControllers(registerErpCoreControllers(createO2CControllerRegistry()));
  return {
    store,
    kernel: new DocumentKernel(registry, store, { assert() {} }, () => NOW),
  };
}

function poLine() {
  return {
    row_id: "ROW-1",
    item_code: "AL71",
    qty: "560.160000",
    qty_bar: "200",
    length_m: "7.200000",
    theoretical_kg: "560.160000",
    theoretical_kg_per_m: "0.389000",
    color: "GS",
    condition: "Đã sơn",
    is_stamped: "Có",
    uom: "Kg",
    rate: "100000",
  };
}

test("Purchase Receipt posts counted bars + actual Kg + Kg-priced value to one Batch and cancels exactly", async () => {
  const { store, kernel } = setup();

  await createAndSubmit(kernel, {
    doctype: "Purchase Order",
    name: "PO-AL-001",
    document: {
      supplier: "TIEN-DAT",
      company: "ALUMDOOR",
      currency: "VND",
      transaction_date: "2026-08-10",
      taxes: [],
      items: [poLine()],
    },
  });

  await createAndSubmit(kernel, {
    doctype: "Serial and Batch Bundle",
    name: "SABB-AL-001",
    document: {
      item_code: "AL71",
      warehouse: "KHO-NHOM",
      type: "Inward",
      posting_at: NOW,
      entries: [{ row_id: "ROW-1", qty: "200", batch_no: "LO-AL71-001" }],
    },
  });

  const receipt = {
    supplier: "TIEN-DAT",
    company: "ALUMDOOR",
    currency: "VND",
    posting_at: NOW,
    stock_account: "HANG-TON-KHO",
    stock_received_but_not_billed: "HANG-NHAN-CHO-HOA-DON",
    against_purchase_order: "PO-AL-001",
    items: [{
      row_id: "ROW-1",
      item_code: "AL71",
      purchase_order: "PO-AL-001",
      warehouse: "KHO-NHOM",
      qty: "568.700000",
      qty_bar: "200",
      length_m: "7.200000",
      theoretical_kg: "560.160000",
      actual_weight_kg: "568.700000",
      color: "GS",
      condition: "Đã sơn",
      is_stamped: "Có",
      uom: "Kg",
      rate: "100000",
      valuation_rate: "100000",
      serial_and_batch_bundle: "SABB-AL-001",
    }],
  };

  await createAndSubmit(kernel, { doctype: "Purchase Receipt", name: "PR-AL-001", document: receipt });

  let snapshot = store.snapshot();
  const posted = snapshot.stock_entries.filter((row) => row.voucher_no === "PR-AL-001" || row.batch_no === "LO-AL71-001");
  const inward = posted.find((row) => row.batch_no === "LO-AL71-001" && row.actual_qty_micros > 0);
  assert.ok(inward);
  assert.equal(inward.actual_qty_micros, 200_000_000, "stock authority is counted bars");
  assert.equal(inward.actual_weight_micros, 568_700_000, "catch weight keeps the actual scale reading");
  assert.equal(inward.stock_value_difference_minor, 5_687_000_000, "value is 568.7 Kg × 100,000 VND/Kg at scale 2");
  assert.equal(inward.valuation_rate_minor, 28_435_000, "per-stock-unit valuation is receipt value / 200 bars");

  const receiptDoc = await store.getDocument("demo", "Purchase Receipt", "PR-AL-001");
  assert.equal(receiptDoc.data.stock_qty_micros, undefined);
  assert.equal(receiptDoc.data.items[0].stock_qty_micros, 200_000_000);
  assert.equal(receiptDoc.data.items[0].priced_qty_micros, 568_700_000);
  assert.equal(receiptDoc.data.items[0].conversion_factor, "0.351679");

  const receiptGl = snapshot.gl_entries.filter((row) => row.voucher_no === "PR-AL-001");
  assert.equal(receiptGl.reduce((sum, row) => sum + row.debit_minor, 0), 5_687_000_000);
  assert.equal(receiptGl.reduce((sum, row) => sum + row.credit_minor, 0), 5_687_000_000);

  await mutate(kernel, {
    commandId: "PR-AL-001-cancel",
    doctype: "Purchase Receipt",
    name: "PR-AL-001",
    action: "cancel",
    expectedVersion: 2,
    document: receiptDoc.data,
  });

  snapshot = store.snapshot();
  const batchLedger = snapshot.stock_entries.filter((row) => row.batch_no === "LO-AL71-001");
  assert.equal(batchLedger.reduce((sum, row) => sum + row.actual_qty_micros, 0), 0);
  assert.equal(batchLedger.reduce((sum, row) => sum + (row.actual_weight_micros ?? 0), 0), 0);
  assert.equal(batchLedger.reduce((sum, row) => sum + row.stock_value_difference_minor, 0), 0);
  assert.equal(await store.isStockBundleUsed("demo", "SABB-AL-001"), false, "cancel releases exact bundle usage");

  const glAfterCancel = snapshot.gl_entries.filter((row) => row.voucher_no === "PR-AL-001");
  assert.equal(glAfterCancel.reduce((sum, row) => sum + row.debit_minor - row.credit_minor, 0), 0);
});
