import type { Doc } from "@metaforge/core";

/** Compatibility names consumed by ChildGrid; semantics come only from Item.sales_qty_basis. */
export type LinearSalesBasis = "RAY" | "TRUC";

export type SalesQtyBasis =
  | "DIRECT"
  | "AREA"
  | "HEIGHT_X_SETS"
  | "WIDTH_X_SETS"
  | "LENGTH_X_PIECES"
  | "SET_COUNT"
  | "PIECES";

export function salesQtyBasis(row: Doc | Record<string, unknown>): SalesQtyBasis {
  const value = String(row.sales_qty_basis ?? "").trim().toUpperCase();
  if (["AREA", "HEIGHT_X_SETS", "WIDTH_X_SETS", "LENGTH_X_PIECES", "SET_COUNT", "PIECES"].includes(value)) {
    return value as SalesQtyBasis;
  }
  return "DIRECT";
}

/** HEIGHT/WIDTH are generic measurement facts; names such as ray/trục never enter runtime policy. */
export function deriveLinearSalesBasis(row: Doc | Record<string, unknown>): LinearSalesBasis | undefined {
  const basis = salesQtyBasis(row);
  if (basis === "HEIGHT_X_SETS") return "RAY";
  if (basis === "WIDTH_X_SETS") return "TRUC";
  return undefined;
}

/** Kept for old ChildGrid call-sites while they transition to salesQtyBasis. */
export function isWidthQuantitySalesItem(row: Doc | Record<string, unknown>): boolean {
  return salesQtyBasis(row) === "WIDTH_X_SETS";
}

export function isOrdinaryQuantitySalesItem(row: Doc | Record<string, unknown>): boolean {
  const basis = salesQtyBasis(row);
  return basis === "SET_COUNT" || basis === "PIECES";
}

/**
 * Deprecated compatibility export. Monetary policy is server-authoritative Pricing Rule;
 * the client never invents a percentage from item type/name/group.
 */
export function defaultSalesDiscountPercent(_row: Doc | Record<string, unknown>): number {
  return 0;
}
