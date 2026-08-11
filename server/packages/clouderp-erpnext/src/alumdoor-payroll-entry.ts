import type { JsonObject } from "../../contracts/src/index.js";
import { errors } from "../../core/src/index.js";
import type { ControllerContext } from "../../document-kernel/src/index.js";
import { fromScaledInt, toScaledInt } from "../../money/src/index.js";
import { PayrollEntryController } from "./enterprise-controllers.js";
import type { PayrollEntryData, SalarySlipData } from "./enterprise-types.js";

const EDITABLE_STATES = new Set(["draft", "calculated", "pending_approval", "invalidated"]);
const PAID_ROLES = new Set(["AlumDoor Payroll Approver", "HR Manager", "System Manager", "Administrator"]);

/**
 * Keeps the ordinary Payroll Entry contract intact while adding the AlumDoor period
 * state machine. A plain Payroll Entry still delegates byte-for-byte to the generic
 * controller; the specialised path activates only when `alu_state` is present.
 */
export class AlumDoorAwarePayrollEntryController extends PayrollEntryController {
  async normalize(context: ControllerContext<PayrollEntryData>): Promise<PayrollEntryData> {
    const input = context.command.document;
    if (input.alu_state === undefined && input.alu_standard_work_days_bp === undefined && input.alu_period_key === undefined) {
      return super.normalize(context);
    }
    if (!input.company || !input.posting_at || !input.start_date || !input.end_date || !Array.isArray(input.salary_slips)) {
      throw errors.validation("AlumDoor Payroll Entry requires company, payroll dates and a salary_slips array");
    }
    if (input.end_date < input.start_date) throw errors.validation("Payroll end_date must not precede start_date");

    const requestedState = text(input.alu_state) || "draft";
    const existingState = text(context.existing?.data.alu_state);
    const state = resolveState(context, requestedState, existingState);
    if (context.command.action === "submit" && input.salary_slips.length === 0) {
      throw errors.validation("Approved AlumDoor payroll requires at least one Salary Slip");
    }

    const standardWorkDaysBp = integer(input.alu_standard_work_days_bp, "standard work days", 1, 310_000);
    const branch = text(input.branch);
    const periodKey = `${input.company}|${branch || "*"}|${input.start_date}|${input.end_date}`;
    await assertNoOverlappingPeriod(context, input.company, branch, input.start_date, input.end_date);

    const company = await context.reader.getMasterRecordData(context.command.tenant_id, "Company", input.company);
    const currency = requiredText(company?.default_currency, `Company ${input.company} default currency`);
    const currencyRecord = await context.reader.getMasterRecordData(context.command.tenant_id, "Currency", currency);
    const scale = Number.isInteger(currencyRecord?.currency_scale) ? Number(currencyRecord?.currency_scale) : 2;
    if (scale < 0 || scale > 6) throw errors.reference(`Currency ${currency} has invalid precision`);

    const seen = new Set<string>();
    const slips: PayrollEntryData["salary_slips"] = [];
    let totalMinor = 0;
    let regularMinutes = 0;
    let overtimeMinutes = 0;
    let basePayVnd = 0;
    let overtimePayVnd = 0;
    let allowanceVnd = 0;
    let advanceVnd = 0;
    let deductionVnd = 0;
    for (const [index, raw] of input.salary_slips.entries()) {
      const name = text(raw.salary_slip);
      if (!name || seen.has(name)) throw errors.validation(`Salary Slip must be unique at row ${index + 1}`);
      seen.add(name);
      const slip = await context.reader.getDocument<SalarySlipData>(context.command.tenant_id, "Salary Slip", name);
      if (!slip || slip.docstatus === 2) throw errors.reference(`Salary Slip ${name} does not exist or is cancelled`);
      if (context.command.action === "submit" && slip.docstatus !== 1) {
        throw errors.reference(`Submitted Salary Slip ${name} is required before approving Payroll Entry`);
      }
      if (slip.data.company !== input.company || slip.data.start_date !== input.start_date || slip.data.end_date !== input.end_date) {
        throw errors.reference(`Salary Slip ${name} does not belong to this payroll period/company`);
      }
      if (text(slip.data.alu_payroll_entry) && text(slip.data.alu_payroll_entry) !== context.command.aggregate.name) {
        throw errors.reference(`Salary Slip ${name} belongs to another AlumDoor payroll entry`);
      }
      const netMinor = slip.data.net_pay_minor ?? toScaledInt(slip.data.net_pay ?? 0, scale, `Salary Slip ${name} net pay`);
      totalMinor = safeAdd(totalMinor, netMinor, "Payroll total");
      regularMinutes = safeAdd(regularMinutes, integer(slip.data.alu_regular_minutes ?? 0, "regular minutes", 0, 60 * 24 * 31), "regular minutes");
      overtimeMinutes = safeAdd(overtimeMinutes, integer(slip.data.alu_overtime_minutes ?? 0, "overtime minutes", 0, 60 * 24 * 31), "overtime minutes");
      basePayVnd = safeAdd(basePayVnd, integer(slip.data.alu_base_pay_vnd ?? 0, "base pay", 0, 999_999_999_999), "base pay");
      overtimePayVnd = safeAdd(overtimePayVnd, integer(slip.data.alu_overtime_pay_vnd ?? 0, "overtime pay", 0, 999_999_999_999), "overtime pay");
      allowanceVnd = safeAdd(allowanceVnd, integer(slip.data.alu_allowance_vnd ?? 0, "allowance", 0, 999_999_999_999), "allowance");
      advanceVnd = safeAdd(advanceVnd, integer(slip.data.alu_advance_vnd ?? 0, "advance", 0, 999_999_999_999), "advance");
      deductionVnd = safeAdd(deductionVnd, integer(slip.data.alu_manual_deduction_vnd ?? 0, "deduction", 0, 999_999_999_999), "deduction");
      slips.push({ row_id: raw.row_id || `ROW-${index + 1}`, salary_slip: name, employee: slip.data.employee, net_pay_minor: netMinor });
    }

    return {
      ...input,
      branch,
      salary_slips: slips,
      employee_count: slips.length,
      total_net_pay_minor: totalMinor,
      total_net_pay: fromScaledInt(totalMinor, scale),
      currency,
      currency_scale: scale,
      alu_period_code: context.command.aggregate.name,
      alu_period_key: periodKey,
      alu_standard_work_days_bp: standardWorkDaysBp,
      alu_state: state,
      alu_regular_minutes: regularMinutes,
      alu_overtime_minutes: overtimeMinutes,
      alu_base_pay_vnd: basePayVnd,
      alu_overtime_pay_vnd: overtimePayVnd,
      alu_allowance_vnd: allowanceVnd,
      alu_advance_vnd: advanceVnd,
      alu_deduction_vnd: deductionVnd,
      ...(context.command.action === "submit" ? { alu_approved_by: context.command.actor.user_id, alu_approved_at: context.now } : {}),
      ...(state === "paid" ? { alu_paid_by: context.command.actor.user_id, alu_paid_at: context.now } : {}),
    };
  }
}

