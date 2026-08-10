#!/usr/bin/env node
/**
 * Stop the local AlumDoor development processes without touching their D1/R2/DO state.
 *
 * `Stop-Process` on workerd alone is insufficient: its Wrangler parent can stay alive
 * and reclaim the port later.  That was the cause of two local AlumDoor clusters
 * competing for 8799 and a Desk that appeared to have a random server outage.
 */
import { spawnSync } from "node:child_process";

const dryRun = process.argv.includes("--dry-run");
const portsArgument = process.argv.find((argument) => argument.startsWith("--ports="));
const ports = (portsArgument?.slice("--ports=".length) ?? "8799,5173")
  .split(",")
  .map((value) => Number(value.trim()))
  .filter((value) => Number.isInteger(value) && value > 0 && value < 65_536);

if (process.platform !== "win32") {
  console.log("LOCAL_DEV_STOP_SKIPPED platform=" + process.platform);
  process.exit(0);
}

function runPowerShell(script) {
  const result = spawnSync("powershell.exe", ["-NoProfile", "-Command", script], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || "PowerShell failed").trim());
  return result.stdout.trim();
}

function processList() {
  const output = runPowerShell(
    "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,CommandLine | ConvertTo-Json -Compress",
  );
  if (!output) return [];
  const parsed = JSON.parse(output);
  return (Array.isArray(parsed) ? parsed : [parsed]).map((row) => ({
    id: Number(row.ProcessId),
    parentId: Number(row.ParentProcessId),
    commandLine: typeof row.CommandLine === "string" ? row.CommandLine : "",
  }));
}

function listenerOwners() {
  const list = ports.join(",");
  const output = runPowerShell(
    `$ports=@(${list}); Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | `
      + "Where-Object { $ports -contains $_.LocalPort } | "
      + "Select-Object -ExpandProperty OwningProcess -Unique | ConvertTo-Json -Compress",
  );
  if (!output) return [];
  const parsed = JSON.parse(output);
  return (Array.isArray(parsed) ? parsed : [parsed]).map(Number).filter(Number.isInteger);
}

function ancestors(index, processId) {
  const result = [];
  const seen = new Set();
  let current = index.get(processId);
  while (current && !seen.has(current.id)) {
    result.push(current);
    seen.add(current.id);
    current = index.get(current.parentId);
  }
  return result;
}

function knownLocalRoot(chain) {
  const workerNodes = chain.filter((entry) => entry.commandLine.includes("wrangler.alumdoor-local.jsonc"));
  if (workerNodes.length > 0) return workerNodes.at(-1);
  return chain.find((entry) => /(?:\\client\\apps\\runtime|\bpnpm(?:\.cjs)?\b.*\bdev\b|\bvite\b)/i.test(entry.commandLine)) ?? chain[0];
}

const processes = processList();
const byId = new Map(processes.map((entry) => [entry.id, entry]));
const targets = new Map();

// Start from the requested listening ports.  A separate probe or a developer's
// intentionally running Worker on another port must never be killed just because it
// happens to use the same AlumDoor configuration.
for (const owner of listenerOwners()) {
  const root = knownLocalRoot(ancestors(byId, owner));
  if (root) targets.set(root.id, root);
}

if (targets.size === 0) {
  console.log("LOCAL_DEV_STOP_NO_PROCESS");
  process.exit(0);
}

for (const target of targets.values()) {
  const summary = target.commandLine.replace(/\s+/g, " ").slice(0, 180);
  if (dryRun) {
    console.log(`LOCAL_DEV_STOP_DRY_RUN pid=${target.id} command=${summary}`);
    continue;
  }
  const result = spawnSync("taskkill.exe", ["/PID", String(target.id), "/T", "/F"], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || `Could not stop ${target.id}`).trim());
  console.log(`LOCAL_DEV_STOPPED pid=${target.id}`);
}
