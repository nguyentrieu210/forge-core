import type { JsonObject, MutationPlan } from "../../contracts/src/index.js";
import { errors } from "../../core/src/index.js";
import type { ControllerContext, DocumentController } from "../../document-kernel/src/index.js";
import { reverseGl, reverseStock } from "../../ledger/src/index.js";
import {
  RolloutPurchaseReceiptController,
  type PurchaseReceiptData,
} from "../../clouderp-core/src/index.js";
import {
  DeliveryNoteController,
  type DeliveryNoteData,
} from "../../clouderp-selling/src/index.js";
import { requireLeafWarehouse } from "../../clouderp-stock/src/index.js";

type WarehouseLine = JsonObject & { warehouse?: string };
type WarehouseScopedDocument = JsonObject & {
  company?: string;
  items?: WarehouseLine[];
};

/**
 * Canonical guard for stock documents whose posting warehouse is carried on item rows.
 *
 * Historical documents may point to warehouses that are now disabled/grouped, therefore
 * this guard deliberately runs only on submit. Cancel must remain able to reverse the
 * exact historical posting through the ledger even after master-data lifecycle changes.
 */
export async function assertPostingWarehouses(
  context: ControllerContext<JsonObject>,
  document: WarehouseScopedDocument,
): Promise<void> {
  const company = text(document.company);
  if (!company || !Array.isArray(document.items)) return;

  const checked = new Set<string>();
  for (const row of document.items) {
    const warehouse = text(row.warehouse);
    if (!warehouse || checked.has(warehouse)) continue;
    checked.add(warehouse);
    await requireLeafWarehouse(context, warehouse, company);
  }
}

abstract class WarehouseScopedController<T extends WarehouseScopedDocument>
implements DocumentController<T> {
  abstract readonly doctype: string;
  protected abstract readonly delegate: DocumentController<T>;

  async buildPlan(context: ControllerContext<T>): Promise<MutationPlan<T>> {
    if (context.command.action === "submit") {
      await assertPostingWarehouses(
        context as unknown as ControllerContext<JsonObject>,
        context.command.document,
      );
    }
    return this.delegate.buildPlan(context);
  }
}

/**
 * Overrides the O2C Delivery Note controller at the ERPNext registry layer so every
 * outward delivery shares the same company/leaf warehouse boundary as Stock Entry,
 * Stock Return and Stock Reconciliation.
 */
export class WarehouseScopedDeliveryNoteController
extends WarehouseScopedController<DeliveryNoteData> {
  readonly doctype = "Delivery Note";
  protected readonly delegate = new DeliveryNoteController();
}

/**
 * Replaces only the physical/accounting reversal portion of a Purchase Receipt cancel plan.
 * Procurement/allocation extensions produced by the rollout-aware delegate stay untouched.
 */
export async function exactPurchaseReceiptCancellationPlan(
  context: ControllerContext<PurchaseReceiptData>,
  plan: MutationPlan<PurchaseReceiptData>,
): Promise<MutationPlan<PurchaseReceiptData>> {
  if (!context.existing) throw errors.notFound();
  const revision = context.existing.version;
  const [stock, gl] = await Promise.all([
    context.reader.getVoucherStockEntries(
      context.command.tenant_id,
      "Purchase Receipt",
      context.command.aggregate.name,
      revision,
    ),
    context.reader.getVoucherGlEntries(
      context.command.tenant_id,
      "Purchase Receipt",
      context.command.aggregate.name,
      revision,
    ),
  ]);
  if (stock.length === 0) {
    throw errors.reference(`Original stock posting for Purchase Receipt ${context.command.aggregate.name} was not found`);
  }
  return {
    ...plan,
    stock_entries: reverseStock(stock),
    gl_entries: reverseGl(gl),
  };
}

/**
 * Wraps the rollout-aware Purchase Receipt controller rather than bypassing it, so the
 * purchase-allocation rollout switch remains intact while warehouse posting is hardened.
 *
 * Cancellation lets the delegate build procurement/allocation reversal facts, then replaces
 * reconstructed Stock/GL rows with the exact rows from the submitted revision. That keeps
 * allocation v1 behavior while making quantity/value/account reversal audit-exact.
 */
export class WarehouseScopedPurchaseReceiptController
extends WarehouseScopedController<PurchaseReceiptData> {
  readonly doctype = "Purchase Receipt";
  protected readonly delegate = new RolloutPurchaseReceiptController();

  override async buildPlan(context: ControllerContext<PurchaseReceiptData>): Promise<MutationPlan<PurchaseReceiptData>> {
    if (context.command.action === "submit") {
      await assertPostingWarehouses(
        context as unknown as ControllerContext<JsonObject>,
        context.command.document,
      );
      return this.delegate.buildPlan(context);
    }
    if (context.command.action !== "cancel") return this.delegate.buildPlan(context);
    const plan = await this.delegate.buildPlan(context);
    return exactPurchaseReceiptCancellationPlan(context, plan);
  }
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
