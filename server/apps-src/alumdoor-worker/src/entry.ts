import baseWorker from "./index.js";
import { validateItemCatalogInvariants } from "./item-catalog-invariants.js";
import {
  handleTrackedPurchaseFifoRequest,
  validateAluminumPurchaseHook,
} from "./aluminum-purchase-closure.js";
import {
  handleAluminumSalesPlan,
  handleMaterialRequestFromAluminumShortage,
  handleReserveAluminumForSales,
} from "./aluminum-supply-demand.js";
import { handlePurchaseSupplierDashboard } from "./purchase-supplier-dashboard.js";
import { handlePurchaseSupplierSettlement } from "./purchase-supplier-settlement.js";

type WorkerEnv = Parameters<typeof baseWorker.fetch>[1];
type WorkerContext = Parameters<typeof baseWorker.fetch>[2];

const PURCHASE_VALIDATION_DOCTYPES = new Set([
  "Material Request",
  "Supplier Quotation",
  "Purchase Order",
  "Purchase Receipt",
  "Purchase Invoice",
]);

/**
 * Entrypoint triển khai của Alumdoor.
 *
 * Aluminum inventory is now converged at this boundary:
 * - FIFO purchase orchestration prepares Batch + submitted Inward bundles before Receipt submit;
 * - Purchase Receipt events never maintain legacy `Aluminium Lot.sheet_count`;
 * - Item/purchase validation understands the exact dual-measure contract instead of static Kg↔Cây factors;
 * - Sales/Work Order ATP, reservation and shortage Material Request read canonical Batch Stock Ledger positions.
 *
 * Canonical document/Stock/Manufacturing/Finance controllers still own posting. This worker only composes them.
 */
export default {
  async fetch(request: Request, env: WorkerEnv, ctx: WorkerContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/method/")) {
      const method = decodeURIComponent(url.pathname.slice("/api/method/".length));
      if (method === "alumdoor.purchase.supplier_delivery_dashboard") {
        return handlePurchaseSupplierDashboard(request, env);
      }
      if (method === "alumdoor.purchase.supplier_delivery_settlement") {
        return handlePurchaseSupplierSettlement(request, env);
      }
      if (method === "alumdoor.purchase.preview_fifo_receipt") {
        return handleTrackedPurchaseFifoRequest(request, env, false, false);
      }
      if (method === "alumdoor.purchase.fifo_receipt") {
        return handleTrackedPurchaseFifoRequest(request, env, true, false);
      }
      if (method === "alumdoor.purchase.preview_bulk_fifo_receipt") {
        return handleTrackedPurchaseFifoRequest(request, env, false, true);
      }
      if (method === "alumdoor.purchase.bulk_fifo_receipt") {
        return handleTrackedPurchaseFifoRequest(request, env, true, true);
      }
      if (method === "alumdoor.inventory.plan_sales_order") {
        return handleAluminumSalesPlan(request, env);
      }
      if (method === "alumdoor.inventory.reserve_sales_order") {
        return handleReserveAluminumForSales(request, env);
      }
      if (method === "alumdoor.inventory.material_request_from_shortage") {
        return handleMaterialRequestFromAluminumShortage(request, env);
      }
    }

    if (url.pathname === "/hooks/event" && request.method === "POST") {
      const event = await request.clone().json().catch(() => null) as { event_type?: string } | null;
      const type = String(event?.event_type ?? "");
      if (type.startsWith("purchase_receipt.")) {
        // P0 convergence boundary. The historical base worker calls syncLotsFromReceipt(), which
        // writes `Aluminium Lot.sheet_count`. That would recreate the second stock ledger after
        // canonical Purchase Receipt already wrote Batch Stock Ledger. Tracked receipt support
        // documents are created before submit, so no post-commit lot mutation is required.
        return Response.json({
          ok: true,
          skipped_legacy_aluminium_lot_sync: true,
          authority: "Batch + Stock Ledger",
          event_type: type,
        });
      }
      return baseWorker.fetch(request, env, ctx);
    }

    if (url.pathname !== "/hooks/validate" || request.method !== "POST") {
      return baseWorker.fetch(request, env, ctx);
    }

    const body = await request.clone().json().catch(() => null) as { doctype?: string } | null;
    if (body?.doctype === "Item") {
      const invariantResponse = await validateItemCatalogInvariants(request.clone(), env);
      if (!invariantResponse.ok) return invariantResponse;
      const marker = await invariantResponse.clone().json().catch(() => ({})) as { aluminum_contract?: boolean };
      if (marker.aluminum_contract) {
        // The historical Item validator requires a static conversion whenever purchase UOM differs
        // from stock UOM. Canonical catch-weight aluminum intentionally has no static Kg→piece factor;
        // exact qty_bar drives the per-line factor in clouderp-core/uom.ts.
        return invariantResponse;
      }
      const baseResponse = await baseWorker.fetch(request, env, ctx);
      if (!baseResponse.ok && baseResponse.status !== 422) return baseResponse;
      return baseResponse;
    }

    if (body?.doctype && PURCHASE_VALIDATION_DOCTYPES.has(body.doctype)) {
      const aluminum = await validateAluminumPurchaseHook(request.clone(), env);
      if (aluminum) return aluminum;
    }

    return baseWorker.fetch(request, env, ctx);
  },
};
