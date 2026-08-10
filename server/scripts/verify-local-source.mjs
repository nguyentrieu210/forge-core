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

function restoreLocalDevVars() {
  if (!hadLocalDevVars || !existsSync(hiddenDevVarsPath)) return;
  // A nested local helper may recreate .dev.vars while the original is hidden.
  // Never overwrite either secret: retain that new copy outside Git, then restore
  // the pre-verification file the running local cluster was configured with.
  if (existsSync(devVarsPath)) {
    const preservedPath = `${devVarsPath}.recreated-during-verify-${Date.now()}`;
    renameSync(devVarsPath, preservedPath);
    console.warn(`LOCAL_VERIFY_PRESERVED_RECREATED_DEV_VARS path=${preservedPath}`);
  }
  renameSync(hiddenDevVarsPath, devVarsPath);
}

function runPnpm(args) {
  const command = process.platform === "win32" ? (process.env.ComSpec || "cmd.exe") : "pnpm";
  const commandArgs = process.platform === "win32"
    ? ["/d", "/s", "/c", `pnpm ${args.join(" ")}`]
    : args;
  const result = spawnSync(command, commandArgs, {
    cwd: repositoryRoot,
    stdio: "inherit",
  });
  if (result.error) {
    console.error(`LOCAL_VERIFY_FAILED: ${result.error.message}`);
    return 1;
  }
  return result.status ?? 1;
}

try {
  if (hadLocalDevVars) renameSync(devVarsPath, hiddenDevVarsPath);
  // `wrangler types` must not see local secret declarations, but Worker integration
  // tests intentionally load the local development actor from .dev.vars. Run the
  // generated-type/business suite first, then restore local variables for the rest.
  verificationStatus = runPnpm(["run", "server:check"]);
} finally {
  restoreLocalDevVars();
}

if (verificationStatus === 0) {
  for (const args of [
    ["--filter", "cloudforge", "run", "test:workers"],
    ["run", "client:typecheck"],
    ["run", "client:test"],
    ["run", "client:build"],
  ]) {
    verificationStatus = runPnpm(args);
    if (verificationStatus !== 0) break;
  }
}

process.exit(verificationStatus);
