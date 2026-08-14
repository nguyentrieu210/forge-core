# RUNBOOK — chạy Forge hoàn toàn cục bộ (không deploy Cloudflare)

Mục tiêu: dựng đủ backend + Desk trên máy để **nhìn thấy và thao tác dự án thật**, không đụng
Cloudflare, không đụng dữ liệu production.

Stack cục bộ: `wrangler dev` (workerd thật) + D1 file cục bộ + Vite dev server cho MetaForge Desk.

> **Ranh giới.** Mọi thứ ở đây là `--local`. Không có lệnh nào chạm tài khoản Cloudflare, D1 remote,
> secret hay DNS. `seed-local.mjs` tự từ chối chạy trên database remote.

---

## 0. Yêu cầu

- Node 22+, `corepack enable`, pnpm 9
- Đã `pnpm install` ở gốc repo

## 1. Secret cục bộ — làm một lần

`run-local.bat` ở gốc repo đã tự sinh file này. Phần dưới chỉ cần khi bạn muốn làm tay.
File nằm trong `.gitignore` (`server/.gitignore` dòng 23: `apps/*/.dev.vars`) nên không bao giờ bị commit.

```bat
cd C:\Forge-r6\server
copy .dev.vars.example apps\tenant-worker\.dev.vars
```

> **Vị trí quan trọng.** Wrangler đọc `.dev.vars` **cạnh file config**, tức
> `server/apps/tenant-worker/.dev.vars`. Đặt ở `server/.dev.vars` thì wrangler **không nạp biến nào**
> và mọi request trả 401. `server/.gitignore` dòng 23 (`apps/*/.dev.vars`) đã ignore sẵn vị trí này.

Mở `.dev.vars` và thay mọi giá trị `replace-with-...` bằng chuỗi ngẫu nhiên **tối thiểu 32 ký tự**.
Sinh nhanh:

```bat
node -e "for(const k of ['JWT_SECRET','INTERNAL_AUTH_SECRET','INTERNAL_SERVICE_TOKEN','CONTROL_TOKEN'])console.log(k+'='+require('crypto').randomBytes(24).toString('hex'))"
```

Rồi **thêm hai dòng bắt buộc**:

```
SESSION_SECRET=<48 ký tự ngẫu nhiên>
AUTH_MODE=development
```

`AUTH_MODE` mặc định trong `wrangler.jsonc` là `production`, chế độ đó đòi trusted-identity header do
**gateway-worker ký**. Chạy tenant-worker một mình thì không ai ký — mọi request 401
`Missing trusted identity context`. Xem `apps/tenant-worker/src/index-base.ts:491`.

## 2. Build server

```bat
cd C:\Forge-r6\server
pnpm run build
```

Bắt buộc: `seed-local.mjs` import `dist/packages/frappe-api` để băm mật khẩu.

## 3. Tạo D1 cục bộ + chạy migration

```bat
npx wrangler d1 migrations apply cloudforge-demo --local --config apps/tenant-worker/wrangler.jsonc
```

Database nằm ở `server/apps/tenant-worker/.wrangler/state/v3/d1` — thuần file, xoá lúc nào cũng được.

## 4. Seed tài khoản đăng nhập

```bat
pnpm run dev:seed
```

Mặc định tạo `dev@example.com` / `local-dev-password-1` với vai trò System Manager. Đổi được:

```bat
node scripts/seed-local.mjs --user ban@noi-bo.test --password mot-mat-khau-du-dai
```

## 5. Chạy worker

Cửa sổ terminal **thứ nhất**, để nguyên:

```bat
cd C:\Forge-r6\server
npx wrangler dev --config apps/tenant-worker/wrangler.jsonc --port 8799 --local
```

## 6. Kiểm tra backend trước khi mở UI

Cửa sổ **thứ hai**:

```bat
cd C:\Forge-r6\server
pnpm run smoke:http
```

Mong đợi `HTTP_SMOKE_PASS checks=26 failures=0`. Nếu đỏ ở đây thì đừng mở UI vội — sửa backend trước.

## 7. Cài một app (tuỳ chọn)

Bản lõi không kèm app nghiệp vụ nào. Muốn có DocType/màn hình để thử thì viết brief JSON và cài
qua App Factory theo `docs/APP_FACTORY.md` — không có bước bắt buộc ở đây nữa.

## 8. Chạy Desk

Cửa sổ **thứ ba**:

```bat
cd C:\Forge-r6\client\apps\runtime
pnpm run dev
```

Mở `http://localhost:5173`. Vite proxy `/api` sang `http://localhost:8799` (khai trong
`vite.config.ts`). Đổi cổng backend thì đặt `VITE_FORGE_BACKEND`.

