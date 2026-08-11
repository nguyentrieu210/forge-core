import test from "node:test";
import assert from "node:assert/strict";
import {
  submitAlumDoorAttendanceCorrection,
  reviewAlumDoorAttendanceCorrection,
} from "../dist/apps/tenant-worker/src/attendance-correction-coordinator.js";

function doc(name, data, docstatus = 0, version = 1) { return { name, data, docstatus, version }; }
function fixture() {
  const docs = new Map([
    ["Employee:EMP-1", doc("EMP-1", { user_id: "employee@example.test", company: "ALUMDOOR", branch: "XUONG", department: "SX", employee_status: "Active" }, 0)],
    ["AlumDoor Attendance Day:AAD-1", doc("AAD-1", {
      employee: "EMP-1", company: "ALUMDOOR", branch: "XUONG", department: "SX", work_date: "2026-08-10", policy: "ATP-1", state: "exception",
      segments: [
        { segment_code: "SHIFT1", actual_in: "2026-08-10T07:00:00+07:00", state: "open" },
        { segment_code: "SHIFT2", actual_in: "2026-08-10T13:00:00+07:00", actual_out: "2026-08-10T17:00:00+07:00", state: "complete" },
        { segment_code: "SHIFT3", state: "empty" },
      ],
    }, 0, 3)],
  ]);
  const store = {
    async getDocument(_tenant, doctype, name) { return docs.get(`${doctype}:${name}`) ?? null; },
    async listDocumentsByDoctype(_tenant, doctype) { return [...docs.entries()].filter(([key]) => key.startsWith(`${doctype}:`)).map(([, value]) => value); },
  };
  return { docs, store };
}

test("employee correction submission is self-scoped and creates+submits one Attendance Request bundle", async () => {
  const f = fixture();
  let observed;
  const result = await submitAlumDoorAttendanceCorrection({
    tenantId: "alu", actor: { user_id: "employee@example.test", roles: ["Employee"] },
    workDate: "2026-08-10", segmentCode: "SHIFT1", requestedOut: "2026-08-10T11:30:00+07:00", reason: "Quên quét ra",
  }, {
    store: f.store,
    kernel: { async executeBundle(bundle) { observed = bundle.commands; return [{ aggregate_version: 1 }, { aggregate_version: 2 }]; } },
    now: () => "2026-08-10T12:00:00.000Z",
  });
  assert.equal(result.state, "pending");
  assert.equal(observed.length, 2);
  assert.deepEqual(observed.map((command) => command.action), ["create", "submit"]);
  assert.equal(observed[0].document.employee, "EMP-1");
  assert.equal(observed[0].document.request_type, "Sửa chấm công");
  assert.equal(observed[0].document.alu_segment_code, "SHIFT1");
  assert.ok(observed[0].actor.roles.includes("HR Manager"));
});

test("manager approval changes only requested segment and request in one atomic bundle", async () => {
  const f = fixture();
  f.docs.set("Attendance Request:REQ-1", doc("REQ-1", {
    employee: "EMP-1", company: "ALUMDOOR", branch: "XUONG", from_date: "2026-08-10", to_date: "2026-08-10",
    request_type: "Sửa chấm công", reason: "Quên quét ra", alu_segment_code: "SHIFT1", alu_requested_out: "2026-08-10T11:30:00+07:00",
  }, 1, 2));
  let observed;
  const result = await reviewAlumDoorAttendanceCorrection({
    tenantId: "alu", actor: { user_id: "manager@example.test", roles: ["AlumDoor Attendance Manager"] }, request: "REQ-1", action: "approve", note: "Đã đối chiếu",
  }, {
    store: f.store,
    kernel: { async executeBundle(bundle) { observed = bundle.commands; return [{ aggregate_version: 4 }, { aggregate_version: 3 }]; } },
    now: () => "2026-08-10T12:30:00.000Z",
  });
  assert.equal(result.state, "applied");
  assert.equal(observed.length, 2);
  const dayCommand = observed.find((command) => command.aggregate.doctype === "AlumDoor Attendance Day");
  const requestCommand = observed.find((command) => command.aggregate.doctype === "Attendance Request");
  assert.equal(dayCommand.document.segments[0].actual_out, "2026-08-10T11:30:00+07:00");
  assert.equal(dayCommand.document.segments[1].actual_out, "2026-08-10T17:00:00+07:00");
  assert.equal(dayCommand.document.corrected_segment_code, "SHIFT1");
  assert.ok(dayCommand.actor.roles.includes("AlumDoor Attendance System"));
  assert.equal(requestCommand.document.alu_review_note, "Đã đối chiếu");
  assert.ok(requestCommand.document.alu_before_json);
  assert.ok(requestCommand.document.alu_preview_json);
  assert.ok(requestCommand.document.alu_applied_at);
});

test("locked attendance refuses correction review before mutation", async () => {
  const f = fixture();
  f.docs.get("AlumDoor Attendance Day:AAD-1").data.state = "locked";
  f.docs.get("AlumDoor Attendance Day:AAD-1").data.locked_by_payroll = "PAY-1";
  f.docs.set("Attendance Request:REQ-1", doc("REQ-1", { employee: "EMP-1", from_date: "2026-08-10", to_date: "2026-08-10", request_type: "Sửa chấm công", alu_segment_code: "SHIFT1", alu_requested_out: "2026-08-10T11:30:00+07:00" }, 1, 2));
  let executed = false;
  await assert.rejects(() => reviewAlumDoorAttendanceCorrection({ tenantId: "alu", actor: { user_id: "manager@example.test", roles: ["AlumDoor Attendance Manager"] }, request: "REQ-1", action: "approve" }, { store: f.store, kernel: { async executeBundle() { executed = true; return []; } } }), /LOCKED_BY_PAYROLL/);
  assert.equal(executed, false);
});
