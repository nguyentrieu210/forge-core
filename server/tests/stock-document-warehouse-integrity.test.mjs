import test from "node:test";
import assert from "node:assert/strict";
import {
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
