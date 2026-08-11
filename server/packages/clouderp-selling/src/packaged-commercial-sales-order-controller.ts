import type { JsonObject } from "../../contracts/src/index.js";
import type { ControllerContext } from "../../document-kernel/src/index.js";
import { CommercialSalesOrderController } from "./commercial-sales-order-controller.js";
import { parseSalesPackageSnapshot, resolveSalesPackage } from "./sales-package-resolver.js";
import type { SalesItem, SalesOrderData } from "./types.js";

/**
 * Adds fulfillment composition to the canonical commercial pricing controller.
 * Pricing and fulfillment remain separate authorities: Sales Option may point at a
 * Sales Package, but package components never participate in line price calculation.
 */
export class PackagedCommercialSalesOrderController extends CommercialSalesOrderController {
  override async normalize(context: ControllerContext<SalesOrderData>): Promise<SalesOrderData> {
    const data = await super.normalize(context);
    const postingDate = data.transaction_date;
    const items: SalesItem[] = [];

    for (const item of data.items) {
      const packageName = text((item as JsonObject).sales_package);
      const suppliedSnapshot = parseSalesPackageSnapshot((item as JsonObject).sales_package_snapshot);
      if (!packageName) {
        const clean = { ...item } as SalesItem;
        delete (clean as JsonObject).sales_package_version;
        delete (clean as JsonObject).sales_package_checksum;
        delete (clean as JsonObject).sales_package_snapshot;
        items.push(clean);
        continue;
      }

      if (suppliedSnapshot) {
        if (suppliedSnapshot.sales_package !== packageName) {
          throw new Error(`Sales Package snapshot ${suppliedSnapshot.sales_package} does not match ${packageName}`);
        }
        items.push(withSnapshot(item, suppliedSnapshot));
        continue;
      }

      const resolved = await resolveSalesPackage(context as unknown as ControllerContext<JsonObject>, {
        packageName,
        postingDate,
        itemCode: item.item_code,
        facts: item as unknown as Record<string, unknown>,
      });
      items.push(withSnapshot(item, resolved));
    }

    return { ...data, items };
  }
}

function withSnapshot(item: SalesItem, snapshot: ReturnType<typeof parseSalesPackageSnapshot> extends infer _T ? NonNullable<Awaited<ReturnType<typeof resolveSalesPackage>>> : never): SalesItem {
  return {
    ...item,
    sales_package: snapshot.sales_package,
    sales_package_version: snapshot.sales_package_version,
    sales_package_checksum: snapshot.sales_package_checksum,
    sales_package_snapshot: snapshot,
  } as SalesItem;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
