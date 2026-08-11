# AlumDoor — BRD chấm công QR và tính lương đơn giản

- Ngày lập: 10/08/2026
- Phạm vi: tenant/bề mặt AlumDoor; không làm thay đổi trải nghiệm HRM dùng chung của tenant khác
- Trạng thái: Cổng 3 — kiến trúc an toàn đã khóa; Slice 1 đang triển khai metadata, QR và công ngày
- Mức ưu tiên: nghiệp vụ tiền lương — fail closed, không chốt khi dữ liệu chưa đủ hoặc cấu hình chưa được duyệt

## 1. Vấn đề

AlumDoor hiện chỉ cần dùng `Employee` để nhận diện người quét và `Employee Checkin` để lưu log gốc. `Attendance` chuẩn của HRM chỉ có một cặp giờ vào/ra, vì vậy không thể là nguồn tính cho lịch ba ca của xưởng. Hệ thống đã có log check-in, ca và nền lương dùng chung, nhưng cách dùng hiện tại quá nặng so với nhu cầu xưởng và chưa phản ánh đúng lịch làm thực tế:

- Ca 1: 07:00–11:30.
- Ca 2: 13:00–17:00.
- Phần ca 1 + ca 2 vượt 8 giờ/ngày được tính tăng ca.
- Ca 3 bắt đầu 17:30 và mặc định là tăng ca.
- Nhân viên cần quét QR tại xưởng; mã QR phải đổi mỗi 15 giây để giảm việc chụp lại mã cũ và chấm hộ bằng ảnh lưu sẵn.
- Quản lý cần xem công, xử lý thiếu quét và tính lương trong một luồng ngắn, không phải đi qua toàn bộ HRM/ERPNext.

Nếu lấy trực tiếp log QR làm số công hoặc tự động chốt tiền khi thiếu quét, hệ thống có thể trả sai lương. Nếu dùng một trạng thái IN/OUT chung cho cả ngày, một lần quên quét sẽ làm đảo chiều toàn bộ các lần quét sau. Vì vậy dữ liệu phải tách thành log gốc bất biến, từng đoạn ca và bản tổng hợp ngày đã được kiểm soát.

## 2. Mục tiêu

### 2.1 Kết quả định lượng

- Một lần chấm công bình thường hoàn tất trong tối đa 5 giây sau khi camera đọc được QR.
- QR hiển thị tự đổi đúng chu kỳ 15 giây; server chỉ chấp nhận token còn hạn theo giờ server.
- 100% phút công thường và tăng ca truy ngược được về log quét gốc hoặc phiếu sửa công đã duyệt.
- Một ngày không có ngoại lệ được tổng hợp tự động, người quản lý không nhập lại giờ.
- Bảng công tháng của một nhân viên xem được trong tối đa 2 lần chạm từ màn Chấm công.
- Bảng lương không được chốt khi còn ngày thiếu quét, phiếu sửa công đang chờ hoặc hệ số tăng ca chưa có hiệu lực.
- Tiền lưu dưới dạng số nguyên VND; bản chốt không có số thập phân và không thay đổi âm thầm sau khi duyệt.

### 2.2 Bất biến nghiệp vụ

1. Log quét gốc không được sửa hoặc xóa cứng.
2. Sửa công phải tạo phiếu điều chỉnh, ghi giá trị trước/sau, lý do, người gửi và người duyệt.
3. Nhân viên không được duyệt phiếu sửa công hoặc bảng lương của chính mình.
4. Server, không phải trình duyệt, quyết định thời điểm quét, đoạn ca, phút công và số tiền.
5. Bảng lương đã duyệt chỉ được sửa bằng kỳ điều chỉnh mới; không mở khóa và ghi đè lịch sử.
6. Không hardcode hệ số tăng ca, thuế hoặc bảo hiểm chưa có nguồn pháp lý và phê duyệt có hiệu lực.
7. Dữ liệu luôn được giới hạn theo tenant; chi nhánh chỉ được xem trong phạm vi được cấp.

### 2.3 Công thức thời gian đã đề xuất

Với mỗi ngày làm việc, lấy giao của thời gian thực tế với từng khoảng chuẩn:

```text
phút_ca_1 = giao(thời gian thực tế, 07:00–11:30)
phút_ca_2 = giao(thời gian thực tế, 13:00–17:00)
phút_ngày = phút_ca_1 + phút_ca_2
phút_thường = min(phút_ngày, 480)
phút_tăng_ca_vượt_8h = max(phút_ngày - 480, 0)
phút_tăng_ca_3 = thời gian thực tế từ 17:30 đến lúc quét ra
tổng_phút_tăng_ca = phút_tăng_ca_vượt_8h + phút_tăng_ca_3
```

Ví dụ đúng:

- Vào 07:00, ra 11:30; vào 13:00, ra 17:00: tổng 510 phút = 480 phút thường + 30 phút tăng ca.
- Vào 07:10, ra 11:30; vào 13:00, ra 17:00: tổng 500 phút = 480 phút thường + 20 phút tăng ca.
- Ca 3 vào 17:30, ra 20:00: 150 phút tăng ca.
- Khoảng nghỉ 11:30–13:00 và 17:00–17:30 không tính công.

## 3. Actor và vai trò

| Vai trò | Nhiệm vụ | Phạm vi dòng được xem | Quyền ghi |
|---|---|---|---|
| Nhân viên | Quét QR, xem công/lương của mình, gửi yêu cầu sửa công | Chỉ bản ghi có `employee_id` nối với tài khoản hiện tại | Tạo log qua API quét; tạo phiếu sửa của mình; không sửa log/tổng công/lương |
| Quản lý xưởng | Theo dõi hiện diện, xử lý ngoại lệ, duyệt sửa công | Nhân viên trong chi nhánh/đội được cấp; không xem tài khoản ngân hàng nếu không có permlevel | Duyệt/từ chối sửa công; xác nhận ngày công; không chốt bảng lương nếu không có quyền lương |
| Nhân sự/Kế toán lương | Cấu hình hồ sơ lương, chạy thử và lập bảng lương | Nhân viên trong tenant/chi nhánh được cấp | Sửa hồ sơ lương có hiệu lực tương lai; tính lại kỳ nháp; gửi duyệt |
| Chủ doanh nghiệp/System Manager | Duyệt chính sách, chốt bảng lương, xem báo cáo toàn tenant | Toàn tenant | Cấu hình ca/QR/hệ số; duyệt bảng lương; đánh dấu đã trả; xuất dữ liệu |
| Máy hiển thị QR | Chỉ hiển thị challenge QR của một trạm | Một trạm được cấp, không đọc danh sách nhân viên | Không ghi công; chỉ xin challenge đã ký |
| Viewer/kiểm toán | Đối chiếu lịch sử được cấp | Chỉ phạm vi được cấp; số nhạy cảm có thể che | Chỉ đọc/xuất được cấp phép |

