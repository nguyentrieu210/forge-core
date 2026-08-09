# CHANGELOG

## Unreleased

### Added

- Nút `+` cạnh các trường liên kết có thể tạo mới, mở đúng biểu mẫu tạo nhanh và tự chọn bản ghi vừa lưu.

### Changed

- The sales-line mesh-height field appears only for Cửa Lưới.
- Sales Orders now select the latest active price list for the customer's price group, while preserving a manual override.
- Renamed the Item tracking section to “Quản lý lô & serial”.
- The Item tracking section hides expiry, negative-stock, origin/specification, and per-item valuation fields while retaining BOM, lot, serial, and retirement controls.
- Form checkboxes stay square even when the touch-density layout is enabled.
- The Item identity section now retains only the allowed-colors table.
- The Item form no longer shows the unused catch-weight setting.
- The Item list's Item Group filter now shows only active leaf groups, matching the Item form.

- Ẩn các dòng mô tả phụ của trường trên toàn bộ biểu mẫu để bố cục gọn và cân bằng hơn.
- Dòng hàng Đơn hàng không còn đọc `Item.default_warehouse`; kho xuất chỉ lấy từ lựa chọn của chứng từ/dòng hàng.
- Ô chọn Nhóm hàng của Mặt hàng chỉ hiển thị nhóm lá đang hoạt động, không còn nhóm cha.

## 0.2.0 — Enterprise Parallel Baseline — 2026-08-03

### Added

- Forge Enterprise Completion Skill.
- Enterprise North Star và capability map có ID ổn định.
- Parallel Agent Board, execution protocol và prompt chuẩn.
- 18 workstream branch cho architecture/kernel, finance/VN, CRM, procurement, inventory/WMS, manufacturing/QMS, HCM/payroll, project/service, BI/AI, BPM/App Factory, integrations, security/SaaS, SRE/data safety, migration/implementation, frontend/mobile, workplace/DMS, logistics/POS/commerce và Alumdoor reference vertical.
- Product versioning policy cho monorepo Forge.

### Changed

- Root Forge product/integration version: `0.1.0` -> `0.2.0`.
- Enterprise completion được đo bằng capability maturity/evidence thay vì số màn hình/module.
- Parallel development dùng explicit branch ownership và dependency requests thay vì nhiều agent cùng sửa shared hotspots.

### Cleanup

- PR coordination #293 merged vào `main`.
- Đóng các PR stale/superseded/temporary đã xác định rõ: #224, #248, #256, #257, #259, #285.
- Giữ các PR substantive chưa supersede để agent owner audit/cherry-pick/rebase theo exact state thay vì xóa mất lịch sử có giá trị.

### Release boundary

Đây là **source baseline**, không phải xác nhận production release. Không production migration/deploy/secret/DNS/customer-data mutation chỉ vì version được bump.
