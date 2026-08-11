import type { JsonObject } from "../../contracts/src/index.js";

export interface PricingContext {
  itemCode: string;
  qtyMicros: number;
  postingDate: string;
  priceList: string;
  documentCurrency: string;
  uom?: string;
  /** Missing/blank remains STANDARD for backward compatibility. */
  priceVariant?: string;
  /** Existing callers keep legacy behavior unless commercial composition asks for raw price. */
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
  price_variant: string;
  pricing_rule?: string;
  discount_percentage?: string;
}
