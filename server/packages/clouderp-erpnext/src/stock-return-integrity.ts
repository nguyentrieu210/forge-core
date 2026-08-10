import type {
  CanonicalDocument,
  JsonObject,
  MutationPlan,
  ReturnEntry,
  StockBundleUsageEntry,
} from "../../contracts/src/index.js";
import { requireLeafWarehouse } from "../../clouderp-stock/src/index.js";
import { errors } from "../../core/src/index.js";
import type { ControllerContext } from "../../document-kernel/src/index.js";
import { reverseGl, reverseStock } from "../../ledger/src/index.js";
import { toScaledInt } from "../../money/src/index.js";
import { domainEvent } from "../../outbox/src/index.js";
import type { StockReturnData } from "./types.js";
import { StockReturnController } from "./controllers.js";

function text(value: unknown): string {
  return String(value ?? "").normalize("NFC").trim();
}

/**
 * Stock Return is a correction of an already-posted Delivery/Purchase Receipt.
 * Cancellation therefore reverses the exact submitted Stock/GL facts; it must never
 * recalculate valuation or reselect batch state from "now" because stock may have moved
 * since the return was submitted.
 */
export class StockReturnIntegrityController extends StockReturnController {
  override async buildPlan(context: ControllerContext<StockReturnData>): Promise<MutationPlan<StockReturnData>> {
    if (context.command.action === "submit") {
      const company = text(context.command.document.company);
      for (const row of context.command.document.items ?? []) {
        if (!row.warehouse) continue;
        await requireLeafWarehouse(
          context as unknown as ControllerContext<JsonObject>,
          row.warehouse,
          company,
        );
      }
      return super.buildPlan(context);
    }

    if (context.command.action !== "cancel") return super.buildPlan(context);
    return buildExactCancelPlan(context);
  }
}

async function buildExactCancelPlan(
  context: ControllerContext<StockReturnData>,
): Promise<MutationPlan<StockReturnData>> {
  const existing = requireExisting(context);
  const data = structuredClone(existing.data);
  await assertUnlocked(context, data.company, data.posting_at);

  const [originalStock, originalGl] = await Promise.all([
    context.reader.getVoucherStockEntries(
      context.command.tenant_id,
      "Stock Return",
      context.command.aggregate.name,
      existing.version,
    ),
    context.reader.getVoucherGlEntries(
      context.command.tenant_id,
      "Stock Return",
      context.command.aggregate.name,
      existing.version,
    ),
  ]);
  if (originalStock.length === 0) {
    throw errors.reference(`Original stock posting for Stock Return ${context.command.aggregate.name} was not found`);
  }

  const inward = data.return_type === "Sales";
  const returnEntries: ReturnEntry[] = data.items.map((item, index) => ({
    line_key: `REV-RETURN-${item.row_id || index + 1}`,
    reference_doctype: inward ? "Delivery Note" : "Purchase Receipt",
    reference_name: data.return_against,
    kind: inward ? "Sales Stock" : "Purchase Stock",
    item_code: item.item_code,
    qty_micros: -(item.qty_micros ?? toScaledInt(item.qty, 6)),
    posting_at: data.posting_at,
  }));
  const bundleUsages: StockBundleUsageEntry[] = data.items.flatMap((item, index) => (
    item.serial_and_batch_bundle && item.warehouse
      ? [{
        line_key: `REV-BUNDLE-RETURN-${item.row_id || index + 1}`,
        bundle_name: item.serial_and_batch_bundle,
        item_code: item.item_code,
        warehouse: item.warehouse,
        direction: inward ? "Inward" as const : "Outward" as const,
        usage_delta: -1 as const,
        posting_at: data.posting_at,
      }]
      : []
  ));

  const document: CanonicalDocument<StockReturnData> = {
    ...existing,
    docstatus: 2,
    status: "Cancelled",
    version: context.nextVersion,
    modified_at: context.now,
    data,
    children: structuredClone(existing.children),
  };
  const event = domainEvent({
    type: "stock_return.cancel",
    tenantId: context.command.tenant_id,
    aggregate: context.command.aggregate,
    aggregateVersion: context.nextVersion,
    actor: context.command.actor.user_id,
    commandId: context.command.command_id,
    occurredAt: context.now,
    payload: { status: "Cancelled" },
  });

  return {
    command: context.command,
    document,
    gl_entries: reverseGl(originalGl),
    stock_entries: reverseStock(originalStock),
    payment_entries: [],
    fulfillment_entries: [],
    stock_bundle_usages: bundleUsages,
    return_entries: returnEntries,
    manufacturing_entries: [],
    asset_depreciation_entries: [],
    events: [event],
    result: {
      doctype: "Stock Return",
      name: document.name,
      version: document.version,
      docstatus: 2,
      status: "Cancelled",
    },
  };
}

async function assertUnlocked(
  context: ControllerContext<StockReturnData>,
  company: string,
  postingAt: string,
): Promise<void> {
  if (context.command.actor.roles.includes("System Manager") || context.command.actor.user_id === "Administrator") return;
  const lock = await context.reader.getPeriodLockDate(context.command.tenant_id, company);
  if (lock && postingAt.slice(0, 10) <= lock) {
    throw errors.validation(`Ngày ${postingAt.slice(0, 10)} thuộc kỳ đã khoá`, { lock_date: lock });
  }
}

function requireExisting(
  context: ControllerContext<StockReturnData>,
): CanonicalDocument<StockReturnData> {
  if (!context.existing) throw errors.notFound();
  return context.existing;
}
