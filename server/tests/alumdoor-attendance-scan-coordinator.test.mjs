import test from "node:test";
import assert from "node:assert/strict";
import { createO2CControllerRegistry } from "../dist/packages/clouderp-selling/src/index.js";
import { registerErpCoreControllers } from "../dist/packages/clouderp-core/src/index.js";
import { registerStockControllers } from "../dist/packages/clouderp-stock/src/index.js";
import { registerErpNextCoreControllers } from "../dist/packages/clouderp-erpnext/src/index.js";
import { DocumentKernel, InMemoryMutationStore } from "../dist/packages/document-kernel/src/index.js";
import { commitAlumDoorAttendanceScan } from "../dist/apps/tenant-worker/src/attendance-scan-coordinator.js";

function setup() {
  let current = "2026-08-10T00:00:00.000Z"; // 07:00, Ca 1, Asia/Ho_Chi_Minh
  const store = new InMemoryMutationStore();
  store.seedMaster("Employee", "EMP-1", "demo", {
    user_id: "worker@example.test",
    employee_status: "Äang lÃ m viá»‡c",
    company: "Demo",
    branch: "BR-A",
    department: "OPS",
  });
  store.seedMaster("AlumDoor Attendance Policy", "CA-1", "demo", {
    policy_status: "approved",
    company: "Demo",
    branch: "BR-A",
    timezone: "Asia/Ho_Chi_Minh",
    shift1_start_minute: 420,
    shift1_end_minute: 690,
    shift2_start_minute: 780,
    shift2_end_minute: 1020,
    shift3_start_minute: 1050,
    shift3_latest_out_minute: 1439,
    regular_daily_cap_minutes: 480,
    effective_from: "2026-01-01",
  });
  store.seedMaster("AlumDoor QR Station", "GATE-A", "demo", {
    station_code: "GATE-A",
    station_name: "Cá»•ng A",
    policy: "CA-1",
    branch: "BR-A",
    secret_version: 1,
    is_active: 1,
  });
  const registry = registerErpNextCoreControllers(
    registerStockControllers(registerErpCoreControllers(createO2CControllerRegistry())),
  );
  const kernel = new DocumentKernel(registry, store, { assert() {} }, () => current);
  const scan = (nonce) => commitAlumDoorAttendanceScan({
    tenantId: "demo",
    actor: { user_id: "worker@example.test", roles: ["Employee"] },
    station: "GATE-A",
    nonceHash: nonce,
  }, { kernel, store, now: () => current });
  return {
    store,
    scan,
    setTime(value) { current = value; },
  };
}

const nonceA = "a".repeat(64);
const nonceB = "b".repeat(64);
const nonceC = "c".repeat(64);

test("QR scan creates immutable standard checkin and one three-segment day atomically", async () => {
  const { store, scan } = setup();
  const first = await scan(nonceA);
  assert.equal(first.replayed, false);
  assert.equal(first.checkin.log_type, "IN");
  assert.equal(first.day.segment_code, "SHIFT1");

  const checkin = await store.getDocument("demo", "Employee Checkin", first.checkin.name);
  const day = await store.getDocument("demo", "AlumDoor Attendance Day", first.day.name);
  assert.equal(checkin.docstatus, 1);
  assert.equal(checkin.data.source, "Device");
  assert.equal(checkin.data.alu_segment_code, "SHIFT1");
  assert.equal(day.version, 1);
  assert.equal(day.data.segments[0].state, "open");
  assert.equal(day.data.segments.length, 3);
});

test("same QR replay does not toggle the segment a second time", async () => {
  const { store, scan } = setup();
  const first = await scan(nonceA);
  const replay = await scan(nonceA);
  assert.equal(replay.replayed, true);
  assert.equal(replay.checkin.name, first.checkin.name);
  const day = await store.getDocument("demo", "AlumDoor Attendance Day", first.day.name);
  assert.equal(day.version, 1);
  assert.equal(day.data.segments[0].state, "open");
});

test("a new QR closes only its own shift and recalculates the day", async () => {
  const { store, scan, setTime } = setup();
  const first = await scan(nonceA);
  setTime("2026-08-10T02:00:00.000Z"); // 09:00 local
  const second = await scan(nonceB);
  assert.equal(second.checkin.log_type, "OUT");
  const day = await store.getDocument("demo", "AlumDoor Attendance Day", first.day.name);
  assert.equal(day.version, 2);
  assert.equal(day.data.segments[0].state, "complete");
  assert.equal(day.data.regular_minutes, 120);
  assert.equal(day.data.overtime_minutes, 0);
});

test("a completed segment refuses another scan without leaving a stray checkin", async () => {
  const { store, scan, setTime } = setup();
  const first = await scan(nonceA);
  setTime("2026-08-10T02:00:00.000Z");
  await scan(nonceB);
  await assert.rejects(scan(nonceC), (error) => {
    assert.equal(error.code, "INVALID_LIFECYCLE_TRANSITION");
    return true;
  });
  const checkins = await store.listDocumentsByDoctype("demo", "Employee Checkin");
  assert.equal(checkins.length, 2);
  const day = await store.getDocument("demo", "AlumDoor Attendance Day", first.day.name);
  assert.equal(day.version, 2);
});