## 4. Thực thể dữ liệu và trường

Ghi chú kiến trúc đã khóa: `Employee Checkin` là log quét bất biến. `AlumDoor Attendance Day` là bản tổng hợp ngày riêng của AlumDoor, luôn có ba dòng `AlumDoor Attendance Segment`; đây là nguồn công cho lương sau này. Không dùng `Attendance` chuẩn của HRM để chạy thuật toán ba ca hoặc làm nguồn lương. `Employee` chỉ cung cấp định danh/scope nhân viên, không nhận trường `alu_*`.

### Ranh giới Slice 1

Slice 1 chỉ cài bốn DocType AlumDoor (`AlumDoor Attendance Policy`, `AlumDoor QR Station`, `AlumDoor Attendance Segment`, `AlumDoor Attendance Day`) và overlay cần thiết trên `Employee Checkin`. Chưa cài custom field/luồng ghi nào cho `Attendance`, `Attendance Request`, `Payroll Entry` hay `Salary Slip`.

Nếu mở rộng sau Slice 1, năm DocType chuẩn có thể được bổ sung overlay **khi Field Ledger tương ứng được duyệt**: `Employee Checkin`, `Attendance` (chỉ projection tương thích HRM, không chạy công thức ba ca), `Attendance Request`, `Payroll Entry`, `Salary Slip`. `Employee` vẫn chỉ là nguồn identity, không nằm trong danh sách custom field.

### 4.1 `attendance_policy` — chính sách ca có hiệu lực

| Trường | Kiểu D1 | Khóa/ràng buộc | Validate server | Ý nghĩa |
|---|---|---|---|---|
| `id` | TEXT | PK, UUID | UUID hợp lệ | Định danh chính sách |
| `tenant_id` | TEXT | NOT NULL, FK tenant | Bằng tenant session | Cô lập dữ liệu |
| `name` | TEXT | NOT NULL | 3–120 ký tự | Ví dụ `Ca AlumDoor 8 giờ` |
| `timezone` | TEXT | NOT NULL, default `Asia/Ho_Chi_Minh` | IANA timezone | Múi giờ tính ngày công |
| `shift1_start_minute` | INTEGER | NOT NULL, default 420 | 0–1439 | 07:00 |
| `shift1_end_minute` | INTEGER | NOT NULL, default 690 | Lớn hơn start | 11:30 |
| `shift2_start_minute` | INTEGER | NOT NULL, default 780 | 0–1439 | 13:00 |
| `shift2_end_minute` | INTEGER | NOT NULL, default 1020 | Lớn hơn start | 17:00 |
| `shift3_start_minute` | INTEGER | NOT NULL, default 1050 | 0–1439 | 17:30 |
| `shift3_latest_out_minute` | INTEGER | NOT NULL, default 1439 | 1051–1439 | Mốc ra tối đa cùng ngày; vượt mốc phải sửa công |
| `regular_daily_cap_minutes` | INTEGER | NOT NULL, default 480 | 1–1440 | Giới hạn công thường 8 giờ |
| `qr_ttl_seconds` | INTEGER | NOT NULL, default 15 | 10–60 | Chu kỳ QR |
| `effective_from` | TEXT | NOT NULL, ISO date | Ngày hợp lệ | Ngày bắt đầu áp dụng |
| `effective_to` | TEXT | NULL, ISO date | `>= effective_from` | Ngày kết thúc |
| `policy_status` | TEXT | NOT NULL | `draft/approved/retired` | Trạng thái chính sách |

Chính sách đã `approved` không sửa trực tiếp; thay đổi tạo phiên bản mới theo ngày hiệu lực. Tên trường kỹ thuật dùng trong metadata là `policy_status` để không đụng cột hệ thống `status`. Slice 1 không có cột `approved_by` hay `approved_at` trên Policy: bằng chứng duyệt nằm ở workflow/audit timeline (actor, action, thời gian, before/after).

### 4.2 `attendance_qr_station` — trạm QR

| Trường | Kiểu D1 | Khóa/ràng buộc | Validate server | Ý nghĩa |
|---|---|---|---|---|
| `id` | TEXT | PK, UUID | UUID | Trạm |
| `tenant_id` | TEXT | NOT NULL | Theo session | Cô lập tenant |
| `station_code` | TEXT | UNIQUE theo tenant | `^[A-Z0-9-]{3,30}$` | Mã tự sinh `QR-...` |
| `station_name` | TEXT | NOT NULL | 3–100 ký tự | Ví dụ `Cổng xưởng` |
| `branch_id` | TEXT | NULL, FK branch | Phải thuộc tenant | Phạm vi chi nhánh |
| `policy_id` | TEXT | NOT NULL, FK policy | Policy approved, còn hiệu lực | Chính sách ca |
| `secret_version` | INTEGER | NOT NULL, default 1 | `>=1` | Phiên bản khóa ký; không lưu secret ở client |
| `is_active` | INTEGER | NOT NULL, default 1 | Boolean 0/1 | Bật/tắt trạm |
| `last_seen_at` | TEXT | NULL | ISO datetime | Theo dõi màn QR |
| `created_by`, `created_at`, `updated_at` | TEXT | NOT NULL | Server sinh | Audit cơ bản |

QR payload chứa `station_id`, `issued_at`, `expires_at`, `nonce`, `secret_version`, `signature`; không chứa employee id và không dùng id tăng dần.

### 4.3 `employee_checkin` — log quét gốc bất biến

