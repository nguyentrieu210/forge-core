import type { PurchaseFifoEnv } from "./purchase-fifo-receipt.js";

type Json = Record<string, unknown>;
type PlatformCall = (path: string, init?: RequestInit) => Promise<Response>;

const PURCHASE_DOCTYPES = new Set([
  "Supplier Quotation",
  "Purchase Order",
  "Purchase Receipt",
  "Purchase Invoice",
]);

function text(value: unknown): string {
  return String(value ?? "").normalize("NFC").trim();
}

function platformCaller(request: Request, env: PurchaseFifoEnv): PlatformCall {
  const callback = request.headers.get("x-cloudforge-callback")?.replace(/\/$/, "");
  if (!callback) throw new Error("Nền tảng không cấp địa chỉ gọi ngược.");
  const forwarded = {
    authorization: request.headers.get("authorization") ?? "",
    "x-cloudforge-app": request.headers.get("x-cloudforge-app") ?? "",
    "x-cloudforge-identity": request.headers.get("x-cloudforge-identity") ?? "",
    "x-cloudforge-identity-signature": request.headers.get("x-cloudforge-identity-signature") ?? "",
  };
  return (path: string, init: RequestInit = {}) => {
    const outbound = new Request(`${callback}/${path.replace(/^\//, "")}`, {
      ...init,
      headers: { "content-type": "application/json", ...forwarded, ...(init.headers as Record<string, string> | undefined) },
    });
    return env.PLATFORM ? env.PLATFORM.fetch(outbound) : fetch(outbound);
  };
}

async function readDoc(call: PlatformCall, doctype: string, name: string): Promise<Json | null> {
  const response = await call(`resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Không đọc được ${doctype} ${name} (HTTP ${response.status}).`);
  return ((await response.json()) as { data?: Json }).data ?? null;
}

/**
 * When the historical purchase validator stops on aluminum's obsolete static Kg→piece
 * conversion rule, validate the remaining non-aluminum rows separately before allowing the
 * canonical aluminum override. This prevents a mixed document from hiding an error in a later
 * ordinary row merely because the first aluminum row reached the old conversion guard first.
 */
export async function buildResidualPurchaseValidationRequest(
  request: Request,
  env: PurchaseFifoEnv,
): Promise<Request | null> {
  const subject = await request.clone().json().catch(() => null) as {
    doctype?: string;
    name?: string;
    action?: string;
    payload?: Json;
  } | null;
  if (!subject?.doctype || !PURCHASE_DOCTYPES.has(subject.doctype)) return null;

  const call = platformCaller(request, env);
  let document: Json = subject.payload ?? {};
  if (subject.action !== "create" && text(subject.name)) {
    const current = await readDoc(call, subject.doctype, text(subject.name));
    if (current) document = { ...current, ...document };
  }
  const rows = Array.isArray(document.items)
    ? document.items.filter((row): row is Json => Boolean(row) && typeof row === "object" && !Array.isArray(row))
    : [];
  if (!rows.length) return null;

  const codes = [...new Set(rows.map((row) => text(row.item_code)).filter(Boolean))];
  const masters = new Map<string, Json | null>();
  await Promise.all(codes.map(async (code) => masters.set(code, await readDoc(call, "Item", code))));
  const residual = rows.filter((row) => text(masters.get(text(row.item_code))?.inventory_mode) !== "Nhôm cây/lá");
  if (!residual.length) return null;

  const headers = new Headers(request.headers);
  headers.delete("content-length");
  headers.set("content-type", "application/json");
  return new Request(request.url, {
    method: request.method,
    headers,
    body: JSON.stringify({
      ...subject,
      payload: { ...document, items: residual },
    }),
  });
}
