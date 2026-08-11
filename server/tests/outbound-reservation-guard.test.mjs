import test from "node:test";
import assert from "node:assert/strict";
import { assertStockPlanRespectsReservations } from "../dist/packages/clouderp-erpnext/src/outbound-reservation-guard.js";

const NOW = "2026-08-11T01:00:00.000Z";

function reservation(name, sourceName, minLength = "4.5", qty = "1") {
  return {
    name,
    data: {
      item_code: "AL548",
      warehouse: "KHO-1",
      color: "Ghi",
      condition: "Đã sơn",
      min_length_m: minLength,
      qty_reserved: qty,
      source_name: sourceName,
      state: "Đang giữ",
      expires_at: "2026-08-12T00:00:00.000Z",
    },
  };
}

function context({ reservations = [], positions, batches } = {}) {
  const stockPositions = positions ?? [
    { item_code: "AL548", warehouse: "KHO-1", batch_no: "LO-50", qty_micros: 1_000_000 },
  ];
  const batchMap = batches ?? {
    "LO-50": { item_code: "AL548", length_m: "5", color: "Ghi", condition: "Đã sơn" },
  };
  return {
    command: {
      tenant_id: "tenant-a",
      aggregate: { doctype: "Delivery Note", name: "DN-1" },
      document: {},
      actor: { user_id: "stock@example.test", roles: ["Stock User"] },
    },
    now: NOW,
    reader: {
      async listDocumentsByDoctype() { return reservations; },
      async listTrackedStockPositions() { return stockPositions; },
      async getMasterRecordData(_tenantId, type, name) {
        if (type === "Batch") return batchMap[name] ?? null;
        return null;
      },
    },
  };
}

function outbound(batchNo = "LO-50", qtyMicros = 1_000_000) {
  return [{
    line_key: "OUT-1",
    item_code: "AL548",
    warehouse: "KHO-1",
    actual_qty_micros: -qtyMicros,
    valuation_rate_minor: 100,
    stock_value_difference_minor: -100,
    qty_scale: 6,
    currency_scale: 2,
    currency: "VND",
    posting_at: NOW,
    batch_no: batchNo,
    allow_negative_stock: false,
  }];
}

test("outbound plan cannot consume the only bar promised to another source", async () => {
  await assert.rejects(
    () => assertStockPlanRespectsReservations(
      context({ reservations: [reservation("RSV-1", "SO-OTHER")] }),
      outbound(),
      ["SO-MINE"],
    ),
    /phải chừa 1\.000000 lá khổ ≥ 4\.500000 m cho chứng từ khác/,
  );
});

test("outbound plan may consume stock promised to its own source lineage", async () => {
  await assert.doesNotReject(() => assertStockPlanRespectsReservations(
    context({ reservations: [reservation("RSV-1", "SO-MINE")] }),
    outbound(),
    ["SO-MINE"],
  ));
});

test("length breakpoint uses substitutable shorter stock correctly", async () => {
  const positions = [
    { item_code: "AL548", warehouse: "KHO-1", batch_no: "LO-30", qty_micros: 1_000_000 },
    { item_code: "AL548", warehouse: "KHO-1", batch_no: "LO-50", qty_micros: 1_000_000 },
  ];
  const batches = {
    "LO-30": { item_code: "AL548", length_m: "3", color: "Ghi", condition: "Đã sơn" },
    "LO-50": { item_code: "AL548", length_m: "5", color: "Ghi", condition: "Đã sơn" },
  };
  await assert.doesNotReject(() => assertStockPlanRespectsReservations(
    context({ reservations: [reservation("RSV-1", "SO-OTHER", "3")], positions, batches }),
    outbound("LO-50"),
    [],
  ));
});

test("untracked outbound stock is ignored because length reservations are batch-identity based", async () => {
  const ctx = context({ reservations: [reservation("RSV-1", "SO-OTHER")] });
  ctx.reader.listDocumentsByDoctype = async () => { throw new Error("must not scan reservations"); };
  await assert.doesNotReject(() => assertStockPlanRespectsReservations(ctx, [{
    ...outbound()[0],
    batch_no: undefined,
  }]));
});
