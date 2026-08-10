import test from "node:test";
import assert from "node:assert/strict";
import { attendanceChallenge, attendanceScan } from "../dist/apps-src/alumdoor-worker/src/attendance-routes.js";

const now = new Date("2026-08-10T01:00:05.000Z");
const env = { ALUMDOOR_ATTENDANCE_QR_SECRET: "attendance-route-secret-for-tests-only" };

function platformCall(observed) {
  return async (path, init = {}) => {
    if (path === "method/metaforge.api.get_alumdoor_attendance_qr_config") {
      assert.deepEqual(JSON.parse(String(init.body ?? "{}")), { station: "QR-XUONG-01" });
      return Response.json({ message: {
        station: {
          station_code: "QR-XUONG-01",
          station_name: "Cổng xưởng 01",
          policy: "ATP-2026-00001",
          secret_version: 1,
          is_active: 1,
        },
        policy: {
          policy_status: "approved",
          timezone: "Asia/Ho_Chi_Minh",
          qr_ttl_seconds: 15,
          effective_from: "2026-01-01",
          effective_to: "2026-12-31",
        },
      } });
    }
    if (path === "method/metaforge.api.commit_alumdoor_attendance_scan") {
      observed.push(JSON.parse(String(init.body ?? "{}")));
      return Response.json({ message: { segment: "SHIFT1", log_type: "IN", idempotent: false } });
    }
    return Response.json({ message: "not found" }, { status: 404 });
  };
}

function request() {
  return new Request("https://app.internal/api/method/alumdoor.attendance.challenge", {
    method: "POST",
    headers: { "x-cloudforge-tenant": "tenant-attendance-test" },
  });
}

test("attendance challenge is a short-lived station token without employee data", async () => {
  const observed = [];
  const response = await attendanceChallenge({
    request: request(),
    call: platformCall(observed),
    env,
    args: { station: "QR-XUONG-01" },
    now,
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.station, "QR-XUONG-01");
  assert.equal(body.refresh_after_seconds, 15);
  assert.equal(body.token.includes("EMP"), false);
  assert.equal(body.token.includes(env.ALUMDOOR_ATTENDANCE_QR_SECRET), false);
  assert.deepEqual(observed, []);
});

test("attendance scan verifies the challenge and delegates only station + nonce to the native transaction", async () => {
  const observed = [];
  const challenge = await attendanceChallenge({
    request: request(),
    call: platformCall(observed),
    env,
    args: { station: "QR-XUONG-01" },
    now,
  });
  const token = (await challenge.json()).token;

  const response = await attendanceScan({
    request: request(),
    call: platformCall(observed),
    env,
    args: { token, device_fingerprint_hash: "a".repeat(64) },
    now,
  });
  assert.equal(response.status, 200, await response.text());
  assert.equal(observed.length, 1);
  assert.deepEqual(Object.keys(observed[0]).sort(), ["device_fingerprint_hash", "nonce_hash", "station"]);
  assert.equal(observed[0].station, "QR-XUONG-01");
  assert.match(observed[0].nonce_hash, /^[a-f0-9]{64}$/);
  assert.equal(observed[0].device_fingerprint_hash, "a".repeat(64));
});

test("expired or cross-tenant QR never reaches the native attendance transaction", async () => {
  const observed = [];
  const challenge = await attendanceChallenge({
    request: request(),
    call: platformCall(observed),
    env,
    args: { station: "QR-XUONG-01" },
    now,
  });
  const token = (await challenge.json()).token;
  const response = await attendanceScan({
    request: new Request("https://app.internal/api/method/alumdoor.attendance.scan", {
      method: "POST",
      headers: { "x-cloudforge-tenant": "other-tenant" },
    }),
    call: platformCall(observed),
    env,
    args: { token },
    now,
  });
  assert.equal(response.status, 422);
  assert.equal((await response.json()).code, "QR_STATION_MISMATCH");
  assert.deepEqual(observed, []);
});