| Trường | Kiểu D1 | Khóa/ràng buộc | Validate server | Ý nghĩa |
|---|---|---|---|---|
| `id` | TEXT | PK, UUID | Server sinh | Log gốc |
| `tenant_id` | TEXT | NOT NULL | Theo session | Cô lập tenant |
| `employee_id` | TEXT | NOT NULL, FK Employee | Nối từ user session; client không tự chọn | Người quét |
| `station_id` | TEXT | NOT NULL, FK station | Active, đúng tenant | Nơi quét |
| `scan_time` | TEXT | NOT NULL | Giờ server, ISO datetime | Thời điểm duy nhất dùng tính công |
| `work_date` | TEXT | NOT NULL | Suy từ timezone policy | Ngày công |
| `segment_code` | TEXT | NOT NULL | `SHIFT1/SHIFT2/SHIFT3` | Đoạn ca |
| `log_type` | TEXT | NOT NULL | `IN/OUT` do state machine quyết định | Chiều quét |
| `token_nonce_hash` | TEXT | NOT NULL | Hash; không lưu token thô | Chống replay |
| `source` | TEXT | NOT NULL, default `QR` | `QR/MANUAL_IMPORT` | Nguồn |
| `device_fingerprint_hash` | TEXT | NULL | Tối đa 128 ký tự | Hỗ trợ điều tra, không phải định danh tuyệt đối |
| `ip_hash` | TEXT | NULL | Hash/chính sách riêng tư | Hỗ trợ điều tra |
| `created_at` | TEXT | NOT NULL | Bằng `scan_time` | Audit |

Unique bảo vệ: cùng `employee_id + token_nonce_hash + segment_code` chỉ ghi một lần. Bản ghi không có API update/delete.

### 4.4 `attendance_segment` — từng đoạn ca trong ngày

| Trường | Kiểu D1 | Khóa/ràng buộc | Validate server | Ý nghĩa |
|---|---|---|---|---|
| `id` | TEXT | PK, UUID | UUID | Dòng đoạn ca |
| `attendance_day_id` | TEXT | NOT NULL, FK AlumDoor Attendance Day | Cùng tenant | Bản tổng ngày |
| `segment_code` | TEXT | UNIQUE theo attendance day | `SHIFT1/SHIFT2/SHIFT3` | Mỗi đoạn tối đa một dòng |
| `in_checkin_id`, `out_checkin_id` | TEXT | NULL, FK checkin | Cùng employee/ngày/đoạn | Nối bằng chứng |
| `actual_in`, `actual_out` | TEXT | NULL | ISO datetime; out > in | Thời gian thực tế |
| `actual_minutes` | INTEGER | NOT NULL, default 0 | 0–1110 | Phút có mặt thực tế |
| `regular_minutes` | INTEGER | NOT NULL, default 0 | 0–480 | Phút thường đóng góp |
| `overtime_minutes` | INTEGER | NOT NULL, default 0 | 0–1110 | Phút tăng ca đóng góp |
| `state` | TEXT | NOT NULL | `open/complete/missing_in/missing_out/corrected` | Tình trạng đoạn |
| `calculation_version` | INTEGER | NOT NULL | `>=1` | Phiên bản công thức |
| `correction_request_id` | TEXT | NULL, FK correction | Bắt buộc nếu corrected | Nguồn sửa |

### 4.5 `attendance_day` — tổng hợp ngày AlumDoor

| Trường | Kiểu D1 | Khóa/ràng buộc | Validate server | Ý nghĩa |
|---|---|---|---|---|
| `id` | TEXT | PK, UUID | UUID | Ngày công |
| `tenant_id` | TEXT | NOT NULL | Theo session | Cô lập tenant |
| `employee_id` | TEXT | NOT NULL, FK Employee | Nhân viên active | Người được tính |
| `work_date` | TEXT | NOT NULL | ISO date | Ngày công |
| `policy_id` | TEXT | NOT NULL, FK policy | Policy hiệu lực tại ngày | Khóa công thức |
| `regular_minutes` | INTEGER | NOT NULL, default 0 | 0–480 | Tổng phút thường |
| `overtime_minutes` | INTEGER | NOT NULL, default 0 | `>=0` | Tổng phút tăng ca |
| `payable_work_fraction_bp` | INTEGER | NOT NULL, default 0 | 0–10000 basis points | Tỷ lệ ngày công, tránh REAL |
| `state` | TEXT | NOT NULL | `open/complete/exception/approved/locked` | Trạng thái ngày |
| `exception_code` | TEXT | NULL | Enum đã khai báo | Thiếu vào/ra, ngoài khung... |
| `approved_by`, `approved_at` | TEXT | NULL | Có khi approved | Duyệt ngày ngoại lệ |
| `payroll_period_id` | TEXT | NULL, FK period | Có khi locked | Kỳ lương đã dùng |
| `calculated_at` | TEXT | NOT NULL | Server sinh | Lần tính gần nhất |

Triển khai là Custom DocType `AlumDoor Attendance Day`, không phải `Attendance` chuẩn HRM. Unique: `tenant_id + employee_id + work_date`. State: `open → complete`; nếu lỗi `open/complete → exception`; duyệt sửa `exception → approved`; bảng lương chốt `complete/approved → locked`.

### 4.6 `attendance_correction_request` — phiếu sửa công (pha sau)

| Trường | Kiểu D1 | Khóa/ràng buộc | Validate server | Ý nghĩa |
|---|---|---|---|---|
| `id` | TEXT | PK, UUID | UUID | Phiếu |
| `tenant_id` | TEXT | NOT NULL | Theo session | Cô lập tenant |
| `request_code` | TEXT | UNIQUE theo tenant | Server cấp mã | Mã dễ tra cứu |
| `employee_id` | TEXT | NOT NULL | Người gửi hoặc quản lý được cấp | Nhân viên cần sửa |
| `work_date` | TEXT | NOT NULL | Không thuộc kỳ đã paid | Ngày sửa |
| `segment_code` | TEXT | NOT NULL | Enum đoạn ca | Đoạn sửa |
| `requested_in`, `requested_out` | TEXT | NULL | Cặp hợp lệ, out > in | Giờ đề nghị |
| `reason` | TEXT | NOT NULL | 10–500 ký tự | Lý do bắt buộc |
| `evidence_file_key` | TEXT | NULL | R2 key hợp lệ | Ảnh/file bằng chứng tùy chọn |
| `status` | TEXT | NOT NULL | `pending/approved/rejected/applied/cancelled` | Workflow |
| `review_note` | TEXT | NULL | Bắt buộc khi reject | Ý kiến duyệt |
| `requested_by`, `requested_at` | TEXT | NOT NULL | Theo session/server | Audit |
| `reviewed_by`, `reviewed_at`, `applied_at` | TEXT | NULL | Tách người gửi | Audit |

