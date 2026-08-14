#!/usr/bin/env node
/**
 * Sinh `server/apps/tenant-worker/.dev.vars` cho `wrangler dev` cục bộ.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(serverRoot, "apps", "tenant-worker", ".dev.vars");
const legacy = path.join(serverRoot, ".dev.vars");
const example = path.join(serverRoot, ".dev.vars.example");

const source = existsSync(target) ? target : existsSync(legacy) ? legacy : example;
let text = readFileSync(source, "utf8");

const secret = () => randomBytes(24).toString("hex");
const NEEDS_SECRET = ["JWT_SECRET", "INTERNAL_AUTH_SECRET", "INTERNAL_SERVICE_TOKEN", "CONTROL_TOKEN", "SESSION_SECRET"];

text = text.replace(/^([A-Z_]+)=replace-with.*$/gm, (line, key) =>
  NEEDS_SECRET.includes(key) ? `${key}=${secret()}` : line);

if (!/^SESSION_SECRET=/m.test(text)) text += `\nSESSION_SECRET=${secret()}\n`;

text = text
  .replace(/^AUTH_MODE=.*$/gm, "")
  .replace(/^PUBLIC_ORIGIN=.*$/gm, "")
  .replace(/\n{3,}/g, "\n\n")
  .trimEnd();
text += "\n\n# Tenant-worker chạy đơn lẻ (không qua gateway) BẮT BUỘC development.\nAUTH_MODE=development\n";
text += "# App method dispatcher dùng service binding local khi origin là loopback.\nPUBLIC_ORIGIN=http://127.0.0.1:8799\n";

mkdirSync(path.dirname(target), { recursive: true });
writeFileSync(target, text);
writeFileSync(legacy, text);

const remaining = (text.match(/replace-with/g) ?? []).length;
if (remaining) {
  console.error(`DEV_VARS_INCOMPLETE còn ${remaining} giá trị "replace-with" chưa thay — sửa tay ${target}`);
  process.exit(1);
}
console.log(`  .dev.vars sẵn sàng: ${path.relative(serverRoot, target)} (nguồn: ${path.relative(serverRoot, source)})`);
