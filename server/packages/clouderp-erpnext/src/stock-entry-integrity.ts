import type { JsonObject, MutationPlan } from "../../contracts/src/index.js";
import type { StockEntryData } from "../../clouderp-core/src/types.js";
import { requireLeafWarehouse } from "../../clouderp-stock/src/index.js";
import type { ControllerContext } from "../../document-kernel/src/index.js";
import { RolloutManufacturingStockEntryController } from "./manufacturing-rollout.js";
import { assertStockPlanRespectsReservations } from "./outbound-reservation-guard.js";

function text(value: unknown): string {
  return String(value ?? "").normalize("NFC").trim();
}

async function assertWarehouseScope(context: ControllerContext<StockEntryData>): Promise<void> {
  if (context.command.action !== "submit") return;
  const document = context.command.document;
  const company = text(document.company);
  if (!company) return;

  const names = new Set<string>();
  for (const row of Array.isArray(document.items) ? document.items : []) {
    if (row.source_warehouse) names.add(text(row.source_warehouse));
    if (row.target_warehouse) names.add(text(row.target_warehouse));
  }
  if (document.target_warehouse) names.add(text(document.target_warehouse));

  for (const warehouseName of names) {
    if (!warehouseName) continue;
    await requireLeafWarehouse(
      context as unknown as ControllerContext<JsonObject>,
      warehouseName,
      company,
    );
  }
}

/**
 * Cross-company warehouse guard around the complete Stock Entry rollout chain plus the
 * shared reservation invariant at the final Stock Ledger plan boundary.
 */
export class StockEntryIntegrityController extends RolloutManufacturingStockEntryController {
  override async buildPlan(context: ControllerContext<StockEntryData>): Promise<MutationPlan<StockEntryData>> {
    await assertWarehouseScope(context);
    const plan = await super.buildPlan(context);
    await assertStockPlanRespectsReservations(context, plan.stock_entries, [
      context.command.aggregate.name,
      text((context.command.action === "cancel" ? context.existing?.data.work_order : context.command.document.work_order) ?? ""),
    ]);
    return plan;
  }
}
