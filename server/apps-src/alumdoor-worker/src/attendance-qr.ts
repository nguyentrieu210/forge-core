/**
 * Stateless, short-lived QR challenges for an AlumDoor attendance station.
 *
 * The QR only proves that a scanner saw the currently active station challenge.  It never
 * names an employee and it never carries a credential that can be reused outside its
 * fifteen-second window.  The scan command still derives the employee from the session.
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const DEFAULT_QR_TTL_SECONDS = 15;

export interface AttendanceQrPayload {
  v: 1;
  tenant: string;
  station: string;
  bucket: number;
  expires_at: number;
  secret_version: string;
}

export class AttendanceQrError extends Error {
  constructor(
    readonly code: "QR_INVALID" | "QR_EXPIRED" | "QR_STATION_MISMATCH",
    message: string,
  ) {
    super(message);
    this.name = "AttendanceQrError";
  }
}

function nowSeconds(now: number | Date): number {
  const milliseconds = typeof now === "number" ? now : now.getTime();
  if (!Number.isFinite(milliseconds)) throw new AttendanceQrError("QR_INVALID", "Thời điểm phát QR không hợp lệ.");
  return Math.floor(milliseconds / 1_000);
}

function assertTtl(ttlSeconds: number): void {
  if (!Number.isInteger(ttlSeconds) || ttlSeconds < 5 || ttlSeconds > 60) {
    throw new AttendanceQrError("QR_INVALID", "Chu kỳ đổi QR phải từ 5 đến 60 giây.");
  }
}

function assertIdentifier(label: string, value: string): void {
  if (!value || value.length > 160 || /[\u0000-\u001f]/.test(value)) {
    throw new AttendanceQrError("QR_INVALID", `${label} không hợp lệ.`);
  }
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function fromBase64Url(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/u.test(value) || value.length > 8_192) {
    throw new AttendanceQrError("QR_INVALID", "Mã QR không đúng định dạng.");
  }
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  try {
    const binary = atob(base64);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    throw new AttendanceQrError("QR_INVALID", "Mã QR không đọc được.");
  }
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  if (secret.length < 16 || secret.length > 4_096) {
    throw new AttendanceQrError("QR_INVALID", "Khóa QR của trạm không hợp lệ.");
  }
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(value: string, secret: string): Promise<Uint8Array> {
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(value));
  return new Uint8Array(signature);
}

async function sha256Hex(value: string): Promise<string> {
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
  return [...hash].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function parsePayload(encoded: string): AttendanceQrPayload {
  let raw: unknown;
  try {
    raw = JSON.parse(decoder.decode(fromBase64Url(encoded))) as unknown;
  } catch (error) {
    if (error instanceof AttendanceQrError) throw error;
    throw new AttendanceQrError("QR_INVALID", "Nội dung QR không hợp lệ.");
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new AttendanceQrError("QR_INVALID", "Nội dung QR không hợp lệ.");
  }
  const value = raw as Record<string, unknown>;
  if (value.v !== 1
    || typeof value.tenant !== "string"
    || typeof value.station !== "string"
    || !Number.isInteger(value.bucket)
    || !Number.isInteger(value.expires_at)
    || typeof value.secret_version !== "string") {
    throw new AttendanceQrError("QR_INVALID", "Nội dung QR thiếu thông tin bắt buộc.");
  }
  return {
    v: 1,
    tenant: value.tenant as string,
    station: value.station as string,
    bucket: value.bucket as number,
    expires_at: value.expires_at as number,
    secret_version: value.secret_version as string,
  };
}

/**
 * Reads the public routing fields from a challenge before it is verified.  A scan endpoint
 * needs the station name to load the current station secret; callers MUST still pass the
 * token to `verifyAttendanceQr` before treating any returned field as trusted.
 */
export function inspectAttendanceQr(token: string): Pick<AttendanceQrPayload, "tenant" | "station" | "secret_version"> {
  const pieces = token.split(".");
  if (pieces.length !== 2 || !pieces[0] || !pieces[1]) {
    throw new AttendanceQrError("QR_INVALID", "Mã QR không đúng định dạng.");
  }
  const payload = parsePayload(pieces[0]);
  return {
    tenant: payload.tenant,
    station: payload.station,
    secret_version: payload.secret_version,
  };
}

