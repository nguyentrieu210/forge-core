import test from "node:test";
import assert from "node:assert/strict";
import {
  AttendanceRuleError,
  applySegmentScan,
  calculateAttendance,
  nextSegmentLogType,
  segmentForServerTime,
} from "../dist/apps-src/alumdoor-worker/src/attendance-core.js";

const tz = "Asia/Ho_Chi_Minh";
const workDate = "2026-08-10";

test("three scan windows use the approved boundaries in Ho Chi Minh time", () => {
  assert.deepEqual(segmentForServerTime("2026-08-10T05:29:59.000Z", tz), { code: "SHIFT1", workDate }); // 12:29:59
  assert.deepEqual(segmentForServerTime("2026-08-10T05:30:00.000Z", tz), { code: "SHIFT2", workDate }); // 12:30
  assert.deepEqual(segmentForServerTime("2026-08-10T10:30:00.000Z", tz), { code: "SHIFT3", workDate }); // 17:30
  assert.throws(
    () => segmentForServerTime("2026-08-09T17:00:00.000Z", tz), // 00:00
    (error) => error instanceof AttendanceRuleError && error.code === "ATTENDANCE_OUTSIDE_WINDOW",
  );
});

test("each segment toggles independently from IN to OUT", () => {
  const first = applySegmentScan({ code: "SHIFT2", status: "empty" }, "2026-08-10T06:00:00.000Z");
  assert.equal(first.logType, "IN");
  assert.equal(first.segment.status, "open");

  const second = applySegmentScan(first.segment, "2026-08-10T10:00:00.000Z");
  assert.equal(second.logType, "OUT");
  assert.equal(second.segment.status, "complete");

  assert.throws(
    () => nextSegmentLogType(second.segment),
    (error) => error instanceof AttendanceRuleError && error.code === "ATTENDANCE_SEGMENT_COMPLETE",
  );
});

test("full Ca 1 and Ca 2 produce 8 regular hours and 30 minutes overtime", () => {
  const result = calculateAttendance({
    workDate,
    timeZone: tz,
    segments: [
      { code: "SHIFT1", status: "complete", actualIn: "2026-08-10T00:00:00.000Z", actualOut: "2026-08-10T04:30:00.000Z" },
      { code: "SHIFT2", status: "complete", actualIn: "2026-08-10T06:00:00.000Z", actualOut: "2026-08-10T10:00:00.000Z" },
      { code: "SHIFT3", status: "empty" },
    ],
  });

  assert.equal(result.regularMinutes, 480);
  assert.equal(result.overtimeMinutes, 30);
  assert.equal(result.payableWorkFractionBp, 10_000);
  assert.deepEqual(
    result.segments.map((segment) => [segment.code, segment.actualMinutes, segment.regularMinutes, segment.overtimeMinutes]),
    [["SHIFT1", 270, 270, 0], ["SHIFT2", 240, 210, 30], ["SHIFT3", 0, 0, 0]],
  );
});

test("Ca 3 is overtime by default and work is clipped to a shift window", () => {
  const result = calculateAttendance({
    workDate,
    timeZone: tz,
    segments: [
      // 06:00–12:00 local is only paid inside Ca 1's 07:00–11:30 window.
      { code: "SHIFT1", status: "complete", actualIn: "2026-08-09T23:00:00.000Z", actualOut: "2026-08-10T05:00:00.000Z" },
      { code: "SHIFT2", status: "empty" },
      { code: "SHIFT3", status: "complete", actualIn: "2026-08-10T10:30:00.000Z", actualOut: "2026-08-10T12:00:00.000Z" },
    ],
  });

  assert.equal(result.regularMinutes, 270);
  assert.equal(result.overtimeMinutes, 90);
  assert.equal(result.payableWorkFractionBp, 5625);
});

test("cross-day evidence fails closed instead of silently paying a made-up duration", () => {
  assert.throws(
    () => calculateAttendance({
      workDate,
      timeZone: tz,
      segments: [{ code: "SHIFT3", status: "complete", actualIn: "2026-08-10T16:30:00.000Z", actualOut: "2026-08-10T17:30:00.000Z" }],
    }),
    (error) => error instanceof AttendanceRuleError && error.code === "CROSS_DAY",
  );
});
