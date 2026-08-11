import test from "node:test";
import assert from "node:assert/strict";
import {
  allocateAluminumDemand,
  protectExternalReservations,
} from "../dist/apps-src/alumdoor-worker/src/aluminum-supply-demand.js";

function position(batch_no, length_m, qty, is_offcut = false) {
  return {
    batch_no,
    item_code: "AL71",
    warehouse: "KHO-NHOM",
    length_m,
    qty,
    color: "GS",
    condition: "Đã sơn",
    is_offcut,
  };
}

test("ATP consumes fitting offcuts before the smallest full batch", () => {
  const pool = [
    position("FULL-7200", 7.2, 10, false),
    position("OFF-2600", 2.6, 2, true),
    position("OFF-1800", 1.8, 20, true),
    position("FULL-6000", 6.0, 4, false),
  ];
  const result = allocateAluminumDemand(pool, {
    item_code: "AL71",
    warehouse: "KHO-NHOM",
    min_length_m: 2.45,
    qty: 5,
    color: "GS",
  });
  assert.equal(result.shortage, 0);
  assert.deepEqual(result.picks.map((row) => [row.batch_no, row.take]), [
    ["OFF-2600", 2],
    ["FULL-6000", 3],
  ]);
  assert.equal(pool.find((row) => row.batch_no === "FULL-7200").qty, 10, "long stock stays untouched when shorter stock fits");
});

test("external reservations are protected before a new sales-order ATP plan", () => {
  const pool = [
    position("FULL-6000", 6.0, 4),
    position("FULL-7200", 7.2, 3),
  ];
  protectExternalReservations(pool, [{
    source_name: "WO-OTHER",
    item_code: "AL71",
    warehouse: "KHO-NHOM",
    min_length_m: 6.5,
    qty: 2,
    color: "GS",
  }]);
  const result = allocateAluminumDemand(pool, {
    item_code: "AL71",
    warehouse: "KHO-NHOM",
    min_length_m: 5.8,
    qty: 6,
    color: "GS",
  });
  assert.equal(result.allocated, 5);
  assert.equal(result.shortage, 1);
  assert.equal(pool.find((row) => row.batch_no === "FULL-7200").qty, 0, "one 7.2m bar remains available after protecting two, then is consumed by current demand");
});

test("ATP never counts a batch shorter than the required cut", () => {
  const pool = [position("SHORT", 2.4, 100, true), position("FIT", 2.5, 1, true)];
  const result = allocateAluminumDemand(pool, {
    item_code: "AL71",
    warehouse: "KHO-NHOM",
    min_length_m: 2.45,
    qty: 3,
    color: "GS",
  });
  assert.equal(result.allocated, 1);
  assert.equal(result.shortage, 2);
  assert.equal(pool[0].qty, 100);
});

test("allocation is deterministic when two batches have the same shape", () => {
  const pool = [position("B-2", 6, 2), position("B-1", 6, 2)];
  const result = allocateAluminumDemand(pool, {
    item_code: "AL71",
    warehouse: "KHO-NHOM",
    min_length_m: 5,
    qty: 2,
    color: "GS",
  });
  assert.deepEqual(result.picks.map((row) => row.batch_no), ["B-1"]);
});