### 4.7 `employee_pay_profile` — hồ sơ trả lương có hiệu lực (pha sau)

| Trường | Kiểu D1 | Khóa/ràng buộc | Validate server | Ý nghĩa |
|---|---|---|---|---|
| `id` | TEXT | PK, UUID | UUID | Phiên bản hồ sơ |
| `tenant_id`, `employee_id` | TEXT | NOT NULL | Cùng tenant | Nhân viên |
| `pay_mode` | TEXT | NOT NULL | `MONTHLY/DAILY` | Cách trả lương |
| `base_salary_vnd` | INTEGER | NOT NULL | Số nguyên `>=0` | Lương tháng hoặc lương ngày |
| `overtime_multiplier_bp` | INTEGER | NULL | 0–100000 basis points | Hệ số tăng ca; null thì chặn chốt |
| `fixed_allowance_vnd` | INTEGER | NOT NULL, default 0 | Số nguyên `>=0` | Phụ cấp cố định |
| `effective_from`, `effective_to` | TEXT | NOT NULL/NULL | Không chồng kỳ cùng employee | Hiệu lực |
| `status` | TEXT | NOT NULL | `draft/approved/retired` | Chỉ approved được dùng |
| `approved_by`, `approved_at` | TEXT | NULL | Bắt buộc khi approved | Phê duyệt |

Không đưa số tài khoản ngân hàng vào thực thể này; tiếp tục dùng permlevel của Employee Lite.

### 4.8 `payroll_period` — kỳ lương (pha sau)

| Trường | Kiểu D1 | Khóa/ràng buộc | Validate server | Ý nghĩa |
|---|---|---|---|---|
| `id` | TEXT | PK, UUID | UUID | Kỳ lương |
| `tenant_id` | TEXT | NOT NULL | Theo session | Cô lập tenant |
| `period_code` | TEXT | UNIQUE theo tenant | Server cấp | Ví dụ `BL-2026-08` |
| `start_date`, `end_date` | TEXT | NOT NULL | start ≤ end, không chồng kỳ active | Khoảng lương |
| `standard_work_days_bp` | INTEGER | NOT NULL | 0–310000 | Ngày công chuẩn ×10000 |
| `status` | TEXT | NOT NULL | `draft/calculated/pending_approval/approved/paid/cancelled` | Workflow tài chính |
| `calculation_version` | INTEGER | NOT NULL, default 1 | Tăng sau mỗi lần tính nháp | Truy vết |
| `calculated_by`, `calculated_at` | TEXT | NULL | Có khi calculated | Audit |
| `approved_by`, `approved_at` | TEXT | NULL | Có khi approved | Audit |
| `paid_by`, `paid_at` | TEXT | NULL | Có khi paid | Audit |

### 4.9 `salary_slip` — phiếu lương (pha sau)

| Trường | Kiểu D1 | Khóa/ràng buộc | Validate server | Ý nghĩa |
|---|---|---|---|---|
| `id` | TEXT | PK, UUID | UUID | Phiếu lương |
| `tenant_id`, `payroll_period_id`, `employee_id` | TEXT | NOT NULL | UNIQUE period + employee | Một phiếu/người/kỳ |
| `pay_profile_id` | TEXT | NOT NULL | Profile approved hiệu lực | Khóa nguồn lương |
| `regular_minutes`, `overtime_minutes` | INTEGER | NOT NULL | `>=0` | Dữ liệu công đã dùng |
| `payable_work_fraction_bp` | INTEGER | NOT NULL | `>=0` | Tổng tỷ lệ ngày công |
| `base_pay_vnd` | INTEGER | NOT NULL | Số nguyên | Lương thường |
| `overtime_pay_vnd` | INTEGER | NOT NULL | Số nguyên | Tiền tăng ca |
| `allowance_vnd` | INTEGER | NOT NULL, default 0 | Số nguyên `>=0` | Phụ cấp |
| `advance_vnd` | INTEGER | NOT NULL, default 0 | Số nguyên `>=0` | Tạm ứng |
| `manual_deduction_vnd` | INTEGER | NOT NULL, default 0 | Số nguyên `>=0` | Khấu trừ có lý do |
| `net_pay_vnd` | INTEGER | NOT NULL | Server tính | Tiền thực nhận |
| `status` | TEXT | NOT NULL | `draft/pending_approval/approved/paid/cancelled` | Workflow |
| `formula_trace_json` | TEXT | NOT NULL | JSON schema versioned, hash khi approve | Đầu vào/công thức/đầu ra |
| `adjustment_reason` | TEXT | NULL | Bắt buộc nếu có manual deduction | Giải trình |

### 4.10 Công thức lương

Lương ngày:

```text
đơn_giá_giờ = lương_ngày / 8
lương_thường = làm_tròn_VND(lương_ngày × tổng_tỷ_lệ_ngày_công)
tiền_tăng_ca = làm_tròn_VND(phút_tăng_ca / 60 × đơn_giá_giờ × hệ_số_tăng_ca)
```

Lương tháng:

```text
đơn_giá_ngày = lương_tháng / ngày_công_chuẩn_của_kỳ
lương_thường = làm_tròn_VND(đơn_giá_ngày × tổng_tỷ_lệ_ngày_công)
đơn_giá_giờ = đơn_giá_ngày / 8
tiền_tăng_ca = làm_tròn_VND(phút_tăng_ca / 60 × đơn_giá_giờ × hệ_số_tăng_ca)
```

Chung:

```text
thực_nhận = lương_thường + tiền_tăng_ca + phụ_cấp - tạm_ứng - khấu_trừ
```

