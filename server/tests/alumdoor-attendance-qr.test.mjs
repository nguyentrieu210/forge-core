import test from "node:test";
import assert from "node:assert/strict";
import {
  AttendanceQrError,
  inspectStaticAttendanceStationToken,
  issueStaticAttendanceStationToken,
  verifyStaticAttendanceStationToken,
} from "../dist/apps-src/alumdoor-worker/src/attendance-qr.js";

const input = {
  tenant: "alu",
  station: "CỔNG-XƯỞNG",
  secret: "attendance-secret-for-tests-only",
  tokenVersion: "1",
};

test("static station QR is stable and contains no employee, coordinates or secret", async () => {
  const first = await issueStaticAttendanceStationToken(input);
  const second = await issueStaticAttendanceStationToken(input);
  assert.equal(first.token, second.token);
  assert.equal(first.token.includes(input.secret), false);
  assert.equal(first.token.includes("EMP"), false);
  assert.equal(first.token.includes("latitude"), false);
  assert.equal(inspectStaticAttendanceStationToken(first.token).station, input.station);
  const verified = await verifyStaticAttendanceStationToken({ ...input, token: first.token });
  assert.match(verified.tokenHash, /^[0-9a-f]{64}$/);
});

test("rotating station version invalidates the old printed QR", async () => {
  const old = await issueStaticAttendanceStationToken(input);
  await assert.rejects(
    () => verifyStaticAttendanceStationToken({ ...input, tokenVersion: "2", token: old.token }),
    (error) => error instanceof AttendanceQrError && error.code === "QR_REVOKED",
  );
});

test("tampering or changing station never becomes a valid scan", async () => {
  const issued = await issueStaticAttendanceStationToken(input);
  const [payload, signature] = issued.token.split(".");
  await assert.rejects(
    () => verifyStaticAttendanceStationToken({ ...input, token: `${payload}a.${signature}` }),
    (error) => error instanceof AttendanceQrError && error.code === "QR_INVALID",
  );
  await assert.rejects(
    () => verifyStaticAttendanceStationToken({ ...input, station: "TRẠM-KHÁC", token: issued.token }),
    (error) => error instanceof AttendanceQrError && error.code === "QR_STATION_MISMATCH",
  );
});
