import test from "node:test";
import assert from "node:assert/strict";
import {
  exactPurchaseReceiptCancellationPlan,
  WarehouseScopedDeliveryNoteController,
  WarehouseScopedPurchaseReceiptController,
} from "../dist/packages/clouderp-erpnext/src/stock-document-warehouse-integrity.js";

function context(doctype, document, warehouse) {
  return {
    command: {
      tenant_id: "tenant-a",
      action: "submit",
      aggregate: { doctype, name: `${doctype}-TEST` },
      actor: { user_id: "stock@example.com", roles: ["Stock User"] },
      command_id: `${doctype}-cmd`,
      document,
    },
    existing: null,
    now: "2026-08-11T00:00:00.000Z",
    nextVersion: 1,
    reader: {
      async getMasterRecordData(_tenantId, type, name) {
        if (type === "Warehouse" && name === "WH-1") return warehouse;
        return null;
      },
    },
  };
}

function deliveryDocument() {
  return {
    company: "COMP-A",
    currency: "VND",
    posting_at: "2026-08-11T00:00:00.000Z",
    issue_purpose: "Xuất nội bộ",
    items: [{ item_code: "ITEM-1", warehouse: "WH-1", qty: "1", rate: "1000" }],
  };
}

function receiptDocument() {
  return {
    supplier: "SUP-1",
    company: "COMP-A",
    currency: "VND",
    posting_at: "2026-08-11T00:00:00.000Z",
    items: [{ item_code: "ITEM-1", warehouse: "WH-1", qty: "1", rate: "1000" }],
  };
}

test("Delivery Note rejects warehouse from another company before stock planning", async () => {
  const controller = new WarehouseScopedDeliveryNoteController();
  await assert.rejects(
    () => controller.buildPlan(context("Delivery Note", deliveryDocument(), { company: "COMP-B", is_group: 0, disabled: 0 })),
    /belongs to COMP-B, not COMP-A/,
  );
});

test("Delivery Note rejects group warehouse before stock planning", async () => {
  const controller = new WarehouseScopedDeliveryNoteController();
  await assert.rejects(
    () => controller.buildPlan(context("Delivery Note", deliveryDocument(), { company: "COMP-A", is_group: 1, disabled: 0 })),
    /disabled or is a group/,
  );
});

test("Purchase Receipt rejects warehouse from another company before stock planning", async () => {
  const controller = new WarehouseScopedPurchaseReceiptController();
  await assert.rejects(
    () => controller.buildPlan(context("Purchase Receipt", receiptDocument(), { company: "COMP-B", is_group: 0, disabled: 0 })),
    /belongs to COMP-B, not COMP-A/,
  );
});

test("Purchase Receipt rejects disabled warehouse before stock planning", async () => {
  const controller = new WarehouseScopedPurchaseReceiptController();
  await assert.rejects(
    () => controller.buildPlan(context("Purchase Receipt", receiptDocument(), { company: "COMP-A", is_group: 0, disabled: 1 })),
    /disabled or is a group/,
  );
});

