/**
 * Atomic AlumDoor QR attendance transaction.
 *
 * The generic HRM Attendance controller intentionally remains out of this path: it
 * represents exactly one Shift Assignment/IN/OUT pair.  A scan instead appends one
 * immutable standard Employee Checkin and updates AlumDoor's three-segment daily
 * projection in the same kernel bundle.
 */
import type { Actor, JsonObject, MutationCommand } from "../../../packages/contracts/src/index.js";
import { commandPayloadHash, errors, sha256Hex } from "../../../packages/core/src/index.js";
import type { DocumentKernel, MutationStore } from "../../../packages/document-kernel/src/index.js";
import {
  applySegmentScan,
  assertAttendanceWindows,
  AttendanceRuleError,
  asSegmentCode,
  SEGMENT_CODES,
  segmentForServerTime,
  type AttendanceSegmentCode,
  type AttendanceSegmentStatus,
  type AttendanceSegmentWindow,
  type SegmentSnapshot,
} from "../../../apps-src/alumdoor-worker/src/attendance-core.js";

const INTERNAL_SCAN_ROLE = "AlumDoor QR System";
const DAY_DOCTYPE = "AlumDoor Attendance Day";
const CHECKIN_DOCTYPE = "Employee Checkin";

export interface AlumDoorAttendanceScanInput {
  tenantId: string;
  actor: Actor;
  station: string;
  nonceHash: string;
  deviceFingerprintHash?: string;
}

export interface AlumDoorAttendanceScanServices {
  kernel: DocumentKernel;
  store: MutationStore;
  /** Injectable only for deterministic tests. Production uses the core clock. */
  now?: () => string;
}

/**
 * Called exclusively by the per-user attendance coordinator Durable Object.  Neither
 * the browser nor the AlumDoor Worker can name an employee, a time, or a payable
 * quantity: all three are resolved at this trusted boundary.
 */
