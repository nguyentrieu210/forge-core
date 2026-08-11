import { CutOrderController } from "./alumdoor-inventory.js";
import { withReservationLifecycleReader } from "./reservation-lifecycle-reader.js";

type CutOrderContext = Parameters<CutOrderController["buildPlan"]>[0];

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Preserves the mature Cut Order calculation/ledger implementation while making its existing
 * reservation scan lifecycle-aware. Cancelled source documents cease to reserve ATP without
 * rewriting their immutable reservation audit records, while the Cut Order may consume the
 * promise owned by its own Production Order / Sales reference.
 */
export class CutOrderReservationIntegrityController extends CutOrderController {
  override buildPlan(context: CutOrderContext) {
    const document = context.command.action === "cancel" ? context.existing?.data : context.command.document;
    const ownSources = [
      context.command.aggregate.name,
      text(document?.production_order),
      text(document?.so_reference),
    ];
    return super.buildPlan(withReservationLifecycleReader(context, ownSources));
  }
}