test("Purchase Receipt cancel replaces reconstructed Stock/GL with exact submitted revision", async () => {
  const originalStock = [{
    line_key: "ITEM-ROW-1-BATCH-A",
    item_code: "ITEM-1",
    warehouse: "WH-1",
    actual_qty_micros: 2_000_000,
    valuation_rate_minor: 12_345,
    stock_value_difference_minor: 24_690,
    qty_scale: 6,
    currency_scale: 2,
    currency: "VND",
    posting_at: "2026-08-01T00:00:00.000Z",
    batch_no: "BATCH-A",
    allow_negative_stock: false,
  }];
  const originalGl = [{
    line_key: "STOCK-ROW-1",
    account: "1561",
    debit_minor: 24_690,
    credit_minor: 0,
    currency: "VND",
    currency_scale: 2,
    posting_at: "2026-08-01T00:00:00.000Z",
  }];
  const data = {
    supplier: "SUP-1", company: "COMP-A", currency: "VND", currency_scale: 2,
    posting_at: "2026-08-01T00:00:00.000Z",
    items: [{ row_id: "ROW-1", item_code: "ITEM-1", warehouse: "WH-1", qty: "2", rate: "123.45" }],
  };
  const cancelContext = {
    command: {
      tenant_id: "tenant-a", action: "cancel", aggregate: { doctype: "Purchase Receipt", name: "PREC-1" },
      actor: { user_id: "stock@example.com", roles: ["Stock Manager"] }, command_id: "cancel-prec-1", document: {},
    },
    existing: {
      tenant_id: "tenant-a", doctype: "Purchase Receipt", name: "PREC-1", owner: "stock@example.com",
      docstatus: 1, status: "Submitted", version: 7,
      created_at: "2026-08-01T00:00:00.000Z", modified_at: "2026-08-01T00:00:00.000Z",
      data, children: [],
    },
    now: "2026-08-11T00:00:00.000Z",
    nextVersion: 8,
    reader: {
      async getVoucherStockEntries(_tenant, _type, _name, revision) {
        assert.equal(revision, 7);
        return originalStock;
      },
      async getVoucherGlEntries(_tenant, _type, _name, revision) {
        assert.equal(revision, 7);
        return originalGl;
      },
    },
  };
  const delegatePlan = {
    command: cancelContext.command,
    document: { ...cancelContext.existing, docstatus: 2, status: "Cancelled", version: 8 },
    gl_entries: [{ ...originalGl[0], debit_minor: 999, credit_minor: 0 }],
    stock_entries: [{ ...originalStock[0], actual_qty_micros: -999, stock_value_difference_minor: -999 }],
    payment_entries: [], fulfillment_entries: [],
    procurement_entries: [{ line_key: "REV-ALLOC", purchase_order: "PO-1", kind: "Receipt", item_code: "ITEM-1", qty_micros: -2_000_000, posting_at: data.posting_at }],
    stock_bundle_usages: [], events: [],
    result: { doctype: "Purchase Receipt", name: "PREC-1", version: 8, docstatus: 2, status: "Cancelled" },
  };

  const exact = await exactPurchaseReceiptCancellationPlan(cancelContext, delegatePlan);
  assert.equal(exact.stock_entries[0].actual_qty_micros, -2_000_000);
  assert.equal(exact.stock_entries[0].stock_value_difference_minor, -24_690);
  assert.equal(exact.stock_entries[0].batch_no, "BATCH-A");
  assert.equal(exact.gl_entries[0].debit_minor, 0);
  assert.equal(exact.gl_entries[0].credit_minor, 24_690);
  assert.equal(exact.procurement_entries[0].line_key, "REV-ALLOC");
});

test("Purchase Receipt exact cancel fails closed if original stock posting is missing", async () => {
  const data = receiptDocument();
  const cancelContext = {
    command: { tenant_id: "tenant-a", action: "cancel", aggregate: { doctype: "Purchase Receipt", name: "PREC-MISSING" }, actor: { user_id: "stock@example.com", roles: [] }, command_id: "cancel-missing", document: {} },
    existing: { tenant_id: "tenant-a", doctype: "Purchase Receipt", name: "PREC-MISSING", owner: "stock@example.com", docstatus: 1, status: "Submitted", version: 2, created_at: "x", modified_at: "x", data, children: [] },
    now: "2026-08-11T00:00:00.000Z", nextVersion: 3,
    reader: { async getVoucherStockEntries() { return []; }, async getVoucherGlEntries() { return []; } },
  };
  const plan = { command: cancelContext.command, document: cancelContext.existing, gl_entries: [], stock_entries: [], payment_entries: [], fulfillment_entries: [], stock_bundle_usages: [], events: [], result: {} };
  await assert.rejects(() => exactPurchaseReceiptCancellationPlan(cancelContext, plan), /Original stock posting.*was not found/);
});
