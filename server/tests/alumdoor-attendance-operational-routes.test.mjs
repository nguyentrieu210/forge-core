import test from "node:test";
import assert from "node:assert/strict";
import {
  attendanceCorrectionRequests,
  attendanceMonth,
  attendanceExceptions,
  attendanceSubmitCorrection,
  attendanceReviewCorrection,
} from "../dist/apps-src/alumdoor-worker/src/attendance-operational-routes.js";

function fixture() {
  const observed = [];
  const call = async (path, init = {}) => {
    const body = JSON.parse(String(init.body ?? "{}"));
    observed.push({ path, body });
    if (path === "method/frappe.client.get_list" && body.doctype === "Attendance Request") return Response.json({ message: [{ name: "REQ-1", employee: "EMP-1", workflow_state: "Chờ duyệt" }] });
    if (path === "method/frappe.client.get_list") return Response.json({ message: [{ name: "AAD-1", employee: "EMP-1", work_date: "2026-08-10", state: "exception" }] });
    if (path === "method/frappe.desk.form.load.getdoc") return Response.json({ docs: [{ name: body.name, segments: [{ segment_code: "SHIFT1", actual_in: "2026-08-10T08:00:00+07:00" }] }] });
    if (path === "method/metaforge.api.submit_alumdoor_attendance_correction") return Response.json({ message: { request: "REQ-1", state: "pending" } });
    if (path === "method/metaforge.api.review_alumdoor_attendance_correction") return Response.json({ message: { request: "REQ-1", state: body.action === "approve" ? "applied" : "rejected" } });
    return Response.json({ message: "unexpected" }, { status: 404 });
  };
  return { call, observed };
}

test("month register uses server list filters for the month boundary", async () => {
  const f = fixture();
  const response = await attendanceMonth({ call: f.call, args: { month: "2026-08", employee: "EMP-1" } });
  assert.equal(response.status, 200, await response.clone().text());
  const request = f.observed[0];
  assert.equal(request.path, "method/frappe.client.get_list");
  assert.deepEqual(request.body.filters, [
    ["work_date", ">=", "2026-08-01"],
    ["work_date", "<=", "2026-08-31"],
    ["employee", "=", "EMP-1"],
  ]);
  assert.ok(!request.body.fields.includes("segments"));
  const payload = await response.json();
  assert.equal(payload[0].segments[0].segment_code, "SHIFT1");
});

test("exception queue asks only for open/exception rows", async () => {
  const f = fixture();
  const response = await attendanceExceptions({ call: f.call, args: { from: "2026-08-01", to: "2026-08-31" } });
  assert.equal(response.status, 200, await response.text());
  assert.deepEqual(f.observed[0].body.filters[0], ["state", "in", ["open", "exception"]]);
});

test("correction submit/review go through narrow native callbacks", async () => {
  const f = fixture();
  let response = await attendanceSubmitCorrection({ call: f.call, args: { work_date: "2026-08-10", segment_code: "SHIFT1", requested_out: "2026-08-10T11:30:00+07:00", reason: "Quên quét ra" } });
  assert.equal(response.status, 200, await response.text());
  assert.ok(f.observed.some((entry) => entry.path === "method/metaforge.api.submit_alumdoor_attendance_correction"));
  response = await attendanceReviewCorrection({ call: f.call, args: { request: "REQ-1", action: "approve", note: "Đã đối chiếu" } });
  assert.equal(response.status, 200, await response.text());
  assert.ok(f.observed.some((entry) => entry.path === "method/metaforge.api.review_alumdoor_attendance_correction"));
});

test("correction queue exposes only pending AlumDoor attendance corrections", async () => {
  const f = fixture();
  const response = await attendanceCorrectionRequests({ call: f.call });
  assert.equal(response.status, 200, await response.text());
  const request = f.observed[0];
  assert.equal(request.body.doctype, "Attendance Request");
  assert.deepEqual(request.body.filters, [["request_type", "=", "Sửa chấm công"], ["workflow_state", "=", "Chờ duyệt"]]);
});
