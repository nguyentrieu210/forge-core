/**
 * AlumDoor QR attendance app methods.
 *
 * This worker is deliberately stateless: it only signs/verifies a short station challenge
 * and then hands the authenticated scan to the tenant's native atomic transaction.  It does
 * not know an employee id, does not write D1, and never returns the QR signing secret.
 */
import {
  AttendanceQrError,
  inspectAttendanceQr,
  issueAttendanceQr,
  verifyAttendanceQr,
} from "./attendance-qr.js";

export type AttendancePlatformCall = (path: string, init?: RequestInit) => Promise<Response>;

export interface AttendanceRouteEnv {
  /** Dedicated HMAC secret. This must not be shared with the platform's internal auth key. */
  ALUMDOOR_ATTENDANCE_QR_SECRET?: string;
}

type Json = Record<string, unknown>;

interface StationDocument extends Json {
  name?: unknown;
  station_code?: unknown;
  station_name?: unknown;
  policy?: unknown;
  secret_version?: unknown;
  is_active?: unknown;
}

interface PolicyDocument extends Json {
  name?: unknown;
  policy_status?: unknown;
  timezone?: unknown;
  qr_ttl_seconds?: unknown;
  effective_from?: unknown;
  effective_to?: unknown;
}

interface QrConfigDocument extends Json {
  station?: unknown;
  policy?: unknown;
}

const json = (value: unknown, status = 200): Response => new Response(JSON.stringify(value), {
  status,
  headers: { "content-type": "application/json" },
});

function fail(code: string, message: string, status = 422): Response {
  return json({ code, message }, status);
}

class AttendanceRouteError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 422,
  ) {
    super(message);
    this.name = "AttendanceRouteError";
  }
}

function nonEmptyText(value: unknown, label: string, max = 160): string {
  if (typeof value !== "string") throw new Error(`${label} là bắt buộc.`);
  const normalized = value.trim();
  if (!normalized || normalized.length > max || /[\u0000-\u001f]/u.test(normalized)) {
    throw new Error(`${label} không hợp lệ.`);
  }
  return normalized;
}

function truthy(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || String(value ?? "").trim().toLowerCase() === "true";
}

function integerInRange(value: unknown, fallback: number, min: number, max: number, label: string): number {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) throw new Error(`${label} không hợp lệ.`);
  return parsed;
}

function isoDateFor(timezone: string, now: Date): string {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const part = (type: string): string => parts.find((entry) => entry.type === type)?.value ?? "";
    const year = part("year");
    const month = part("month");
    const day = part("day");
    if (!/^\d{4}$/u.test(year) || !/^\d{2}$/u.test(month) || !/^\d{2}$/u.test(day)) throw new Error();
    return `${year}-${month}-${day}`;
  } catch {
    throw new Error("Múi giờ trong chính sách chấm công không hợp lệ.");
  }
}

function dateText(value: unknown, label: string): string | null {
  if (value === undefined || value === null || value === "") return null;
  const date = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(date)) throw new Error(`${label} không hợp lệ.`);
  return date;
}

function activeSecret(env: AttendanceRouteEnv): string {
  const secret = env.ALUMDOOR_ATTENDANCE_QR_SECRET?.trim();
  if (!secret) throw new AttendanceRouteError(
    "ATTENDANCE_QR_MISCONFIGURED",
    "Chưa cấu hình khóa QR chấm công của AlumDoor.",
    503,
  );
  return secret;
}

function trustedTenant(request: Request): string {
  const tenant = request.headers.get("x-cloudforge-tenant")?.trim() ?? "";
  if (!tenant || tenant.length > 160 || /[\u0000-\u001f]/u.test(tenant)) {
    throw new AttendanceRouteError("AUTH_REQUIRED", "Không nhận được tenant tin cậy từ nền tảng.", 403);
  }
  return tenant;
}

