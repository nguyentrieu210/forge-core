import test from "node:test";
import assert from "node:assert/strict";
import { useLocalMasterSecret } from "../scripts/ensure-alumdoor-local-vars.mjs";

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
