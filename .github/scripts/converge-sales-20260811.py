from pathlib import Path


def replace_once(path, old, new, label):
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    if new in text:
        return
    if old not in text:
        raise SystemExit(f"{label}: anchor not found in {path}")
    p.write_text(text.replace(old, new, 1), encoding="utf-8")


# AlumDoor Worker: Sales version is authoritative for Sales/cut behavior;
# re-add Attendance/Payroll routes from the already-converged HCM lane.
path = "server/apps-src/alumdoor-worker/src/index.ts"
old = 'import { attendanceChallenge, attendanceScan } from "./attendance-routes.js";\n'
new = old + '''import {
  attendanceExceptions, attendanceMonth, attendanceReviewCorrection,
  attendanceSubmitCorrection, attendanceToday,
} from "./attendance-operational-routes.js";
import {
  payrollApprovePeriod, payrollCalculatePeriod, payrollCreatePeriod, payrollMarkPaid,
  payrollMySlips, payrollPeriodList, payrollPeriodSlips, payrollSubmitPeriod,
} from "./payroll-routes.js";
'''
replace_once(path, old, new, "worker attendance imports")
old = '        if (method === "alumdoor.attendance.scan") return await attendanceScan({ request, call, env, args });\n'
new = old + '''        if (method === "alumdoor.attendance.today") return await attendanceToday({ call, args });
        if (method === "alumdoor.attendance.month") return await attendanceMonth({ call, args });
        if (method === "alumdoor.attendance.exceptions") return await attendanceExceptions({ call, args });
        if (method === "alumdoor.attendance.submit_correction") return await attendanceSubmitCorrection({ call, args });
        if (method === "alumdoor.attendance.review_correction") return await attendanceReviewCorrection({ call, args });
        if (method === "alumdoor.payroll.period_list") return await payrollPeriodList({ call, args });
        if (method === "alumdoor.payroll.create_period") return await payrollCreatePeriod({ call, args });
        if (method === "alumdoor.payroll.calculate_period") return await payrollCalculatePeriod({ call, args });
        if (method === "alumdoor.payroll.submit_period") return await payrollSubmitPeriod({ call, args });
        if (method === "alumdoor.payroll.approve_period") return await payrollApprovePeriod({ call, args });
        if (method === "alumdoor.payroll.mark_paid") return await payrollMarkPaid({ call, args });
        if (method === "alumdoor.payroll.period_slips") return await payrollPeriodSlips({ call, args });
        if (method === "alumdoor.payroll.my_slips") return await payrollMySlips({ call, args, actorUser: platformActorUser(request) });
'''
replace_once(path, old, new, "worker attendance routes")

# ERP registry: preserve Sales stock/reservation controllers and add payroll authority.
path = "server/packages/clouderp-erpnext/src/registry.ts"
p = Path(path)
text = p.read_text(encoding="utf-8")
text = text.replace(
    "EInvoiceSubmissionController, PayrollEntryController,\n  SubscriptionController",
    "EInvoiceSubmissionController,\n  SubscriptionController",
)
anchor = 'import { AlumDoorAttendanceDayController } from "./alumdoor-attendance.js";\n'
addition = anchor + 'import { AlumDoorPayProfileController } from "./alumdoor-payroll.js";\nimport { AlumDoorAwarePayrollEntryController } from "./alumdoor-payroll-entry.js";\n'
if "AlumDoorAwarePayrollEntryController" not in text:
    if anchor not in text:
        raise SystemExit("registry attendance import anchor not found")
    text = text.replace(anchor, addition, 1)
text = text.replace(
    ".register(new PayrollEntryController())",
    ".register(new AlumDoorAwarePayrollEntryController())",
)
anchor2 = "    .register(new AlumDoorAttendanceDayController())\n"
if "    .register(new AlumDoorPayProfileController())\n" not in text:
    if anchor2 not in text:
        raise SystemExit("registry attendance registration anchor not found")
    text = text.replace(
        anchor2,
        "    .register(new AlumDoorPayProfileController())\n" + anchor2,
        1,
    )
p.write_text(text, encoding="utf-8")

