# Server — lõi doctype tương thích Frappe

Backend Cloudflare-native: Workers, Durable Objects, D1 mỗi tenant, Queues/R2, và một router
API hình dạng Frappe. Không còn nghiệp vụ ERP (bán hàng, kho, mua hàng, sản xuất, nhân sự) —
xem `../README.md` để biết vì sao và bóc từ đâu.

## Có gì

- **`packages/document-kernel`** — engine ghi tài liệu: `MutationCommand` với `expected_version`,
  thực thi tuần tự qua Durable Object theo khoá tài liệu.
- **`packages/frappe-api`** — router 90 method tương thích Frappe (`frappe.client.*`,
  `frappe.desk.*`, `frappe.model.*`), phiên đăng nhập, MFA, CSRF.
- **`packages/frappe-model`** — metadata DocType, quyền (DocPerm/User Permission/row-level/che
  trường), tra cứu link/tree.
- **`packages/app-registry`** — cài app từ brief JSON, `AppFactoryApprovalRuntime` (quy trình
  duyệt nhiều tầng, hẹn giờ, uỷ quyền, kiểm SoD).
- **`packages/query`** — report builder, count/list có phân trang.
- **`packages/auth`** — user store, MFA, phiên, giới hạn tần suất đăng nhập.
- Các Worker trong `apps/`: `tenant-worker` (route chính), `gateway-worker` (định tuyến theo
  tenant), `query-worker`, `jobs-worker`, `control-plane-worker`.

## Chạy local

Xem `RUNBOOK_LOCAL.md` — dựng đủ backend + Desk trên máy, không đụng Cloudflare thật.

```bash
pnpm run server:build
pnpm run server:typecheck
pnpm run server:test
```

## Ví dụ lệnh có xác thực

```http
POST /api/v1/commands
Authorization: Bearer <signed-jwt>
Content-Type: application/json

{
  "command_id": "client-generated-idempotency-key",
  "doctype": "<Tên DocType do app khai>",
  "name": "<tên tài liệu>",
  "action": "create",
  "expected_version": null,
  "document": {}
}
```

Tenant, actor, roles là do server phân giải từ chữ ký phiên/JWT — không bao giờ tin theo header
client tự khai.

## Ranh giới

Đây là engine, không phải app. Không có `Sales Order`, `Item`, `Stock Entry` — khai DocType và
viết controller riêng nếu cần hành vi ngoài CRUD/quyền/quy trình duyệt mặc định. Đừng import
thẳng code app vào `packages/` hay router lõi — đó chính là lỗi kiến trúc đã phải mổ khi bóc
Alumdoor ra khỏi bản này (xem `741caeb7`, `27d2fb90` trong git log).
