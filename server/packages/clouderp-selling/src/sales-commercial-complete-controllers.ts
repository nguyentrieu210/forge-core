import type { JsonObject } from "../../contracts/src/index.js";
import type { ControllerContext } from "../../document-kernel/src/index.js";
import { applyOrderCommercialPricingPolicy } from "./order-commercial-policy.js";
import { applySalesPackageSnapshots, type PackageSnapshotDocument } from "./packaged-commercial-sales-order-controller.js";
import { QuotationController } from "./quotation-controller.js";
import type { QuotationData } from "./quotation-types.js";
import { SalesOrderClosureController } from "./sales-order-closure-controller.js";
import type { SalesOrderData } from "./types.js";

/** Full Sales Order composition: line pricing -> source closure -> order policy -> frozen fulfillment package. */
export class CompleteSalesOrderController extends SalesOrderClosureController {
  override async normalize(context: ControllerContext<SalesOrderData>): Promise<SalesOrderData> {
    const data = await super.normalize(context);
    const orderAdjusted = await applyOrderCommercialPricingPolicy(
      context as unknown as ControllerContext<JsonObject>,
      data,
    );
    return applySalesPackageSnapshots(
      context as unknown as ControllerContext<JsonObject>,
      orderAdjusted as SalesOrderData & PackageSnapshotDocument,
    ) as Promise<SalesOrderData>;
  }
}

/** Quotation keeps the existing line-commercial contract; order aggregates currently apply at Sales Order. */
export class CompleteQuotationController extends QuotationController {
  override async normalize(context: ControllerContext<QuotationData>): Promise<QuotationData> {
    const data = await super.normalize(context);
    return applySalesPackageSnapshots(
      context as unknown as ControllerContext<JsonObject>,
      data as unknown as QuotationData & PackageSnapshotDocument,
    ) as Promise<QuotationData>;
  }
}
