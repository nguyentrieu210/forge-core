#!/usr/bin/env node
/** Keep the local callback Worker on the tenant Worker's exact signing secret. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tenantVars = path.join(serverRoot, "apps", "tenant-worker", ".dev.vars");
const callbackVars = path.join(serverRoot, "apps", "purchase-qa-callback", ".dev.vars");

/**
 * Local multi-Worker development shares the platform master secret.
 *
 * A key id changes tenant-worker semantics: INTERNAL_AUTH_SECRET is then treated as
 * an already-derived tenant key. The local callback instead needs the master so it
 * can verify and re-mint the app identity. Leaving the example's `k1` line in place
 * therefore makes every callback read fail with an invalid-signature HTTP 401.
 */
export function useLocalMasterSecret(text) {
  return text
    .replace(/^INTERNAL_AUTH_KEY_ID(?:_PREVIOUS)?=.*(?:\r?\n|$)/gm, "")
    .replace(/^INTERNAL_AUTH_SECRET_PREVIOUS=.*(?:\r?\n|$)/gm, "")
    .replace(/\n{3,}/g, "\n\n");
}

function main() {
  if (!existsSync(tenantVars)) {
    console.error(`ALUMDOOR_LOCAL_VARS_MISSING Run ensure-dev-vars.mjs first: ${tenantVars}`);
    process.exit(1);
  }

  const localVars = useLocalMasterSecret(readFileSync(tenantVars, "utf8"));
  mkdirSync(path.dirname(callbackVars), { recursive: true });
  writeFileSync(tenantVars, localVars);
  writeFileSync(callbackVars, localVars);
  console.log("  Alumdoor local Workers share the master signing secret.");
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) main();
