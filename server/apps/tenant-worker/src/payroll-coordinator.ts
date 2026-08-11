import type { Actor, JsonObject, MutationCommand } from "../../../packages/contracts/src/index.js";
import { commandPayloadHash, errors, sha256Hex } from "../../../packages/core/src/index.js";
import type { DocumentKernel, MutationStore } from "../../../packages/document-kernel/src/index.js";

const PAYROLL_ENTRY = "Payroll Entry";
const SALARY_SLIP = "Salary Slip";
const ATTENDANCE_DAY = "AlumDoor Attendance Day";
const INTERNAL_PAYROLL_ROLE = "AlumDoor Payroll System";

export interface AlumDoorPayrollApprovalInput { tenantId: string; actor: Actor; payrollEntry: string; }
export interface AlumDoorPayrollCoordinatorServices { kernel: DocumentKernel; store: MutationStore; now?: () => string; }

export async function approveAlumDoorPayroll(input: AlumDoorPayrollApprovalInput, services: AlumDoorPayrollCoordinatorServices): Promise<JsonObject> {
  assertApprover(input.actor);
  const payrollName = requiredText(input.payrollEntry, "Payroll Entry");
  const payroll = await services.store.getDocument<JsonObject>(input.tenantId, PAYROLL_ENTRY, payrollName);
  if (!payroll || payroll.docstatus === 2) throw errors.reference(`Payroll Entry ${payrollName} does not exist`);
  if (payroll.docstatus === 1 && text(payroll.data.alu_state) === "approved") {
    return { replayed: true, payroll_entry: payrollName, state: "approved", employee_count: payroll.data.employee_count ?? 0 };
  }
  if (!["calculated", "pending_approval"].includes(text(payroll.data.alu_state))) throw errors.lifecycle("Payroll Entry must be calculated or pending approval before approval");
  const now = services.now?.() ?? new Date().toISOString();
  const startDate = requiredDate(payroll.data.start_date, "Payroll start_date");
  const endDate = requiredDate(payroll.data.end_date, "Payroll end_date");
  const company = requiredText(payroll.data.company, "Payroll company");
  const rows = arrayObjects(payroll.data.salary_slips);
  if (rows.length === 0) throw errors.validation("Payroll Entry has no Salary Slips to approve");

  const systemActor: Actor = { ...input.actor, roles: [...new Set([...input.actor.roles, INTERNAL_PAYROLL_ROLE, "Payroll Manager", "HR Manager", "Accounts Manager"])] };
  const commands: MutationCommand[] = [];
  const employees = new Set<string>();
  const slipHashes: Array<{ name: string; input_hash: string }> = [];

  for (const [index, row] of rows.entries()) {
    const slipName = requiredText(row.salary_slip, `Salary Slip row ${index + 1}`);
    const slip = await services.store.getDocument<JsonObject>(input.tenantId, SALARY_SLIP, slipName);
    if (!slip || slip.docstatus === 2) throw errors.reference(`Salary Slip ${slipName} does not exist`);
    if (text(slip.data.company) !== company || text(slip.data.start_date) !== startDate || text(slip.data.end_date) !== endDate) throw errors.reference(`Salary Slip ${slipName} does not belong to Payroll Entry ${payrollName}`);
    if (text(slip.data.alu_payroll_entry) !== payrollName) throw errors.reference(`Salary Slip ${slipName} is not bound to Payroll Entry ${payrollName}`);
    const employee = requiredText(slip.data.employee, `Salary Slip ${slipName} employee`);
    if (employees.has(employee)) throw errors.validation(`Payroll Entry contains duplicate employee ${employee}`);
    employees.add(employee);
    const oldHash = requiredText(slip.data.alu_input_hash, `Salary Slip ${slipName} input hash`);
    slipHashes.push({ name: slipName, input_hash: oldHash });
    if (slip.docstatus === 0) commands.push(await command({ tenantId: input.tenantId, actor: systemActor, doctype: SALARY_SLIP, name: slipName, action: "submit", expectedVersion: slip.version, document: { ...slip.data, alu_state: "pending_approval" }, submittedAt: now, commandId: `alu-payroll:${payrollName}:slip:${slipName}:submit` }));
  }

  const attendance = (await services.store.listDocumentsByDoctype<JsonObject>(input.tenantId, ATTENDANCE_DAY))
    .filter((entry) => employees.has(text(entry.data.employee)) && text(entry.data.work_date) >= startDate && text(entry.data.work_date) <= endDate)
    .sort((left, right) => text(left.data.employee).localeCompare(text(right.data.employee)) || text(left.data.work_date).localeCompare(text(right.data.work_date)));
  if (attendance.length === 0) throw errors.validation("PAYROLL_BLOCKED: Payroll period has no AlumDoor Attendance Day source rows");
  for (const day of attendance) {
    const state = text(day.data.state); const lockedBy = text(day.data.locked_by_payroll);
    if (state === "locked" && lockedBy === payrollName) continue;
    if (!["complete", "approved"].includes(state)) throw errors.validation(`PAYROLL_BLOCKED: Attendance Day ${day.name} is ${state || "invalid"}`);
    commands.push(await command({ tenantId: input.tenantId, actor: systemActor, doctype: ATTENDANCE_DAY, name: day.name, action: "save", expectedVersion: day.version, document: { ...day.data, state: "locked", locked_by_payroll: payrollName }, submittedAt: now, commandId: `alu-payroll:${payrollName}:lock:${day.name}` }));
  }

  const aggregateHash = await sha256Hex({ payroll_entry: payrollName, slips: slipHashes.sort((a, b) => a.name.localeCompare(b.name)) });
  commands.push(await command({ tenantId: input.tenantId, actor: systemActor, doctype: PAYROLL_ENTRY, name: payrollName, action: "submit", expectedVersion: payroll.version, document: { ...payroll.data, alu_state: "pending_approval", alu_input_hash: aggregateHash, alu_approved_by: input.actor.user_id, alu_approved_at: now }, submittedAt: now, commandId: `alu-payroll:${payrollName}:approve` }));

  const receipts = await services.kernel.executeBundle({ commands });
  const payrollReceipt = receipts.at(-1);
  return { replayed: false, payroll_entry: payrollName, state: "approved", employee_count: employees.size, attendance_locked: attendance.length, input_hash: aggregateHash, version: payrollReceipt?.aggregate_version ?? payroll.version + 1 };
}

