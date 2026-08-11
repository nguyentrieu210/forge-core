import { errors } from "../../core/src/index.js";
import { addMinor, fromScaledInt, multiplyScaled, percentOfMinor, toScaledInt } from "../../money/src/index.js";
import type { DiscountBasis, SalesItem, TaxChargeType, TaxRow } from "./types.js";

export interface SalesTotalsInput {
  apply_discount_on?: DiscountBasis | undefined;
  additional_discount_percentage?: string | number | undefined;
  discount_amount?: string | number | undefined;
  /** Chỉ controller đã chạy applyUomConversion mới được bật trục giá server này. */
  use_priced_quantity?: boolean | undefined;
  /**
   * Only a controller that has rebuilt line money through the canonical commercial resolver
   * may enable this. Raw REST payload discount/adjustment fields are otherwise ignored.
   */
  use_server_line_money?: boolean | undefined;
}

export interface SalesTotals {
  items: SalesItem[];
  taxes: TaxRow[];
  net_total: string;
  net_total_minor: number;
  total_taxes_and_charges: string;
  total_taxes_and_charges_minor: number;
  grand_total: string;
  grand_total_minor: number;
  rounded_total: string;
  rounded_total_minor: number;
  rounding_adjustment: string;
  rounding_adjustment_minor: number;
  apply_discount_on?: DiscountBasis | undefined;
  additional_discount_percentage?: string;
  discount_amount: string;
  discount_amount_minor: number;
}

/**
 * Fixed-point implementation of the O2C tax subset captured by the pinned ERPNext oracle.
 *
 * Legacy callers start from gross line amount and optional document discount. The canonical
 * commercial Sales path additionally enables `use_server_line_money`, in which each line has
 * already been rebuilt by the server as `gross - line discount + line adjustment`. That mode
 * removes the old dependency on a client-computed header `discount_amount`.
 */
