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

function productionReservation(name, minLength, qty) {
  return {
    tenant_id: "tenant-a", doctype: "Stock Reservation", name,
    owner: "planner@example.test", docstatus: 0, status: "Đang giữ", version: 1,
    created_at: "2026-08-11T00:00:00.000Z", modified_at: "2026-08-11T00:00:00.000Z",
    data: {
      item_code: "AL548", source_doctype: "Production Order", source_name: "LSX-1",
      warehouse: "KHO-1", color: "Ghi", condition: "Đã sơn",
      min_length_m: minLength, qty_reserved: qty, state: "Đang giữ",
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

function consumptionReader({ reservations, cutQtyMicros, batchLength = "5" }) {
  const cut = {
    tenant_id: "tenant-a", doctype: "Cut Order", name: "CN-1",
    owner: "cutter@example.test", docstatus: 1, status: "Đã cắt", version: 3,
    created_at: "2026-08-11T00:00:00.000Z", modified_at: "2026-08-11T00:05:00.000Z",
    data: { production_order: "LSX-1" }, children: [],
  };
  return {
    async listDocumentsByDoctype(_tenant, doctype) {
      if (doctype === "Stock Reservation") return reservations;
      if (doctype === "Cut Order") return [cut];
      return [];
    },
    async getDocument(_tenant, doctype, name) {
      if (doctype === "Production Order" && name === "LSX-1") {
        return { tenant_id: "tenant-a", doctype, name, owner: "x", docstatus: 1, status: "Released", version: 1, created_at: "x", modified_at: "x", data: { company: "COMP-A" }, children: [] };
      }
      return null;
    },
    async getVoucherStockEntries(_tenant, doctype, name, revision) {
      assert.equal(doctype, "Cut Order");
      assert.equal(name, "CN-1");
      assert.equal(revision, 3);
      return [{
        line_key: "CUT-BATCH-1", item_code: "AL548", warehouse: "KHO-1",
        actual_qty_micros: -cutQtyMicros, valuation_rate_minor: 100,
        stock_value_difference_minor: -100, qty_scale: 6, currency_scale: 2,
        currency: "VND", posting_at: "2026-08-11T00:05:00.000Z",
        batch_no: "BATCH-5M", allow_negative_stock: false,
      }];
    },
    async getMasterRecordData(_tenant, type, name) {
      if (type === "Batch" && name === "BATCH-5M") {
        return { item_code: "AL548", length_m: batchLength, color: "Ghi", condition: "Đã sơn" };
      }
      return null;
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

test("submitted Cut Order ledger reduces effective reservation quantity but keeps partial promise active", async () => {
  const raw = productionReservation("RSV-51", "4.5", "51");
  const reader = reservationLifecycleReader(consumptionReader({ reservations: [raw], cutQtyMicros: 30_000_000 }), "tenant-a");
  const [projected] = await reader.listDocumentsByDoctype("tenant-a", "Stock Reservation");
  assert.equal(projected.data.qty_reserved, "21.000000");
  assert.equal(projected.data.qty_reserved_micros, 21_000_000);
  assert.equal(projected.data.consumed_qty_micros, 30_000_000);
  assert.equal(projected.data.state, "Đang giữ");
  assert.equal(projected.data.consumption_source, "Cut Order Stock Ledger");
});

test("full Cut Order consumption derives terminal Đã dùng without client state mutation", async () => {
  const raw = productionReservation("RSV-51", "4.5", "51");
  const reader = reservationLifecycleReader(consumptionReader({ reservations: [raw], cutQtyMicros: 51_000_000 }), "tenant-a");
  const [projected] = await reader.listDocumentsByDoctype("tenant-a", "Stock Reservation");
  assert.equal(projected.data.qty_reserved, "0.000000");
  assert.equal(projected.data.consumed_qty_micros, 51_000_000);
  assert.equal(projected.data.state, "Đã dùng");
  assert.equal(projected.status, "Đã dùng");
});

test("consumption allocation is longest-minimum-first for the same Production Order", async () => {
  const long = productionReservation("RSV-LONG", "4.5", "1");
  const short = productionReservation("RSV-SHORT", "3", "1");
  const reader = reservationLifecycleReader(consumptionReader({ reservations: [short, long], cutQtyMicros: 1_000_000 }), "tenant-a");
  const docs = await reader.listDocumentsByDoctype("tenant-a", "Stock Reservation");
  const projectedLong = docs.find((doc) => doc.name === "RSV-LONG");
  const projectedShort = docs.find((doc) => doc.name === "RSV-SHORT");
  assert.equal(projectedLong.data.state, "Đã dùng");
  assert.equal(projectedLong.data.qty_reserved, "0.000000");
  assert.equal(projectedShort.data.state, "Đang giữ");
  assert.equal(projectedShort.data.qty_reserved, "1");
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
