/**
 * Pure AlumDoor attendance rules.
 *
 * This module deliberately knows nothing about a browser, D1, or document writes.  The
 * transaction command supplies the real server timestamp and persists the result; keeping
 * this calculation pure makes every edge of the three-shift policy directly testable.
 */

export const ATTENDANCE_TIMEZONE = "Asia/Ho_Chi_Minh";

export const SEGMENT_CODES = ["SHIFT1", "SHIFT2", "SHIFT3"] as const;
export type AttendanceSegmentCode = typeof SEGMENT_CODES[number];

export type AttendanceSegmentStatus = "empty" | "open" | "complete" | "missing_in" | "missing_out" | "corrected";
export type AttendanceState = "open" | "complete" | "exception";

export interface AttendanceSegmentWindow {
  code: AttendanceSegmentCode;
  /** Inclusive, measured from 00:00 in the configured timezone. */
  scanStartMinute: number;
  /** Inclusive, measured from 00:00 in the configured timezone. */
  scanEndMinute: number;
  /** Inclusive work-time boundary. */
  workStartMinute: number;
  /** Exclusive work-time boundary. 1440 is midnight at the end of the work date. */
  workEndMinute: number;
}

/**
 * The policy approved for the first AlumDoor slice.  These values become tenant Policy
 * documents later; this constant is only the explicit default used to validate a fresh
 * policy and test its calculation.
 */
export const DEFAULT_ATTENDANCE_WINDOWS: readonly AttendanceSegmentWindow[] = [
  { code: "SHIFT1", scanStartMinute: 5 * 60 + 30, scanEndMinute: 12 * 60 + 29, workStartMinute: 7 * 60, workEndMinute: 11 * 60 + 30 },
  { code: "SHIFT2", scanStartMinute: 12 * 60 + 30, scanEndMinute: 17 * 60 + 29, workStartMinute: 13 * 60, workEndMinute: 17 * 60 },
  { code: "SHIFT3", scanStartMinute: 17 * 60 + 30, scanEndMinute: 23 * 60 + 59, workStartMinute: 17 * 60 + 30, workEndMinute: 24 * 60 },
];

export interface SegmentSnapshot {
  code: AttendanceSegmentCode;
  status: AttendanceSegmentStatus;
  actualIn?: string;
  actualOut?: string;
}

export interface CalculatedSegment extends SegmentSnapshot {
  actualMinutes: number;
  regularMinutes: number;
  overtimeMinutes: number;
}

export interface AttendanceCalculation {
  workDate: string;
  state: AttendanceState;
  exceptionCode: "MISSING_IN" | "MISSING_OUT" | null;
  regularMinutes: number;
  overtimeMinutes: number;
  payableWorkFractionBp: number;
  segments: CalculatedSegment[];
}

export class AttendanceRuleError extends Error {
  constructor(
    readonly code: "ATTENDANCE_OUTSIDE_WINDOW" | "ATTENDANCE_SEGMENT_COMPLETE" | "CROSS_DAY" | "INVALID_SEGMENT_PAIR",
    message: string,
  ) {
    super(message);
    this.name = "AttendanceRuleError";
  }
}

interface LocalTime {
  date: string;
  secondsOfDay: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string): Intl.DateTimeFormat {
  const found = formatters.get(timeZone);
  if (found) return found;
  const created = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  formatters.set(timeZone, created);
  return created;
}

function asInstant(value: string | Date): Date {
  const instant = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(instant.getTime())) throw new AttendanceRuleError("INVALID_SEGMENT_PAIR", "Thời điểm chấm công không hợp lệ.");
  return instant;
}