Đăng nhập bằng tài khoản đã seed ở bước 4.

---

## Làm lại từ đầu

```bat
cd C:\Forge-r6\server
rmdir /s /q apps\tenant-worker\.wrangler
npx wrangler d1 migrations apply cloudforge-demo --local --config apps/tenant-worker/wrangler.jsonc
pnpm run dev:seed
```

State D1 cục bộ nằm cạnh **wrangler config**, không phải gốc `server/`:
`server/apps/tenant-worker/.wrangler/state/v3/d1`.

---

## Lỗi hay gặp

| Triệu chứng | Nguyên nhân |
|---|---|
| **Mọi request 401 `Missing trusted identity context`** | `.dev.vars` sai vị trí, hoặc thiếu `AUTH_MODE=development` — xem ô bên dưới |
| `wrangler dev` chạy nhưng không nạp biến | `.dev.vars` phải ở `server/apps/tenant-worker/`, không phải `server/` |
| `dev:seed` báo không tìm thấy module | chưa `pnpm run build` (bước 2) |
| Mọi lệnh ghi trả 417 | wrangler quá cũ hạ compat date; cần `wrangler@4.114.0+` |
| UI gọi API ra 404 | worker chưa chạy, hoặc `VITE_FORGE_BACKEND` sai cổng |
| `pnpm install` chết ở `xlsx` | `client/packages/views` pin `xlsx` vào `cdn.sheetjs.com` thay vì npm registry; cần mạng ra được CDN đó |

### Bẫy lớn nhất của bản local — đã kiểm chứng

Hai lỗi cộng dồn, cùng cho một triệu chứng là **mọi request 401**:

**1. `.dev.vars` sai vị trí.** Wrangler đọc file cạnh `--config`, tức
`server/apps/tenant-worker/.dev.vars`. Để ở `server/.dev.vars` thì wrangler khởi động bình thường
nhưng **không nạp biến nào**.

**2. `AUTH_MODE=production`.** `wrangler.jsonc` đặt vậy. Ở chế độ đó
`apps/tenant-worker/src/index-base.ts:295` gọi `verifyTrustedIdentity`, đòi header identity do
gateway ký. Chạy tenant-worker đơn lẻ thì không có → `packages/auth/src/index.ts:201` ném
`Missing trusted identity context`.

Bằng chứng đo được:

| Cấu hình | `GET /api/method/metaforge.api.get_boot` |
|---|---|
| `.dev.vars` ở `server/` | `401 AUTHENTICATION_REQUIRED` — `"Missing trusted identity context"` |
| `.dev.vars` ở `apps/tenant-worker/` + `AUTH_MODE=development` | `403 PermissionError` — `"Login to access this resource"` |

`403` mới là đáp án đúng: `scripts/http-smoke.mjs` kiểm chính xác giá trị đó (dòng 99–100). Với
cấu hình đúng, smoke test cho **`HTTP_SMOKE_PASS checks=26 failures=0`**.

Nếu muốn giữ `AUTH_MODE=production` cho giống thật thì phải chạy thêm `pnpm run dev:gateway` và gọi
vào qua gateway — không cần thiết chỉ để xem UI.

---

## Điều KHÔNG làm được ở local

- `d1-migrate-remote.mjs`, `bootstrap-remote-secrets.mjs`, `wrangler deploy` — chạm production,
  chỉ chạy khi có yêu cầu rõ ràng từ người vận hành thật.
- Local PASS không tự động là bằng chứng đã deploy đúng. Config sai (secret, route, binding)
  chỉ lộ ra sau khi deploy thật — luôn kiểm health-check sau khi lên production.

---

## GitHub main -> local reproducible build

Use this when the local machine must follow the exact `main` commit on GitHub:

```bat
cd C:\Forge-r6
sync-local.bat
```

The script only fast-forwards a **clean local `main`**. It refuses to run if
there are local edits or local commits that GitHub does not have. On an update,
it stops the local servers, snapshots local Wrangler state into ignored
`local-backups\`, runs `pnpm install --frozen-lockfile`, then runs the full
`pnpm run verify` gate before rebuilding, migrating local D1, reinstalling
metadata and starting the local servers again.

To keep watching GitHub `main` every minute, leave this running:

```bat
cd C:\Forge-r6
watch-github-local.bat 60
```

The snapshot contains the local D1, R2 and Durable Object state, together with
a `manifest.json` recording the source commit. It is intentionally excluded
from Git: source code and metadata are reproducible from GitHub, but running
business data must never be committed to the public repository. A remote D1/R2
copy or deployment is a separate, explicitly approved operation.
