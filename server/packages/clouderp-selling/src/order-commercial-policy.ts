import type { JsonObject } from "../../contracts/src/index.js";
import { errors } from "../../core/src/index.js";
import type { ControllerContext } from "../../document-kernel/src/index.js";
import { fromScaledInt, multiplyScaled, toScaledInt } from "../../money/src/index.js";
import { alumdoorOrderTotals } from "./controllers.js";
import type { SalesItem, SalesOrderData, TaxRow } from "./types.js";

export type OrderAggregateFunction = "SUM";
export type OrderAggregateOperator = "lt" | "lte" | "gt" | "gte" | "eq" | "neq";

export interface AppliedOrderPricingAdjustment extends JsonObject {
  rule_name: string;
  rule_version?: number;
  pricing_scope?: string;
  aggregate_function: OrderAggregateFunction;
  aggregate_field: string;
  aggregate_operator: OrderAggregateOperator;
  aggregate_threshold: number;
  aggregate_value: number;
  eligible_line_count: number;
  amount_minor: number;
  taxable: boolean;
  discountable: boolean;
  exclusive_group?: string;
}

interface Candidate {
  name: string;
  data: JsonObject;
  priority: number;
  specificity: number;
  exclusiveGroup: string;
  aggregateValue: number;
  eligibleLineCount: number;
}

interface LineContext {
  line: SalesItem;
  itemGroup: string;
}

/**
 * Resolve header-level commercial charges after canonical line pricing.
 *
 * ORDER rules deliberately use a distinct effect_type (ORDER_ADJUSTMENT). The line pricing
 * engine does not recognise that effect, so an order aggregate can never be accidentally
 * charged once per row. The first supported slice is a non-discountable FIXED charge driven
 * by SUM over a Pricing Scope; more order effects can extend this contract without teaching
 * React or an Alumdoor-specific controller new money formulas.
 */
export async function resolveOrderCommercialPricingPolicy(
  context: ControllerContext<JsonObject>,
  data: SalesOrderData,
): Promise<AppliedOrderPricingAdjustment[]> {
  const records = await context.reader.listMasterRecordData(context.command.tenant_id, "Pricing Rule");
  const orderRules = records.filter(({ data: rule }) =>
    !disabled(rule.disabled)
    && normalized(rule.rule_level) === "order"
    && text(rule.effect_type).toUpperCase() === "ORDER_ADJUSTMENT");
  if (orderRules.length === 0) return [];

  const itemMasters = new Map<string, JsonObject | null>();
  const lines: LineContext[] = [];
  for (const line of data.items) {
    let master = itemMasters.get(line.item_code);
    if (master === undefined) {
      master = await context.reader.getMasterRecordData(context.command.tenant_id, "Item", line.item_code);
      itemMasters.set(line.item_code, master);
    }
    lines.push({ line, itemGroup: text(master?.item_group) });
  }

  const scopes = new Map<string, JsonObject | null>();
  const candidates: Candidate[] = [];
  for (const record of orderRules) {
    const rule = record.data;
    if (!headerMatches(rule, data)) continue;
    const scopeName = text(rule.pricing_scope);
    let scope: JsonObject | null = null;
    if (scopeName) {
      scope = scopes.get(scopeName) ?? undefined as unknown as JsonObject | null;
      if (scope === undefined) {
        scope = await context.reader.getMasterRecordData(context.command.tenant_id, "Pricing Scope", scopeName);
        scopes.set(scopeName, scope);
      }
      if (!scope || disabled(scope.disabled)) continue;
    }

    const eligible = lines.filter((entry) => lineMatchesRule(entry, rule, scope));
    if (eligible.length === 0) continue;
    const aggregateFunction = text(rule.aggregate_function).toUpperCase() || "SUM";
    if (aggregateFunction !== "SUM") throw errors.validation(`${record.name}: unsupported order aggregate ${aggregateFunction}`);
    const aggregateField = text(rule.aggregate_field);
    if (!aggregateField) throw errors.validation(`${record.name}: aggregate_field is required for ORDER Pricing Rule`);
    const aggregateValue = sumAggregate(eligible, aggregateField, record.name);
    const operator = orderOperator(rule.aggregate_operator, record.name);
    const threshold = finiteNumber(rule.aggregate_value, `${record.name}.aggregate_value`);
    if (!compare(aggregateValue, operator, threshold)) continue;

    const basis = text(rule.adjustment_basis).toUpperCase() || "FIXED";
    if (basis !== "FIXED") throw errors.validation(`${record.name}: ORDER adjustment currently requires FIXED basis`);
    if (rule.discountable === true || rule.discountable === 1) {
      throw errors.validation(`${record.name}: ORDER adjustment is not discountable in this release`);
    }

    candidates.push({
      name: record.name,
      data: rule,
      priority: integer(rule.priority, 0),
      specificity: (scopeName ? 8 : 0) + (text(rule.item_code) ? 4 : 0) + (text(rule.item_group) ? 2 : 0)
        + (text(rule.customer_group) || text(rule.party) ? 1 : 0),
      exclusiveGroup: text(rule.exclusive_group),
      aggregateValue,
      eligibleLineCount: eligible.length,
    });
  }

  const selected = selectAdjustments(candidates);
  const scale = currencyScale(data);
  const applied: AppliedOrderPricingAdjustment[] = [];
  for (const candidate of selected) {
    const rate = candidate.data.adjustment_rate ?? candidate.data.effect_value ?? candidate.data.rate;
    const amountMinor = moneyMinor(rate, scale, `${candidate.name}.adjustment_rate`);
    const canonical = await context.reader.getDocument<JsonObject>(context.command.tenant_id, "Pricing Rule", candidate.name);
    applied.push({
      rule_name: candidate.name,
      ...(canonical ? { rule_version: canonical.version } : {}),
      ...(text(candidate.data.pricing_scope) ? { pricing_scope: text(candidate.data.pricing_scope) } : {}),
      aggregate_function: "SUM",
      aggregate_field: text(candidate.data.aggregate_field),
      aggregate_operator: orderOperator(candidate.data.aggregate_operator, candidate.name),
      aggregate_threshold: finiteNumber(candidate.data.aggregate_value, `${candidate.name}.aggregate_value`),
      aggregate_value: candidate.aggregateValue,
      eligible_line_count: candidate.eligibleLineCount,
      amount_minor: amountMinor,
      taxable: candidate.data.taxable !== false && candidate.data.taxable !== 0,
      discountable: false,
      ...(candidate.exclusiveGroup ? { exclusive_group: candidate.exclusiveGroup } : {}),
    });
  }
  return applied;
}

