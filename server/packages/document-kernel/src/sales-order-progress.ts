import type { JsonObject } from "../../contracts/src/index.js";
import { toScaledInt } from "../../money/src/index.js";

export interface SalesOrderProgressReader {
  getLine(kind: "Delivery" | "Billing", rowKey: string, packageComponentKey?: string): Promise<number>;
  getLegacy(kind: "Delivery" | "Billing", itemCode: string): Promise<number>;
}

export interface SalesOrderProgress {
  ordered_micros: number;
  delivered_micros: number;
  billed_micros: number;
  delivered_percentage: number;
  billed_percentage: number;
}

/**
 * Project Sales Order progress without item-code cross-talk.
 *
 * Direct lines use exact source-row progress. A frozen ALL package reports delivery according
 * to the least-complete required component, converted back to an equivalent commercial parent
 * quantity. Billing always follows the parent commercial row. Legacy item-code progress is used
 * only when the item appears on exactly one order row, so old documents remain readable without
 * inventing an allocation across duplicate configured lines.
 */
export async function deriveSalesOrderProgress(
  values: unknown[],
  reader: SalesOrderProgressReader,
): Promise<SalesOrderProgress> {
  const rows = values.filter((value): value is JsonObject => Boolean(value) && typeof value === "object" && !Array.isArray(value));
  const itemCounts = new Map<string, number>();
  for (const row of rows) {
    const itemCode = text(row.item_code);
    if (itemCode) itemCounts.set(itemCode, (itemCounts.get(itemCode) ?? 0) + 1);
  }

  let ordered = 0;
  let delivered = 0;
  let billed = 0;
  for (const row of rows) {
    const rowQty = qtyMicros(row.qty_micros, row.qty);
    if (rowQty <= 0) continue;
    ordered += rowQty;
    const itemCode = text(row.item_code);
    const rowKey = text(row.row_id);

    billed += await directProgress(reader, "Billing", rowKey, itemCode, itemCounts, rowQty);

    const packageSnapshot = parsePackageSnapshot(row.sales_package_snapshot);
    if (packageSnapshot?.selection_mode === "ALL" && rowKey) {
      const required = packageSnapshot.components.filter((component) => component.required);
      if (required.length === 0) {
        delivered += await directProgress(reader, "Delivery", rowKey, itemCode, itemCounts, rowQty);
        continue;
      }
      let minDelivered = 0n;
      let minRequired = 1n;
      let initialized = false;
      for (const component of required) {
        const componentDelivered = Math.max(0, await reader.getLine("Delivery", rowKey, component.component_key));
        const bounded = Math.min(componentDelivered, component.qty_micros);
        if (!initialized || BigInt(bounded) * minRequired < minDelivered * BigInt(component.qty_micros)) {
          minDelivered = BigInt(bounded);
          minRequired = BigInt(component.qty_micros);
          initialized = true;
        }
      }
      delivered += initialized ? ratioMicros(rowQty, minDelivered, minRequired) : 0;
    } else {
      delivered += await directProgress(reader, "Delivery", rowKey, itemCode, itemCounts, rowQty);
    }
  }

  const deliveredPct = ordered > 0 ? (delivered * 100) / ordered : 0;
  const billedPct = ordered > 0 ? (billed * 100) / ordered : 0;
  return {
    ordered_micros: ordered,
    delivered_micros: delivered,
    billed_micros: billed,
    delivered_percentage: deliveredPct,
    billed_percentage: billedPct,
  };
}

async function directProgress(
  reader: SalesOrderProgressReader,
  kind: "Delivery" | "Billing",
  rowKey: string,
  itemCode: string,
  itemCounts: Map<string, number>,
  ordered: number,
): Promise<number> {
  if (rowKey) {
    const exact = await reader.getLine(kind, rowKey, "");
    if (exact !== 0) return clampProgress(exact, ordered);
  }
  if (itemCode && itemCounts.get(itemCode) === 1) {
    return clampProgress(await reader.getLegacy(kind, itemCode), ordered);
  }
  return 0;
}

function clampProgress(value: number, ordered: number): number {
  return Math.max(0, Math.min(value, ordered));
}

function ratioMicros(parentQty: number, delivered: bigint, required: bigint): number {
  if (required <= 0n || delivered <= 0n) return 0;
  const result = (BigInt(parentQty) * delivered + required / 2n) / required;
  const numeric = Number(result);
  return Number.isSafeInteger(numeric) ? Math.min(parentQty, numeric) : parentQty;
}

function qtyMicros(micros: unknown, value: unknown): number {
  if (typeof micros === "number" && Number.isSafeInteger(micros)) return micros;
  return toScaledInt(String(value ?? 0), 6, "Sales Order progress qty");
}

interface PackageProgressSnapshot {
  selection_mode: string;
  components: Array<{ component_key: string; qty_micros: number; required: boolean }>;
}

function parsePackageSnapshot(value: unknown): PackageProgressSnapshot | null {
  let candidate = value;
  if (typeof candidate === "string") {
    if (!candidate.trim()) return null;
    try { candidate = JSON.parse(candidate); } catch { return null; }
  }
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;
  const data = candidate as JsonObject;
  const componentsValue = data.components;
  if (!Array.isArray(componentsValue)) return null;
  const components: PackageProgressSnapshot["components"] = [];
  for (const raw of componentsValue) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const row = raw as JsonObject;
    const key = text(row.component_key);
    const qty = qtyMicros(row.qty_micros, row.qty);
    if (!key || qty <= 0) continue;
    components.push({ component_key: key, qty_micros: qty, required: row.required !== false && row.required !== 0 });
  }
  return { selection_mode: text(data.selection_mode).toUpperCase(), components };
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
