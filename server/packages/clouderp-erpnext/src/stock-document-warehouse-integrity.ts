import type { JsonObject, MutationPlan } from "../../contracts/src/index.js";
import type { ControllerContext, DocumentController } from "../../document-kernel/src/index.js";
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
 * Wraps the rollout-aware Purchase Receipt controller rather than bypassing it, so the
 * purchase-allocation rollout switch remains intact while warehouse posting is hardened.
 */
export class WarehouseScopedPurchaseReceiptController
extends WarehouseScopedController<PurchaseReceiptData> {
  readonly doctype = "Purchase Receipt";
  protected readonly delegate = new RolloutPurchaseReceiptController();
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
