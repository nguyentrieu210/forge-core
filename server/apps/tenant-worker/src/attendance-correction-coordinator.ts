import type { Actor, JsonObject, MutationCommand } from "../../../packages/contracts/src/index.js";
import { commandPayloadHash, errors } from "../../../packages/core/src/index.js";
import type { DocumentKernel, MutationStore } from "../../../packages/document-kernel/src/index.js";
import { SEGMENT_CODES, type AttendanceSegmentCode } from "../../../apps-src/alumdoor-worker/src/attendance-core.js";

const DAY_DOCTYPE = "AlumDoor Attendance Day";
const REQUEST_DOCTYPE = "Attendance Request";
const INTERNAL_CORRECTION_ROLE = "AlumDoor Attendance System";
const REVIEW_ROLES = new Set(["AlumDoor Attendance Manager", "HR Manager", "System Manager", "Administrator"]);

export interface AlumDoorAttendanceCorrectionInput {
  tenantId: string;
  actor: Actor;
  request: string;
  action: "approve" | "reject";
  note?: string;
}
export interface AttendanceCorrectionServices { kernel: DocumentKernel; store: MutationStore; now?: () => string; }

export async function reviewAlumDoorAttendanceCorrection(
  input: AlumDoorAttendanceCorrectionInput,
  services: AttendanceCorrectionServices,
): Promise<JsonObject> {
  assertReviewer(input.actor);
  const requestName = requiredText(input.request, "Attendance Request");
  const request = await services.store.getDocument<JsonObject>(input.tenantId, REQUEST_DOCTYPE, requestName);
  if (!request || request.docstatus !== 1) throw errors.reference(`Submitted Attendance Request ${requestName} is required`);
  if (text(request.data.request_type) !== "Sửa chấm công" || !text(request.data.alu_segment_code)) {
    throw errors.validation(`Attendance Request ${requestName} is not an AlumDoor correction request`);
  }
  if (text(request.data.alu_reviewed_at)) throw errors.lifecycle(`Attendance Request ${requestName} was already reviewed`);
  const employee = requiredText(request.data.employee, "Attendance Request employee");
  const workDate = requiredDate(request.data.from_date, "Attendance Request date");
  if (requiredDate(request.data.to_date, "Attendance Request to_date") !== workDate) {
    throw errors.validation("AlumDoor correction request must cover exactly one work date");
  }
  const segmentCode = segment(request.data.alu_segment_code);
  const now = services.now?.() ?? new Date().toISOString();
  const note = text(input.note);
  const reviewer: Actor = { ...input.actor, roles: [...new Set([...input.actor.roles, INTERNAL_CORRECTION_ROLE, "HR Manager"])] };

  if (input.action === "reject") {
    const requestDocument = {
      ...request.data,
      alu_review_note: note,
      alu_reviewed_by: input.actor.user_id,
      alu_reviewed_at: now,
    };
    const receipt = await services.kernel.execute(await mutation({
      tenantId: input.tenantId, actor: reviewer, doctype: REQUEST_DOCTYPE, name: requestName,
      action: "save", expectedVersion: request.version, document: requestDocument,
      submittedAt: now, commandId: `alu-attendance-correction:${requestName}:reject`,
    }));
    return { request: requestName, state: "rejected", version: receipt.aggregate_version };
  }

  const days = (await services.store.listDocumentsByDoctype<JsonObject>(input.tenantId, DAY_DOCTYPE))
    .filter((entry) => text(entry.data.employee) === employee && text(entry.data.work_date) === workDate);
  if (days.length !== 1) throw errors.reference(`Exactly one AlumDoor Attendance Day is required for ${employee} / ${workDate}`);
  const day = days[0]!;
  if (text(day.data.state) === "locked" || text(day.data.locked_by_payroll)) {
    throw errors.lifecycle("LOCKED_BY_PAYROLL: Ngày công đã khóa; điều chỉnh phải chuyển sang kỳ sau.");
  }
  const segments = arrayObjects(day.data.segments).map((row) => ({ ...row }));
  const index = segments.findIndex((row) => text(row.segment_code) === segmentCode);
  if (index < 0) throw errors.reference(`Attendance Day ${day.name} does not contain ${segmentCode}`);
  const before = structuredClone(segments[index]!);
  const requestedIn = text(request.data.alu_requested_in);
  const requestedOut = text(request.data.alu_requested_out);
  const correctedIn = requestedIn || text(before.actual_in);
  const correctedOut = requestedOut || text(before.actual_out);
  if (!correctedIn || !correctedOut) throw errors.validation("Phiếu sửa công phải bổ sung đủ giờ vào và giờ ra sau khi áp dụng.");
  if (Date.parse(correctedOut) <= Date.parse(correctedIn)) throw errors.validation("Giờ ra điều chỉnh phải sau giờ vào.");
  segments[index] = { ...before, actual_in: correctedIn, actual_out: correctedOut, state: "corrected" };

  const dayDocument = { ...day.data, segments, corrected_segment_code: segmentCode };
  const preview = { segment_code: segmentCode, actual_in: correctedIn, actual_out: correctedOut };
  const requestDocument = {
    ...request.data,
    alu_before_json: JSON.stringify(before),
    alu_preview_json: JSON.stringify(preview),
    alu_review_note: note,
    alu_reviewed_by: input.actor.user_id,
    alu_reviewed_at: now,
    alu_applied_at: now,
  };
  const commands = await Promise.all([
    mutation({ tenantId: input.tenantId, actor: reviewer, doctype: DAY_DOCTYPE, name: day.name, action: "save", expectedVersion: day.version, document: dayDocument, submittedAt: now, commandId: `alu-attendance-correction:${requestName}:day` }),
    mutation({ tenantId: input.tenantId, actor: reviewer, doctype: REQUEST_DOCTYPE, name: requestName, action: "save", expectedVersion: request.version, document: requestDocument, submittedAt: now, commandId: `alu-attendance-correction:${requestName}:request` }),
  ]);
  const receipts = await services.kernel.executeBundle({ commands });
  return {
    request: requestName,
    state: "applied",
    attendance_day: day.name,
    segment_code: segmentCode,
    day_version: receipts[0]?.aggregate_version ?? day.version + 1,
    request_version: receipts[1]?.aggregate_version ?? request.version + 1,
  };
}

