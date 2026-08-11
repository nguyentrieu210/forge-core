import test from "node:test";
import assert from "node:assert/strict";
import { reservationLifecycleReader } from "../dist/packages/clouderp-erpnext/src/reservation-lifecycle-reader.js";
import { StockReservationIntegrityController } from "../dist/packages/clouderp-erpnext/src/stock-reservation-integrity.js";

function reservationDoc(name, sourceName) {
  return {
    tenant_id: "tenant-a", doctype: "Stock Reservation", name,
    owner: "planner@example.test", docstatus: 0, status: "Đang giữ", version: 1,
    created_at: "2026-08-11T00:00:00.000Z", modified_at: "2026-08-11T00:00:00.000Z",
    data: {
      item_code: "AL548", source_doctype: "Sales Order", source_name: sourceName,
      warehouse: "KHO-1", color: "Ghi", condition: "Đã sơn",
      min_length_m: "4.5", qty_reserved: "1", state: "Đang giữ",
    }, children: [],
  };
}

function baseReader({ missing = false } = {}) {
  const reservations = [reservationDoc("RSV-ACTIVE", "SO-ACTIVE"), reservationDoc("RSV-CANCEL", "SO-CANCEL")];
  return {
    async listDocumentsByDoctype(_tenant, doctype) { return doctype === "Stock Reservation" ? reservations : []; },
    async getDocument(_tenant, doctype, name) {
      if (doctype !== "Sales Order") return null;
      if (missing && name === "SO-CANCEL") return null;
      return { tenant_id: "tenant-a", doctype, name, owner: "x", docstatus: name === "SO-CANCEL" ? 2 : 1, status: "", version: 1, created_at: "x", modified_at: "x", data: { company: "COMP-A" }, children: [] };
    },
  };
}

test("effective reservation projection excludes promises whose source is cancelled", async () => {
  const reader = reservationLifecycleReader(baseReader(), "tenant-a");
  const docs = await reader.listDocumentsByDoctype("tenant-a", "Stock Reservation");
  assert.deepEqual(docs.map((doc) => doc.name), ["RSV-ACTIVE"]);
});

test("missing historical source stays conservative and does not silently free stock", async () => {
  const reader = reservationLifecycleReader(baseReader({ missing: true }), "tenant-a");
  const docs = await reader.listDocumentsByDoctype("tenant-a", "Stock Reservation");
  assert.deepEqual(docs.map((doc) => doc.name), ["RSV-ACTIVE", "RSV-CANCEL"]);
});

test("non-reservation document scans pass through unchanged", async () => {
  const source = [{ name: "SO-1", data: {} }];
  const reader = reservationLifecycleReader({
    ...baseReader(),
    async listDocumentsByDoctype(_tenant, doctype) { return doctype === "Sales Order" ? source : []; },
  }, "tenant-a");
  assert.equal(await reader.listDocumentsByDoctype("tenant-a", "Sales Order"), source);
});

test("reservation cannot be created against a cancelled source", async () => {
  const controller = new StockReservationIntegrityController();
  const document = {
    item_code: "AL548", source_doctype: "Sales Order", source_name: "SO-CANCEL",
    warehouse: "KHO-1", color: "Ghi", condition: "Đã sơn",
    min_length_m: "4.5", qty_reserved: "1", state: "Đang giữ",
  };
  const context = {
    command: {
      tenant_id: "tenant-a", action: "create", aggregate: { doctype: "Stock Reservation", name: "RSV-NEW" },
      actor: { user_id: "planner@example.test", roles: ["Stock User"] }, command_id: "create-rsv", document,
    },
    existing: null, now: "2026-08-11T01:00:00.000Z", nextVersion: 1,
    reader: {
      async getDocument(_tenant, doctype, name) { return doctype === "Sales Order" && name === "SO-CANCEL" ? { docstatus: 2, data: { company: "COMP-A" } } : null; },
      async getMasterRecordData(_tenant, type) {
        if (type === "Warehouse") return { company: "COMP-A", stock_role: "Kho chính", disabled: 0, is_group: 0 };
        if (type === "Item") return { has_batch_no: 1 };
        return null;
      },
      async listTrackedStockPositions() { return []; },
      async listDocumentsByDoctype() { return []; },
    },
  };
  await assert.rejects(() => controller.normalize(context), /đã huỷ; không thể tạo hoặc sửa giữ chỗ/);
});
