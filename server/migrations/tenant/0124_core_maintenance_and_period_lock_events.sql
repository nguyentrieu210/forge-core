-- Ba bảng/cột thuộc LÕI, dựng lại sau khi bóc tầng nghiệp vụ.
--
-- Cả ba vốn nằm trong `0025_alumdoor_inventory_views.sql` — một migration mang tên một khách
-- hàng, nhưng lại chứa hạ tầng chung. Khi gỡ 11 migration của app, chúng đi theo và làm
-- `/health` trả 500 còn khoá kỳ kế toán thì ghi vào bảng không tồn tại.
--
-- Migration này chép lại ĐÚNG phần lõi của 0025, bỏ phần thuộc app (ai_logs, các view tồn kho
-- catch-weight, chỉ mục riêng của Alumdoor).

-- 1. `maintenance_runs` — vòng bảo trì định kỳ ghi mốc chạy vào đây, và `/health` đọc ra để
--    báo "stale" khi quá 5 phút chưa chạy xong lần nào.
CREATE TABLE IF NOT EXISTS maintenance_runs (
  tenant_id TEXT NOT NULL,
  job_name TEXT NOT NULL,
  last_started_at TEXT,
  last_success_at TEXT,
  last_error TEXT,
  PRIMARY KEY (tenant_id, job_name)
);

-- 2. `accounting_period_locks` được `0001_core.sql` tạo với 4 cột, nhưng `document-kernel`
--    ghi thêm `modified_by` và `reason` — ai khoá kỳ và vì sao. Thiếu hai cột này thì lệnh
--    khoá kỳ gãy ngay ở câu INSERT.
--
--    SQLite không có `ADD COLUMN IF NOT EXISTS`; migration chỉ chạy một lần nên để trần.
ALTER TABLE accounting_period_locks ADD COLUMN modified_by TEXT NOT NULL DEFAULT '';
ALTER TABLE accounting_period_locks ADD COLUMN reason TEXT NOT NULL DEFAULT '';

-- 3. Bảng khoá kỳ chỉ giữ trạng thái HIỆN TẠI (một dòng mỗi công ty). Nhật ký khoá/mở nằm
--    riêng ở đây — mất nó là mất dấu vết ai từng mở khoá một kỳ đã chốt.
CREATE TABLE IF NOT EXISTS accounting_period_lock_events (
  tenant_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  company TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('Lock', 'Unlock')),
  lock_date TEXT NOT NULL,
  reason TEXT NOT NULL,
  actor TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  PRIMARY KEY (tenant_id, event_id)
);
CREATE INDEX IF NOT EXISTS idx_accounting_period_lock_events_company
  ON accounting_period_lock_events(tenant_id, company, occurred_at DESC);
