#!/usr/bin/env node
/**
 * Run the repository verification gate without leaking local Wrangler secrets
 * into generated worker type declarations. Wrangler includes .dev.vars when it
 * runs `wrangler types`; the declarations committed to Git deliberately model
 * the shared production config instead.
 */
import { existsSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const repositoryRoot = path.resolve(import.meta.dirname, "..", "..");
const devVarsPath = path.join(repositoryRoot, "server", "apps", "tenant-worker", ".dev.vars");
const hiddenDevVarsPath = `${devVarsPath}.verify-hidden`;

if (existsSync(hiddenDevVarsPath)) {
  console.error("LOCAL_VERIFY_REFUSED: found a previous .dev.vars.verify-hidden file; restore it before verifying.");
  process.exit(1);
}

const hadLocalDevVars = existsSync(devVarsPath);
let verificationStatus = 1;
try {
  if (hadLocalDevVars) renameSync(devVarsPath, hiddenDevVarsPath);
  const command = process.platform === "win32" ? (process.env.ComSpec || "cmd.exe") : "pnpm";
  const args = process.platform === "win32" ? ["/d", "/s", "/c", "pnpm run verify"] : ["run", "verify"];
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    stdio: "inherit",
  });
  verificationStatus = result.status ?? 1;
  if (result.error) {
    console.error(`LOCAL_VERIFY_FAILED: ${result.error.message}`);
    verificationStatus = 1;
  }
} finally {
  if (hadLocalDevVars && existsSync(hiddenDevVarsPath)) renameSync(hiddenDevVarsPath, devVarsPath);
}

process.exit(verificationStatus);