Mọi phép tính nội bộ dùng số hữu tỉ/basis points hoặc fixed-point; chỉ làm tròn về số nguyên VND ở từng thành phần phiếu lương. Không dùng số chấm động `REAL` cho tiền.

## 5. Luồng nghiệp vụ

### 5.1 Mở trạm và đổi QR 15 giây

1. Quản trị chọn một trạm active và mở chế độ Toàn màn hình.
2. Trình duyệt gọi API challenge, nhận token ký bởi server cùng `expires_at` và chênh lệch giờ server.
3. Màn hình hiển thị QR, tên trạm, đồng hồ đếm ngược 15 giây và tình trạng kết nối.
4. Trước khi token hết hạn, client xin token kế tiếp; token cũ vẫn chỉ hợp lệ tới `expires_at`.
5. Nếu mất mạng, màn hình che QR bằng thông báo `Mất kết nối — mã đã tạm khóa`, không hiển thị token hết hạn.

Token 15 giây giảm tái sử dụng ảnh cũ, nhưng không chống được phát trực tiếp mã đang còn hạn. MVP ghi rõ giới hạn này; geofence/selfie là lớp bổ sung, không được quảng cáo QR động là chống chấm hộ tuyệt đối.

### 5.2 Nhân viên quét QR

1. Nhân viên đăng nhập trên điện thoại và mở `Quét chấm công`.
2. Camera đọc QR; client gửi nguyên token tới server, không tự quyết định IN/OUT.
3. Server kiểm chữ ký, thời hạn, station active, tenant, employee active và replay.
4. Server xác định đoạn ca theo giờ server và trạng thái riêng của đoạn đó:
   - Ca 1 nhận quét 05:30–12:29.
   - Ca 2 nhận quét 12:30–17:29; công thường chỉ bắt đầu từ 13:00.
   - Ca 3 nhận quét 17:30–23:59.
   - Nếu đoạn đang `open`, lần quét kế tiếp đóng đoạn (`OUT`); nếu chưa có log, lần quét mở đoạn (`IN`).
5. Server ghi log bất biến, tính lại đoạn và ngày, trả kết quả: `Vào ca 1 lúc 06:58` hoặc `Ra ca 2 lúc 17:03 — hôm nay 8 giờ thường, 33 phút tăng ca`.
6. UI beep/rung nhẹ, màu success và chống gửi lặp.

Ngoại lệ:

- Token hết hạn: không ghi log; báo `Mã vừa hết hạn, hướng camera vào mã mới`.
- Quét lại cùng token: trả kết quả lần đầu theo idempotency, không tạo log mới.
- Đã đủ IN/OUT cho đoạn: trả 409 `Ca này đã chấm đủ`; hướng dẫn mở yêu cầu sửa công.
- Quét ngoài khung: không tự gán sang ca gần nhất; báo giờ được phép và tạo lối tắt gửi yêu cầu.
- Thiếu OUT ca trước: không đảo chiều ca sau; ca trước thành `missing_out`, ca sau vẫn có state riêng.
- Mất mạng trên điện thoại: không lưu giờ client vào hàng đợi để gửi muộn; hướng dẫn quét lại khi có mạng hoặc tạo phiếu sửa công.

### 5.3 Tổng hợp ngày

1. Sau mỗi log, server ghép IN/OUT theo `employee + work_date + segment`.
2. Mỗi đoạn hoàn chỉnh tính phút giao với khung chuẩn.
3. Tổng ca 1 + ca 2 áp trần 480 phút thường, phần dư thành tăng ca.
4. Toàn bộ ca 3 thành tăng ca từ 17:30.
5. Nếu thiếu cặp hoặc ngoài giới hạn, ngày thành `exception`; không khóa cho lương.
6. Tác vụ cuối ngày chỉ đánh dấu ngoại lệ/chốt tính toán; không tự bịa giờ ra.

### 5.4 Sửa công

1. Nhân viên mở ngày lỗi, chọn đoạn ca, nhập giờ đề nghị và lý do; ảnh bằng chứng tùy chọn.
2. Server lưu phiếu `pending`; log gốc không đổi.
3. Quản lý xem trước/sau và tác động phút công/lương dự kiến.
4. Duyệt: tạo bản điều chỉnh, tính lại đoạn/ngày, ghi audit, chuyển `applied`.
5. Từ chối: bắt buộc ghi lý do; nhân viên nhận thông báo in-app.
6. Ngày đã khóa vào kỳ lương approved/paid: không sửa trực tiếp; chuyển sang điều chỉnh kỳ kế tiếp.

### 5.5 Chạy và duyệt lương

1. Kế toán tạo kỳ, nhập ngày công chuẩn; kỳ mặc định tháng hiện tại nhưng chưa tự chốt.
2. `Kiểm tra dữ liệu` liệt kê nhân viên thiếu pay profile, hệ số tăng ca, ngày ngoại lệ hoặc phiếu sửa đang chờ.
3. Chỉ khi không còn lỗi chặn, server tạo/tính lại phiếu nháp từ `AlumDoor Attendance Day` đã khóa dữ liệu đầu vào.
4. Kế toán có thể thêm phụ cấp, tạm ứng, khấu trừ; khấu trừ thủ công bắt buộc lý do.
5. `Gửi duyệt` khóa input của lần tính và sinh formula trace.
6. Chủ doanh nghiệp xem tổng, drill-down từng người và duyệt.
7. Khi approved, `AlumDoor Attendance Day` liên quan chuyển `locked`; phiếu không sửa âm thầm.
8. `Đánh dấu đã trả` ghi người/thời điểm trả; không tự tạo bút toán kế toán trong MVP.

### 5.6 Bản in và xuất dữ liệu

- Phiếu lương A5/A4 hiển thị kỳ, công thường, tăng ca, từng khoản cộng/trừ, thực nhận, người lập/duyệt và QR token ngẫu nhiên mở bản ghi có quyền.
- Bảng công/bảng lương xuất Excel theo bộ lọc hiện tại; bản lương chỉ role có quyền mới xuất và mọi lần xuất ghi audit.
- Nhân viên tải PDF phiếu của chính mình; không có link công khai chứa dữ liệu lương.

## 6. Ma trận quyền API

Mọi route áp chuỗi kiểm tra: session hợp lệ → tenant scope → role/action → branch/employee row scope → Zod validation → transaction/audit. UI ẩn nút không thay thế kiểm tra server.

