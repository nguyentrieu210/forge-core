/** Static, revocable QR tokens for AlumDoor attendance stations. */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export interface AttendanceStationTokenPayload {
  v: 2;
  tenant: string;
  station: string;
  token_version: string;
}

export class AttendanceQrError extends Error {
  constructor(
    readonly code: "QR_INVALID" | "QR_REVOKED" | "QR_STATION_MISMATCH",
    message: string,
  ) {
    super(message);
    this.name = "AttendanceQrError";
  }
}

function assertIdentifier(label: string, value: string): void {
  if (!value || value.length > 160 || /[\u0000-\u001f]/u.test(value)) {
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
  try {
    const base64 = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  } catch {
    throw new AttendanceQrError("QR_INVALID", "Mã QR không đọc được.");
  }
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  if (secret.length < 16 || secret.length > 4_096) {
    throw new AttendanceQrError("QR_INVALID", "Khóa QR của trạm không hợp lệ.");
  }
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function signature(value: string, secret: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(value)));
}

export async function sha256Hex(value: string): Promise<string> {
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
  return [...hash].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function parsePayload(encoded: string): AttendanceStationTokenPayload {
  let value: unknown;
  try {
    value = JSON.parse(decoder.decode(fromBase64Url(encoded)));
  } catch (error) {
    if (error instanceof AttendanceQrError) throw error;
    throw new AttendanceQrError("QR_INVALID", "Nội dung QR không hợp lệ.");
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AttendanceQrError("QR_INVALID", "Nội dung QR không hợp lệ.");
  }
  const payload = value as Record<string, unknown>;
  if (payload.v !== 2 || typeof payload.tenant !== "string" || typeof payload.station !== "string" || typeof payload.token_version !== "string") {
    throw new AttendanceQrError("QR_INVALID", "Nội dung QR thiếu thông tin bắt buộc.");
  }
  return { v: 2, tenant: payload.tenant, station: payload.station, token_version: payload.token_version };
}

/** The token is stable until station.secret_version changes. It contains no employee or location data. */
export async function issueStaticAttendanceStationToken(input: {
  tenant: string;
  station: string;
  tokenVersion: string;
  secret: string;
}): Promise<{ token: string; payload: AttendanceStationTokenPayload }> {
  assertIdentifier("Tenant", input.tenant);
  assertIdentifier("Trạm QR", input.station);
  assertIdentifier("Phiên bản QR", input.tokenVersion);
  const payload: AttendanceStationTokenPayload = {
    v: 2,
    tenant: input.tenant,
    station: input.station,
    token_version: input.tokenVersion,
  };
  const encoded = base64Url(encoder.encode(JSON.stringify(payload)));
  return { token: `${encoded}.${base64Url(await signature(encoded, input.secret))}`, payload };
}

/** Reads routing data only. Callers must still verify the signature before trusting it. */
export function inspectStaticAttendanceStationToken(token: string): AttendanceStationTokenPayload {
  const pieces = token.split(".");
  if (pieces.length !== 2 || !pieces[0] || !pieces[1]) throw new AttendanceQrError("QR_INVALID", "Mã QR không đúng định dạng.");
  return parsePayload(pieces[0]);
}

export async function verifyStaticAttendanceStationToken(input: {
  token: string;
  tenant: string;
  station: string;
  tokenVersion: string;
  secret: string;
}): Promise<{ payload: AttendanceStationTokenPayload; tokenHash: string }> {
  const pieces = input.token.split(".");
  if (pieces.length !== 2 || !pieces[0] || !pieces[1]) throw new AttendanceQrError("QR_INVALID", "Mã QR không đúng định dạng.");
  const [encoded, encodedSignature] = pieces as [string, string];
  const valid = await crypto.subtle.verify("HMAC", await hmacKey(input.secret), fromBase64Url(encodedSignature), encoder.encode(encoded));
  if (!valid) throw new AttendanceQrError("QR_INVALID", "Mã QR không hợp lệ hoặc đã bị thay đổi.");
  const payload = parsePayload(encoded);
  if (payload.tenant !== input.tenant || payload.station !== input.station) {
    throw new AttendanceQrError("QR_STATION_MISMATCH", "Mã QR không thuộc trạm hoặc tenant này.");
  }
  if (payload.token_version !== input.tokenVersion) {
    throw new AttendanceQrError("QR_REVOKED", "Mã QR này đã được thay thế. Hãy quét mã đang dán tại trạm.");
  }
  return { payload, tokenHash: await sha256Hex(input.token) };
}

export function randomCredential(bytes = 32): string {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return base64Url(value);
}
