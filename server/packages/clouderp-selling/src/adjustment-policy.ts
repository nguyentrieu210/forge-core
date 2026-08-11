import { errors } from "../../core/src/index.js";
import { fromScaledInt, toScaledInt } from "../../money/src/index.js";

export type AdjustmentOperator = "eq" | "neq" | "in" | "not_in" | "lt" | "lte" | "gt" | "gte";
export type AdjustmentBasis = "FIXED" | "AREA_SQM" | "LENGTH_M" | "SET_COUNT";
export type AdjustmentScope = "LINE" | "ORDER" | "UNRESOLVED";

export interface AdjustmentCondition {
  field: string;
  op: AdjustmentOperator;
  value?: string | number | boolean;
  values?: Array<string | number | boolean>;
}

export interface SalesAdjustmentRule {
  code: string;
  description: string;
  basis: AdjustmentBasis;
  /** Currency amount per basis unit, expressed in canonical minor units. */
  rate_minor: number;
  conditions: AdjustmentCondition[];
  scope?: AdjustmentScope;
  exclusive_group?: string;
  priority?: number;
  taxable?: boolean;
  discountable?: boolean;
}

export interface SalesAdjustmentContext {
  facts: Record<string, unknown>;
  area_sqm?: number;
  length_m?: number;
  set_count?: number;
}

export interface AppliedSalesAdjustment {
  rule_code: string;
  description: string;
  basis: AdjustmentBasis;
  basis_qty: string;
  basis_qty_micros: number;
  rate_minor: number;
  amount_minor: number;
  exclusive_group?: string;
  taxable: boolean;
  discountable: boolean;
}

export interface AdjustmentEvaluation {
  applied: AppliedSalesAdjustment[];
  unresolved_rules: string[];
}

const QTY_SCALE = 6;
const ONE_QTY = 1_000_000;

function normalizedText(value: unknown): string {
  return String(value ?? "").normalize("NFC").trim().toLocaleLowerCase("vi");
}

function comparable(value: unknown): string | number | boolean | null {
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "string") return normalizedText(value);
  return value == null ? null : normalizedText(value);
}

function conditionMatches(facts: Record<string, unknown>, condition: AdjustmentCondition): boolean {
  const actual = comparable(facts[condition.field]);
  if (condition.op === "in" || condition.op === "not_in") {
    const values = (condition.values ?? []).map(comparable);
    const matched = values.some((value) => value === actual);
    return condition.op === "in" ? matched : !matched;
  }

  const expected = comparable(condition.value);
  if (condition.op === "eq") return actual === expected;
  if (condition.op === "neq") return actual !== expected;

  const left = Number(actual);
  const right = Number(expected);
  if (!Number.isFinite(left) || !Number.isFinite(right)) return false;
  if (condition.op === "lt") return left < right;
  if (condition.op === "lte") return left <= right;
  if (condition.op === "gt") return left > right;
  return left >= right;
}

function quantityMicros(context: SalesAdjustmentContext, basis: AdjustmentBasis): number {
  if (basis === "FIXED") return ONE_QTY;
  const raw = basis === "AREA_SQM"
    ? context.area_sqm
    : basis === "LENGTH_M" ? context.length_m : context.set_count;
  if (raw === undefined || !Number.isFinite(raw) || raw <= 0) return 0;
  const micros = Math.round(raw * ONE_QTY);
  if (!Number.isSafeInteger(micros)) throw errors.validation(`Adjustment ${basis} quantity exceeds safe integer range`);
  return micros;
}

function multiplyMinorByQuantity(rateMinor: number, qtyMicros: number, field: string): number {
  if (!Number.isSafeInteger(rateMinor) || rateMinor < 0) throw errors.validation(`${field} rate_minor must be a non-negative safe integer`);
  if (!Number.isSafeInteger(qtyMicros) || qtyMicros < 0) throw errors.validation(`${field} quantity must be a non-negative safe integer`);
  const numerator = BigInt(rateMinor) * BigInt(qtyMicros);
  const denominator = BigInt(ONE_QTY);
  const rounded = (numerator + denominator / 2n) / denominator;
  const result = Number(rounded);
  if (!Number.isSafeInteger(result)) throw errors.validation(`${field} amount exceeds safe integer range`);
  return result;
}