export async function commitAlumDoorAttendanceScan(
  input: AlumDoorAttendanceScanInput,
  services: AlumDoorAttendanceScanServices,
): Promise<JsonObject> {
  const stationName = requiredText(input.station, "QR station");
  if (!/^[a-f0-9]{64}$/i.test(input.nonceHash)) {
    throw errors.validation("Attendance QR nonce is invalid");
  }
  const now = (services.now?.() ?? new Date().toISOString());
  if (Number.isNaN(Date.parse(now))) throw errors.validation("Attendance scan time is invalid");

  const employee = await resolveEmployeeForActor(services.store, input.tenantId, input.actor);
  const station = await requireRecord(services.store, input.tenantId, "AlumDoor QR Station", stationName);
  if (!truthy(station.is_active)) throw errors.reference(`QR station ${stationName} is inactive`);

  const policyName = requiredText(station.policy, "QR station policy");
  const policy = await requireRecord(services.store, input.tenantId, "AlumDoor Attendance Policy", policyName);
  if (text(policy.policy_status) !== "approved") {
    throw errors.reference(`Attendance policy ${policyName} is not approved`);
  }

  const timezone = requiredText(policy.timezone, "Attendance policy timezone");
  const windows = policyWindows(policy);
  try {
    assertAttendanceWindows(windows);
  } catch (error) {
    if (error instanceof AttendanceRuleError) throw errors.validation(error.message, { code: error.code });
    throw error;
  }
  const currentSegment = segmentForServerTime(now, timezone, windows);
  assertPolicyEffective(policy, currentSegment.workDate);

  const employeeState = await resolveEffectiveEmployeeState(
    services.store,
    input.tenantId,
    employee.name,
    employee.data,
    currentSegment.workDate,
  );
  const company = requiredText(employeeState.company, "Employee company");
  const branch = requiredText(employeeState.branch, "Employee branch");
  if (text(policy.company) !== company) {
    throw errors.reference(`Attendance policy ${policyName} belongs to another company`);
  }
  if (text(policy.branch) && text(policy.branch) !== branch) {
    throw errors.reference(`Attendance policy ${policyName} belongs to another branch`);
  }
  if (text(station.branch) && text(station.branch) !== branch) {
    throw errors.reference(`QR station ${stationName} belongs to another branch`);
  }

  const employeeDigest = (await sha256Hex(employee.name)).slice(0, 20).toUpperCase();
  const dayName = `AAD-${currentSegment.workDate.replaceAll("-", "")}-${employeeDigest}`;
  const externalId = `QR-${await sha256Hex({
    tenant_id: input.tenantId,
    employee: employee.name,
    station: stationName,
    nonce_hash: input.nonceHash.toLowerCase(),
    segment_code: currentSegment.code,
    work_date: currentSegment.workDate,
  })}`.toUpperCase();
  const checkinName = `CHK-QR-${externalId.slice(3)}`;
  const commandPrefix = `attendance-scan:${externalId}`;
  const priorCheckinCreate = await services.store.getReceipt(input.tenantId, `${commandPrefix}:checkin-create`);
  if (priorCheckinCreate) {
    const [priorCheckinSubmit, priorDay] = await Promise.all([
      services.store.getReceipt(input.tenantId, `${commandPrefix}:checkin-submit`),
      services.store.getReceipt(input.tenantId, `${commandPrefix}:day`),
    ]);
    if (!priorCheckinSubmit || !priorDay) {
      throw errors.validation("Attendance QR scan has an incomplete receipt set; it cannot be replayed safely");
    }
    const priorCheckin = await services.store.getDocument<JsonObject>(input.tenantId, CHECKIN_DOCTYPE, checkinName);
    const priorDayName = `AAD-${currentSegment.workDate.replaceAll("-", "")}-${employeeDigest}`;
    return {
      replayed: true,
      checkin: {
        name: checkinName,
        log_type: typeof priorCheckin?.data.log_type === "string" ? priorCheckin.data.log_type : "",
        external_id: externalId,
      },
      day: {
        name: priorDayName,
        work_date: currentSegment.workDate,
        segment_code: currentSegment.code,
        ...(priorDay.result.regular_minutes !== undefined ? { regular_minutes: priorDay.result.regular_minutes } : {}),
        ...(priorDay.result.overtime_minutes !== undefined ? { overtime_minutes: priorDay.result.overtime_minutes } : {}),
      },
    };
  }

  const existingDay = await services.store.getDocument<JsonObject>(input.tenantId, DAY_DOCTYPE, dayName);
  if (existingDay?.data.state === "locked") {
    throw errors.lifecycle("Công ngày đã khóa; hãy lập phiếu điều chỉnh thay vì quét thêm.");
  }
  const segments = hydrateSegments(existingDay?.data.segments);
  const targetIndex = segments.findIndex((segment) => segment.segment_code === currentSegment.code);
  if (targetIndex < 0) throw errors.validation("Attendance day is missing the required shift segment");
  const target = segments[targetIndex]!;
  let scan;
  try {
    scan = applySegmentScan(toSnapshot(target), now);
  } catch (error) {
    if (error instanceof AttendanceRuleError) throw errors.lifecycle(error.message, { code: error.code });
    throw error;
  }
  segments[targetIndex] = {
    ...target,
    state: scan.segment.status,
    ...(scan.segment.actualIn ? { actual_in: scan.segment.actualIn } : {}),
    ...(scan.segment.actualOut ? { actual_out: scan.segment.actualOut } : {}),
    ...(scan.logType === "IN" ? { in_checkin: checkinName } : { out_checkin: checkinName }),
  };

  const scanActor: Actor = {
    ...input.actor,
    roles: [...new Set([...input.actor.roles, INTERNAL_SCAN_ROLE])],
  };
  const checkinDocument: JsonObject = {
    employee: employee.name,
    time: now,
    log_type: scan.logType,
    source: "Device",
    external_id: externalId,
    alu_station: stationName,
    alu_work_date: currentSegment.workDate,
    alu_segment_code: currentSegment.code,
    alu_token_nonce_hash: input.nonceHash.toLowerCase(),
    alu_capture_source: "QR",
    ...(input.deviceFingerprintHash ? { alu_device_fingerprint_hash: input.deviceFingerprintHash } : {}),
  };
  const dayDocument: JsonObject = {
    employee: employee.name,
    company,
    branch,
    department: requiredText(employeeState.department, "Employee department"),
    work_date: currentSegment.workDate,
    policy: policyName,
    state: existingDay?.data.state ?? "open",
    segments,
  };

  const commands = await Promise.all([
    command({
      commandId: `${commandPrefix}:checkin-create`,
      tenantId: input.tenantId,
      actor: scanActor,
      doctype: CHECKIN_DOCTYPE,
      name: checkinName,
      action: "create",
      expectedVersion: null,
      document: checkinDocument,
      submittedAt: now,
    }),
    command({
      commandId: `${commandPrefix}:checkin-submit`,
      tenantId: input.tenantId,
      actor: scanActor,
      doctype: CHECKIN_DOCTYPE,
      name: checkinName,
      action: "submit",
      expectedVersion: 1,
      document: checkinDocument,
      submittedAt: now,
    }),
    command({
      commandId: `${commandPrefix}:day`,
      tenantId: input.tenantId,
      actor: scanActor,
      doctype: DAY_DOCTYPE,
      name: dayName,
      action: existingDay ? "save" : "create",
      expectedVersion: existingDay?.version ?? null,
      document: dayDocument,
      submittedAt: now,
    }),
  ]);

  const receipts = await services.kernel.executeBundle({ commands });
  const dayReceipt = receipts[2]!;
  return {
    replayed: false,
    checkin: {
      name: checkinName,
      log_type: scan.logType,
      external_id: externalId,
    },
    day: {
      name: dayName,
      work_date: currentSegment.workDate,
      segment_code: currentSegment.code,
      ...(dayReceipt.result.regular_minutes !== undefined ? { regular_minutes: dayReceipt.result.regular_minutes } : {}),
      ...(dayReceipt.result.overtime_minutes !== undefined ? { overtime_minutes: dayReceipt.result.overtime_minutes } : {}),
    },
  };
}