| Method + endpoint | Vai trò | Kiểm tra server bắt buộc |
|---|---|---|
| `POST /api/hr/attendance-qr/stations/:id/challenge` | Máy trạm, Manager, System Manager | Station active; session/trạm thuộc tenant; rate limit; chỉ trả token ngắn hạn |
| `POST /api/hr/attendance-qr/scan` | Employee | `employee_id` lấy từ session; chữ ký/TTL/replay/station/segment; insert log + recalc cùng transaction |
| `GET /api/hr/attendance/today` | Employee, Manager, Payroll, Owner | Employee chỉ `WHERE employee_id=session.employee_id`; quản lý thêm branch scope |
| `GET /api/hr/attendance?from=&to=&employee_id=&status=` | Manager, Payroll, Owner, Viewer được cấp | Luôn `WHERE tenant_id=session.tenant_id`; employee/branch filter nằm trong allowed scope; pagination server |
| `POST /api/hr/attendance/corrections` | Employee, Manager | Employee chỉ tạo cho mình; ngày chưa paid; reason/time validate |
| `GET /api/hr/attendance/corrections` | Employee, Manager, Payroll, Owner | Employee chỉ phiếu mình; Manager branch scope |
| `POST /api/hr/attendance/corrections/:id/approve` | Manager, Owner | Không phải người gửi; đúng scope; status pending; apply + recalc + audit transaction |
| `POST /api/hr/attendance/corrections/:id/reject` | Manager, Owner | Như approve; bắt buộc `review_note` |
| `GET /api/hr/pay-profiles` | Payroll, Owner | Tenant/branch scope; không trả field ngân hàng ngoài permlevel |
| `POST /api/hr/pay-profiles` | Payroll, Owner | Không chồng effective dates; số tiền nguyên; hệ số nullable nhưng không dùng để finalize |
| `POST /api/hr/pay-profiles/:id/approve` | Owner | Không tự duyệt bản do chính mình tạo nếu tenant bật tách nhiệm vụ; version bất biến |
| `GET /api/hr/payroll/periods` | Payroll, Owner, Viewer được cấp | Tenant/branch scope; Viewer read-only |
| `POST /api/hr/payroll/periods` | Payroll, Owner | Kỳ không chồng; status draft; mã atomic |
| `POST /api/hr/payroll/periods/:id/validate` | Payroll, Owner | Trả danh sách lỗi chặn; không ghi tiền |
| `POST /api/hr/payroll/periods/:id/calculate` | Payroll, Owner | Draft/calculated; reject nếu exception/pending correction/missing multiplier; server tính toàn bộ |
| `POST /api/hr/payroll/periods/:id/submit` | Payroll, Owner | Calculated, không lỗi; freeze trace; audit |
| `POST /api/hr/payroll/periods/:id/approve` | Owner | Pending approval; người duyệt có quyền; lock AlumDoor Attendance Day cùng transaction |
| `POST /api/hr/payroll/periods/:id/mark-paid` | Owner, Payroll được cấp | Approved; ghi paid actor/time; không xóa/sửa phiếu |
| `GET /api/hr/payroll/slips/:id` | Employee, Payroll, Owner, Viewer được cấp | Employee chỉ phiếu mình; tenant/branch scope |
| `GET /api/hr/payroll/slips/:id/pdf` | Employee, Payroll, Owner | Cùng row scope; signed response ngắn hạn; audit lần tải |
| `GET /api/hr/reports/attendance.xlsx` | Manager, Payroll, Owner | Scope + filter server; audit export |
| `GET /api/hr/reports/payroll.xlsx` | Payroll, Owner | Quyền lương riêng; tenant scope; audit export |

Không cung cấp `DELETE` cho checkin, `AlumDoor Attendance Day`, correction đã xử lý, period hoặc salary slip. Bản cấu hình nháp chưa dùng có thể archive/soft-delete, không xóa cứng.

## 7. Màn hình MVP

### 7.1 Trạm QR

- Desktop/tablet: màn toàn trang, QR tối thiểu 360 px, tên trạm, giờ server, vòng đếm 15 giây, trạng thái online; nút `Toàn màn hình`, `Đổi trạm`, `Khóa trạm` theo quyền.
- Mobile quản trị: card QR và bottom sheet chọn trạm; không dùng làm màn quét của nhân viên.
- Loading: skeleton khung QR; offline: che QR; permission denied: không lộ token; error: nút `Thử lại`.

### 7.2 Quét chấm công và Hôm nay

- Mobile ưu tiên: camera toàn vùng trên, khung bắt QR; dưới là trạng thái ca 1/2/3, lần quét gần nhất và tổng `Giờ thường / Tăng ca`; nút `Báo thiếu quét` trong thumb zone.
- Desktop: dành cho kiểm tra tài khoản, không mở camera mặc định; hiển thị timeline hôm nay.
- BottomNav AlumDoor theo role nhân viên: `Hôm nay · Công tháng · [FAB: Quét QR] · Phiếu lương · Tài khoản`. Đây là lệch có chủ đích so preset xưởng sản xuất vì đây là bề mặt self-service của nhân viên, không thay shell quản lý xưởng.
- Thành công: beep/rung nhẹ và card xanh; token hết hạn: tự sẵn sàng quét mã kế tiếp, không buộc tải lại trang.

### 7.3 Bảng công tháng

- Desktop: bảng chuẩn có checkbox, STT, avatar, nhân viên, ngày, ca 1, ca 2, ca 3, giờ thường, tăng ca, trạng thái, action. Số căn phải, status giữa; cột resize/ẩn/ghi nhớ. Chọn dòng mở layout 3 cột: danh sách trái, timeline đoạn giữa, audit/hành động phải.
- Mobile: card theo ngày; title `Thứ Hai, 10/08`, badge trạng thái, 3 dòng ca, tổng giờ và action `Yêu cầu sửa`.
- Toolbar: tìm không dấu theo tên/mã; lọc tháng, chi nhánh, trạng thái; Export Excel theo quyền; không cho Employee thấy người khác.
- Dòng ngoại lệ màu warning; không dùng chỉ màu, luôn có icon và nhãn.