/** Creates the identical challenge for every refresh inside the same server time bucket. */
export async function issueAttendanceQr(input: {
  tenant: string;
  station: string;
  secret: string;
  secretVersion: string;
  now?: number | Date;
  ttlSeconds?: number;
}): Promise<{ token: string; payload: AttendanceQrPayload; issuedAt: number; expiresAt: number }> {
  const ttlSeconds = input.ttlSeconds ?? DEFAULT_QR_TTL_SECONDS;
  assertTtl(ttlSeconds);
  assertIdentifier("Tenant", input.tenant);
  assertIdentifier("Trạm QR", input.station);
  assertIdentifier("Phiên bản khóa QR", input.secretVersion);

  const issuedAt = nowSeconds(input.now ?? Date.now());
  const bucket = Math.floor(issuedAt / ttlSeconds);
  const expiresAt = (bucket + 1) * ttlSeconds;
  const payload: AttendanceQrPayload = {
    v: 1,
    tenant: input.tenant,
    station: input.station,
    bucket,
    expires_at: expiresAt,
    secret_version: input.secretVersion,
  };
  const encodedPayload = base64Url(encoder.encode(JSON.stringify(payload)));
  const encodedSignature = base64Url(await sign(encodedPayload, input.secret));
  return { token: `${encodedPayload}.${encodedSignature}`, payload, issuedAt, expiresAt };
}

/**
 * Checks a scan without trusting any timestamp from the phone.  The immediately preceding
 * bucket is accepted only if its actual expiry time has not passed, which handles a camera
 * reading a code during a refresh boundary without opening a longer replay window.
 */
export async function verifyAttendanceQr(input: {
  token: string;
  tenant: string;
  station: string;
  secret: string;
  now?: number | Date;
  ttlSeconds?: number;
}): Promise<{ payload: AttendanceQrPayload; nonceHash: string }> {
  const ttlSeconds = input.ttlSeconds ?? DEFAULT_QR_TTL_SECONDS;
  assertTtl(ttlSeconds);
  assertIdentifier("Tenant", input.tenant);
  assertIdentifier("Trạm QR", input.station);

  const pieces = input.token.split(".");
  if (pieces.length !== 2 || !pieces[0] || !pieces[1]) {
    throw new AttendanceQrError("QR_INVALID", "Mã QR không đúng định dạng.");
  }
  const [encodedPayload, encodedSignature] = pieces as [string, string];
  const signature = fromBase64Url(encodedSignature);
  const validSignature = await crypto.subtle.verify(
    "HMAC",
    await hmacKey(input.secret),
    signature,
    encoder.encode(encodedPayload),
  );
  if (!validSignature) throw new AttendanceQrError("QR_INVALID", "Mã QR không hợp lệ hoặc đã bị thay đổi.");

  const payload = parsePayload(encodedPayload);
  if (payload.tenant !== input.tenant || payload.station !== input.station) {
    throw new AttendanceQrError("QR_STATION_MISMATCH", "Mã QR không thuộc trạm chấm công này.");
  }

  const currentSecond = nowSeconds(input.now ?? Date.now());
  const currentBucket = Math.floor(currentSecond / ttlSeconds);
  const expectedExpiry = (payload.bucket + 1) * ttlSeconds;
  if (payload.expires_at !== expectedExpiry || payload.bucket < currentBucket - 1 || payload.bucket > currentBucket) {
    throw new AttendanceQrError("QR_EXPIRED", "Mã QR vừa hết hạn, hướng camera vào mã mới.");
  }
  if (currentSecond >= payload.expires_at) {
    throw new AttendanceQrError("QR_EXPIRED", "Mã QR vừa hết hạn, hướng camera vào mã mới.");
  }

  return { payload, nonceHash: await sha256Hex(input.token) };
}

/** Stable idempotency input: a repeated scan of the same employee/QR/segment is one event. */
export async function attendanceScanExternalId(input: {
  tenant: string;
  employee: string;
  station: string;
  nonceHash: string;
  segment: string;
}): Promise<string> {
  for (const [label, value] of Object.entries(input)) assertIdentifier(label, value);
  return `QR-${await sha256Hex([input.tenant, input.employee, input.station, input.nonceHash, input.segment].join("\n"))}`;
}
