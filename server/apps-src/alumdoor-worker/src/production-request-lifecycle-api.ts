import { deriveProductionRequestLifecycle } from "./production-request-lifecycle.js";
import type { ProductionPlatformCall } from "./sales-production.js";

type Json = Record<string, unknown>;

/**
 * Permission-preserving read seam for the Production Request operator screen.
 * Every read goes through the existing platform callback using the caller identity.
 */
export async function readProductionRequestLifecycle(
  call: ProductionPlatformCall,
  args: Json,
): Promise<Response> {
  try {
    const name = text(args.production_request);
    if (!name) return answer({ message: "Thiếu production_request." }, 422);

    const requestResponse = await call(`resource/Production%20Request/${encodeURIComponent(name)}`);
    if (!requestResponse.ok) {
      return answer({ message: `Không đọc được Production Request ${name} (HTTP ${requestResponse.status}).` }, requestResponse.status === 404 ? 404 : 422);
    }
    const request = ((await requestResponse.json()) as { data?: Json }).data ?? {};
    request.name = name;

    const query = new URLSearchParams({
      fields: JSON.stringify([
        "name", "production_request", "production_request_line_key", "status", "docstatus",
        "qty", "qty_micros", "produced_qty", "produced_qty_micros",
      ]),
      filters: JSON.stringify([["production_request", "=", name]]),
      limit_page_length: "500",
    });
    const workOrderResponse = await call(`resource/Work%20Order?${query}`);
    if (!workOrderResponse.ok) {
      return answer({ message: `Không đọc được Work Order của ${name} (HTTP ${workOrderResponse.status}).` }, 422);
    }
    const workOrders = ((await workOrderResponse.json()) as { data?: Json[] }).data ?? [];
    return answer({ message: deriveProductionRequestLifecycle(request, workOrders) });
  } catch (error) {
    return answer({ message: error instanceof Error ? error.message : "Không đọc được vòng đời yêu cầu sản xuất." }, 422);
  }
}

function answer(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json", "cache-control": "private, no-store" },
  });
}
function text(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value).normalize("NFC").trim() : "";
}
