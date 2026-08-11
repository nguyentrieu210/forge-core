import type { MutationPlan } from "../../contracts/src/index.js";
import type { ControllerContext } from "../../document-kernel/src/index.js";
import { CutOrderController, type CutOrderData } from "./alumdoor-inventory.js";
import { withReservationLifecycleReader } from "./reservation-lifecycle-reader.js";

/**
 * Preserves the mature Cut Order calculation/ledger implementation while making its existing
 * reservation scan lifecycle-aware. Cancelled source documents cease to reserve ATP without
 * rewriting their immutable reservation audit records.
 */
export class CutOrderReservationIntegrityController extends CutOrderController {
  override async buildPlan(context: ControllerContext<CutOrderData>): Promise<MutationPlan<CutOrderData>> {
    return super.buildPlan(withReservationLifecycleReader(context));
  }
}
