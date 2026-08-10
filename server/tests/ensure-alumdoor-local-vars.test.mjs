import test from "node:test";
import assert from "node:assert/strict";
import { ensureAttendanceQrSecret, useLocalMasterSecret } from "../scripts/ensure-alumdoor-local-vars.mjs";

test("local Alumdoor Workers use the master secret rather than a derived tenant key", () => {
  const result = useLocalMasterSecret([
    "INTERNAL_AUTH_SECRET=master-secret-with-at-least-32-characters",
    "INTERNAL_AUTH_KEY_ID=k1",
    "INTERNAL_AUTH_SECRET_PREVIOUS=old-derived-secret",
    "INTERNAL_AUTH_KEY_ID_PREVIOUS=k0",
    "SESSION_SECRET=session-secret",
    "",
  ].join("\n"));

  assert.match(result, /^INTERNAL_AUTH_SECRET=master-secret-with-at-least-32-characters$/m);
  assert.match(result, /^SESSION_SECRET=session-secret$/m);
  assert.doesNotMatch(result, /^INTERNAL_AUTH_KEY_ID/m);
  assert.doesNotMatch(result, /^INTERNAL_AUTH_SECRET_PREVIOUS=/m);
});

test("local attendance QR secret is created once and then preserved", () => {
  const created = ensureAttendanceQrSecret("EXISTING=keep\n");
  assert.equal(created.created, true);
  assert.match(created.text, /^EXISTING=keep$/m);
  const secret = created.text.match(/^ALUMDOOR_ATTENDANCE_QR_SECRET=([a-f0-9]{64})$/m)?.[1];
  assert.ok(secret, "a 32-byte local HMAC secret is created");

  const preserved = ensureAttendanceQrSecret(created.text);
  assert.equal(preserved.created, false);
  assert.equal(preserved.text, created.text);
});