export function calculateSalesTotals(
  items: SalesItem[],
  taxes: TaxRow[] = [],
  currencyScale = 2,
  options: SalesTotalsInput = {},
): SalesTotals {
  if (items.length === 0) throw errors.validation("At least one item is required");
  assertCurrencyScale(currencyScale);
  const useServerLineMoney = options.use_server_line_money === true;
  const normalizedItems = items.map((item, index) => normalizeItem(
    item,
    index,
    currencyScale,
    options.use_priced_quantity === true,
    useServerLineMoney,
  ));
  const grossMinor = addMinor(normalizedItems.map((item) => item.amount_minor ?? 0), "gross total");
  const quantityMicros = addMinor(normalizedItems.map((item) => item.qty_micros ?? 0), "quantity total");
  const lineDiscountMinor = useServerLineMoney
    ? addMinor(normalizedItems.map((item) => item.discount_amount_minor ?? 0), "line discount total")
    : 0;
  const lineAdjustmentMinor = useServerLineMoney
    ? addMinor(normalizedItems.map((item) => item.adjustment_amount_minor ?? 0), "line adjustment total")
    : 0;
  const lineNetMinor = useServerLineMoney
    ? addMinor(normalizedItems.map((item) => item.net_amount_minor ?? 0), "line net total")
    : grossMinor;

  const discountBasis = options.apply_discount_on ?? "Net Total";
  if (discountBasis !== "Net Total" && discountBasis !== "Grand Total") throw errors.validation("Invalid apply_discount_on value");
  const percentage = options.additional_discount_percentage === undefined
    ? 0
    : toScaledInt(options.additional_discount_percentage, 6, "additional_discount_percentage");
  if (percentage < 0 || percentage > 100_000_000) throw errors.validation("additional_discount_percentage must be from 0 to 100");
  const requestedFixedDiscount = options.discount_amount === undefined
    ? 0
    : toScaledInt(options.discount_amount, currencyScale, "discount_amount");
  if (requestedFixedDiscount < 0) throw errors.validation("discount_amount cannot be negative");

  const includedRows = taxes.filter((row) => row.included_in_print_rate === true);
  for (const row of includedRows) {
    const type = normalizeChargeType(row.charge_type);
    if (type !== "On Net Total" || row.add_deduct_tax === "Deduct") {
      throw errors.validation("Included tax currently supports additive On Net Total rows only");
    }
  }
  if (useServerLineMoney && includedRows.length > 0 && (lineDiscountMinor !== 0 || lineAdjustmentMinor !== 0)) {
    throw errors.validation("Included tax with policy-derived line discount/adjustment is not supported in this O2C release");
  }

  // A normalized percentage-discount document legitimately contains both the percentage and
  // its computed discount_amount. Percentage is authoritative when non-zero. In server-line
  // mode the caller must never pass a computed line-discount total back as this header field.
  const fixedDiscount = percentage > 0 ? 0 : requestedFixedDiscount;
  if (includedRows.length > 0 && (percentage > 0 || fixedDiscount > 0)) {
    throw errors.validation("Included tax and document discount cannot be combined in this O2C release");
  }

  const includedRateMicros = addMinor(includedRows.map((row, index) => {
    const rate = toScaledInt(row.rate, 6, `taxes[${index}].rate`);
    if (rate < 0) throw errors.validation(`Tax rate cannot be negative at row ${index + 1}`);
    return rate;
  }), "included tax rates");
  const rateDenominator = 100_000_000; // 100 × 10^6
  let netMinor = includedRateMicros === 0
    ? lineNetMinor
    : divideRoundedSafe(BigInt(lineNetMinor) * BigInt(rateDenominator), BigInt(rateDenominator + includedRateMicros), "inclusive net total");

  let documentDiscountMinor = 0;
  let discountedGrandTarget: number | null = null;
  if (percentage > 0) {
    const netDiscount = percentOfMinor(netMinor, fromScaledInt(percentage, 6), 6, "additional_discount_percentage");
    if (discountBasis === "Grand Total") {
      const provisional = calculateTaxRows(netMinor, grossMinor, quantityMicros, taxes, currencyScale);
      const provisionalGrand = addMinor([netMinor, provisional.nonIncludedTaxMinor], "provisional grand total");
      documentDiscountMinor = percentOfMinor(provisionalGrand, fromScaledInt(percentage, 6), 6, "additional_discount_percentage");
      discountedGrandTarget = provisionalGrand - documentDiscountMinor;
    } else {
      documentDiscountMinor = netDiscount;
    }
    netMinor -= netDiscount;
  } else if (fixedDiscount > 0) {
    documentDiscountMinor = fixedDiscount;
    if (discountBasis === "Grand Total") {
      const provisional = calculateTaxRows(netMinor, grossMinor, quantityMicros, taxes, currencyScale);
      const provisionalGrand = addMinor([netMinor, provisional.nonIncludedTaxMinor], "provisional grand total");
      if (documentDiscountMinor > provisionalGrand) throw errors.validation("discount_amount cannot exceed Grand Total");
      discountedGrandTarget = provisionalGrand - documentDiscountMinor;
      netMinor = scaleByRatio(netMinor, discountedGrandTarget, provisionalGrand, "grand-total discount");
    } else {
      if (documentDiscountMinor > netMinor) throw errors.validation("discount_amount cannot exceed Net Total");
      netMinor -= documentDiscountMinor;
    }
  }

  const itemsWithNet = allocateNetAmounts(normalizedItems, netMinor, lineNetMinor, currencyScale);
  const taxResult = calculateTaxRows(netMinor, grossMinor, quantityMicros, taxes, currencyScale);
  const taxMinor = taxResult.totalTaxMinor;
  const computedGrand = addMinor([netMinor, taxMinor], "computed grand total");
  const targetGrand = includedRows.length > 0
    ? addMinor([grossMinor, taxResult.nonIncludedTaxMinor], "inclusive rounded total")
    : (discountedGrandTarget ?? computedGrand);
  const roundingAdjustment = targetGrand - computedGrand;
  const totalDiscountMinor = addMinor([lineDiscountMinor, documentDiscountMinor], "total discount");

  return {
    items: itemsWithNet,
    taxes: taxResult.rows,
    net_total: fromScaledInt(netMinor, currencyScale),
    net_total_minor: netMinor,
    total_taxes_and_charges: fromScaledInt(taxMinor, currencyScale),
    total_taxes_and_charges_minor: taxMinor,
    grand_total: fromScaledInt(targetGrand, currencyScale),
    grand_total_minor: targetGrand,
    rounded_total: fromScaledInt(targetGrand, currencyScale),
    rounded_total_minor: targetGrand,
    rounding_adjustment: fromScaledInt(roundingAdjustment, currencyScale),
    rounding_adjustment_minor: roundingAdjustment,
    ...(options.apply_discount_on ? { apply_discount_on: options.apply_discount_on } : {}),
    ...(percentage > 0 ? { additional_discount_percentage: fromScaledInt(percentage, 6) } : {}),
    discount_amount: fromScaledInt(totalDiscountMinor, currencyScale),
    discount_amount_minor: totalDiscountMinor,
  };
}