async function resolveEmployeeForActor(store: MutationStore, tenantId: string, actor: Actor): Promise<{ name: string; data: JsonObject }> {
  const matches = (await store.listMasterRecordData(tenantId, "Employee"))
    .filter((employee) => text(employee.data.user_id) === actor.user_id);
  if (matches.length !== 1) {
    throw errors.permission(matches.length === 0
      ? "Tài khoản chưa được liên kết với Nhân viên nên không thể chấm công."
      : "Tài khoản liên kết nhiều Nhân viên; hãy nhờ quản trị viên xử lý trước khi chấm công.");
  }
  const employee = matches[0]!;
  if (truthy(employee.data.has_left) || ["Nghỉ việc", "Ngừng sử dụng"].includes(text(employee.data.employee_status))) {
    throw errors.reference(`Employee ${employee.name} is not active`);
  }
  return employee;
}

async function requireRecord(store: MutationStore, tenantId: string, doctype: string, name: string): Promise<JsonObject> {
  const document = await store.getDocument<JsonObject>(tenantId, doctype, name);
  if (document && document.docstatus !== 2) return document.data;
  const master = await store.getMasterRecordData(tenantId, doctype, name);
  if (master) return master;
  throw errors.reference(`${doctype} ${name} does not exist`);
}

async function resolveEffectiveEmployeeState(
  store: MutationStore,
  tenantId: string,
  employeeName: string,
  employee: JsonObject,
  workDate: string,
): Promise<JsonObject> {
  const state: JsonObject = { ...employee };
  const transfers = (await store.listDocumentsByDoctype<JsonObject>(tenantId, "Employee Transfer"))
    .filter((item) => item.docstatus === 1 && text(item.data.employee) === employeeName && text(item.data.effective_date) <= workDate)
    .sort((left, right) => text(left.data.effective_date).localeCompare(text(right.data.effective_date)) || left.name.localeCompare(right.name));
  for (const transfer of transfers) {
    if (text(transfer.data.to_branch)) state.branch = text(transfer.data.to_branch);
    if (text(transfer.data.to_department)) state.department = text(transfer.data.to_department);
  }
  const separations = (await store.listDocumentsByDoctype<JsonObject>(tenantId, "Employee Separation"))
    .filter((item) => item.docstatus === 1 && text(item.data.employee) === employeeName)
    .sort((left, right) => text(left.data.last_working_day).localeCompare(text(right.data.last_working_day)) || left.name.localeCompare(right.name));
  if (separations.some((item) => text(item.data.last_working_day) < workDate)) {
    throw errors.reference(`Employee ${employeeName} separated before ${workDate}`);
  }
  return state;
}

function policyWindows(policy: JsonObject): AttendanceSegmentWindow[] {
  const shift1Start = integer(policy.shift1_start_minute, 420);
  const shift1End = integer(policy.shift1_end_minute, 690);
  const shift2Start = integer(policy.shift2_start_minute, 780);
  const shift2End = integer(policy.shift2_end_minute, 1020);
  const shift3Start = integer(policy.shift3_start_minute, 1050);
  const shift3End = integer(policy.shift3_latest_out_minute, 1439) + 1;
  return [
    { code: "SHIFT1", scanStartMinute: shift1Start - 90, scanEndMinute: shift1End + 59, workStartMinute: shift1Start, workEndMinute: shift1End },
    { code: "SHIFT2", scanStartMinute: shift2Start - 30, scanEndMinute: shift2End + 29, workStartMinute: shift2Start, workEndMinute: shift2End },
    { code: "SHIFT3", scanStartMinute: shift3Start, scanEndMinute: shift3End - 1, workStartMinute: shift3Start, workEndMinute: shift3End },
  ];
}