# Frappe router: Sales preview is kept; add Attendance correction/payroll callbacks.
path = "server/packages/frappe-api/src/router.ts"
p = Path(path)
text = p.read_text(encoding="utf-8")
iface_anchor = '''  commitAlumdoorAttendanceScan?: (input: {
    station: string;
    nonceHash: string;
    deviceFingerprintHash?: string;
  }) => Promise<JsonObject>;
'''
iface_add = iface_anchor + '''  submitAlumdoorAttendanceCorrection?: (input: {
    workDate: string; segmentCode: string; requestedIn?: string; requestedOut?: string;
    reason: string; attachment?: string;
  }) => Promise<JsonObject>;
  reviewAlumdoorAttendanceCorrection?: (input: {
    request: string; action: "approve" | "reject"; note?: string;
  }) => Promise<JsonObject>;
  approveAlumdoorPayroll?: (input: { payrollEntry: string }) => Promise<JsonObject>;
'''
if "submitAlumdoorAttendanceCorrection?:" not in text:
    if iface_anchor not in text:
        raise SystemExit("router interface anchor not found")
    text = text.replace(iface_anchor, iface_add, 1)
dispatch_anchor = '''    case "metaforge.api.commit_alumdoor_attendance_scan":
      return methodResponse(await commitAlumdoorAttendanceScan(args, context));
'''
dispatch_add = dispatch_anchor + '''
    case "metaforge.api.submit_alumdoor_attendance_correction":
      return methodResponse(await submitAlumdoorAttendanceCorrection(args, context));

    case "metaforge.api.review_alumdoor_attendance_correction":
      return methodResponse(await reviewAlumdoorAttendanceCorrection(args, context));

    case "metaforge.api.approve_alumdoor_payroll":
      return methodResponse(await approveAlumdoorPayroll(args, context));
'''
if 'case "metaforge.api.submit_alumdoor_attendance_correction"' not in text:
    if dispatch_anchor not in text:
        raise SystemExit("router dispatch anchor not found")
    text = text.replace(dispatch_anchor, dispatch_add, 1)
fn_anchor = "async function alumdoorAttendanceQrConfig(args: FrappeArgs, context: FrappeRouterContext): Promise<JsonObject> {\n"
fn_add = '''async function submitAlumdoorAttendanceCorrection(args: FrappeArgs, context: FrappeRouterContext): Promise<JsonObject> {
  if (context.appCallbackAppId !== "alumdoor" || !context.submitAlumdoorAttendanceCorrection) {
    throw errors.permission("AlumDoor attendance correction accepts only the verified AlumDoor app callback.");
  }
  const requestedIn = args.text("requested_in");
  const requestedOut = args.text("requested_out");
  const attachment = args.text("attachment");
  return context.submitAlumdoorAttendanceCorrection({
    workDate: args.requireText("work_date", 10),
    segmentCode: args.requireText("segment_code", 16),
    ...(requestedIn ? { requestedIn } : {}),
    ...(requestedOut ? { requestedOut } : {}),
    reason: args.requireText("reason", 1000),
    ...(attachment ? { attachment } : {}),
  });
}

async function reviewAlumdoorAttendanceCorrection(args: FrappeArgs, context: FrappeRouterContext): Promise<JsonObject> {
  if (context.appCallbackAppId !== "alumdoor" || !context.reviewAlumdoorAttendanceCorrection) {
    throw errors.permission("AlumDoor attendance correction review accepts only the verified AlumDoor app callback.");
  }
  const action = args.requireText("action", 16);
  if (action !== "approve" && action !== "reject") throw errors.validation("action must be approve or reject");
  const note = args.text("note");
  return context.reviewAlumdoorAttendanceCorrection({
    request: args.requireText("request", 320),
    action,
    ...(note ? { note } : {}),
  });
}

async function approveAlumdoorPayroll(args: FrappeArgs, context: FrappeRouterContext): Promise<JsonObject> {
  if (context.appCallbackAppId !== "alumdoor" || !context.approveAlumdoorPayroll) {
    throw errors.permission("AlumDoor payroll approval accepts only the verified AlumDoor app callback.");
  }
  return context.approveAlumdoorPayroll({ payrollEntry: args.requireText("payroll_entry", 320) });
}

'''
if "async function submitAlumdoorAttendanceCorrection(" not in text:
    if fn_anchor not in text:
        raise SystemExit("router function anchor not found")
    text = text.replace(fn_anchor, fn_add + fn_anchor, 1)
p.write_text(text, encoding="utf-8")