function normalizeItem(
  item: SalesItem,
  index: number,
  currencyScale: number,
  usePricedQuantity: boolean,
  useServerLineMoney: boolean,
): SalesItem {
  if (!item.item_code) throw errors.validation(`Item code is required at row ${index + 1}`);
  const qtyMicros = toScaledInt(item.qty, 6, `items[${index}].qty`);
  if (qtyMicros <= 0) throw errors.validation(`Quantity must be greater than zero at row ${index + 1}`);
  // Default callers may pass raw REST payloads, so hidden priced_qty_micros is untrusted.
  // Only sales controllers enable it after UOM core has rebuilt the snapshot from master.
  const pricedQtyMicros = usePricedQuantity ? item.priced_qty_micros ?? qtyMicros : qtyMicros;
  if (pricedQtyMicros <= 0) throw errors.validation(`Priced quantity must be greater than zero at row ${index + 1}`);
  const rateMinor = toScaledInt(item.rate, currencyScale, `items[${index}].rate`);
  if (rateMinor < 0) throw errors.validation(`Rate cannot be negative at row ${index + 1}`);
  const roundedRate = fromScaledInt(rateMinor, currencyScale);
  const amountMinor = multiplyScaled(
    fromScaledInt(pricedQtyMicros, 6),
    6,
    roundedRate,
    currencyScale,
    currencyScale,
    `items[${index}].amount`,
  );

  let netAmountMinor = amountMinor;
  let lineDiscountMinor = 0;
  let lineAdjustmentMinor = 0;
  if (useServerLineMoney) {
    lineDiscountMinor = trustedMinor(item.discount_amount_minor, `items[${index}].discount_amount_minor`);
    lineAdjustmentMinor = trustedMinor(item.adjustment_amount_minor, `items[${index}].adjustment_amount_minor`);
    if (lineDiscountMinor > amountMinor) throw errors.validation(`Line discount cannot exceed gross amount at row ${index + 1}`);
    netAmountMinor = addMinor([amountMinor, -lineDiscountMinor, lineAdjustmentMinor], `items[${index}].net_amount`);
    if (netAmountMinor < 0) throw errors.validation(`Line net amount cannot be negative at row ${index + 1}`);
  }

  return {
    ...item,
    qty: fromScaledInt(qtyMicros, 6),
    rate: roundedRate,
    qty_micros: qtyMicros,
    priced_qty_micros: pricedQtyMicros,
    rate_minor: rateMinor,
    amount_minor: amountMinor,
    amount: fromScaledInt(amountMinor, currencyScale),
    ...(useServerLineMoney ? {
      discount_amount_minor: lineDiscountMinor,
      discount_amount: fromScaledInt(lineDiscountMinor, currencyScale),
      adjustment_amount_minor: lineAdjustmentMinor,
      adjustment_amount: fromScaledInt(lineAdjustmentMinor, currencyScale),
      net_amount_minor: netAmountMinor,
      net_amount: fromScaledInt(netAmountMinor, currencyScale),
    } : {}),
  };
}

function trustedMinor(value: number | undefined, field: string): number {
  if (value === undefined) return 0;
  if (!Number.isSafeInteger(value) || value < 0) throw errors.validation(`${field} must be a non-negative safe integer`);
  return value;
}

