import type { JsonObject } from "../../contracts/src/index.js";
import type { ControllerContext } from "../../document-kernel/src/index.js";
import { applySalesPackageSnapshots, type PackageSnapshotDocument } from "./packaged-commercial-sales-order-controller.js";
import { QuotationController } from "./quotation-controller.js";
import type { QuotationData } from "./quotation-types.js";
import { SalesOrderClosureController } from "./sales-order-closure-controller.js";
import type { SalesOrderData } from "./types.js";

/** Full Sales Order composition: pricing -> source closure -> frozen fulfillment package. */
export class CompleteSalesOrderController extends SalesOrderClosureController {
  override async normalize(context: ControllerContext<SalesOrderData>): Promise<SalesOrderData> {
    const data = await super.normalize(context);
    return applySalesPackageSnapshots(
      context as unknown as ControllerContext<JsonObject>,
      data as SalesOrderData & PackageSnapshotDocument,
    ) as Promise<SalesOrderData>;
  }
}

/** Quotation uses the same package snapshot contract so accepted quotes freeze fulfillment. */
export class CompleteQuotationController extends QuotationController {
  override async normalize(context: ControllerContext<QuotationData>): Promise<QuotationData> {
    const data = await super.normalize(context);
    return applySalesPackageSnapshots(
      context as unknown as ControllerContext<JsonObject>,
      data as unknown as QuotationData & PackageSnapshotDocument,
    ) as Promise<QuotationData>;
  }
}