# Sales builder is the newest UI metadata source; reapply the Inventory canonical
# counted-stock/catch-weight contract before regenerating alumdoor-v2.json.
path = "server/scripts/build-alumdoor-v2-brief.mjs"
p = Path(path)
text = p.read_text(encoding="utf-8")
old_g1 = '''// ── G1. Chủ xưởng chốt lại ngày 30/07: nhôm nhập và tồn theo KG ──
// Số cây/lá, số bó và chiều dài là quy cách vật lý để tính barem và theo dõi nhà máy giao;
// không thay thế số lượng giao dịch. `qty` của đơn mua là kg barem, `qty` của phiếu nhập là
// số lượng thực nhận theo ĐVT mua. Vì vậy profile nhôm phải giữ stock_uom = Kg.
fixture("Measurement Profile", "Nhôm cây/lá").data.stock_uom = "Kg";
note('G1 · Measurement Profile "Nhôm cây/lá": nhập/tồn Kg; cây/lá là số lượng phụ');
'''
new_g1 = '''// ── G1. Contract canonical 11/08: nhôm mua/định giá theo Kg, tồn vật lý theo Cây/Lá ──
// Kg là catch weight và priced quantity; số cây/lá là stock quantity. Hai trục cùng nằm trên
// Stock Ledger/Batch, tuyệt đối không dùng hệ số Kg↔Cây tĩnh và không tạo shadow balance.
fixture("Measurement Profile", "Nhôm cây/lá").data.stock_uom = "Cây";
note('G1 · Measurement Profile "Nhôm cây/lá": tồn Cây/Lá; Kg là catch weight và đơn vị mua/định giá');
'''
if "Contract canonical 11/08" not in text:
    if old_g1 not in text:
        raise SystemExit("builder G1 anchor not found")
    text = text.replace(old_g1, new_g1, 1)
child_anchor = "const childPresentation = applyAlumdoorChildPresentation(brief);\n"
inv_block = '''// ── ALUMINUM INVENTORY AUTHORITY CONVERGENCE ──
// Effective package must be born canonical: purchase/price in Kg, physical stock in Cây/Lá,
// Batch identity + catch weight, and qty_bar as exact purchase stock/allocation quantity.
const technicalItemFields = [
  { fieldname: "purchase_stock_qty_field", fieldtype: "Data", label: "Trường SL tồn mua", hidden: true, read_only: true },
  { fieldname: "purchase_allocation_qty_field", fieldtype: "Data", label: "Trường SL phân bổ mua", hidden: true, read_only: true },
  { fieldname: "purchase_allocation_uom", fieldtype: "Link", options: "UOM", label: "ĐVT phân bổ mua", hidden: true, read_only: true },
];
for (const field of technicalItemFields) {
  if (!item.fields.some((existing) => typeof existing === "object" && existing?.fieldname === field.fieldname)) item.fields.push(field);
}
const canonicalAluminumProfile = fixture("Measurement Profile", "Nhôm cây/lá").data;
canonicalAluminumProfile.stock_uom = "Cây";
canonicalAluminumProfile.track_dimension_lot = true;
canonicalAluminumProfile.require_piece_qty = true;
canonicalAluminumProfile._desc = "Tồn nhôm theo số cây/lá có Batch và chiều dài; Kg là catch weight/đơn vị mua-định giá, không phải số lượng tồn.";
for (const f of brief.fixtures) {
  if (f?.type !== "Item" || f?.data?.inventory_mode !== "Nhôm cây/lá") continue;
  f.data.stock_uom = "Cây";
  f.data.default_purchase_uom = "Kg";
  f.data.has_batch_no = 1;
  f.data.has_catch_weight = 1;
  f.data.weight_uom = "Kg";
  f.data.purchase_stock_qty_field = "qty_bar";
  f.data.purchase_allocation_qty_field = "qty_bar";
  f.data.purchase_allocation_uom = "Cây";
  f.data.allow_negative_stock = 0;
  f.data.uom_conversions = [];
}
note('AL-INV · package canonical: Kg priced/catch-weight + Cây/Lá stock + Batch + qty_bar descriptors');

'''
if "ALUMINUM INVENTORY AUTHORITY CONVERGENCE" not in text:
    if child_anchor not in text:
        raise SystemExit("builder child-presentation anchor not found")
    text = text.replace(child_anchor, inv_block + child_anchor, 1)
text = text.replace(
    'writeFileSync(OUT, JSON.stringify(brief, null, 1) + "\\n", "utf8");',
    'writeFileSync(OUT, JSON.stringify(brief, null, 2) + "\\n", "utf8");',
)
p.write_text(text, encoding="utf-8")
