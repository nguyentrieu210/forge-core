# AlumDoor — Field Ledger chấm công QR và tính lương

- Ngày: 2026-08-10
- Trạng thái: Cổng 3; Slice 1 là nguồn duy nhất để dịch sang metadata/Zod/controller cho QR và công ngày
- Quy ước: `Owner` gồm Chủ doanh nghiệp/System Manager; `Manager` gồm AlumDoor Attendance Manager/HR Manager đúng branch; `Payroll` gồm AlumDoor Payroll User/Payroll Manager đúng branch; `Employee` luôn chỉ dòng nối `user_id` của mình.

## 0. Cột hệ thống và quy ước vật lý

Mọi document dùng cột hệ thống chuẩn của Forge: `name/id`, tenant từ database/session, `created_at`, `modified/updated_at`, `owner/created_by`, `docstatus`, version và audit timeline. Document cấu hình nháp có archive/soft-delete; `Employee Checkin`, `AlumDoor Attendance Day`, Request đã xử lý, Payroll Entry và Salary Slip không hard-delete. Child row có `parent`, `parenttype`, `parentfield`, `idx`.

Kiểu D1 dưới đây là kiểu logic của payload. Tiền luôn `INTEGER` VND, tỷ lệ/hệ số là `INTEGER` basis points, ngày/giờ là `TEXT` ISO. Metadata dùng Link/Data/Int/Currency tương ứng nhưng server không chuyển nguồn tính sang floating point.

**Ranh giới đã khóa:** `Employee` chỉ cung cấp identity/scope và không có custom field AlumDoor. `Employee Checkin` là log gốc bất biến. `AlumDoor Attendance Day` cùng ba dòng `AlumDoor Attendance Segment` là projection và nguồn công duy nhất cho lương tương lai. `Attendance` chuẩn HRM không được dùng để chạy thuật toán ba ca.

**Slice 1:** chỉ cần các DocType custom Policy, QR Station, Segment, Attendance Day và overlay `alu_*` của `Employee Checkin`. Bốn nhóm overlay chuẩn còn lại (`Attendance` chỉ projection tương thích nếu có, `Attendance Request`, `Payroll Entry`, `Salary Slip`) là phạm vi tương lai, chỉ được thêm sau khi phần ledger tương ứng được duyệt. Như vậy danh sách **năm** DocType chuẩn có thể có custom field là `Employee Checkin`, `Attendance`, `Attendance Request`, `Payroll Entry`, `Salary Slip`; không tính `Employee`.

## 1. `AlumDoor Attendance Policy`

| Field | D1 | Ràng buộc | Zod | UI | Validate | Autofill | Quyền | Nghiệp vụ |
|---|---|---|---|---|---|---|---|---|
| code | TEXT | UNIQUE NOT NULL | `z.string().regex(/^ALU-CA-[A-Z0-9-]+$/)` | code-auto | `attendancePolicyCode`: "Mã chính sách không hợp lệ" | counter `ALU-CA` khi lưu | all thấy; không sửa | Mã phiên bản chính sách, đã dùng thì bất biến |
| policy_name | TEXT | NOT NULL | `z.string().trim().min(3).max(120)` | text `*` | `requiredTrimmed`: "Nhập tên chính sách" | `Ca AlumDoor 8 giờ` ở setup lần đầu | all thấy; Owner sửa draft | Tên dễ nhận biết |
| company | TEXT | FK→Company NOT NULL | `z.string().min(1)` | link-field→Company `*` | `scopedCompany`: "Công ty không thuộc phạm vi" | company mặc định session | all thấy; Owner sửa draft | Phạm vi pháp nhân |
| branch | TEXT | FK→Branch NULL | `z.string().min(1).nullable()` | link-field→Branch | `branchOfCompany`: "Chi nhánh không thuộc công ty" | branch mặc định user; trống = toàn company | all thấy; Owner sửa draft | Phạm vi áp dụng |
| timezone | TEXT | NOT NULL DEFAULT Asia/Ho_Chi_Minh | `z.string().min(1).max(64)` | select-enum [Asia/Ho_Chi_Minh:Giờ Việt Nam] `*` | `ianaTimezone`: "Múi giờ không hợp lệ" | Asia/Ho_Chi_Minh | all thấy; Owner sửa draft | Khóa ngày công theo giờ server |
| shift1_start_minute | INTEGER | NOT NULL DEFAULT 420 CHECK 0..1439 | `z.number().int().min(0).max(1439)` | number `*` | `minuteOfDay`: "Giờ bắt đầu ca 1 không hợp lệ" | 420 | all thấy; Owner sửa draft | 07:00, đầu khoảng tính công ca 1 |
| shift1_end_minute | INTEGER | NOT NULL DEFAULT 690 CHECK > start | `z.number().int().min(1).max(1439)` | number `*` | `orderedMinuteRange`: "Giờ kết thúc ca 1 phải sau giờ bắt đầu" | 690 | all thấy; Owner sửa draft | 11:30, cuối khoảng tính công ca 1 |
| shift2_start_minute | INTEGER | NOT NULL DEFAULT 780 | `z.number().int().min(0).max(1439)` | number `*` | `minuteOfDay`: "Giờ bắt đầu ca 2 không hợp lệ" | 780 | all thấy; Owner sửa draft | 13:00 |
| shift2_end_minute | INTEGER | NOT NULL DEFAULT 1020 CHECK > start | `z.number().int().min(1).max(1439)` | number `*` | `orderedMinuteRange`: "Giờ kết thúc ca 2 phải sau giờ bắt đầu" | 1020 | all thấy; Owner sửa draft | 17:00 |
| shift3_start_minute | INTEGER | NOT NULL DEFAULT 1050 | `z.number().int().min(0).max(1439)` | number `*` | `minuteOfDay`: "Giờ bắt đầu ca 3 không hợp lệ" | 1050 | all thấy; Owner sửa draft | 17:30, toàn bộ là OT |
| shift3_latest_out_minute | INTEGER | NOT NULL DEFAULT 1439 CHECK > start | `z.number().int().min(1).max(1439)` | number `*` | `orderedMinuteRange`: "Giờ ra tối đa ca 3 phải sau giờ vào" | 1439 | all thấy; Owner sửa draft | Không tự tính qua ngày |
| regular_daily_cap_minutes | INTEGER | NOT NULL DEFAULT 480 CHECK 1..1440 | `z.number().int().min(1).max(1440)` | number `*` | `regularCap`: "Phút công thường phải từ 1 đến 1440" | 480 | all thấy; Owner sửa draft | Quá 480 phút ca 1+2 chuyển OT |
| qr_ttl_seconds | INTEGER | NOT NULL DEFAULT 15 CHECK 10..60 | `z.number().int().min(10).max(60)` | number `*` | `qrTtl`: "Chu kỳ QR phải từ 10 đến 60 giây" | 15 | all thấy; Owner sửa draft | Chu kỳ phát QR |
| effective_from | TEXT | NOT NULL ISO date | `z.string().date()` | date `*` | `notPastWhenNew`: "Ngày hiệu lực không hợp lệ" | ngày bắt đầu do Owner chọn | all thấy; Owner sửa draft | Chọn policy theo ngày công |
| effective_to | TEXT | NULL ISO date | `z.string().date().nullable()` | date | `effectiveRange`: "Ngày kết thúc phải sau ngày bắt đầu" | — | all thấy; Owner sửa draft | Kết thúc version |
| policy_key | TEXT | UNIQUE NOT NULL | `z.string().min(1)` | text | `derivedPolicyKey`: "Khóa chính sách không khớp" | server từ company/branch/from/version | Owner thấy; không sửa | Unique kỹ thuật |
| policy_status | TEXT | NOT NULL DEFAULT draft | `z.enum(['draft','approved','retired'])` | select-enum [draft:Nháp,approved:Đã duyệt,retired:Ngừng áp dụng] | `policyState`: "Chuyển trạng thái chính sách không hợp lệ" | draft | all thấy; action-only | Chỉ approved được tính công; tránh đụng `status` hệ thống |

