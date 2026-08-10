import test from "node:test";
import assert from "node:assert/strict";
import {
  AttendanceQrError,
  attendanceScanExternalId,
  issueAttendanceQr,
  verifyAttendanceQr,
} from "../dist/apps-src/alumdoor-worker/src/attendance-qr.js";

const input = {
  tenant: "alu",
  station: "CỔNG-XƯỞNG",
  secret: "attendance-secret-for-tests-only",
  secretVersion: "v1",
  ttlSeconds: 15,
};

test("the same 15-second bucket produces a signed QR without exposing the secret", async () => {
  const first = await issueAttendanceQr({ ...input, now: 100_000 });
  const second = await issueAttendanceQr({ ...input, now: 104_999 });
  assert.equal(first.token, second.token);
  assert.equal(first.payload.expires_at, 105);
  assert.equal(first.token.includes(input.secret), false);

  const verified = await verifyAttendanceQr({ ...input, token: first.token, now: 104_999 });
  assert.equal(verified.payload.station, input.station);
  assert.match(verified.nonceHash, /^[0-9a-f]{64}$/);
});

test("QR is rejected once its server-side bucket expires", async () => {
  const challenge = await issueAttendanceQr({ ...input, now: 100_000 });
  await assert.rejects(
    () => verifyAttendanceQr({ ...input, token: challenge.token, now: 105_000 }),
    (error) => error instanceof AttendanceQrError && error.code === "QR_EXPIRED",
  );
});

test("tampering or changing station never becomes a valid scan", async () => {
  const challenge = await issueAttendanceQr({ ...input, now: 100_000 });
  const [payload, signature] = challenge.token.split(".");
  await assert.rejects(
    () => verifyAttendanceQr({ ...input, token: `${payload}a.${signature}`, now: 101_000 }),
    (error) => error instanceof AttendanceQrError && error.code === "QR_INVALID",
  );
  await assert.rejects(
    () => verifyAttendanceQr({ ...input, station: "TRẠM-KHÁC", token: challenge.token, now: 101_000 }),
    (error) => error instanceof AttendanceQrError && error.code === "QR_STATION_MISMATCH",
  );
});

test("scan idempotency is stable for the same employee, challenge and segment", async () => {
  const same = {
    tenant: "alu",
    employee: "EMP-0001",
    station: "CỔNG-XƯỞNG",
    nonceHash: "a".repeat(64),
    segment: "SHIFT1",
  };
  assert.equal(await attendanceScanExternalId(same), await attendanceScanExternalId(same));
  assert.notEqual(
    await attendanceScanExternalId(same),
    await attendanceScanExternalId({ ...same, segment: "SHIFT2" }),
  );
});