/**
 * Apply resolved ORDER charges to Sales Order header totals without contaminating line money.
 * Line net amounts stay unchanged; the charge is added once to grand total and to the taxable
 * running base. This is exactly the semantic needed by order freight and keeps audit snapshots
 * separate from per-line Pricing Rule snapshots.
 */
export async function applyOrderCommercialPricingPolicy(
  context: ControllerContext<JsonObject>,
  data: SalesOrderData,
): Promise<SalesOrderData> {
  const adjustments = await resolveOrderCommercialPricingPolicy(context, data);
  const result = { ...data } as SalesOrderData;
  if (adjustments.length === 0) {
    delete result.order_adjustments;
    delete result.order_pricing_rule_snapshots;
    delete result.order_pricing_as_of;
    delete result.order_adjustment_amount;
    delete result.order_adjustment_amount_minor;
    return result;
  }

  const scale = currencyScale(data);
  const orderMinor = sumSafe(adjustments.map((row) => row.amount_minor), "order adjustments");
  const taxableMinor = sumSafe(adjustments.filter((row) => row.taxable).map((row) => row.amount_minor), "taxable order adjustments");
  const taxRows = data.taxes ?? [];
  if (taxRows.length > 0 && taxableMinor !== orderMinor) {
    throw errors.validation("Mixed taxable/non-taxable ORDER adjustments with tax rows are not supported in this release");
  }

  const netMinor = trustedMinor(data.net_total_minor, data.net_total, scale, "net_total");
  const oldTaxMinor = trustedMinor(data.total_taxes_and_charges_minor, data.total_taxes_and_charges, scale, "total_taxes_and_charges");
  const oldGrandMinor = trustedMinor(data.grand_total_minor, data.grand_total, scale, "grand_total");
  const taxResult = applyTaxableHeaderCharge(taxRows, netMinor, taxableMinor, scale);
  const taxDelta = safeAdd(taxResult.totalTaxMinor, -oldTaxMinor, "order tax delta");

  const hasVatProjection = data.vat_rate !== undefined || data.total_amount !== undefined || data.vat_amount !== undefined;
  let vatDelta = 0;
  let vatProjection: JsonObject = {};
  if (hasVatProjection) {
    const discountMinor = trustedMinor(data.discount_amount_minor, data.discount_amount, scale, "discount_amount");
    const oldProjection = alumdoorOrderTotals({
      netTotalMinor: netMinor,
      discountAmountMinor: discountMinor,
      vatRate: data.vat_rate,
      surchargeMinor: 0,
      currencyScale: scale,
    });
    const nextProjection = alumdoorOrderTotals({
      netTotalMinor: netMinor,
      discountAmountMinor: discountMinor,
      vatRate: data.vat_rate,
      surchargeMinor: orderMinor,
      currencyScale: scale,
    });
    vatDelta = safeAdd(safeAdd(nextProjection.extraMinor, -oldProjection.extraMinor, "VAT order delta"), -orderMinor, "VAT order delta");
    const { extraMinor: _ignored, ...projection } = nextProjection;
    vatProjection = projection;
  }

  const grandMinor = sumSafe([oldGrandMinor, orderMinor, taxDelta, vatDelta], "grand total with order adjustment");
  const surchargeMinor = sumSafe([
    trustedMinor(data.surcharge_amount_minor, data.surcharge_amount, scale, "surcharge_amount"),
    orderMinor,
  ], "surcharge total");
  const base = convertBaseTotals(data, taxResult.totalTaxMinor, grandMinor, scale);

  return {
    ...result,
    taxes: taxResult.rows,
    total_taxes_and_charges_minor: taxResult.totalTaxMinor,
    total_taxes_and_charges: fromScaledInt(taxResult.totalTaxMinor, scale),
    grand_total_minor: grandMinor,
    grand_total: fromScaledInt(grandMinor, scale),
    rounded_total_minor: grandMinor,
    rounded_total: fromScaledInt(grandMinor, scale),
    surcharge_amount_minor: surchargeMinor,
    surcharge_amount: fromScaledInt(surchargeMinor, scale),
    order_adjustment_amount_minor: orderMinor,
    order_adjustment_amount: fromScaledInt(orderMinor, scale),
    order_adjustments: adjustments,
    order_pricing_rule_snapshots: structuredClone(adjustments),
    order_pricing_as_of: data.transaction_date,
    ...vatProjection,
    ...base,
  } as SalesOrderData;
}

