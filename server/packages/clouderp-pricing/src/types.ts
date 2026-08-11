import type { JsonObject } from "../../contracts/src/index.js";

export interface PricingContext {
  itemCode: string;
  qtyMicros: number;
  postingDate: string;
  priceList: string;
  documentCurrency: string;
  uom?: string;
  /**
   * Existing callers keep legacy behavior by default. Commercial composition can ask for
   * the raw Item Price and apply Pricing Rule effects exactly once in the shared resolver.
   */
  applyPricingRules?: boolean;
  partyType?: "Customer" | "Supplier";
  party?: string;
  customerGroup?: string;
  supplierGroup?: string;
}

export interface ResolvedPrice extends JsonObject {
  rate_minor: number;
  rate: string;
  currency: string;
  currency_scale: number;
  item_price: string;
  pricing_rule?: string;
  discount_percentage?: string;
}