function assertApprover(actor: Actor): void { const allowed = new Set(["AlumDoor Payroll Approver", "HR Manager", "System Manager", "Administrator"]); if (!actor.roles.some((role) => allowed.has(role)) && actor.user_id !== "Administrator") throw errors.permission("AlumDoor Payroll Approver is required to approve payroll"); }
async function command(input: { commandId: string; tenantId: string; actor: Actor; doctype: string; name: string; action: MutationCommand["action"]; expectedVersion: number | null; document: JsonObject; submittedAt: string; }): Promise<MutationCommand> { const draft: MutationCommand = { schema_version: 1, command_id: input.commandId, tenant_id: input.tenantId, actor: input.actor, aggregate: { doctype: input.doctype, name: input.name }, action: input.action, expected_version: input.expectedVersion, payload_hash: "", document: input.document, submitted_at: input.submittedAt }; draft.payload_hash = await commandPayloadHash(draft as unknown as Record<string, unknown>); return draft; }
function arrayObjects(value: unknown): JsonObject[] { return Array.isArray(value) ? value.filter((row): row is JsonObject => Boolean(row) && typeof row === "object" && !Array.isArray(row)) : []; }
function text(value: unknown): string { return typeof value === "string" ? value.trim() : ""; }
function requiredText(value: unknown, field: string): string { const result = text(value); if (!result) throw errors.validation(`${field} is required`); return result; }
function requiredDate(value: unknown, field: string): string { const result = requiredText(value, field); if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || Number.isNaN(Date.parse(`${result}T00:00:00Z`))) throw errors.validation(`${field} must use YYYY-MM-DD`); return result; }