function assertReviewer(actor: Actor): void {
  if (!actor.roles.some((role) => REVIEW_ROLES.has(role)) && actor.user_id !== "Administrator") {
    throw errors.permission("AlumDoor Attendance Manager is required to review attendance corrections");
  }
}
async function mutation(input: { commandId: string; tenantId: string; actor: Actor; doctype: string; name: string; action: MutationCommand["action"]; expectedVersion: number | null; document: JsonObject; submittedAt: string }): Promise<MutationCommand> {
  const draft: MutationCommand = { schema_version: 1, command_id: input.commandId, tenant_id: input.tenantId, actor: input.actor, aggregate: { doctype: input.doctype, name: input.name }, action: input.action, expected_version: input.expectedVersion, payload_hash: "", document: input.document, submitted_at: input.submittedAt };
  draft.payload_hash = await commandPayloadHash(draft as unknown as Record<string, unknown>);
  return draft;
}
function segment(value: unknown): AttendanceSegmentCode { const result = text(value) as AttendanceSegmentCode; if (!SEGMENT_CODES.includes(result)) throw errors.validation("Attendance correction segment is invalid"); return result; }
function arrayObjects(value: unknown): JsonObject[] { return Array.isArray(value) ? value.filter((row): row is JsonObject => Boolean(row) && typeof row === "object" && !Array.isArray(row)) : []; }
function text(value: unknown): string { return typeof value === "string" ? value.trim() : ""; }
function requiredText(value: unknown, field: string): string { const result = text(value); if (!result) throw errors.validation(`${field} is required`); return result; }
function requiredDate(value: unknown, field: string): string { const result = requiredText(value, field); if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || Number.isNaN(Date.parse(`${result}T00:00:00Z`))) throw errors.validation(`${field} must use YYYY-MM-DD`); return result; }