function headerMatches(rule: JsonObject, data: SalesOrderData): boolean {
  if (text(rule.price_list) && text(rule.price_list) !== text(data.selling_price_list)) return false;
  if (text(rule.currency) && text(rule.currency) !== text(data.currency)) return false;
  if (text(rule.party_type) && text(rule.party_type) !== "Customer") return false;
  if (text(rule.party) && text(rule.party) !== text(data.customer)) return false;
  if (text(rule.customer_group) && normalized(rule.customer_group) !== normalized(data.customer_group)) return false;
  const day = data.transaction_date.slice(0, 10);
  if (text(rule.valid_from) && day < text(rule.valid_from).slice(0, 10)) return false;
  if (text(rule.valid_upto) && day > text(rule.valid_upto).slice(0, 10)) return false;
  return true;
}

function lineMatchesRule(entry: LineContext, rule: JsonObject, scope: JsonObject | null): boolean {
  if (text(rule.item_code) && text(rule.item_code) !== entry.line.item_code) return false;
  if (text(rule.item_group) && normalized(rule.item_group) !== normalized(entry.itemGroup)) return false;
  if (!scope) return true;
  return tableRows(scope.members).some((row) => {
    const memberType = text(row.member_type) || (text(row.item_code) ? "Item" : "Item Group");
    if (memberType === "Item") return text(row.item_code) === entry.line.item_code;
    if (memberType === "Item Group") return normalized(row.item_group) === normalized(entry.itemGroup);
    return false;
  });
}

function sumAggregate(lines: LineContext[], field: string, ruleName: string): number {
  let total = 0;
  for (const { line } of lines) {
    const raw = aggregateValue(line, field);
    if (raw === undefined) continue;
    total += raw;
    if (!Number.isFinite(total)) throw errors.validation(`${ruleName}: aggregate exceeds numeric bounds`);
  }
  return Number(total.toFixed(6));
}

