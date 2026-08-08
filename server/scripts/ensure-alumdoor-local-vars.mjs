#!/usr/bin/env node
/** Keep the local callback Worker on the tenant Worker's exact signing secret. */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tenantVars = path.join(serverRoot, "apps", "tenant-worker", ".dev.vars");
const callbackVars = path.join(serverRoot, "apps", "purchase-qa-callback", ".dev.vars");

if (!existsSync(tenantVars)) {
  console.error(`ALUMDOOR_LOCAL_VARS_MISSING Run ensure-dev-vars.mjs first: ${tenantVars}`);
  process.exit(1);
}

mkdirSync(path.dirname(callbackVars), { recursive: true });
copyFileSync(tenantVars, callbackVars);
console.log("  Alumdoor callback .dev.vars now matches tenant-worker.");