function selectedRules(rules: SalesAdjustmentRule[], facts: Record<string, unknown>): SalesAdjustmentRule[] {
  const matched = rules.filter((rule) => rule.conditions.every((condition) => conditionMatches(facts, condition)));
  const plain = matched.filter((rule) => !rule.exclusive_group);
  const grouped = new Map<string, SalesAdjustmentRule[]>();
  for (const rule of matched) {
    if (!rule.exclusive_group) continue;
    const bucket = grouped.get(rule.exclusive_group) ?? [];
    bucket.push(rule);
    grouped.set(rule.exclusive_group, bucket);
  }

  const selected = [...plain];
  for (const [group, candidates] of grouped) {
    candidates.sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0) || left.code.localeCompare(right.code));
    const first = candidates[0];
    if (!first) continue;
    const tied = candidates.filter((candidate) => (candidate.priority ?? 0) === (first.priority ?? 0));
    if (tied.length > 1) {
      throw errors.validation(`Multiple adjustment rules tie in exclusive group ${group}: ${tied.map((rule) => rule.code).join(", ")}`);
    }
    selected.push(first);
  }
  return selected.sort((left, right) => left.code.localeCompare(right.code));
}

export function evaluateSalesAdjustmentRules(
  context: SalesAdjustmentContext,
  rules: SalesAdjustmentRule[],
): AdjustmentEvaluation {
  const applied: AppliedSalesAdjustment[] = [];
  const unresolvedRules: string[] = [];
  for (const rule of selectedRules(rules, context.facts)) {
    if ((rule.scope ?? "LINE") === "UNRESOLVED") {
      unresolvedRules.push(rule.code);
      continue;
    }
    if ((rule.scope ?? "LINE") !== "LINE") continue;
    const qtyMicros = quantityMicros(context, rule.basis);
    if (qtyMicros <= 0) continue;
    applied.push({
      rule_code: rule.code,
      description: rule.description,
      basis: rule.basis,
      basis_qty: fromScaledInt(qtyMicros, QTY_SCALE),
      basis_qty_micros: qtyMicros,
      rate_minor: rule.rate_minor,
      amount_minor: multiplyMinorByQuantity(rule.rate_minor, qtyMicros, rule.code),
      ...(rule.exclusive_group ? { exclusive_group: rule.exclusive_group } : {}),
      taxable: rule.taxable !== false,
      discountable: rule.discountable === true,
    });
  }
  return { applied, unresolved_rules: unresolvedRules.sort() };
}

export interface CommercialLineInput {
  priced_qty: number;
  selling_rate_minor: number;
  discount_percentage?: number;
  discount_basis_qty?: number;
  discount_basis_rate_minor?: number;
  adjustments?: AppliedSalesAdjustment[];
}

export interface CommercialLineTotals {
  gross_amount_minor: number;
  discount_basis_amount_minor: number;
  discount_amount_minor: number;
  surcharge_amount_minor: number;
  taxable_surcharge_amount_minor: number;
  net_before_tax_minor: number;
}

function percentageMicros(value: number | undefined): number {
  if (value === undefined) return 0;
  const micros = toScaledInt(value, 6, "discount_percentage");
  if (micros < 0 || micros > 100_000_000) throw errors.validation("discount_percentage must be from 0 to 100");
  return micros;
}

function percentOfMinor(amountMinor: number, pctMicros: number): number {
  const numerator = BigInt(amountMinor) * BigInt(pctMicros);
  const denominator = 100_000_000n;
  const rounded = (numerator + denominator / 2n) / denominator;
  const result = Number(rounded);
  if (!Number.isSafeInteger(result)) throw errors.validation("discount amount exceeds safe integer range");
  return result;
}

export function calculateCommercialLine(input: CommercialLineInput): CommercialLineTotals {
  const pricedQtyMicros = Math.round(input.priced_qty * ONE_QTY);
  if (!Number.isSafeInteger(pricedQtyMicros) || pricedQtyMicros <= 0) throw errors.validation("priced_qty must be greater than zero");
  const basisQtyMicros = input.discount_basis_qty === undefined
    ? pricedQtyMicros
    : Math.round(input.discount_basis_qty * ONE_QTY);
  if (!Number.isSafeInteger(basisQtyMicros) || basisQtyMicros <= 0) throw errors.validation("discount_basis_qty must be greater than zero");

  const sellingRateMinor = input.selling_rate_minor;
  const basisRateMinor = input.discount_basis_rate_minor ?? sellingRateMinor;
  const grossMinor = multiplyMinorByQuantity(sellingRateMinor, pricedQtyMicros, "selling_rate");
  const discountBasisMinor = multiplyMinorByQuantity(basisRateMinor, basisQtyMicros, "discount_basis_rate");
  const discountMinor = percentOfMinor(discountBasisMinor, percentageMicros(input.discount_percentage));
  const adjustments = input.adjustments ?? [];
  const surchargeMinor = adjustments.reduce((sum, adjustment) => sum + adjustment.amount_minor, 0);
  const taxableSurchargeMinor = adjustments.reduce((sum, adjustment) => sum + (adjustment.taxable ? adjustment.amount_minor : 0), 0);
  const netBeforeTaxMinor = grossMinor - discountMinor + surchargeMinor;
  if (!Number.isSafeInteger(netBeforeTaxMinor)) throw errors.validation("commercial line total exceeds safe integer range");
  return {
    gross_amount_minor: grossMinor,
    discount_basis_amount_minor: discountBasisMinor,
    discount_amount_minor: discountMinor,
    surcharge_amount_minor: surchargeMinor,
    taxable_surcharge_amount_minor: taxableSurchargeMinor,
    net_before_tax_minor: netBeforeTaxMinor,
  };
}

