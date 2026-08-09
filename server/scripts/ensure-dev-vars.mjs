#!/usr/bin/env node
/**
 * Sinh `server/apps/tenant-worker/.dev.vars` cho `wrangler dev` cục bộ.
 *
 * Vì sao là file riêng chứ không phải `node -e` trong .bat: chuỗi JS chứa `!`, mà cmd.exe bật
 * `EnableDelayedExpansion` sẽ NUỐT ký tự đó và làm hỏng lệnh — script đứng im không rõ lý do.
 *
 * Hai điều bắt buộc, thiếu là mọi request trả 401:
 *   1. file phải nằm CẠNH wrangler config (`apps/tenant-worker/`), không phải ở `server/`;
 *   2. `AUTH_MODE=development` — mặc định `production` đòi trusted-identity header do gateway ký,
 *      mà chạy tenant-worker đơn lẻ thì không có ai ký.
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
  .replace(/\n{3,}/g, "\n\n")
  .trimEnd();
text += "\n\n# Tenant-worker chạy đơn lẻ (không qua gateway) BẮT BUỘC development.\nAUTH_MODE=development\n";

mkdirSync(path.dirname(target), { recursive: true });
writeFileSync(target, text);
writeFileSync(legacy, text);

const remaining = (text.match(/replace-with/g) ?? []).length;
if (remaining) {
  console.error(`DEV_VARS_INCOMPLETE còn ${remaining} giá trị "replace-with" chưa thay — sửa tay ${target}`);
  process.exit(1);
}
console.log(`  .dev.vars sẵn sàng: ${path.relative(serverRoot, target)} (nguồn: ${path.relative(serverRoot, source)})`);