State machine: `draft → approved → retired`. Nút: draft `Lưu`, `Duyệt`; approved `Tạo phiên bản mới`, `Ngừng áp dụng`; retired chỉ `Xem`. Approved không update. Policy Slice 1 không có `approved_by`/`approved_at`; actor, thời gian và before/after của duyệt được lấy từ workflow/audit timeline. Slice 1 chưa chặn policy approved chồng khoảng hiệu lực; đây là validator bắt buộc của pha sau, còn scan hiện chỉ dùng policy mà trạm tham chiếu, ở trạng thái approved và còn hiệu lực.

## 2. `AlumDoor QR Station`

| Field | D1 | Ràng buộc | Zod | UI | Validate | Autofill | Quyền | Nghiệp vụ |
|---|---|---|---|---|---|---|---|---|
| station_code | TEXT | UNIQUE NOT NULL | `z.string().regex(/^[A-Z0-9-]{3,30}$/)` | code-auto | `stationCode`: "Mã trạm chỉ gồm chữ hoa, số và dấu gạch" | counter `QR` | Manager+ thấy; không sửa | Định danh trạm |
| station_name | TEXT | NOT NULL | `z.string().trim().min(3).max(100)` | text `*` | `requiredTrimmed`: "Nhập tên trạm" | — | Manager+ thấy; Owner sửa | Tên hiển thị trên màn QR |
| branch | TEXT | FK→Branch NULL | `z.string().min(1).nullable()` | link-field→Branch | `branchOfCompany`: "Chi nhánh không thuộc công ty" | branch user | Manager+ thấy; Owner sửa | Scope nhân viên được quét |
| policy | TEXT | FK→AlumDoor Attendance Policy NOT NULL | `z.string().min(1)` | link-field→AlumDoor Attendance Policy `*` | `approvedEffectivePolicy`: "Chọn chính sách đã duyệt và còn hiệu lực" | policy approved gần nhất của branch | Manager+ thấy; Owner sửa | Chính sách phát/tính token |
| secret_version | INTEGER | NOT NULL DEFAULT 1 CHECK >=1 | `z.number().int().min(1)` | number | `secretVersion`: "Phiên bản khóa phải lớn hơn 0" | 1; tăng khi Rotate | Owner thấy; action-only | Thu hồi token cũ trong tối đa TTL |
| is_active | INTEGER | NOT NULL DEFAULT 1 | `z.boolean()` | checkbox | `boolean`: "Trạng thái trạm không hợp lệ" | true | Manager+ thấy; Owner sửa | Trạm tắt không phát/nhận QR |
| last_seen_at | TEXT | NULL ISO datetime | `z.string().datetime().nullable()` | datetime | `serverDatetime`: "Thời điểm heartbeat không hợp lệ" | challenge heartbeat | Manager+ thấy; không sửa | Giám sát trạm |

Lifecycle: active/inactive không xóa station. Actions Owner: `Mở màn QR`, `Khóa trạm`, `Mở trạm`, `Đổi khóa`; mọi action audit.

## 3. `Employee Checkin` — trường chuẩn dùng và customization AlumDoor