function localTime(value: string | Date, timeZone: string): LocalTime {
  const parts = formatter(timeZone).formatToParts(asInstant(value));
  const read = (name: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((item) => item.type === name)?.value;
    const parsed = Number(part);
    if (!Number.isInteger(parsed)) throw new AttendanceRuleError("INVALID_SEGMENT_PAIR", "Không đọc được giờ chấm công theo múi giờ chính sách.");
    return parsed;
  };
  const year = read("year");
  const month = read("month");
  const day = read("day");
  const hour = read("hour");
  const minute = read("minute");
  const second = read("second");
  return {
    date: `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    secondsOfDay: hour * 3600 + minute * 60 + second,
  };
}

function windowFor(code: AttendanceSegmentCode, windows: readonly AttendanceSegmentWindow[]): AttendanceSegmentWindow {
  const found = windows.find((candidate) => candidate.code === code);
  if (!found) throw new AttendanceRuleError("INVALID_SEGMENT_PAIR", `Thiếu cấu hình ${code}.`);
  return found;
}

function isSegmentCode(value: string): value is AttendanceSegmentCode {
  return (SEGMENT_CODES as readonly string[]).includes(value);
}

function overlapWholeMinutes(fromSeconds: number, toSeconds: number, startMinute: number, endMinute: number): number {
  const start = Math.max(fromSeconds, startMinute * 60);
  const end = Math.min(toSeconds, endMinute * 60);
  return Math.max(0, Math.floor((end - start) / 60));
}

function roundHalfUp(numerator: number, denominator: number): number {
  return Math.floor((numerator * 2 + denominator) / (denominator * 2));
}

/** Returns the policy segment that may be scanned at this server timestamp. */
export function segmentForServerTime(
  serverTime: string | Date,
  timeZone = ATTENDANCE_TIMEZONE,
  windows = DEFAULT_ATTENDANCE_WINDOWS,
): { code: AttendanceSegmentCode; workDate: string } {
  const local = localTime(serverTime, timeZone);
  const match = windows.find((candidate) =>
    local.secondsOfDay >= candidate.scanStartMinute * 60
    && local.secondsOfDay <= candidate.scanEndMinute * 60 + 59);
  if (!match) {
    throw new AttendanceRuleError("ATTENDANCE_OUTSIDE_WINDOW", "Hiện không nằm trong giờ quét của ca.");
  }
  return { code: match.code, workDate: local.date };
}

/**
 * A segment alternates independently.  An unfinished Ca 1 can never make the first scan
 * of Ca 2 look like an OUT; that is the important distinction from a whole-day toggle.
 */
export function nextSegmentLogType(segment: Pick<SegmentSnapshot, "status">): "IN" | "OUT" {
  if (segment.status === "empty") return "IN";
  if (segment.status === "open") return "OUT";
  throw new AttendanceRuleError("ATTENDANCE_SEGMENT_COMPLETE", "Ca này đã chấm đủ; hãy gửi yêu cầu sửa nếu cần.");
}

export function applySegmentScan(
  segment: SegmentSnapshot,
  serverTime: string | Date,
): { logType: "IN" | "OUT"; segment: SegmentSnapshot } {
  const logType = nextSegmentLogType(segment);
  const at = asInstant(serverTime).toISOString();
  if (logType === "IN") {
    const { actualOut: _discardedOut, ...withoutOut } = segment;
    return { logType, segment: { ...withoutOut, status: "open", actualIn: at } };
  }
  return { logType, segment: { ...segment, status: "complete", actualOut: at } };
}

/**
 * Recomputes the day from the evidence rows.  No duration comes from the client and no
 * incomplete pair is paid.  The caller persists this result atomically with the check-in.
 */
export function calculateAttendance(input: {
  workDate: string;
  segments: readonly SegmentSnapshot[];
  timeZone?: string;
  windows?: readonly AttendanceSegmentWindow[];
  /** Number of regular minutes that make up one full AlumDoor work day. */
  regularDailyCapMinutes?: number;
}): AttendanceCalculation {
  const timeZone = input.timeZone ?? ATTENDANCE_TIMEZONE;
  const windows = input.windows ?? DEFAULT_ATTENDANCE_WINDOWS;
  const regularDailyCapMinutes = input.regularDailyCapMinutes ?? 480;
  if (!Number.isInteger(regularDailyCapMinutes) || regularDailyCapMinutes <= 0 || regularDailyCapMinutes > 24 * 60) {
    throw new AttendanceRuleError("INVALID_SEGMENT_PAIR", "Giới hạn phút công thường trong ngày không hợp lệ.");
  }
  const byCode = new Map(input.segments.map((segment) => [segment.code, segment]));
  const calculated: CalculatedSegment[] = [];

  for (const code of SEGMENT_CODES) {
    const raw = byCode.get(code) ?? { code, status: "empty" as const };
    const window = windowFor(code, windows);
    let actualMinutes = 0;

    if (raw.actualIn || raw.actualOut) {
      if (!raw.actualIn || !raw.actualOut) {
        calculated.push({ ...raw, actualMinutes: 0, regularMinutes: 0, overtimeMinutes: 0 });
        continue;
      }
      const inLocal = localTime(raw.actualIn, timeZone);
      const outLocal = localTime(raw.actualOut, timeZone);
      if (inLocal.date !== input.workDate || outLocal.date !== input.workDate) {
        throw new AttendanceRuleError("CROSS_DAY", "Chấm công qua ngày phải xử lý bằng phiếu điều chỉnh.");
      }
      if (outLocal.secondsOfDay <= inLocal.secondsOfDay) {
        throw new AttendanceRuleError("INVALID_SEGMENT_PAIR", "Giờ ra phải sau giờ vào trong cùng một ngày.");
      }
      actualMinutes = overlapWholeMinutes(
        inLocal.secondsOfDay,
        outLocal.secondsOfDay,
        window.workStartMinute,
        window.workEndMinute,
      );
    }
    calculated.push({ ...raw, actualMinutes, regularMinutes: 0, overtimeMinutes: 0 });
  }

  let remainingRegularMinutes = regularDailyCapMinutes;
  for (const segment of calculated) {
    if (segment.code === "SHIFT3") {
      segment.overtimeMinutes = segment.actualMinutes;
      continue;
    }
    segment.regularMinutes = Math.min(segment.actualMinutes, remainingRegularMinutes);
    segment.overtimeMinutes = segment.actualMinutes - segment.regularMinutes;
    remainingRegularMinutes -= segment.regularMinutes;
  }

  const regularMinutes = calculated.reduce((total, segment) => total + segment.regularMinutes, 0);
  const overtimeMinutes = calculated.reduce((total, segment) => total + segment.overtimeMinutes, 0);
  const exceptionCode = calculated.some((segment) => segment.status === "missing_in")
    ? "MISSING_IN"
    : calculated.some((segment) => segment.status === "missing_out" || segment.status === "open")
      ? "MISSING_OUT"
      : null;
  const hasCompletedSegment = calculated.some((segment) => segment.status === "complete" || segment.status === "corrected");
  const state: AttendanceState = exceptionCode ? "exception" : hasCompletedSegment ? "complete" : "open";

  return {
    workDate: input.workDate,
    state,
    exceptionCode,
    regularMinutes,
    overtimeMinutes,
    payableWorkFractionBp: Math.min(10_000, roundHalfUp(regularMinutes * 10_000, regularDailyCapMinutes)),
    segments: calculated,
  };
}

/** Verifies custom policy data before it becomes an approved version. */
export function assertAttendanceWindows(windows: readonly AttendanceSegmentWindow[]): void {
  if (windows.length !== SEGMENT_CODES.length) {
    throw new AttendanceRuleError("INVALID_SEGMENT_PAIR", "Chính sách phải có đúng ba ca.");
  }
  for (const code of SEGMENT_CODES) {
    const segment = windowFor(code, windows);
    const values = [segment.scanStartMinute, segment.scanEndMinute, segment.workStartMinute, segment.workEndMinute];
    if (values.some((value) => !Number.isInteger(value))
      || segment.scanStartMinute < 0
      || segment.scanEndMinute >= 24 * 60
      || segment.workStartMinute < 0
      || segment.workEndMinute > 24 * 60
      || segment.scanEndMinute < segment.scanStartMinute
      || segment.workEndMinute <= segment.workStartMinute) {
      throw new AttendanceRuleError("INVALID_SEGMENT_PAIR", `Cấu hình ${code} không hợp lệ.`);
    }
  }
}

/** Parses persisted segment code defensively at the application boundary. */
export function asSegmentCode(value: unknown): AttendanceSegmentCode {
  const code = String(value ?? "").trim();
  if (!isSegmentCode(code)) throw new AttendanceRuleError("INVALID_SEGMENT_PAIR", "Mã ca không hợp lệ.");
  return code;
}
