import test from "node:test";
import assert from "node:assert/strict";
import { StockReturnIntegrityController } from "../dist/packages/clouderp-erpnext/src/stock-return-integrity.js";

function submitContext(warehouse) {
  return {
    command: { tenant_id: "tenant-a", action: "submit", document: {
      party: "SUP-1", company: "COMP-A", currency: "VND", posting_at: "2026-08-03T09:00:00.000Z",
      return_against: "PREC-1", return_type: "Purchase",
      items: [{ item_code: "ITEM-1", warehouse: "WH-1", qty: "1" }],
    } },
    reader: { async getMasterRecordData(_tenantId, type) { return type === "Warehouse" ? warehouse : null; } },
  };
}

test("Stock Return rejects cross-company and group warehouse before source mutation plan", async () => {
  const controller = new StockReturnIntegrityController();
  await assert.rejects(() => controller.buildPlan(submitContext({ company: "COMP-B", is_group: 0 })), /belongs to COMP-B, not COMP-A/);
  await assert.rejects(() => controller.buildPlan(submitContext({ company: "COMP-A", is_group: 1 })), /disabled or is a group/);
});

function cancelContext({ stockRows, glRows, lockDate = null }) {
  const data = {
    party: "SUP-1",
    company: "COMP-A",
    currency: "VND",
    currency_scale: 2,
    posting_at: "2026-08-03T09:00:00.000Z",
    return_against: "PREC-1",
    return_type: "Purchase",
    stock_account: "1301",
    cogs_or_expense_account: "632",
    items: [{
      row_id: "ROW-1",
      item_code: "ITEM-1",
      warehouse: "WH-1",
      qty: "1.000000",
      qty_micros: 1_000_000,
      rate: "123.45",
      valuation_rate: "123.45",
      valuation_rate_minor: 12_345,
      stock_value_difference_minor: -12_345,
      serial_and_batch_bundle: "BUNDLE-RETURN-1",
    }],
  };
  return {
    command: {
      schema_version: 1,
      command_id: "cancel-stock-return",
      tenant_id: "tenant-a",
      actor: { user_id: "stock.manager@example.test", roles: ["Stock Manager"] },
      aggregate: { doctype: "Stock Return", name: "SRET-1" },
      action: "cancel",
      expected_version: 4,
      payload_hash: "b".repeat(64),
      document: {},
    },
    existing: {
      tenant_id: "tenant-a", doctype: "Stock Return", name: "SRET-1",
      owner: "stock.manager@example.test", docstatus: 1, status: "Submitted", version: 4,
      created_at: "2026-08-03T09:00:00.000Z", modified_at: "2026-08-03T09:00:00.000Z",
      data,
      children: [{ fieldname: "items", child_doctype: "Stock Return items", row_id: "ROW-1", idx: 1, data: data.items[0] }],
    },
    nextVersion: 5,
    now: "2026-08-11T00:00:00.000Z",
    reader: {
      async getPeriodLockDate() { return lockDate; },
      async getVoucherStockEntries() { return stockRows; },
      async getVoucherGlEntries() { return glRows; },
      async getTrackedStockState() { throw new Error("cancel must not recalculate current tracked stock"); },
      async getStockLedgerHistory() { throw new Error("cancel must not replay current valuation"); },
    },
  };
}

test("Stock Return cancel reverses exact submitted stock and GL rows without revaluation", async () => {
  const originalStock = [{
    line_key: "RETURN-ROW-1-BATCH-1",
    item_code: "ITEM-1",
    warehouse: "WH-1",
    actual_qty_micros: -1_000_000,
    valuation_rate_minor: 12_345,
    stock_value_difference_minor: -12_345,
    qty_scale: 6,
    currency_scale: 2,
    currency: "VND",
    posting_at: "2026-08-03T09:00:00.000Z",
    batch_no: "BATCH-1",
    allow_negative_stock: false,
  }];
  const originalGl = [{
    line_key: "STOCK-0",
    account: "1301",
    debit_minor: 0,
    credit_minor: 12_345,
    currency: "VND",
    currency_scale: 2,
    posting_at: "2026-08-03T09:00:00.000Z",
  }];
  const controller = new StockReturnIntegrityController();
  const plan = await controller.buildPlan(cancelContext({ stockRows: originalStock, glRows: originalGl }));

  assert.equal(plan.document.docstatus, 2);
  assert.equal(plan.document.status, "Cancelled");
  assert.equal(plan.stock_entries.length, 1);
  assert.equal(plan.stock_entries[0].actual_qty_micros, 1_000_000);
  assert.equal(plan.stock_entries[0].stock_value_difference_minor, 12_345);
  assert.equal(plan.stock_entries[0].batch_no, "BATCH-1");
  assert.equal(plan.gl_entries[0].debit_minor, 12_345);
  assert.equal(plan.gl_entries[0].credit_minor, 0);
  assert.equal(plan.return_entries[0].qty_micros, -1_000_000);
  assert.equal(plan.stock_bundle_usages[0].usage_delta, -1);
  assert.equal(plan.stock_bundle_usages[0].direction, "Outward");
});

test("Stock Return cancel fails closed when original stock posting is missing", async () => {
  const controller = new StockReturnIntegrityController();
  await assert.rejects(
    () => controller.buildPlan(cancelContext({ stockRows: [], glRows: [] })),
    /Original stock posting.*was not found/,
  );
});

test("Stock Return cancel respects accounting period lock", async () => {
  const controller = new StockReturnIntegrityController();
  await assert.rejects(
    () => controller.buildPlan(cancelContext({ stockRows: [{}], glRows: [], lockDate: "2026-08-05" })),
    /thuộc kỳ đã khoá/,
  );
});