| Field | D1 | Ràng buộc | Zod | UI | Validate | Autofill | Quyền | Nghiệp vụ |
|---|---|---|---|---|---|---|---|---|
| employee | TEXT | FK→Employee NOT NULL | `z.string().min(1)` | link-field→Employee `*` | `actorEmployee`: "Không xác định được nhân viên đăng nhập" | luôn từ session, bỏ qua client | Employee own/Manager+ thấy; không sửa QR | Người chấm công |
| company | TEXT | FK→Company NOT NULL | `z.string().min(1)` | link-field→Company `*` | `employeeCompany`: "Công ty không khớp nhân viên" | từ Employee | Employee own/Manager+ thấy; không sửa QR | Scope |
| branch | TEXT | FK→Branch NOT NULL | `z.string().min(1)` | link-field→Branch `*` | `employeeBranch`: "Chi nhánh không khớp nhân viên" | từ Employee | Employee own/Manager+ thấy; không sửa QR | Scope |
| time | TEXT | NOT NULL ISO datetime | `z.string().datetime()` | datetime `*` | `serverDatetime`: "Thời điểm quét không hợp lệ" | server now | Employee own/Manager+ thấy; không sửa | Giờ duy nhất tính công |
| log_type | TEXT | NOT NULL | `z.enum(['IN','OUT'])` | select-enum [IN:Vào,OUT:Ra] `*` | `segmentToggle`: "Chiều quét không khớp trạng thái ca" | server từ segment state | Employee own/Manager+ thấy; không sửa | IN/OUT riêng từng segment |
| source | TEXT | NOT NULL DEFAULT Mobile | `z.enum(['Mobile','Device','Import','Manual'])` | select-enum [Mobile:Điện thoại,Device:Thiết bị,Import:Nhập,Manual:Thủ công] `*` | `checkinSource`: "Nguồn chấm công không hợp lệ" | QR trạm dùng `Device` | Manager+ thấy; không sửa QR | Giữ enum chuẩn HRM |
| external_id | TEXT | UNIQUE NOT NULL với QR | `z.string().min(16).max(160)` | text | `qrExternalId`: "Mã sự kiện QR không hợp lệ" | server hash canonical | Manager+ thấy; không sửa | Idempotency/replay guard |
| alu_station | TEXT | FK→AlumDoor QR Station NULL | `z.string().min(1).nullable()` | link-field→AlumDoor QR Station | `activeStation`: "Trạm QR không hợp lệ" | từ token | Employee own/Manager+ thấy; không sửa | Trạm nguồn |
| alu_work_date | TEXT | ISO date NULL | `z.string().date().nullable()` | date | `serverWorkDate`: "Ngày công không hợp lệ" | server theo policy timezone | Employee own/Manager+ thấy; không sửa | Khóa aggregate ngày |
| alu_segment_code | TEXT | NULL | `z.enum(['SHIFT1','SHIFT2','SHIFT3']).nullable()` | select-enum [SHIFT1:Ca 1,SHIFT2:Ca 2,SHIFT3:Ca 3] | `segmentWindow`: "Không xác định được ca" | server theo cửa sổ | Employee own/Manager+ thấy; không sửa | Tách toggle theo ca |
| alu_token_nonce_hash | TEXT | NULL, required QR | `z.string().length(64).nullable()` | text | `sha256Hex`: "Dấu token không hợp lệ" | hash token; không lưu token | Manager+ thấy; không sửa | Điều tra/replay |
| alu_capture_source | TEXT | NULL | `z.enum(['QR','MANUAL_IMPORT']).nullable()` | select-enum [QR:QR,MANUAL_IMPORT:Nhập thủ công] | `captureSource`: "Nguồn AlumDoor không hợp lệ" | QR | Manager+ thấy; không sửa | Phân biệt trong source Mobile |
| alu_device_fingerprint_hash | TEXT | NULL | `z.string().max(128).nullable()` | text | `opaqueHash`: "Dấu thiết bị quá dài" | hash client nếu có | Owner thấy; không sửa | Điều tra, không định danh tuyệt đối |
| alu_ip_hash | TEXT | NULL | `z.string().max(128).nullable()` | text | `opaqueHash`: "Dấu mạng quá dài" | gateway hash | Owner thấy; không sửa | Rate limit/audit riêng tư |

Lifecycle QR: tạo + submit trong transaction; không update/cancel/delete. Duplicate `external_id` trả bản ghi đầu tiên.

## 4. `AlumDoor Attendance Segment` — child của `AlumDoor Attendance Day`

| Field | D1 | Ràng buộc | Zod | UI | Validate | Autofill | Quyền | Nghiệp vụ |
|---|---|---|---|---|---|---|---|---|
| segment_code | TEXT | NOT NULL, unique trong parent | `z.enum(['SHIFT1','SHIFT2','SHIFT3'])` | select-enum [SHIFT1:Ca 1,SHIFT2:Ca 2,SHIFT3:Ca 3] `*` | `uniqueSegment`: "Mỗi ca chỉ có một dòng" | tạo đủ ba dòng theo policy | Employee own/Manager+/Payroll thấy; không sửa | Định danh đoạn |
| in_checkin | TEXT | FK→Employee Checkin NULL | `z.string().min(1).nullable()` | link-field→Employee Checkin | `sameEmployeeDateSegment`: "Log vào không khớp ca" | scan transaction | Employee own/Manager+ thấy; không sửa | Bằng chứng IN |
| out_checkin | TEXT | FK→Employee Checkin NULL | `z.string().min(1).nullable()` | link-field→Employee Checkin | `sameEmployeeDateSegment`: "Log ra không khớp ca" | scan transaction | Employee own/Manager+ thấy; không sửa | Bằng chứng OUT |
| actual_in | TEXT | NULL ISO datetime | `z.string().datetime().nullable()` | datetime | `segmentActualIn`: "Giờ vào không hợp lệ" | từ in_checkin/correction | Employee own/Manager+/Payroll thấy; không sửa | Giờ thực tế |
| actual_out | TEXT | NULL ISO datetime | `z.string().datetime().nullable()` | datetime | `afterActualIn`: "Giờ ra phải sau giờ vào" | từ out_checkin/correction | Employee own/Manager+/Payroll thấy; không sửa | Giờ thực tế |
| actual_minutes | INTEGER | NOT NULL DEFAULT 0 CHECK 0..1110 | `z.number().int().min(0).max(1110)` | number | `derivedMinutes`: "Phút thực tế không khớp" | server overlap | Employee own/Manager+/Payroll thấy; không sửa | Phút giao với khung |
| regular_minutes | INTEGER | NOT NULL DEFAULT 0 CHECK 0..480 | `z.number().int().min(0).max(480)` | number | `derivedMinutes`: "Phút thường không khớp" | server aggregate | Employee own/Manager+/Payroll thấy; không sửa | Đóng góp phút thường |
| overtime_minutes | INTEGER | NOT NULL DEFAULT 0 CHECK 0..1110 | `z.number().int().min(0).max(1110)` | number | `derivedMinutes`: "Phút tăng ca không khớp" | server aggregate | Employee own/Manager+/Payroll thấy; không sửa | Đóng góp OT |
| state | TEXT | NOT NULL | `z.enum(['empty','open','complete','missing_in','missing_out','corrected'])` | select-enum [empty:Chưa quét,open:Đang mở,complete:Đủ,missing_in:Thiếu vào,missing_out:Thiếu ra,corrected:Đã sửa] | `segmentState`: "Trạng thái ca không hợp lệ" | server state | Employee own/Manager+/Payroll thấy; action-only | Chặn/cho phép payroll |
| calculation_version | INTEGER | NOT NULL DEFAULT 1 | `z.number().int().min(1)` | number | `positiveVersion`: "Phiên bản tính không hợp lệ" | tăng khi recompute | Manager+/Payroll thấy; không sửa | Truy vết công thức |
| correction_request | TEXT | FK→Attendance Request NULL | `z.string().min(1).nullable()` | link-field→Attendance Request | `requiredWhenCorrected`: "Ca đã sửa phải có phiếu nguồn" | review correction | Employee own/Manager+/Payroll thấy; không sửa | Pha sau; không cài ở Slice 1 |