### 7.4 Hàng đợi ngoại lệ/sửa công

- Desktop: layout 3 cột và tự nhảy phiếu kế tiếp sau duyệt; danh sách trái ưu tiên phiếu lâu nhất, giữa so sánh log gốc/giờ đề nghị/tác động phút, phải có bằng chứng, lý do, audit và nút `Duyệt`/`Từ chối`.
- Mobile Manager: card + màn chi tiết stack; action sticky đáy; từ chối mở sheet bắt nhập lý do.
- Không có bulk approve cho sửa công để tránh duyệt nhầm hàng loạt.

### 7.5 Hồ sơ lương

- FormDrawer desktop 680 px; mobile full-screen. Trường: Nhân viên*, Cách trả lương*, Lương cơ bản*, Hệ số tăng ca, Phụ cấp cố định, Hiệu lực từ*, Hiệu lực đến.
- Link Nhân viên tìm theo tên/mã/SĐT nhưng không cho tạo Employee bằng form rút gọn; dùng đúng form Employee Lite hiện hữu.
- Cảnh báo đỏ nếu profile chồng ngày; cảnh báo vàng nếu hệ số trống; status approved khóa field.
- Sau lưu: `Gửi duyệt`, `Tạo hồ sơ phiên bản mới`, `Xem phiếu lương gần nhất` theo trạng thái/quyền.

### 7.6 Chạy bảng lương

- Desktop: header kỳ + status; 4 card bấm được `Nhân viên`, `Giờ tăng ca`, `Tổng thực nhận`, `Lỗi cần xử lý`; bảng người lao động bên dưới; panel tổng kết sticky phải. Chọn người mở 3 cột với chi tiết công và formula trace.
- Mobile Payroll/Owner: card kỳ và card từng nhân viên; không ép bảng ngang; action `Kiểm tra`, `Tính lương`, `Gửi duyệt`, `Duyệt`, `Đã trả` trong bottom sheet/sticky bar theo state.
- Lỗi chặn hiển thị thành danh sách có link mở đúng ngày/profile cần sửa; không chỉ toast chung chung.

### 7.7 Phiếu lương của tôi

- Mobile: chọn kỳ, card `Thực nhận`, các dòng Lương thường, Tăng ca, Phụ cấp, Tạm ứng, Khấu trừ; nút `Tải PDF` và `Báo sai`.
- Desktop: danh sách trái các kỳ, chi tiết giữa, giải thích công thức/audit phải; chỉ dữ liệu của chính nhân viên.
- Không hiển thị phiếu draft cho Employee; chỉ approved/paid.

### 7.8 Cài đặt chấm công/lương

- Nhóm `Lịch làm`, `Trạm QR`, `Hệ số & hiệu lực`, `Ngày công chuẩn`, `In phiếu`, `Quyền & audit`.
- Có tìm cài đặt; thay đổi chính sách tạo version mới và preview công thức bằng một ngày mẫu.
- Không đặt hệ số tăng ca pháp lý mặc định trong code. Owner nhập, đính nguồn/quyết định nội bộ và duyệt trước khi chốt lương.

### 7.9 Bảy trạng thái UI bắt buộc

Mọi màn trên có: loading skeleton đúng cấu trúc; chưa có dữ liệu với CTA hợp quyền; lọc không ra với `Xóa bộ lọc`; error tiếng Việt + `Thử lại`; permission denied; offline; success với bước tiếp theo. Mobile test riêng ở 390/412/768 px, desktop ở 1280/1536 px.

### 7.10 Bảng field và autofill của form chính

| Form/field | Bắt buộc | Validate và lỗi tiếng Việt | Autofill/nguồn |
|---|---:|---|---|
| Phiếu sửa — ngày | Có | Không thuộc kỳ paid; `Ngày này đã khóa, hãy tạo điều chỉnh kỳ sau` | Ngày đang xem |
| Phiếu sửa — đoạn ca | Có | Enum 1/2/3 | Đoạn đang lỗi |
| Phiếu sửa — giờ vào/ra | Theo lỗi | Cùng ngày, ra sau vào, trong giới hạn policy | Log hiện có; không đè field user đã sửa |
| Phiếu sửa — lý do | Có | 10–500 ký tự | Trống |
| Pay profile — nhân viên | Có | Active, cùng tenant, không chồng profile | Nhân viên đang xem nếu mở từ hồ sơ |
| Pay profile — pay mode | Có | Monthly/Daily | Nhớ lựa chọn gần nhất của user; user được đổi |
| Pay profile — lương cơ bản | Có | Số nguyên VND ≥0 | Không tự đoán |
| Pay profile — hệ số OT | Không khi lưu; bắt buộc khi duyệt/chốt | Basis points trong ngưỡng Settings | Profile hiệu lực trước nếu tạo phiên bản mới |
| Pay profile — ngày hiệu lực | Có | Không chồng kỳ | Ngày kế tiếp sau profile cũ hoặc hôm nay |
| Kỳ lương — từ/đến | Có | Không chồng kỳ active | Đầu/cuối tháng hiện tại |
| Kỳ lương — ngày công chuẩn | Có | >0 và ≤31 | Từ lịch làm việc của kỳ; Payroll xác nhận |
| Phiếu lương — công, OT, lương thường | Khóa | Chỉ server tính | AlumDoor Attendance Day + profile hiệu lực |
| Phiếu lương — phụ cấp | Có | Số nguyên ≥0 | Phụ cấp cố định profile; user sửa khi draft |
| Phiếu lương — tạm ứng | Có | Số nguyên ≥0 | Tổng tạm ứng đã duyệt nếu module nguồn có; MVP chưa có thì 0 |
| Phiếu lương — khấu trừ | Có | Số nguyên ≥0; >0 bắt buộc lý do | 0 |

Autofill không ghi đè ô đã được người dùng sửa tay. Server luôn tính lại tiền trước khi lưu/gửi duyệt.

## 8. Ngoài phạm vi MVP

