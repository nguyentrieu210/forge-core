#!/usr/bin/env node
/**
 * Makes a filesystem snapshot of every persisted local Wrangler state before
 * local D1/R2/DO migrations run. This never contacts Cloudflare and the output
 * is intentionally ignored by Git because it can contain local business data.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";

const repositoryRoot = path.resolve(import.meta.dirname, "..", "..");
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputRoot = path.join(repositoryRoot, "local-backups", `forge-local-state-${stamp}`);
const dryRun = process.argv.includes("--dry-run");
const stateRoots = [
  "server/apps/tenant-worker/.wrangler/state",
  "server/apps-src/alumdoor-worker/.wrangler",
  "server/apps/purchase-qa-callback/.wrangler",
];

function bytesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).reduce((total, entry) => {
    const item = path.join(directory, entry.name);
    return total + (entry.isDirectory() ? bytesIn(item) : statSync(item).size);
  }, 0);
}

const sources = stateRoots.map((relativePath) => {
  const source = path.join(repositoryRoot, relativePath);
  return { relativePath, source, exists: existsSync(source), bytes: existsSync(source) ? bytesIn(source) : 0 };
});

if (dryRun) {
  console.log(JSON.stringify({ format: "forge-local-state-backup/v1", dry_run: true, output: outputRoot, sources }, null, 2));
  process.exit(0);
}

mkdirSync(outputRoot, { recursive: true });
for (const source of sources) {
  if (!source.exists) continue;
  const destination = path.join(outputRoot, source.relativePath);
  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(source.source, destination, { recursive: true, force: false, errorOnExist: true });
}

const gitHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repositoryRoot, encoding: "utf8" }).trim();
const manifest = {
  format: "forge-local-state-backup/v1",
  created_at: new Date().toISOString(),
  git_head: gitHead,
  note: "Local-only snapshot: D1, R2 and Durable Object state. Never commit this directory.",
  sources: sources.map(({ relativePath, exists, bytes }) => ({ path: relativePath, exists, bytes })),
};
writeFileSync(path.join(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
console.log(`LOCAL_STATE_BACKUP_OK path=${outputRoot} bytes=${sources.reduce((sum, source) => sum + source.bytes, 0)}`);