State machine: `empty → open → complete`; `open → missing_out`; correction approved → `corrected`. Không thao tác trực tiếp trong grid.

## 5. `AlumDoor Attendance Day` — projection ngày và nguồn công

Đây là Custom DocType AlumDoor, không phải `Attendance` chuẩn HRM. Sau mỗi scan, server tạo/cập nhật đúng một document theo `employee + work_date`, đồng thời tính lại đủ ba child row. Bất cứ tính lương tương lai nào đều đọc document này, không đọc `Attendance` chuẩn.

| Field | D1 | Ràng buộc | Zod | UI | Validate | Autofill | Quyền | Nghiệp vụ |
|---|---|---|---|---|---|---|---|---|
| employee | TEXT | FK→Employee NOT NULL | `z.string().min(1)` | link-field→Employee `*` | `activeEmployee`: "Nhân viên không hoạt động" | từ actor/scan | own/Manager+/Payroll thấy; không sửa | Unique cùng ngày |
| company | TEXT | FK→Company NOT NULL | `z.string().min(1)` | link-field→Company `*` | `employeeCompany`: "Công ty không khớp nhân viên" | từ Employee | own/Manager+/Payroll thấy; không sửa QR | Scope |
| branch | TEXT | FK→Branch NULL | `z.string().min(1).nullable()` | link-field→Branch | `employeeBranch`: "Chi nhánh không khớp nhân viên" | từ Employee | own/Manager+/Payroll thấy; không sửa QR | Scope |
| department | TEXT | FK→Department NULL | `z.string().min(1).nullable()` | link-field→Department | `employeeDepartment`: "Phòng ban không khớp" | từ Employee | own/Manager+/Payroll thấy; không sửa QR | Scope/report |
| work_date | TEXT | ISO date NOT NULL | `z.string().date()` | date `*` | `employmentDate`: "Ngày công ngoài thời gian làm việc" | policy timezone | own/Manager+/Payroll thấy; không sửa | Ngày công |
| policy | TEXT | FK→AlumDoor Attendance Policy NOT NULL | `z.string().min(1)` | link-field→AlumDoor Attendance Policy `*` | `approvedEffectivePolicy`: "Không có chính sách hiệu lực" | policy theo ngày/branch | own/Manager+/Payroll thấy; không sửa | Khóa version ca |
| segments | TEXT | child rows, đủ 3 dòng | `z.array(z.object({segment_code:z.enum(['SHIFT1','SHIFT2','SHIFT3'])})).length(3)` | table→AlumDoor Attendance Segment | `threeUniqueSegments`: "Ngày công phải có đủ ba ca" | transaction tạo/tính | own/Manager+/Payroll thấy; không sửa grid | Ba đoạn ca |
| regular_minutes | INTEGER | NOT NULL DEFAULT 0 CHECK 0..480 | `z.number().int().min(0).max(480)` | number | `derivedMinutes`: "Tổng phút thường không khớp" | sum formula | own/Manager+/Payroll thấy; không sửa | Nguồn lương thường |
| overtime_minutes | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0).max(3330)` | number | `derivedMinutes`: "Tổng phút tăng ca không khớp" | sum formula | own/Manager+/Payroll thấy; không sửa | Nguồn lương OT |
| payable_work_fraction_bp | INTEGER | NOT NULL DEFAULT 0 CHECK 0..10000 | `z.number().int().min(0).max(10000)` | number | `derivedWorkFraction`: "Tỷ lệ ngày công không khớp" | round regular/480 | own/Manager+/Payroll thấy; không sửa | 10000 = 1 ngày |
| state | TEXT | NOT NULL DEFAULT open | `z.enum(['open','complete','exception','approved','locked'])` | select-enum [open:Đang chấm,complete:Đủ công,exception:Cần xử lý,approved:Đã duyệt,locked:Đã khóa lương] | `attendanceDayState`: "Chuyển trạng thái công không hợp lệ" | server state | own/Manager+/Payroll thấy; action-only | Workflow ngày |
| calculated_at | TEXT | ISO datetime NOT NULL | `z.string().datetime()` | datetime | `serverDatetime`: "Thời điểm tính công không hợp lệ" | server now | own/Manager+/Payroll thấy; không sửa | Projection freshness |

State machine: `open → complete`; `open/complete → exception`; correction → `approved`; payroll approval `complete/approved → locked`. Locked bất biến.

> **Pha sau, không thuộc Slice 1:** các section 6–9 dưới đây là contract đã dự kiến để không phá luồng lương, nhưng chưa được phép cài metadata, custom field hoặc route. Khi triển khai phải mở lại review Field Ledger của section tương ứng.

## 6. `Attendance Request` — phiếu sửa công

| Field | D1 | Ràng buộc | Zod | UI | Validate | Autofill | Quyền | Nghiệp vụ |
|---|---|---|---|---|---|---|---|---|
| employee | TEXT | FK→Employee NOT NULL | `z.string().min(1)` | link-field→Employee `*` | `ownOrManagedEmployee`: "Bạn không được sửa công nhân viên này" | Employee session; Manager chọn trong scope | own/Manager+ thấy; requester sửa draft | Người cần sửa |
| company | TEXT | FK→Company NOT NULL | `z.string().min(1)` | link-field→Company `*` | `employeeCompany`: "Công ty không khớp" | từ Employee | own/Manager+ thấy; không sửa | Scope |
| branch | TEXT | FK→Branch NOT NULL | `z.string().min(1)` | link-field→Branch `*` | `employeeBranch`: "Chi nhánh không khớp" | từ Employee | own/Manager+ thấy; không sửa | Scope |
| from_date | TEXT | ISO date NOT NULL | `z.string().date()` | date `*` | `singleUnlockedWorkDate`: "Ngày đã khóa lương hoặc không hợp lệ" | ngày đang xem | own/Manager+ thấy; requester sửa draft | Bằng work_date |
| to_date | TEXT | ISO date NOT NULL | `z.string().date()` | date `*` | `sameDate`: "Phiếu sửa công chỉ áp dụng một ngày" | = from_date | own/Manager+ thấy; không sửa | Bằng from_date |
| request_type | TEXT | NOT NULL | `z.literal('Sửa chấm công')` | select-enum [Sửa chấm công:Sửa chấm công] `*` | `correctionType`: "Loại yêu cầu không hợp lệ" | Sửa chấm công | own/Manager+ thấy; không sửa | Dùng controller chuẩn |
| reason | TEXT | NOT NULL | `z.string().trim().min(10).max(500)` | textarea `*` | `correctionReason`: "Lý do phải có từ 10 đến 500 ký tự" | — | own/Manager+ thấy; requester sửa draft | Giải trình bắt buộc |
| attachment | TEXT | R2 key NULL | `z.string().max(500).nullable()` | image | `privateEvidence`: "Tệp bằng chứng không hợp lệ" | media capture | own/Manager+ thấy; requester sửa draft | Bằng chứng tùy chọn |
| workflow_state | TEXT | NOT NULL DEFAULT Nháp | `z.enum(['Nháp','Chờ duyệt','Đã duyệt','Đã áp dụng','Từ chối','Đã hủy'])` | select-enum [Nháp:Nháp,Chờ duyệt:Chờ duyệt,Đã duyệt:Đã duyệt,Đã áp dụng:Đã áp dụng,Từ chối:Từ chối,Đã hủy:Đã hủy] | `correctionState`: "Chuyển trạng thái phiếu không hợp lệ" | Nháp | own/Manager+ thấy; action-only | Workflow |
| alu_request_code | TEXT | UNIQUE NOT NULL | `z.string().min(1)` | code-auto | `correctionCode`: "Mã yêu cầu không hợp lệ" | autoname `YC` | own/Manager+ thấy; không sửa | Tra cứu |
| alu_segment_code | TEXT | NOT NULL | `z.enum(['SHIFT1','SHIFT2','SHIFT3'])` | select-enum [SHIFT1:Ca 1,SHIFT2:Ca 2,SHIFT3:Ca 3] `*` | `segmentForDate`: "Ca không hợp lệ" | ca từ dòng đang xem | own/Manager+ thấy; requester sửa draft | Đoạn sửa |
| alu_requested_in | TEXT | NULL ISO datetime | `z.string().datetime().nullable()` | datetime | `requestedPair`: "Giờ vào/ra đề nghị không hợp lệ" | giờ hiện có nếu sửa | own/Manager+ thấy; requester sửa draft | IN đề nghị |
| alu_requested_out | TEXT | NULL ISO datetime | `z.string().datetime().nullable()` | datetime | `requestedPair`: "Giờ ra phải sau giờ vào và cùng ngày" | giờ hiện có nếu sửa | own/Manager+ thấy; requester sửa draft | OUT đề nghị |
| alu_before_json | TEXT | NOT NULL JSON | `z.string().min(2)` | textarea | `snapshotJson`: "Dữ liệu trước sửa không hợp lệ" | server snapshot | own/Manager+ thấy; không sửa | Bằng chứng trước |
| alu_preview_json | TEXT | NOT NULL JSON | `z.string().min(2)` | textarea | `calculationPreview`: "Kết quả xem trước không hợp lệ" | server preview | own/Manager+ thấy; không sửa | Tác động phút/lương dự kiến |
| alu_review_note | TEXT | NULL | `z.string().trim().max(500).nullable()` | textarea | `reviewNoteRequiredOnReject`: "Từ chối phải nhập lý do" | — | own thấy sau review; Manager sửa khi review | Ý kiến duyệt |
| alu_requested_by | TEXT | FK→User NOT NULL | `z.string().min(1)` | link-field→User | `actorUser`: "Thiếu người gửi" | actor | own/Manager+ thấy; không sửa | Audit |
| alu_requested_at | TEXT | ISO datetime NOT NULL | `z.string().datetime()` | datetime | `serverDatetime`: "Thời điểm gửi không hợp lệ" | server now | own/Manager+ thấy; không sửa | Audit |
| alu_reviewed_by | TEXT | FK→User NULL | `z.string().min(1).nullable()` | link-field→User | `notRequester`: "Không được tự duyệt phiếu của mình" | reviewer actor | own/Manager+ thấy; không sửa | Tách nhiệm vụ |
| alu_reviewed_at | TEXT | NULL ISO datetime | `z.string().datetime().nullable()` | datetime | `reviewTime`: "Thời điểm duyệt không hợp lệ" | server now | own/Manager+ thấy; không sửa | Audit |
| alu_applied_at | TEXT | NULL ISO datetime | `z.string().datetime().nullable()` | datetime | `appliedWhenApproved`: "Phiếu áp dụng thiếu thời điểm" | transaction commit time | own/Manager+ thấy; không sửa | Xác nhận đã tính lại |

State machine: `Nháp → Chờ duyệt → Đã duyệt → Đã áp dụng`; `Chờ duyệt → Từ chối`; requester `Chờ duyệt → Đã hủy`. Duyệt và áp dụng trong cùng transaction; trạng thái Đã duyệt chỉ là bước nội bộ, response cuối Đã áp dụng.

## 7. `AlumDoor Pay Profile`

| Field | D1 | Ràng buộc | Zod | UI | Validate | Autofill | Quyền | Nghiệp vụ |
|---|---|---|---|---|---|---|---|---|
| profile_code | TEXT | UNIQUE NOT NULL | `z.string().regex(/^ALU-LUONG-/)` | code-auto | `payProfileCode`: "Mã hồ sơ lương không hợp lệ" | counter `ALU-LUONG` | Payroll/Owner thấy; không sửa | Mã version |
| employee | TEXT | FK→Employee NOT NULL | `z.string().min(1)` | link-field→Employee `*` | `activeScopedEmployee`: "Nhân viên không thuộc phạm vi" | từ hồ sơ đang xem | Payroll/Owner thấy; Payroll sửa draft | Nhân viên |
| company | TEXT | FK→Company NOT NULL | `z.string().min(1)` | link-field→Company `*` | `employeeCompany`: "Công ty không khớp" | từ Employee | Payroll/Owner thấy; không sửa | Scope |
| branch | TEXT | FK→Branch NOT NULL | `z.string().min(1)` | link-field→Branch `*` | `employeeBranch`: "Chi nhánh không khớp" | từ Employee | Payroll/Owner thấy; không sửa | Scope |
| pay_mode | TEXT | NOT NULL | `z.enum(['MONTHLY','DAILY'])` | select-enum [MONTHLY:Lương tháng,DAILY:Lương ngày] `*` | `payMode`: "Chọn cách trả lương" | profile trước nếu version mới | Payroll/Owner thấy; Payroll sửa draft | Chọn công thức |
| base_salary_vnd | INTEGER | NOT NULL CHECK >=0 | `z.number().int().min(0).max(999999999999)` | money `*` | `vndNonNegative`: "Lương cơ bản phải là số nguyên không âm" | profile trước nếu version mới | Payroll/Owner thấy; Payroll sửa draft | Lương tháng/ngày |
| overtime_multiplier_bp | INTEGER | NULL CHECK 0..100000 | `z.number().int().min(0).max(100000).nullable()` | number | `overtimeMultiplier`: "Hệ số tăng ca không hợp lệ" | profile trước; không tự đoán khi chưa có | Payroll/Owner thấy; Payroll sửa draft, Owner duyệt | 15000 = 1,5; null chặn approve payroll |
| fixed_allowance_vnd | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0).max(999999999999)` | money `*` | `vndNonNegative`: "Phụ cấp phải là số nguyên không âm" | profile trước hoặc 0 | Payroll/Owner thấy; Payroll sửa draft | Phụ cấp mặc định/kỳ |
| effective_from | TEXT | ISO date NOT NULL | `z.string().date()` | date `*` | `profileEffectiveRange`: "Ngày hiệu lực không hợp lệ" | ngày sau profile cũ | Payroll/Owner thấy; Payroll sửa draft | Chọn version theo kỳ/ngày |
| effective_to | TEXT | ISO date NULL | `z.string().date().nullable()` | date | `profileEffectiveRange`: "Ngày kết thúc phải sau ngày bắt đầu" | — | Payroll/Owner thấy; Payroll sửa draft | Kết thúc version |
| profile_key | TEXT | UNIQUE NOT NULL | `z.string().min(1)` | text | `derivedProfileKey`: "Khóa hồ sơ không khớp" | server employee/from/version | Owner thấy; không sửa | Guard duplicate |
| status | TEXT | NOT NULL DEFAULT draft | `z.enum(['draft','approved','retired'])` | select-enum [draft:Nháp,approved:Đã duyệt,retired:Ngừng áp dụng] | `profileState`: "Chuyển trạng thái hồ sơ không hợp lệ" | draft | Payroll/Owner thấy; action-only | Chỉ approved dùng tính |
| approved_by | TEXT | FK→User NULL | `z.string().min(1).nullable()` | link-field→User | `approvalActor`: "Thiếu người duyệt hồ sơ" | Owner actor | Payroll/Owner thấy; không sửa | Audit |
| approved_at | TEXT | NULL ISO datetime | `z.string().datetime().nullable()` | datetime | `approvalTime`: "Thiếu thời điểm duyệt hồ sơ" | server now | Payroll/Owner thấy; không sửa | Audit |