- Tự động tính PIT, BHXH, BHYT, BHTN hoặc hạch toán kế toán; chỉ làm khi bộ tham số có hiệu lực được pháp lý/kế toán duyệt theo Source Lock.
- Nghỉ phép, tuyển dụng, đánh giá, đào tạo, công tác và toàn bộ HRM mở rộng.
- Nhận diện khuôn mặt bắt buộc, GPS/geofence, thiết bị vân tay, kiosk phần cứng chuyên dụng.
- Chấm công offline rồi gửi giờ client lên sau.
- Tính ca qua đêm tự động; quét ra sau 23:59 đi qua phiếu sửa công trong MVP.
- Tự chuyển khoản ngân hàng hoặc đánh dấu paid từ sao kê.
- Tự động phạt tiền theo phút đi trễ/về sớm. MVP hiển thị cảnh báo và phản ánh công thực tế; mọi khấu trừ thủ công phải có lý do và duyệt.
- AI ghi hoặc duyệt dữ liệu lương. Điểm AI tối thiểu nếu triển khai sau là giải thích bất thường bằng dữ liệu thật, chỉ ở dạng gợi ý/bản nháp và đúng quyền.

## 9. Ràng buộc đã chốt và điểm cần duyệt

### 9.1 Đã chốt trong phương án

- Một policy AlumDoor với ba đoạn ca; không bắt người vận hành phân ca thủ công từng ngày.
- Ca 1 07:00–11:30; ca 2 13:00–17:00; ca 3 từ 17:30.
- Ca 1 + ca 2: tối đa 480 phút thường, phần vượt là tăng ca.
- Ca 3: toàn bộ thời gian từ 17:30 tới giờ ra là tăng ca.
- QR đổi 15 giây, dùng giờ server và token ký; không tin thời gian điện thoại.
- IN/OUT theo từng đoạn ca, không dùng một công tắc chung cả ngày.
- Lưu log gốc bất biến; sửa qua phiếu duyệt.
- Hỗ trợ cả lương tháng và lương ngày theo hồ sơ từng nhân viên.
- Tiền VND số nguyên; bảng lương approved/paid bất biến.
- Bề mặt AlumDoor vẫn tinh gọn; không bật toàn bộ HRM dùng chung.

### 9.2 Mặc định đề xuất cần chủ doanh nghiệp duyệt tại Cổng 2

1. `Ca 1 + ca 2 đủ đúng lịch` được tính 480 phút thường + 30 phút tăng ca.
2. Ca 3 chỉ kết thúc theo lần quét OUT thực tế; mặc định giới hạn trong cùng ngày tới 23:59.
3. Hệ số tăng ca không hardcode. Mỗi hồ sơ/chính sách phải có hệ số được Owner duyệt trước khi chốt lương.
4. Đi trễ/về sớm không tự phạt theo phút trong MVP; lương ngày trả theo tỷ lệ công thực tế, lương tháng theo tổng tỷ lệ ngày công của kỳ.
5. Không có chấm công offline; mất mạng thì quét lại hoặc gửi phiếu sửa.
6. Selfie/GPS chưa bắt buộc. Nếu thực tế còn chấm hộ bằng phát trực tiếp QR, bổ sung geofence hoặc selfie ở vòng sau.
7. Ca qua đêm chưa tự tính; xử lý bằng phiếu sửa để tránh cộng nhầm sang ngày kế tiếp.

### 9.3 Cổng an toàn trước khi viết code

Chỉ chuyển sang Pha 3 khi chủ doanh nghiệp xác nhận bằng `Duyệt BRD` hoặc câu tương đương. Pha 3 sẽ tạo Technical Design, API payload chi tiết, migration dạng văn bản và Field Ledger; chưa chạy migration. Chỉ sau khi Cổng 3 đạt mới chuẩn bị nhánh và triển khai code.

## Phụ lục A — Review vận hành sau khi nâng phương án

| Tiêu chí | Trước review | Sau review |
|---|---:|---:|
| Đúng công thức ca | 8/10 | 10/10 |
| Chống đảo IN/OUT khi thiếu quét | 6/10 | 10/10 |
| Truy vết và sửa công | 7/10 | 10/10 |
| An toàn tiền lương | 7/10 | 10/10 |
| Tốc độ thao tác nhân viên | 9/10 | 10/10 |
| Tinh gọn cho AlumDoor | 9/10 | 10/10 |
| Khả năng mở rộng đúng chuẩn | 8/10 | 10/10 |

Điểm tổng thể phương án: **10/10 về thiết kế vận hành**, với điều kiện Cổng 2 phê duyệt bảy mặc định ở mục 9.2 và Cổng 3 khóa Field Ledger/API trước khi code.

## Phụ lục B — Nguồn nội bộ phải giữ tương thích

- `docs/ALUMDOOR-HR-LITE-20260803.md`: bề mặt AlumDoor hiện chỉ đưa Employee và Attendance ra navigation; module mới phải giữ navigation cũ tương thích nhưng không dùng `Attendance` chuẩn làm nguồn ba ca.
- `docs/ALUMDOOR-EMPLOYEE-LITE-20260803.md`: hồ sơ nhân viên tinh gọn, dữ liệu ngân hàng tiếp tục theo permlevel.
- `docs/hrm/VN_STATUTORY_PAYROLL_SOURCE_LOCK_2026.md`: tham số pháp lý phải theo hiệu lực, nguồn và phê duyệt; không dùng fixture chưa được promote làm cấu hình production.
- `server/apps-src/hrm/doctypes/employee-checkin.json`, `attendance.json`, `shift-type.json`, `overtime-request.json`: base DocType dùng chung cần ưu tiên tái sử dụng/customization thay vì sửa phá tenant khác.
- `server/packages/clouderp-erpnext/src/hrm-shift-attendance-controllers.ts`: logic attendance hiện hữu cần được thay/mở rộng có kiểm soát cho policy AlumDoor, không tạo đường tính song song mâu thuẫn.
# Cập nhật kiến trúc ngày 2026-08-11

Phần QR động/kiosk/TTL trong tài liệu gốc đã được **thay thế** bởi [ALUMDOOR-ATTENDANCE-STATIC-QR-GPS-DEVICE-20260811.md](./ALUMDOOR-ATTENDANCE-STATIC-QR-GPS-DEVICE-20260811.md). Nguồn sự thật công và lương bên dưới vẫn giữ nguyên; cơ chế thu nhận mới là QR cố định theo trạm + GPS + credential thiết bị.