function assertPolicyEffective(policy: JsonObject, workDate: string): void {
  const from = requiredDate(policy.effective_from, "Attendance policy effective_from");
  const to = text(policy.effective_to);
  if (to) requiredDate(to, "Attendance policy effective_to");
  if (workDate < from || (to && workDate > to)) {
    throw errors.reference("Attendance policy is not effective on this work date");
  }
}

interface PersistedSegment extends JsonObject {
  row_id: string;
  segment_code: AttendanceSegmentCode;
  state: AttendanceSegmentStatus;
  actual_in?: string;
  actual_out?: string;
  in_checkin?: string;
  out_checkin?: string;
}

function hydrateSegments(value: unknown): PersistedSegment[] {
  const byCode = new Map<AttendanceSegmentCode, JsonObject>();
  if (Array.isArray(value)) {
    for (const entry of value) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
      const row = entry as JsonObject;
      const code = asSegmentCode(row.segment_code);
      if (byCode.has(code)) throw errors.validation(`Attendance day has duplicate segment ${code}`);
      byCode.set(code, row);
    }
  }
  return SEGMENT_CODES.map((code) => {
    const row = byCode.get(code);
    const actualIn = text(row?.actual_in);
    const actualOut = text(row?.actual_out);
    return {
      row_id: text(row?.row_id) || code,
      segment_code: code,
      state: persistedStatus(row?.state, actualIn, actualOut),
      ...(actualIn ? { actual_in: actualIn } : {}),
      ...(actualOut ? { actual_out: actualOut } : {}),
      ...(text(row?.in_checkin) ? { in_checkin: text(row?.in_checkin) } : {}),
      ...(text(row?.out_checkin) ? { out_checkin: text(row?.out_checkin) } : {}),
    };
  });
}

function persistedStatus(value: unknown, actualIn: string, actualOut: string): AttendanceSegmentStatus {
  if (!actualIn && !actualOut) return "empty";
  if (actualIn && !actualOut) return "open";
  if (!actualIn || !actualOut) throw errors.validation("Attendance segment cannot contain an OUT without an IN");
  return text(value) === "corrected" ? "corrected" : "complete";
}

function toSnapshot(segment: PersistedSegment): SegmentSnapshot {
  return {
    code: segment.segment_code,
    status: segment.state,
    ...(segment.actual_in ? { actualIn: segment.actual_in } : {}),
    ...(segment.actual_out ? { actualOut: segment.actual_out } : {}),
  };
}

async function command(input: {
  commandId: string;
  tenantId: string;
  actor: Actor;
  doctype: string;
  name: string;
  action: MutationCommand["action"];
  expectedVersion: number | null;
  document: JsonObject;
  submittedAt: string;
}): Promise<MutationCommand> {
  const draft: MutationCommand = {
    schema_version: 1,
    command_id: input.commandId,
    tenant_id: input.tenantId,
    actor: input.actor,
    aggregate: { doctype: input.doctype, name: input.name },
    action: input.action,
    expected_version: input.expectedVersion,
    payload_hash: "",
    document: input.document,
    submitted_at: input.submittedAt,
  };
  draft.payload_hash = await commandPayloadHash(draft as unknown as Record<string, unknown>);
  return draft;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function requiredText(value: unknown, field: string): string {
  const result = text(value);
  if (!result) throw errors.validation(`${field} is required`);
  return result;
}

function requiredDate(value: unknown, field: string): string {
  const result = text(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || Number.isNaN(Date.parse(`${result}T00:00:00Z`))) {
    throw errors.validation(`${field} must use YYYY-MM-DD`);
  }
  return result;
}

function integer(value: unknown, fallback: number): number {
  const parsed = value === undefined || value === null || value === "" ? fallback : Number(value);
  if (!Number.isSafeInteger(parsed)) throw errors.validation("Attendance policy minute value is invalid");
  return parsed;
}

function truthy(value: unknown): boolean {
  return value === true || value === 1 || value === "1";
}