function calculateTaxRows(
  netMinor: number,
  grossMinor: number,
  quantityMicros: number,
  taxes: TaxRow[],
  currencyScale: number,
): { rows: TaxRow[]; totalTaxMinor: number; nonIncludedTaxMinor: number } {
  let runningTotal = netMinor;
  const rows: TaxRow[] = [];
  let nonIncludedTaxMinor = 0;
  for (const [index, tax] of taxes.entries()) {
    if (!tax.account) throw errors.validation(`Tax account is required at row ${index + 1}`);
    const chargeType = normalizeChargeType(tax.charge_type);
    const rateMicros = toScaledInt(tax.rate, 6, `taxes[${index}].rate`);
    if (rateMicros < 0) throw errors.validation(`Tax rate cannot be negative at row ${index + 1}`);
    let amount: number;
    if (chargeType === "Actual") {
      const actualInput = tax.actual_tax_amount ?? tax.tax_amount;
      if (actualInput === undefined) throw errors.validation(`Actual tax amount is required at row ${index + 1}`);
      amount = toScaledInt(actualInput, currencyScale, `taxes[${index}].actual_tax_amount`);
    } else if (chargeType === "On Item Quantity") {
      amount = multiplyScaled(fromScaledInt(quantityMicros, 6), 6, tax.rate, 6, currencyScale, `taxes[${index}].quantity_charge`);
    } else {
      const base = chargeType === "On Previous Row Total" ? runningTotal : netMinor;
      amount = percentOfMinor(base, tax.rate, 6, `taxes[${index}].rate`);
    }
    if (amount < 0) throw errors.validation(`Tax amount cannot be negative at row ${index + 1}`);
    const signedAmount = tax.add_deduct_tax === "Deduct" ? -amount : amount;
    runningTotal = addMinor([runningTotal, signedAmount], "tax running total");
    if (tax.included_in_print_rate !== true) nonIncludedTaxMinor = addMinor([nonIncludedTaxMinor, signedAmount], "non-included tax total");
    rows.push({
      ...tax,
      charge_type: chargeType,
      add_deduct_tax: tax.add_deduct_tax ?? "Add",
      rate: fromScaledInt(rateMicros, 6),
      ...(chargeType === "Actual" ? { actual_tax_amount: fromScaledInt(amount, currencyScale) } : {}),
      tax_amount_minor: signedAmount,
      tax_amount: fromScaledInt(signedAmount, currencyScale),
      total_minor: runningTotal,
      total: fromScaledInt(runningTotal, currencyScale),
    });
  }
  return {
    rows,
    totalTaxMinor: addMinor(rows.map((row) => row.tax_amount_minor ?? 0), "tax total"),
    nonIncludedTaxMinor,
  };
}

function allocateNetAmounts(items: SalesItem[], netMinor: number, sourceNetMinor: number, scale: number): SalesItem[] {
  let allocated = 0;
  return items.map((item, index) => {
    const sourceMinor = item.net_amount_minor ?? item.amount_minor ?? 0;
    const netAmount = index === items.length - 1
      ? netMinor - allocated
      : (sourceNetMinor === 0 ? 0 : scaleByRatio(sourceMinor, netMinor, sourceNetMinor, `items[${index}].net_amount`));
    allocated += netAmount;
    return { ...item, net_amount_minor: netAmount, net_amount: fromScaledInt(netAmount, scale) };
  });
}

function normalizeChargeType(value: TaxChargeType | undefined): TaxChargeType {
  return value ?? "On Net Total";
}

function scaleByRatio(value: number, numerator: number, denominator: number, field: string): number {
  if (denominator === 0) return 0;
  return divideRoundedSafe(BigInt(value) * BigInt(numerator), BigInt(denominator), field);
}

function divideRoundedSafe(numerator: bigint, denominator: bigint, field: string): number {
  if (denominator <= 0n) throw errors.validation(`${field} divisor must be positive`);
  const negative = numerator < 0n;
  const absolute = negative ? -numerator : numerator;
  const quotient = absolute / denominator;
  const remainder = absolute % denominator;
  const result = (remainder * 2n >= denominator ? quotient + 1n : quotient) * (negative ? -1n : 1n);
  const asNumber = Number(result);
  if (!Number.isSafeInteger(asNumber)) throw errors.validation(`${field} exceeds safe integer range`);
  return asNumber;
}

export function assertCurrencyScale(scale: number): void {
  if (!Number.isInteger(scale) || scale < 0 || scale > 6) throw errors.validation("currency_scale must be an integer from 0 to 6");
}
