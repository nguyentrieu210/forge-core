import test from "node:test";
import assert from "node:assert/strict";
import { AlumDoorAttendanceDayController } from "../dist/packages/clouderp-erpnext/src/alumdoor-attendance.js";

function fakeReader(masters) {
  return {
    async getDocument() { return null; },
    async getMasterRecordData(_tenant, doctype, name) { return masters[`${doctype}:${name}`] ?? null; },
    async listDocumentsByDoctype() { return []; },
    async hasMasterRecord(_tenant, doctype, name) { return Boolean(masters[`${doctype}:${name}`]); },
    async getPeriodLockDate() { return null; },
  };
}

function context(document, roles = ["Employee", "AlumDoor QR System"]) {
  const masters = {
    "Employee:EMP-1": {
      employee_status: "Đang làm việc",
      user_id: "employee@example.test",
      company: "Demo",
      branch: "BR-A",
      department: "OPS",
    },
    "AlumDoor Attendance Policy:CA-1": {
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
    },
  };
  return {
    command: {
      schema_version: 1,
      command_id: "attendance-day-test",
      tenant_id: "demo",
      actor: { user_id: "employee@example.test", roles },
      aggregate: { doctype: "AlumDoor Attendance Day", name: "ALU-ATT-1" },
      action: "create",
      expected_version: null,
      payload_hash: "test",
      document,
    },
    reader: fakeReader(masters),
    existing: null,
    nextVersion: 1,
    now: "2026-08-10T10:05:00.000Z",
  };
}

const completeDay = {
  employee: "EMP-1",
  work_date: "2026-08-10",
  policy: "CA-1",
  segments: [
    { segment_code: "SHIFT1", state: "complete", actual_in: "2026-08-10T00:00:00.000Z", actual_out: "2026-08-10T04:30:00.000Z" },
    { segment_code: "SHIFT2", state: "complete", actual_in: "2026-08-10T06:00:00.000Z", actual_out: "2026-08-10T10:00:00.000Z" },
    { segment_code: "SHIFT3", state: "empty" },
  ],
};

test("AlumDoor daily projection calculates 3 shifts without changing standard Attendance", async () => {
  const plan = await new AlumDoorAttendanceDayController().buildPlan(context(completeDay));
  assert.equal(plan.document.data.regular_minutes, 480);
  assert.equal(plan.document.data.overtime_minutes, 30);
  assert.equal(plan.document.data.payable_work_fraction_bp, 10_000);
  assert.equal(plan.document.status, "complete");
  assert.deepEqual(plan.document.children.map((row) => row.child_doctype), [
    "AlumDoor Attendance Segment",
    "AlumDoor Attendance Segment",
    "AlumDoor Attendance Segment",
  ]);
});

test("daily projection refuses a direct save outside the QR transaction role", async () => {
  await assert.rejects(
    new AlumDoorAttendanceDayController().buildPlan(context(completeDay, ["Employee"])),
    /chỉ được cập nhật từ giao dịch quét QR/i,
  );
});
