# Forge Core — lõi doctype tương thích Frappe, chạy trên Cloudflare

Đây là bản đã bóc lõi khỏi `nguyentrieu210/forge` tại mốc R6 (`b9b325cb`). Toàn bộ nghiệp vụ
ngành — ERPNext (bán hàng, kho, mua hàng, giá), Alumdoor, social commerce, nhân sự — đã gỡ.
Còn lại là engine doctype: khai một DocType là có list/form/report/quyền/quy trình duyệt,
không cần viết UI riêng.

| Thư mục | Vai trò |
|---|---|
| `server/` | Document Kernel, Frappe-shaped REST API, App Registry, Durable Object aggregate |
| `client/` | React Desk meta-driven (list/form/tree/kanban/report/builder) |
| `docs/` | ba tài liệu còn sống: bề mặt API, app factory, gate kiểm tra |

## Nó làm được gì

- **90 API method tương thích Frappe** — `frappe.client.*`, `frappe.desk.*`, `frappe.model.*` —
  client Frappe thật gọi thẳng được. Xem `docs/API_SURFACE.md`.
- **Khai DocType là có màn hình.** `GenericMetadataController` lo list/form/tree/kanban/report/
  print/web form từ metadata, không cần controller riêng.
- **Phân quyền tới từng dòng, từng trường.** DocPerm, User Permission, row-level, che trường —
  `server/packages/frappe-model` + `frappe-api`.
- **Quy trình duyệt nhiều tầng.** `AppFactoryApprovalRuntime` chạy trên Durable Object: kế
  hoạch duyệt theo giai đoạn, hẹn giờ, uỷ quyền, kiểm phân tách nhiệm vụ (SoD).
- **Ghi có thứ tự, chống ghi đè.** Mọi mutation qua `MutationCommand` với `expected_version`;
  Durable Object xếp hàng theo khoá tài liệu.
- **App Factory.** `forge.apps.install` cài app từ brief JSON; `capability profile` bật/tắt
  năng lực theo tenant. Xem `docs/APP_FACTORY.md`.

## Nó KHÔNG làm được gì

Không kế toán, không kho, không mua bán, không sản xuất, không nhân sự — không `Sales Order`,
không `Item`, không `Stock Entry`. Muốn có thì viết app riêng cắm vào lõi này qua App Registry,
đừng trộn thẳng vào `server/packages` hay `client/packages/views` như bản gốc đã làm với
Alumdoor (đó chính là lý do phải bóc).

85 migration D1 cũ (`server/migrations/tenant/`) vẫn giữ nguyên số thứ tự vì chúng phụ thuộc
nhau theo chuỗi — một số bảng ERP còn sót nằm im, không migration nào của app còn đọc chúng.

## Chạy local

```bash
corepack enable
pnpm install
pnpm run build
pnpm run server:test
```

Chi tiết dựng backend + Desk trên máy, không đụng Cloudflare: `server/RUNBOOK_LOCAL.md`.

## Nguồn gốc

Lịch sử git giữ nguyên tới tận `nguyentrieu210/forge`, nên `git log`/`git blame` vẫn tra được
quyết định cũ. Ba commit đầu trên nhánh `main` ghi lại đúng việc đã bóc gì và vì sao:
`741caeb7`, `27d2fb90`, `5a980c91`.
