/**
 * Nguyên thuỷ mã hoá dùng chung: HMAC và phong bì AES-GCM.
 *
 * Trước đây chúng nằm trong `packages/social-commerce`, nhưng chẳng có gì thuộc về social
 * commerce cả — control-plane dùng chúng cho luồng đăng ký, và bất kỳ ai cần cất một bí mật
 * vào D1 cũng cần đúng cặp hàm này. Đặt ở đó khiến một gói nghiệp vụ trở thành thứ không gỡ
 * được. Chuyển về `core` khi bóc bản lõi.
 *
 * `sha256Hex` và `timingSafeEqualString` đã có sẵn ở `hash.ts` — dùng bản đó, đừng viết lại.
 */

export interface EncryptedCredential {
  version: 1;
  algorithm: "AES-GCM";
  iv: string;
  ciphertext: string;
}

export async function hmacHex(secret: string, value: string): Promise<string> {
  if (!secret) throw new Error("HMAC secret is required");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Khoá mã hoá (KEK) phải giải base64 ra đúng 32 byte. Sai độ dài thì ném ngay lúc gọi, chứ
 * không để AES tự xoay xở rồi sinh ra bản mã không giải lại được.
 *
 * `aad` (additional authenticated data) buộc bản mã vào đúng ngữ cảnh của nó — đổi ngữ cảnh
 * là giải thất bại, kể cả khi kẻ tấn công bê nguyên bản mã sang chỗ khác.
 */
export async function encryptCredential(value: string, kekBase64: string, aad: string): Promise<string> {
  if (!value) throw new Error("Credential is empty");
  const keyBytes = decodeBase64(kekBase64);
  if (keyBytes.byteLength !== 32) throw new Error("Credential KEK must decode to 32 bytes");
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: new TextEncoder().encode(aad) },
    key,
    new TextEncoder().encode(value),
  );
  return JSON.stringify({
    version: 1,
    algorithm: "AES-GCM",
    iv: encodeBase64(iv),
    ciphertext: encodeBase64(new Uint8Array(encrypted)),
  } satisfies EncryptedCredential);
}

export async function decryptCredential(envelopeJson: string, kekBase64: string, aad: string): Promise<string> {
  const envelope = JSON.parse(envelopeJson) as Partial<EncryptedCredential>;
  if (envelope.version !== 1 || envelope.algorithm !== "AES-GCM" || !envelope.iv || !envelope.ciphertext) {
    throw new Error("Invalid credential envelope");
  }
  const keyBytes = decodeBase64(kekBase64);
  if (keyBytes.byteLength !== 32) throw new Error("Credential KEK must decode to 32 bytes");
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["decrypt"]);
  const clear = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: decodeBase64(envelope.iv), additionalData: new TextEncoder().encode(aad) },
    key,
    decodeBase64(envelope.ciphertext),
  );
  return new TextDecoder().decode(clear);
}

function encodeBase64(value: Uint8Array): string {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}