State machine: `draft → approved → retired`. Approved chỉ `Tạo phiên bản mới`; không chỉnh tiền/hệ số trực tiếp.

## 8. `Payroll Entry` — kỳ lương AlumDoor

| Field | D1 | Ràng buộc | Zod | UI | Validate | Autofill | Quyền | Nghiệp vụ |
|---|---|---|---|---|---|---|---|---|
| company | TEXT | FK→Company NOT NULL | `z.string().min(1)` | link-field→Company `*` | `scopedCompany`: "Công ty không thuộc phạm vi" | company session | Payroll/Owner thấy; Payroll sửa draft | Scope |
| branch | TEXT | FK→Branch NULL | `z.string().min(1).nullable()` | link-field→Branch | `branchOfCompany`: "Chi nhánh không thuộc công ty" | branch user | Payroll/Owner thấy; Payroll sửa draft | Trống = toàn company |
| start_date | TEXT | ISO date NOT NULL | `z.string().date()` | date `*` | `payrollPeriodRange`: "Từ ngày không hợp lệ" | đầu tháng hiện tại | Payroll/Owner thấy; Payroll sửa draft | Đầu kỳ |
| end_date | TEXT | ISO date NOT NULL | `z.string().date()` | date `*` | `payrollPeriodRange`: "Đến ngày phải sau từ ngày" | cuối tháng hiện tại | Payroll/Owner thấy; Payroll sửa draft | Cuối kỳ |
| employee_count | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0)` | number | `derivedCount`: "Số nhân viên không khớp" | server calculate | Payroll/Owner thấy; không sửa | Tổng người |
| total_net_pay | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0)` | money | `derivedMoney`: "Tổng thực nhận không khớp" | sum Salary Slip | Payroll/Owner thấy; không sửa | Tổng chuẩn Payroll Entry |
| alu_period_code | TEXT | UNIQUE NOT NULL | `z.string().min(1).max(40)` | code-auto | `payrollPeriodCode`: "Mã kỳ lương không hợp lệ" | counter `BL:<YYYYMM>` | Payroll/Owner thấy; không sửa | Mã kỳ |
| alu_period_key | TEXT | UNIQUE NOT NULL | `z.string().min(1)` | text | `derivedPeriodKey`: "Kỳ lương bị trùng" | company/branch/from/to | Owner thấy; không sửa | Guard overlap exact |
| alu_standard_work_days_bp | INTEGER | NOT NULL CHECK 1..310000 | `z.number().int().min(1).max(310000)` | number `*` | `standardWorkDays`: "Ngày công chuẩn phải lớn hơn 0 và không quá 31" | lịch làm kỳ; Payroll xác nhận | Payroll/Owner thấy; Payroll sửa draft | 260000 = 26 ngày |
| alu_state | TEXT | NOT NULL DEFAULT draft | `z.enum(['draft','calculated','pending_approval','approved','paid','cancelled','invalidated'])` | select-enum [draft:Nháp,calculated:Đã tính,pending_approval:Chờ duyệt,approved:Đã duyệt,paid:Đã trả,cancelled:Đã hủy,invalidated:Cần tính lại] | `payrollState`: "Chuyển trạng thái kỳ lương không hợp lệ" | draft | Payroll/Owner thấy; action-only | Workflow tài chính |
| alu_calculation_version | INTEGER | NOT NULL DEFAULT 1 | `z.number().int().min(1)` | number | `positiveVersion`: "Phiên bản tính không hợp lệ" | tăng mỗi calculate | Payroll/Owner thấy; không sửa | Version trace |
| alu_input_hash | TEXT | NULL SHA-256 | `z.string().length(64).nullable()` | text | `sha256Hex`: "Dấu đầu vào không hợp lệ" | canonical inputs khi submit | Payroll/Owner thấy; không sửa | Phát hiện nguồn đổi |
| alu_regular_minutes | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0)` | number | `derivedMinutes`: "Tổng phút thường không khớp" | sum slips | Payroll/Owner thấy; không sửa | KPI kỳ |
| alu_overtime_minutes | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0)` | number | `derivedMinutes`: "Tổng phút tăng ca không khớp" | sum slips | Payroll/Owner thấy; không sửa | KPI kỳ |
| alu_base_pay_vnd | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0)` | money | `derivedMoney`: "Tổng lương thường không khớp" | sum slips | Payroll/Owner thấy; không sửa | Tổng cộng |
| alu_overtime_pay_vnd | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0)` | money | `derivedMoney`: "Tổng tiền OT không khớp" | sum slips | Payroll/Owner thấy; không sửa | Tổng cộng |
| alu_allowance_vnd | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0)` | money | `derivedMoney`: "Tổng phụ cấp không khớp" | sum slips | Payroll/Owner thấy; không sửa | Tổng cộng |
| alu_advance_vnd | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0)` | money | `derivedMoney`: "Tổng tạm ứng không khớp" | sum slips | Payroll/Owner thấy; không sửa | Tổng trừ |
| alu_deduction_vnd | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0)` | money | `derivedMoney`: "Tổng khấu trừ không khớp" | sum slips | Payroll/Owner thấy; không sửa | Tổng trừ |
| alu_calculated_by | TEXT | FK→User NULL | `z.string().min(1).nullable()` | link-field→User | `actorUser`: "Thiếu người tính lương" | actor calculate | Payroll/Owner thấy; không sửa | Audit |
| alu_calculated_at | TEXT | NULL ISO datetime | `z.string().datetime().nullable()` | datetime | `serverDatetime`: "Thời điểm tính không hợp lệ" | server now | Payroll/Owner thấy; không sửa | Audit |
| alu_approved_by | TEXT | FK→User NULL | `z.string().min(1).nullable()` | link-field→User | `payrollApprover`: "Thiếu người duyệt lương" | Owner actor | Payroll/Owner thấy; không sửa | Audit/tách nhiệm vụ |
| alu_approved_at | TEXT | NULL ISO datetime | `z.string().datetime().nullable()` | datetime | `approvalTime`: "Thời điểm duyệt không hợp lệ" | server now | Payroll/Owner thấy; không sửa | Audit |
| alu_paid_by | TEXT | FK→User NULL | `z.string().min(1).nullable()` | link-field→User | `paidActor`: "Thiếu người xác nhận trả" | actor mark-paid | Payroll/Owner thấy; không sửa | Audit |
| alu_paid_at | TEXT | NULL ISO datetime | `z.string().datetime().nullable()` | datetime | `paidTime`: "Thời điểm trả không hợp lệ" | server now hoặc thời điểm hợp lệ | Payroll/Owner thấy; action nhập | Audit |

State machine: `draft → calculated → pending_approval → approved → paid`; input hash đổi trước approve → `invalidated → calculated`; draft/calculated có thể `cancelled`. Approved/paid bất biến.

## 9. `Salary Slip` — phiếu lương AlumDoor

| Field | D1 | Ràng buộc | Zod | UI | Validate | Autofill | Quyền | Nghiệp vụ |
|---|---|---|---|---|---|---|---|---|
| employee | TEXT | FK→Employee NOT NULL | `z.string().min(1)` | link-field→Employee `*` | `periodEmployee`: "Nhân viên không thuộc kỳ" | period employee set | Employee own/Payroll/Owner thấy; không sửa | Một phiếu/người/kỳ |
| company | TEXT | FK→Company NOT NULL | `z.string().min(1)` | link-field→Company `*` | `employeeCompany`: "Công ty không khớp" | từ Employee | own/Payroll/Owner thấy; không sửa | Scope |
| start_date | TEXT | ISO date NOT NULL | `z.string().date()` | date `*` | `samePayrollPeriod`: "Ngày bắt đầu không khớp kỳ" | Payroll Entry | own/Payroll/Owner thấy; không sửa | Kỳ |
| end_date | TEXT | ISO date NOT NULL | `z.string().date()` | date `*` | `samePayrollPeriod`: "Ngày kết thúc không khớp kỳ" | Payroll Entry | own/Payroll/Owner thấy; không sửa | Kỳ |
| gross_pay | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0)` | money | `derivedMoney`: "Tổng thu nhập không khớp" | base + OT + allowance | own/Payroll/Owner thấy; không sửa | Tương thích slip chuẩn |
| total_deduction | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0)` | money | `derivedMoney`: "Tổng khấu trừ không khớp" | advance + deduction | own/Payroll/Owner thấy; không sửa | Tương thích slip chuẩn |
| net_pay | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0)` | money | `derivedMoney`: "Thực nhận không khớp" | gross - total deduction | own/Payroll/Owner thấy; không sửa | Số trả |
| alu_payroll_entry | TEXT | FK→Payroll Entry NOT NULL | `z.string().min(1)` | link-field→Payroll Entry `*` | `activePayrollPeriod`: "Kỳ lương không hợp lệ" | kỳ đang tính | own/Payroll/Owner thấy; không sửa | Aggregate nguồn |
| alu_pay_profile | TEXT | FK→AlumDoor Pay Profile NOT NULL | `z.string().min(1)` | link-field→AlumDoor Pay Profile `*` | `approvedEffectiveProfile`: "Thiếu hồ sơ lương đã duyệt" | profile hiệu lực | own/Payroll/Owner thấy; không sửa | Khóa giá/hệ số |
| alu_regular_minutes | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0)` | number | `derivedMinutes`: "Phút thường không khớp" | sum locked AlumDoor Attendance Day | own/Payroll/Owner thấy; không sửa | Trace công |
| alu_overtime_minutes | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0)` | number | `derivedMinutes`: "Phút tăng ca không khớp" | sum locked AlumDoor Attendance Day | own/Payroll/Owner thấy; không sửa | Trace OT |
| alu_work_fraction_bp | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0).max(310000)` | number | `derivedWorkFraction`: "Ngày công không khớp" | sum AlumDoor Attendance Day | own/Payroll/Owner thấy; không sửa | Tổng ngày công ×10000 |
| alu_base_pay_vnd | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0)` | money | `derivedMoney`: "Lương thường không khớp" | fixed-point server | own/Payroll/Owner thấy; không sửa | Lương thường |
| alu_overtime_pay_vnd | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0)` | money | `derivedMoney`: "Tiền OT không khớp" | fixed-point server | own/Payroll/Owner thấy; không sửa | Tiền OT |
| alu_allowance_vnd | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0)` | money | `vndNonNegative`: "Phụ cấp không hợp lệ" | profile fixed allowance; Payroll sửa draft | own/Payroll/Owner thấy; Payroll sửa draft | Khoản cộng |
| alu_advance_vnd | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0)` | money | `vndNonNegative`: "Tạm ứng không hợp lệ" | 0 nếu chưa có nguồn | own/Payroll/Owner thấy; Payroll sửa draft | Khoản trừ |
| alu_manual_deduction_vnd | INTEGER | NOT NULL DEFAULT 0 | `z.number().int().min(0)` | money | `deductionWithReason`: "Khấu trừ phải là số nguyên không âm và có lý do" | 0 | own/Payroll/Owner thấy; Payroll sửa draft | Khoản trừ thủ công |
| alu_adjustment_reason | TEXT | NULL | `z.string().trim().max(500).nullable()` | textarea | `deductionWithReason`: "Nhập lý do khi có khấu trừ" | — | own/Payroll/Owner thấy; Payroll sửa draft | Giải trình |
| alu_state | TEXT | NOT NULL DEFAULT draft | `z.enum(['draft','pending_approval','approved','paid','cancelled'])` | select-enum [draft:Nháp,pending_approval:Chờ duyệt,approved:Đã duyệt,paid:Đã trả,cancelled:Đã hủy] | `salarySlipState`: "Chuyển trạng thái phiếu lương không hợp lệ" | theo Payroll Entry | own/Payroll/Owner thấy; action-only | Workflow |
| alu_calculation_version | INTEGER | NOT NULL DEFAULT 1 | `z.number().int().min(1)` | number | `positiveVersion`: "Phiên bản tính không hợp lệ" | Payroll Entry version | Payroll/Owner thấy; không sửa | Trace |
| alu_input_hash | TEXT | SHA-256 NOT NULL khi pending | `z.string().length(64).nullable()` | text | `sha256Hex`: "Dấu đầu vào không hợp lệ" | canonical trace | Payroll/Owner thấy; không sửa | Phát hiện nguồn đổi |
| alu_formula_trace_json | TEXT | JSON NOT NULL | `z.string().min(2)` | textarea | `salaryTraceV1`: "Dấu vết công thức lương không hợp lệ" | server schema v1 | Employee thấy bản giải thích; Payroll/Owner thấy đầy đủ; không sửa | Audit đầu vào/công thức/output |

State machine: đi theo Payroll Entry. Chỉ draft cho Payroll sửa ba khoản allowance/advance/manual deduction; pending trở đi khóa. Employee không có action sửa/duyệt.

## 10. Field không tạo mới

- Không thêm số tài khoản ngân hàng vào Pay Profile; dùng Employee permlevel hiện có.
- Không thêm thuế/BHXH/BHTN/TNCN vì MVP chưa có nguồn pháp lý đã duyệt.
- Không thêm giờ client, ảnh QR, token thô, IP/fingerprint thô.
- Không thêm cờ "tự duyệt" hoặc "bỏ qua ngoại lệ".
- Không thêm bảng Checkin hoặc Salary Slip song song với DocType chuẩn. Chỉ có `AlumDoor Attendance Day` là custom projection cần thiết để biểu diễn ba đoạn ca; không tạo/ghi `Attendance` chuẩn cho thuật toán này.

## 11. Kiểm tra Field Ledger

- [x] Mọi bảng/DocType trong Technical Design có ledger.
- [x] Mỗi field đủ 9 cột.
- [x] Tiền/tỷ lệ/thời gian dùng fixed-point/ISO đúng contract.
- [x] Mọi field dẫn xuất khóa ở UI và kiểm lại ở server.
- [x] Mọi Link kiểm tra tenant/branch/employee scope.
- [x] Mọi bảng có trạng thái có state machine và action.
- [x] Không có field ngoài BRD làm thay đổi nghiệp vụ; các field `key/hash/version` chỉ bảo vệ kỹ thuật và truy vết.