function resolveState(context: ControllerContext<PayrollEntryData>, requested: string, existing: string): string {
  if (context.command.action === "submit") {
    if (!["calculated", "pending_approval"].includes(existing || requested)) {
      throw errors.lifecycle("Only calculated or pending approval payroll can be approved");
    }
    return "approved";
  }
  if (context.command.action === "cancel") {
    if (existing !== "approved") throw errors.lifecycle("Only approved payroll can be cancelled");
    return "cancelled";
  }
  if (requested === "paid") {
    if (context.existing?.docstatus !== 1 || existing !== "approved") throw errors.lifecycle("Only approved submitted payroll can be marked paid");
    if (!context.command.actor.roles.some((role) => PAID_ROLES.has(role)) && context.command.actor.user_id !== "Administrator") {
      throw errors.permission("Payroll approver is required to mark payroll paid");
    }
    return "paid";
  }
  if (!EDITABLE_STATES.has(requested)) {
    throw errors.lifecycle(`Payroll state ${requested} cannot be set by an ordinary save`);
  }
  if (context.existing?.docstatus === 1) throw errors.lifecycle("Submitted payroll is immutable except mark-paid or cancel");
  if (existing === "pending_approval" && requested === "calculated") return "calculated";
  if (existing === "calculated" && requested === "draft") throw errors.lifecycle("Calculated payroll cannot return to draft; recalculate or invalidate it");
  return requested;
}

async function assertNoOverlappingPeriod(
  context: ControllerContext<PayrollEntryData>, company: string, branch: string, fromDate: string, toDate: string,
): Promise<void> {
  const periods = await context.reader.listDocumentsByDoctype<JsonObject>(context.command.tenant_id, "Payroll Entry");
  for (const period of periods) {
    if (period.name === context.command.aggregate.name || period.docstatus === 2) continue;
    if (text(period.data.alu_state) === "cancelled" || !text(period.data.alu_state)) continue;
    if (text(period.data.company) !== company || text(period.data.branch) !== branch) continue;
    const otherFrom = text(period.data.start_date); const otherTo = text(period.data.end_date);
    if (otherFrom && otherTo && fromDate <= otherTo && otherFrom <= toDate) {
      throw errors.reference(`AlumDoor Payroll Entry ${period.name} overlaps this active payroll period`);
    }
  }
}

function text(value: unknown): string { return typeof value === "string" ? value.trim() : ""; }
function requiredText(value: unknown, field: string): string { const valueText = text(value); if (!valueText) throw errors.reference(`${field} is required`); return valueText; }
function integer(value: unknown, field: string, min: number, max: number): number { const number = typeof value === "number" ? value : Number(value); if (!Number.isSafeInteger(number) || number < min || number > max) throw errors.validation(`${field} must be an integer between ${min} and ${max}`); return number; }
function safeAdd(left: number, right: number, field: string): number { const value = Number(BigInt(left) + BigInt(right)); if (!Number.isSafeInteger(value)) throw errors.validation(`${field} exceeds safe integer bounds`); return value; }
