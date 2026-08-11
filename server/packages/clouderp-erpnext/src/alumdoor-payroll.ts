import type { JsonObject } from "../../contracts/src/index.js";
import { errors } from "../../core/src/index.js";
import { SuiteController } from "./suite-controllers.js";
import * as H from "./hrm-shared.js";

type HrmContext = H.HrmContext;

/**
 * Lightweight AlumDoor pay configuration. It deliberately does not create a second
 * payroll engine: Salary Slip / Payroll Entry remain the accounting authority.
 */
export class AlumDoorPayProfileController extends SuiteController<JsonObject> {
  readonly doctype = "AlumDoor Pay Profile";

  async normalize(context: HrmContext): Promise<JsonObject> {
    const input = context.command.document;
    const employeeName = H.requiredText(input.employee, "Employee");
    const employee = await H.requireRecord(context, "Employee", employeeName);
    H.assertEmployeeActive(employee, employeeName);

    const effectiveFrom = H.requiredDate(input.effective_from, "Pay Profile effective_from");
    const effectiveTo = H.optionalDate(input.effective_to, "Pay Profile effective_to");
    if (effectiveTo && effectiveTo < effectiveFrom) {
      throw errors.validation("Pay Profile effective_to must not precede effective_from");
    }
    const employeeState = await H.resolveEmployeeState(context, employeeName, employee, effectiveFrom);
    H.assertEmployeeStateActive(employeeState, employeeName, effectiveFrom);
    const company = H.requiredText(employeeState.company, "Employee company");
    const branch = H.requiredText(employeeState.branch, "Employee branch");
    if (H.text(input.company) && H.text(input.company) !== company) throw errors.reference("Pay Profile company does not match Employee");
    if (H.text(input.branch) && H.text(input.branch) !== branch) throw errors.reference("Pay Profile branch does not match Employee");

    const payMode = H.requiredText(input.pay_mode, "Pay Profile pay_mode");
    if (!["MONTHLY", "DAILY"].includes(payMode)) throw errors.validation("Pay Profile pay_mode must be MONTHLY or DAILY");
    const baseSalaryVnd = exactInteger(input.base_salary_vnd, "Pay Profile base_salary_vnd", 0, 999_999_999_999);
    const overtimeMultiplierBp = exactInteger(input.overtime_multiplier_bp, "Pay Profile overtime_multiplier_bp", 0, 100_000);
    const fixedAllowanceVnd = exactInteger(input.fixed_allowance_vnd ?? 0, "Pay Profile fixed_allowance_vnd", 0, 999_999_999_999);

    if (context.command.action === "submit") {
      const profiles = await context.reader.listDocumentsByDoctype<JsonObject>(context.command.tenant_id, this.doctype);
      for (const profile of profiles) {
        if (profile.name === context.command.aggregate.name || profile.docstatus !== 1) continue;
        if (H.text(profile.data.employee) !== employeeName) continue;
        const otherFrom = H.optionalDate(profile.data.effective_from, "Existing Pay Profile effective_from");
        if (!otherFrom) continue;
        const otherTo = H.optionalDate(profile.data.effective_to, "Existing Pay Profile effective_to");
        if (H.rangesOverlap(effectiveFrom, effectiveTo, otherFrom, otherTo)) {
          throw errors.reference(`Employee ${employeeName} already has an approved Pay Profile overlapping this period`);
        }
      }
    }

    const status = context.command.action === "submit"
      ? "approved"
      : context.command.action === "cancel"
        ? "retired"
        : "draft";
    return {
      ...input,
      profile_code: context.command.aggregate.name,
      employee: employeeName,
      company,
      branch,
      pay_mode: payMode,
      base_salary_vnd: baseSalaryVnd,
      overtime_multiplier_bp: overtimeMultiplierBp,
      fixed_allowance_vnd: fixedAllowanceVnd,
      effective_from: effectiveFrom,
      ...(effectiveTo ? { effective_to: effectiveTo } : {}),
      profile_key: `${employeeName}|${effectiveFrom}|${context.command.aggregate.name}`,
      status,
      ...(context.command.action === "submit" ? { approved_by: context.command.actor.user_id, approved_at: context.now } : {}),
    };
  }

  status(context: HrmContext): string {
    if (context.command.action === "submit") return "approved";
    if (context.command.action === "cancel") return "retired";
    return "draft";
  }
}

function exactInteger(value: unknown, field: string, min: number, max: number): number {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(number) || number < min || number > max) {
    throw errors.validation(`${field} must be an integer between ${min} and ${max}`);
  }
  return number;
}
