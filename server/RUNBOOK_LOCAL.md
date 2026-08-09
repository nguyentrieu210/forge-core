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
cd C:\alumdoor\server
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
cd C:\alumdoor\server
pnpm run build
```

Bắt buộc: `seed-local.mjs` import `dist/packages/frappe-api` để băm mật khẩu.

## 3. Tạo D1 cục bộ + chạy 81 migration

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
cd C:\alumdoor\server
npx wrangler dev --config apps/tenant-worker/wrangler.jsonc --port 8799 --local
```

## 6. Kiểm tra backend trước khi mở UI

Cửa sổ **thứ hai**:

```bat
cd C:\alumdoor\server
pnpm run smoke:http
```

Mong đợi `HTTP_SMOKE_PASS checks=26 failures=0`. Nếu đỏ ở đây thì đừng mở UI vội — sửa backend trước.

## 7. Cài app Alumdoor vào tenant cục bộ

```bat
cd C:\alumdoor\server
node scripts/build-alumdoor-v2-brief.mjs
```

> **Cảnh báo đã biết:** script này sinh ra brief version `2.0.35`, trong khi `briefs/alumdoor-v2.json`
> đã commit là `2.2.1` và lớn hơn 26 KB. **Script không tái tạo được artifact đã commit.** Đừng chạy
> nó rồi commit đè — sẽ rollback metadata. Chỉ chạy khi bạn thực sự muốn brief sinh mới.
> Để dùng brief đã commit thì bỏ qua bước này.

Cài package qua đường App Factory theo `docs/APP_FACTORY.md`.

## 8. Chạy Desk

Cửa sổ **thứ ba**:

```bat
cd C:\alumdoor\client\apps\runtime
pnpm run dev
```

Mở `http://localhost:5173`. Vite proxy `/api` sang `http://localhost:8799` (khai trong
`vite.config.ts`). Đổi cổng backend thì đặt `VITE_FORGE_BACKEND`.

Đăng nhập bằng tài khoản đã seed ở bước 4.

---

## Làm lại từ đầu

```bat
cd C:\alumdoor\server
rmdir /s /q apps\tenant-worker\.wrangler
npx wrangler d1 migrations apply cloudforge-demo --local --config apps/tenant-worker/wrangler.jsonc
pnpm run dev:seed
```

State D1 cục bộ nằm cạnh **wrangler config**, không phải gốc `server/`:
`server/apps/tenant-worker/.wrangler/state/v3/d1`.

`docs/VERIFICATION.md` xác nhận vòng migrate → seed → smoke từ D1 trắng đã PASS.

---

## Lỗi hay gặp

| Triệu chứng | Nguyên nhân |
|---|---|
| **Mọi request 401 `Missing trusted identity context`** | `.dev.vars` sai vị trí, hoặc thiếu `AUTH_MODE=development` — xem ô bên dưới |
| `wrangler dev` chạy nhưng không nạp biến | `.dev.vars` phải ở `server/apps/tenant-worker/`, không phải `server/` |
| `dev:seed` báo không tìm thấy module | chưa `pnpm run build` (bước 2) |
| Mọi lệnh ghi trả 417 | wrangler quá cũ hạ compat date; cần `wrangler@4.114.0+`, xem `docs/VERIFICATION.md` |
| UI gọi API ra 404 | worker chưa chạy, hoặc `VITE_FORGE_BACKEND` sai cổng |
| `pnpm install` chết ở `xlsx` | `client/packages/views` pin `xlsx` vào `cdn.sheetjs.com` thay vì npm registry; cần mạng ra được CDN đó |

### Bẫy lớn nhất của bản local — đã kiểm chứng

Hai lỗi cộng dồn, cùng cho một triệu chứng là **mọi request 401**:

**1. `.dev.vars` sai vị trí.** Wrangler đọc file cạnh `--config`, tức
`server/apps/tenant-worker/.dev.vars`. Để ở `server/.dev.vars` thì wrangler khởi động bình thường
nhưng **không nạp biến nào**.

**2. `AUTH_MODE=production`.** `wrangler.jsonc` đặt vậy. Ở chế độ đó
`apps/tenant-worker/src/index-base.ts:493` gọi `verifyTrustedIdentity`, đòi header identity do
gateway ký. Chạy tenant-worker đơn lẻ thì không có → `packages/auth/src/index.ts:201` ném
`Missing trusted identity context`.

Bằng chứng đo được:

| Cấu hình | `GET /api/method/metaforge.api.get_boot` |
|---|---|
| `.dev.vars` ở `server/` | `401 AUTHENTICATION_REQUIRED` — `"Missing trusted identity context"` |
| `.dev.vars` ở `apps/tenant-worker/` + `AUTH_MODE=development` | `403 PermissionError` — `"Login to access this resource"` |

`403` mới là đáp án đúng: `scripts/http-smoke.mjs:99` kiểm chính xác giá trị đó. Với cấu hình đúng,
smoke test cho **`HTTP_SMOKE_PASS checks=26 failures=0`**.

Nếu muốn giữ `AUTH_MODE=production` cho giống thật thì phải chạy thêm `pnpm run dev:gateway` và gọi
vào qua gateway — không cần thiết chỉ để xem UI.

---

## Điều KHÔNG làm được ở local

- `d1-migrate-remote.mjs`, `bootstrap-remote-secrets.mjs`, `wrangler deploy` — production, cần
  authorization tường minh theo `RUNBOOK.md` và `DELIVERY_POLICY.md`.
- Local PASS **không** là bằng chứng release. `docs/VERIFICATION.md` ghi rõ một trường hợp local
  24/24 xanh mà login vẫn hỏng sau deploy.
