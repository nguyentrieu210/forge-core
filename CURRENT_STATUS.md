# CURRENT STATUS

Ngày cập nhật: **2026-08-11**.

GitHub là nguồn sự thật cho exact `main`, branch, PR, workflow run, merge và production evidence. File này chỉ giữ **live verified state**, không giữ lịch sử dài.

## 1. Repository checkpoint

- Repository: `nguyentrieu210/forge`.
- Default branch: `main`.
- Exact source baseline sau convergence: `main@37880fc828bfcab5f9fca19341ee64e4caee3103`.
- Final convergence PR: `#822` — **MERGED**.
- Exact combined candidate trước merge: `dba25942311fd94064f95d7906b5c044347cc440`.
- R6 Pass Convergence run `31465006532` trên exact combined candidate: **SUCCESS**.
- Read-only pilot/provider/package-profile lane trong cùng R6 run: **SUCCESS**.
- Không có production deploy, production migration, tenant apply, DNS/route/secret/provider mutation hay customer-data cutover trong wave merge này.

## 2. 2026-08-11 convergence closure

Một combined candidate duy nhất đã hội tụ theo authority/dependency order:

1. **AlumDoor Inventory / aluminum ATP authority** từ PR `#807`;
2. **Attendance -> Payroll authority** từ `feature/attendance-payroll`, hội tụ qua PR `#818`;
3. **Sales commercial authority** từ canonical Sales end-state, gồm Pricing Rule authority, Item Price variant, Sales Option, Sales Package/source-line fulfillment và server-authoritative commercial money.

Các shared hotspot Sales/Inventory/Payroll đã được reconcile trên cùng tree thay vì merge độc lập rồi giả định tương thích.

Combined convergence verification trước final PR gồm:

- server build: PASS;
- 53/53 targeted critical regressions: PASS;
- aluminum purchase/supply-demand + ATP/reservation: PASS;
- Attendance/Payroll integration + coordinator: PASS;
- commercial line authority + Sales Option + O2C: PASS;
- R6 production-equivalent CloudForge + MetaForge build: PASS;
- migration/restore/PITR safety: PASS;
- Workerd ERP lifecycle, auth/CSRF/tenant isolation, provisioning: PASS;
- R6 Golden Flow: PASS;
- release safety, observability, queue safety, AlumDoor package composition và diff hygiene: PASS.

## 3. Capability truth

Canonical denominator vẫn là **956 capabilities** cho tới khi một convergence/audit sau này materialize distribution mới có evidence đầy đủ.

Latest accepted materialized distribution chưa được wave 2026-08-11 thay đổi hàng loạt:

| Maturity | Count |
|---|---:|
| Hardened | 0 |
| RC | 66 |
| Wired | 406 |
| Foundation | 327 |
| Missing | 157 |
| **Total** | **956** |

Không suy maturity mới chỉ từ việc merge thêm source hoặc tăng test count.

## 4. Current architecture authorities

- Document/business writes: canonical Document Kernel / Durable Object path.
- Tenant/query store: D1 dưới repository migration governance.
- Money authority: canonical GL + Payment Ledger; commercial Sales money được resolve server-side, không lấy client total làm authority.
- Sales pricing: `Item Price` là base price; `Pricing Rule` là conditional commercial adjustment authority; `Sales Option` là operator-facing choice; `Sales Package` là fulfillment composition; BOM vẫn là manufacturing consumption authority.
- Stock authority: canonical Stock Ledger/valuation; không có vertical shadow stock ledger.
- AlumDoor aluminum: physical stock dùng counted Cây/Lá + Batch; Kg là purchase/pricing catch weight; không dùng static Kg<->Cây conversion làm authoritative quantity.
- Reservation/ATP: shared stock/reservation authority được Sales fulfillment và Manufacturing demand tiêu thụ, không fork trong vertical.
- HCM/Payroll: Attendance Day/Pay Profile/Payroll coordination được nối vào canonical payroll path; correction/approval/locking giữ server authority.
- Permission: server-side tenant/role/DocPerm/owner/share/user-permission enforcement.
- App lifecycle: App Registry / App Factory install/upgrade contracts.
- Frontend: shared metadata-driven runtime; vertical logic chỉ giữ ở layer ngành khi thực sự đặc thù.

## 5. Production/provider truth

Wave `#822` là **source convergence**, không phải production promotion.

- R6 evidence đã chứng minh exact combined candidate `dba2594...` có production-equivalent build/source-safety và read-only pilot evidence xanh.
- Merge commit hiện tại là `37880fc...`; không được suy rằng SHA này đã deploy chỉ vì source đã merge.
- Nếu `37880fc...` hoặc một SHA main mới hơn được chọn làm release target, release lock phải dùng exact target SHA và rerun mọi exact-SHA evidence mà release policy yêu cầu trước mutation live.
- Production deploy/redeploy/rollback, migration, restore/PITR, tenant apply, DNS/route/secret/provider mutation và customer-data cutover vẫn là explicit authorization boundaries.

## 6. Open workstreams

Sau cleanup convergence, chỉ còn ba PR mở và chúng **không thuộc wave #822**:

- `#665` — repo/North Star brand + hygiene rebaseline;
- `#672` — provisioning doctrine + Skill Matrix;
- `#675` — Omnichannel Marketplace ERP.

Cả ba được tạo từ baseline cũ. Trước khi merge phải re-audit/rebase/reconcile từ exact current `main`; không dùng evidence cũ để suy compatibility với `37880fc...`.

## 7. Standing boundaries

- Không reopen các PR Sales/UI/control cũ đã superseded chỉ vì branch còn tồn tại.
- Không tạo parallel Finance/Stock/Payroll/Pricing authority trong vertical.
- Source/config presence không bằng observed provider/live state.
- Worker rollback không đồng nghĩa data rollback.
- Exact release evidence phải gắn đúng release SHA; source-changing fix phải phát hành candidate mới và rerun affected lanes.
- Không chạy production mutation khi chưa có explicit authorization riêng.

## 8. Documentation authority

Bắt đầu tại `docs/README.md`, sau đó đọc `skills/forge-enterprise-completion/SKILL.md`, `NEXT_TASKS.md`, North Star và capability map. R6 handoff/agent artifacts cũ là provenance/evidence, không được dùng thay exact current GitHub state.