export type AustralianBillingMode = "PER_SET" | "PER_M2" | "UNRESOLVED_BOUNDARY";

/** User rule: below 4 m2 sells per set; above 4 m2 sells per m2. Exactly 4 m2 remains explicit, not guessed. */
export function resolveAustralianBillingMode(areaPerSetSqm: number): AustralianBillingMode {
  if (!Number.isFinite(areaPerSetSqm) || areaPerSetSqm <= 0) throw errors.validation("area_per_set_sqm must be greater than zero");
  if (areaPerSetSqm < 4) return "PER_SET";
  if (areaPerSetSqm > 4) return "PER_M2";
  return "UNRESOLVED_BOUNDARY";
}

export function alumdoorExperimentalAdjustmentRules(currencyScale: number): SalesAdjustmentRule[] {
  const money = (value: number) => toScaledInt(value, currencyScale, "adjustment_rate");
  const doorWoodgrain = ["Cửa Đức", "Cửa Úc", "Cửa Siêu Trường", "Cửa Đài Loan"];
  const targetRails = ["RAY_HOP_TD", "RAY_HOP_TD_U100", "RAY_DON_TD", "RAY_SAT_KHONG_RON"];
  return [
    {
      code: "WOOD_GRAIN_DOOR", description: "Sơn vân gỗ cửa", basis: "AREA_SQM", rate_minor: money(465_000),
      conditions: [
        { field: "door_type", op: "in", values: doorWoodgrain },
        { field: "finish_class", op: "eq", value: "WOOD_GRAIN" },
      ],
      exclusive_group: "DOOR_FINISH", priority: 100, taxable: true, discountable: false,
    },
    {
      code: "RAIL_WOOD_GRAIN", description: "Ray sơn vân gỗ", basis: "LENGTH_M", rate_minor: money(55_000),
      conditions: [
        { field: "rail_type", op: "in", values: targetRails },
        { field: "finish_class", op: "eq", value: "WOOD_GRAIN" },
      ],
      exclusive_group: "RAIL_FINISH", priority: 100, taxable: true, discountable: false,
    },
    {
      code: "RAIL_OTHER_COLOR", description: "Sơn ray màu khác", basis: "LENGTH_M", rate_minor: money(15_000),
      conditions: [
        { field: "rail_type", op: "in", values: targetRails },
        { field: "finish_class", op: "eq", value: "OTHER_COLOR" },
      ],
      exclusive_group: "RAIL_FINISH", priority: 50, taxable: true, discountable: false,
    },
    {
      code: "V4_V5_POWDER", description: "Sơn tĩnh điện V4/V5", basis: "LENGTH_M", rate_minor: money(15_000),
      conditions: [
        { field: "profile_series", op: "in", values: ["V4", "V5"] },
        { field: "powder_coated", op: "eq", value: true },
      ],
      exclusive_group: "PROFILE_COATING", priority: 100, taxable: true, discountable: false,
    },
    {
      code: "AU_MEDIUM_SET", description: "Phụ thu cửa Úc trên 4 dưới 7 m2", basis: "SET_COUNT", rate_minor: money(300_000),
      conditions: [
        { field: "door_type", op: "eq", value: "Cửa Úc" },
        { field: "area_per_set_sqm", op: "gt", value: 4 },
        { field: "area_per_set_sqm", op: "lt", value: 7 },
      ],
      exclusive_group: "AU_SIZE", priority: 100, taxable: true, discountable: false,
    },
    {
      code: "SMALL_DOOR_TRANSPORT", description: "Vận chuyển cửa nhỏ", basis: "FIXED", rate_minor: money(300_000),
      conditions: [
        { field: "door_type", op: "in", values: ["Cửa Đức", "Cửa Lưới"] },
        { field: "area_per_set_sqm", op: "lt", value: 8 },
      ],
      scope: "UNRESOLVED", exclusive_group: "TRANSPORT", priority: 100, taxable: true, discountable: false,
    },
  ];
}