function aggregateValue(line: SalesItem, field: string): number | undefined {
  if (field === "priced_qty") {
    const micros = (line as JsonObject).priced_qty_micros;
    if (typeof micros === "number" && Number.isSafeInteger(micros) && micros > 0) return micros / 1_000_000;
    return positive(line.qty);
  }
  if (field === "qty") return positive(line.qty);
  if (!["billable_area_sqm", "set_count", "length_m"].includes(field)) {
    throw errors.validation(`Unsupported ORDER aggregate_field ${field}`);
  }
  return positive((line as JsonObject)[field]);
}

function applyTaxableHeaderCharge(
  taxes: TaxRow[],
  netMinor: number,
  chargeMinor: number,
  scale: number,
): { rows: TaxRow[]; totalTaxMinor: number } {
  if (taxes.length === 0 || chargeMinor === 0) {
    return { rows: taxes.map((row) => ({ ...row })), totalTaxMinor: sumSafe(taxes.map((row) => taxMinor(row, scale)), "tax total") };
  }
  if (taxes.some((row) => row.included_in_print_rate === true)) {
    throw errors.validation("ORDER adjustment with included-in-print-rate tax is not supported in this release");
  }

  let oldRunning = netMinor;
  let newRunning = safeAdd(netMinor, chargeMinor, "tax running total with order adjustment");
  const rows: TaxRow[] = [];
  for (const [index, row] of taxes.entries()) {
    const oldAmount = taxMinor(row, scale);
    const type = row.charge_type ?? "On Net Total";
    let delta = 0;
    if (type === "On Net Total") {
      delta = percentageOfMinor(chargeMinor, row.rate, `${index + 1}.order_tax`);
    } else if (type === "On Previous Row Total") {
      delta = percentageOfMinor(safeAdd(newRunning, -oldRunning, "previous-row order tax base"), row.rate, `${index + 1}.order_tax`);
    } else if (type !== "Actual" && type !== "On Item Quantity") {
      throw errors.validation(`Unsupported tax charge_type ${String(type)}`);
    }
    const signedDelta = row.add_deduct_tax === "Deduct" ? -delta : delta;
    const nextAmount = safeAdd(oldAmount, signedDelta, `taxes[${index}].tax_amount`);
    oldRunning = safeAdd(oldRunning, oldAmount, "old tax running total");
    newRunning = safeAdd(newRunning, nextAmount, "new tax running total");
    rows.push({
      ...row,
      tax_amount_minor: nextAmount,
      tax_amount: fromScaledInt(nextAmount, scale),
      total_minor: newRunning,
      total: fromScaledInt(newRunning, scale),
    });
  }
  return { rows, totalTaxMinor: sumSafe(rows.map((row) => row.tax_amount_minor ?? 0), "tax total") };
}

function convertBaseTotals(
  data: SalesOrderData,
  taxMinor: number,
  grandMinor: number,
  sourceScale: number,
): JsonObject {
  const companyScale = typeof data.company_currency_scale === "number" ? data.company_currency_scale : sourceScale;
  const rateMicros = typeof data.conversion_rate_micros === "number" ? data.conversion_rate_micros : 1_000_000;
  const baseTax = convertMinor(taxMinor, sourceScale, rateMicros, companyScale, "base tax total");
  const baseGrand = convertMinor(grandMinor, sourceScale, rateMicros, companyScale, "base grand total");
  return {
    base_total_taxes_and_charges_minor: baseTax,
    base_total_taxes_and_charges: fromScaledInt(baseTax, companyScale),
    base_grand_total_minor: baseGrand,
    base_grand_total: fromScaledInt(baseGrand, companyScale),
  };
}

function convertMinor(amountMinor: number, sourceScale: number, rateMicros: number, targetScale: number, field: string): number {
  return multiplyScaled(fromScaledInt(amountMinor, sourceScale), sourceScale, fromScaledInt(rateMicros, 6), 6, targetScale, field);
}