function jsonObject(value: unknown, label: string): Json {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} trả về dữ liệu không hợp lệ.`);
  return value as Json;
}

async function loadActiveStationPolicy(input: {
  call: AttendancePlatformCall;
  stationCode: string;
  now: Date;
}): Promise<{ station: StationDocument; policy: PolicyDocument; stationCode: string; secretVersion: string; ttlSeconds: number }> {
  // This is a narrow native callback, intentionally not a generic resource read.  Employees
  // can scan a station challenge without gaining browse permission over attendance setup.
  const response = await input.call("method/metaforge.api.get_alumdoor_attendance_qr_config", {
    method: "POST",
    body: JSON.stringify({ station: input.stationCode }),
  });
  if (!response.ok) throw new Error(`Không đọc được cấu hình QR chấm công (HTTP ${response.status}).`);
  const payload = await response.json() as { message?: unknown; data?: unknown };
  const config = jsonObject(payload.message ?? payload.data ?? payload, "Cấu hình QR chấm công") as QrConfigDocument;
  const station = jsonObject(config.station, "Trạm QR") as StationDocument;
  const policy = jsonObject(config.policy, "Chính sách ca") as PolicyDocument;
  const canonicalStation = nonEmptyText(station.station_code ?? station.name ?? input.stationCode, "Trạm QR");
  if (canonicalStation !== input.stationCode) throw new Error("Trạm QR không khớp với cấu hình hiện hành.");
  if (!truthy(station.is_active)) throw new Error("Trạm QR đang ngừng hoạt động.");

  nonEmptyText(station.policy, "Chính sách ca");
  if (String(policy.policy_status ?? "").trim().toLowerCase() !== "approved") {
    throw new Error("Chính sách ca chưa được duyệt hoặc đã ngừng dùng.");
  }

  const timezone = nonEmptyText(policy.timezone ?? "Asia/Ho_Chi_Minh", "Múi giờ", 100);
  const today = isoDateFor(timezone, input.now);
  const effectiveFrom = dateText(policy.effective_from, "Ngày hiệu lực từ");
  const effectiveTo = dateText(policy.effective_to, "Ngày hiệu lực đến");
  if (!effectiveFrom || effectiveFrom > today || (effectiveTo && effectiveTo < today)) {
    throw new Error("Chính sách ca chưa có hiệu lực tại thời điểm này.");
  }

  const secretVersion = nonEmptyText(String(station.secret_version ?? ""), "Phiên bản khóa QR", 64);
  const ttlSeconds = integerInRange(policy.qr_ttl_seconds, 15, 5, 60, "Chu kỳ QR");
  return { station, policy, stationCode: canonicalStation, secretVersion, ttlSeconds };
}

function fingerprint(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const hash = nonEmptyText(value, "Mã nhận diện thiết bị", 64).toLowerCase();
  if (!/^[a-f0-9]{64}$/u.test(hash)) throw new Error("Mã nhận diện thiết bị phải là SHA-256.");
  return hash;
}

function attendanceError(error: unknown): Response {
  if (error instanceof AttendanceQrError) {
    const status = error.code === "QR_EXPIRED" ? 410 : 422;
    return fail(error.code, error.message, status);
  }
  if (error instanceof AttendanceRouteError) return fail(error.code, error.message, error.status);
  const message = error instanceof Error ? error.message : "Không xử lý được QR chấm công.";
  return fail("ATTENDANCE_QR_INVALID", message);
}

/** POST alumdoor.attendance.challenge — issue one deterministic HMAC challenge for this 15s bucket. */
export async function attendanceChallenge(input: {
  request: Request;
  call: AttendancePlatformCall;
  env: AttendanceRouteEnv;
  args: Json;
  now?: Date;
}): Promise<Response> {
  try {
    const tenant = trustedTenant(input.request);
    const stationCode = nonEmptyText(input.args.station, "Trạm QR");
    const now = input.now ?? new Date();
    const station = await loadActiveStationPolicy({ call: input.call, stationCode, now });
    const challenge = await issueAttendanceQr({
      tenant,
      station: station.stationCode,
      secret: activeSecret(input.env),
      secretVersion: station.secretVersion,
      ttlSeconds: station.ttlSeconds,
      now,
    });
    return json({
      station: station.stationCode,
      station_name: typeof station.station.station_name === "string" ? station.station.station_name : station.stationCode,
      token: challenge.token,
      issued_at: new Date(challenge.issuedAt * 1_000).toISOString(),
      expires_at: new Date(challenge.expiresAt * 1_000).toISOString(),
      server_time: now.toISOString(),
      refresh_after_seconds: station.ttlSeconds,
    });
  } catch (error) {
    return attendanceError(error);
  }
}

/** POST alumdoor.attendance.scan — verify one station challenge then delegate the atomic write natively. */
export async function attendanceScan(input: {
  request: Request;
  call: AttendancePlatformCall;
  env: AttendanceRouteEnv;
  args: Json;
  now?: Date;
}): Promise<Response> {
  try {
    const tenant = trustedTenant(input.request);
    const token = nonEmptyText(input.args.token, "Mã QR", 8_192);
    // This only discovers which public station config is needed to verify the signature.
    // No field from this unverified payload is persisted or returned as a scan result.
    const peek = inspectAttendanceQr(token);
    if (peek.tenant !== tenant) return fail("QR_STATION_MISMATCH", "Mã QR không thuộc tenant này.");

    const now = input.now ?? new Date();
    const station = await loadActiveStationPolicy({ call: input.call, stationCode: peek.station, now });
    if (peek.secret_version !== station.secretVersion) {
      return fail("QR_EXPIRED", "Mã QR vừa hết hạn, hướng camera vào mã mới.", 410);
    }
    const verified = await verifyAttendanceQr({
      token,
      tenant,
      station: station.stationCode,
      secret: activeSecret(input.env),
      ttlSeconds: station.ttlSeconds,
      now,
    });
    const deviceFingerprint = fingerprint(input.args.device_fingerprint_hash);
    const response = await input.call("method/metaforge.api.commit_alumdoor_attendance_scan", {
      method: "POST",
      body: JSON.stringify({
        station: station.stationCode,
        nonce_hash: verified.nonceHash,
        ...(deviceFingerprint ? { device_fingerprint_hash: deviceFingerprint } : {}),
      }),
    });
    return response;
  } catch (error) {
    return attendanceError(error);
  }
}