function selectAdjustments(candidates: Candidate[]): Candidate[] {
  const plain = candidates.filter((candidate) => !candidate.exclusiveGroup);
  const grouped = new Map<string, Candidate[]>();
  for (const candidate of candidates) {
    if (!candidate.exclusiveGroup) continue;
    const bucket = grouped.get(candidate.exclusiveGroup) ?? [];
    bucket.push(candidate);
    grouped.set(candidate.exclusiveGroup, bucket);
  }
  const selected = [...plain];
  for (const [group, rows] of grouped) {
    const sorted = [...rows].sort(compareCandidates);
    const first = sorted[0]!;
    const tied = sorted.filter((candidate) => candidate.priority === first.priority && candidate.specificity === first.specificity);
    if (tied.length > 1) throw errors.validation(`Multiple ORDER Pricing Rules tie in ${group}: ${tied.map((row) => row.name).join(", ")}`);
    selected.push(first);
  }
  return selected.sort((left, right) => left.name.localeCompare(right.name));
}

function compareCandidates(left: Candidate, right: Candidate): number {
  return (right.priority - left.priority) || (right.specificity - left.specificity) || left.name.localeCompare(right.name);
}

function tableRows(value: unknown): JsonObject[] {
  let rows = value;
  if (typeof rows === "string" && rows.trim()) {
    try { rows = JSON.parse(rows); } catch { return []; }
  }
  if (!Array.isArray(rows)) return [];
  return rows.filter((row): row is JsonObject => Boolean(row) && typeof row === "object" && !Array.isArray(row));
}

function orderOperator(value: unknown, ruleName: string): OrderAggregateOperator {
  const op = text(value) as OrderAggregateOperator;
  if (!["lt", "lte", "gt", "gte", "eq", "neq"].includes(op)) throw errors.validation(`${ruleName}: invalid aggregate_operator`);
  return op;
}

function compare(actual: number, operator: OrderAggregateOperator, expected: number): boolean {
  if (operator === "lt") return actual < expected;
  if (operator === "lte") return actual <= expected;
  if (operator === "gt") return actual > expected;
  if (operator === "gte") return actual >= expected;
  if (operator === "eq") return actual === expected;
  return actual !== expected;
}

function percentageOfMinor(amountMinor: number, rate: unknown, field: string): number {
  const pctMicros = toScaledInt(rate as string | number, 6, field);
  if (pctMicros < 0) throw errors.validation(`${field}: rate cannot be negative`);
  const value = Number((BigInt(amountMinor) * BigInt(pctMicros) + 50_000_000n) / 100_000_000n);
  if (!Number.isSafeInteger(value)) throw errors.validation(`${field}: tax amount exceeds safe integer range`);
  return value;
}

function taxMinor(row: TaxRow, scale: number): number {
  if (typeof row.tax_amount_minor === "number") return row.tax_amount_minor;
  if (row.tax_amount === undefined) return 0;
  return toScaledInt(row.tax_amount, scale, "tax_amount");
}

function trustedMinor(minor: unknown, value: unknown, scale: number, field: string): number {
  if (typeof minor === "number" && Number.isSafeInteger(minor)) return minor;
  if (value === undefined || value === null || value === "") return 0;
  return toScaledInt(value as string | number, scale, field);
}

function currencyScale(data: SalesOrderData): number {
  const scale = data.currency_scale;
  if (typeof scale !== "number" || !Number.isInteger(scale) || scale < 0 || scale > 6) return 2;
  return scale;
}

function moneyMinor(value: unknown, scale: number, label: string): number {
  if (typeof value !== "string" && typeof value !== "number") throw errors.validation(`${label} must be numeric`);
  const minor = toScaledInt(value, scale, label);
  if (minor < 0) throw errors.validation(`${label} cannot be negative`);
  return minor;
}

function finiteNumber(value: unknown, label: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw errors.validation(`${label} must be numeric`);
  return parsed;
}

function integer(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw errors.validation("Pricing Rule.priority must be an integer");
  return parsed;
}

function positive(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function sumSafe(values: number[], field: string): number {
  let total = 0;
  for (const value of values) {
    if (!Number.isSafeInteger(value)) throw errors.validation(`${field} contains an unsafe integer`);
    total += value;
    if (!Number.isSafeInteger(total)) throw errors.validation(`${field} exceeds safe integer range`);
  }
  return total;
}

function safeAdd(left: number, right: number, field: string): number {
  return sumSafe([left, right], field);
}

function disabled(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || ["true", "yes", "có", "co"].includes(normalized(value));
}

function normalized(value: unknown): string {
  return String(value ?? "").normalize("NFC").trim().toLocaleLowerCase("vi");
}

function text(value: unknown): string {
  return typeof value === "string" ? value.normalize("NFC").trim() : "";
}
