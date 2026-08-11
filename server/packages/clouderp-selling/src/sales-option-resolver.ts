import type { JsonObject } from "../../contracts/src/index.js";
import { errors } from "../../core/src/index.js";
import type { ControllerContext } from "../../document-kernel/src/index.js";
import { normalizePriceVariant, STANDARD_PRICE_VARIANT } from "../../clouderp-pricing/src/index.js";

export const SALES_OPTION_DOCTYPE = "Sales Option";

export interface ResolveSalesOptionInput {
  itemCode: string;
  itemMaster: Record<string, unknown>;
  facts: Record<string, unknown>;
  requestedOption?: string;
  legacySalesMode?: string;
  allowLegacyUnselected?: boolean;
}

export interface ResolvedSalesOption extends JsonObject {
  sales_option?: string;
  sales_option_code?: string;
  sales_option_label?: string;
  price_variant: string;
  discount_basis_variant: string;
  sales_mode?: string;
  sales_package?: string;
  option_version?: number;
}

interface Candidate {
  name: string;
  data: JsonObject;
  priority: number;
  specificity: number;
}

/**
 * Resolve a configured commercial option without teaching the shared runtime any vertical
 * labels. A Sales Option only selects commercial/fulfillment dimensions; pricing remains in
 * Item Price/Pricing Rule and package composition remains in Sales Package.
 */
export async function resolveSalesOption(
  context: ControllerContext<JsonObject>,
  input: ResolveSalesOptionInput,
): Promise<ResolvedSalesOption> {
  const all = await context.reader.listMasterRecordData(context.command.tenant_id, SALES_OPTION_DOCTYPE);
  const candidates = all
    .filter(({ data }) => !disabled(data.disabled))
    .filter(({ data }) => appliesToItem(data, input))
    .filter(({ data }) => conditionsMatch(data.conditions, input.facts))
    .map(({ name, data }) => ({
      name,
      data,
      priority: integer(data.priority),
      specificity: (text(data.item_code) ? 4 : 0) + (text(data.item_group) ? 2 : 0) + (data.conditions ? 1 : 0),
    }));

  if (candidates.length === 0) {
    return {
      price_variant: STANDARD_PRICE_VARIANT,
      discount_basis_variant: STANDARD_PRICE_VARIANT,
      ...(input.legacySalesMode ? { sales_mode: input.legacySalesMode } : {}),
    };
  }

  const requested = text(input.requestedOption);
  let selected: Candidate | undefined;
  if (requested) {
    selected = candidates.find((candidate) => candidate.name === requested || text(candidate.data.option_code) === requested);
    if (!selected) throw errors.reference(`Sales Option ${requested} is not applicable to Item ${input.itemCode}`);
  } else {
    // Legacy Trọn bộ/Tách món rows can be mapped deterministically if exactly one current
    // option declares that same sales_mode. Never guess between multiple same-mode options.
    const legacyMode = text(input.legacySalesMode);
    const modeMatches = legacyMode
      ? candidates.filter((candidate) => text(candidate.data.sales_mode) === legacyMode)
      : [];
    if (modeMatches.length === 1) selected = modeMatches[0];
    if (!selected) {
      const defaults = candidates.filter((candidate) => truthy(candidate.data.is_default));
      if (defaults.length > 1) throw errors.validation(`Item ${input.itemCode} has multiple default Sales Options`);
      selected = defaults[0];
    }
    if (!selected && input.allowLegacyUnselected) {
      return {
        price_variant: STANDARD_PRICE_VARIANT,
        discount_basis_variant: STANDARD_PRICE_VARIANT,
        ...(legacyMode ? { sales_mode: legacyMode } : {}),
      };
    }
    if (!selected) throw errors.validation(`Phương án bán là bắt buộc cho mặt hàng ${input.itemCode}`);
  }

  const competing = candidates
    .filter((candidate) => candidate.name !== selected!.name)
    .filter((candidate) => text(candidate.data.option_code) === text(selected!.data.option_code));
  if (competing.length) throw errors.validation(`Sales Option code ${text(selected.data.option_code)} is duplicated for Item ${input.itemCode}`);

  const canonical = await context.reader.getDocument<JsonObject>(context.command.tenant_id, SALES_OPTION_DOCTYPE, selected.name);
  const priceVariant = normalizePriceVariant(selected.data.price_variant);
  const discountBasisVariant = normalizePriceVariant(selected.data.discount_basis_variant ?? priceVariant);
  return {
    sales_option: selected.name,
    ...(text(selected.data.option_code) ? { sales_option_code: text(selected.data.option_code) } : {}),
    ...(text(selected.data.option_label) ? { sales_option_label: text(selected.data.option_label) } : {}),
    price_variant: priceVariant,
    discount_basis_variant: discountBasisVariant,
    ...(text(selected.data.sales_mode) ? { sales_mode: text(selected.data.sales_mode) } : {}),
    ...(text(selected.data.sales_package) ? { sales_package: text(selected.data.sales_package) } : {}),
    ...(canonical ? { option_version: canonical.version } : {}),
  };
}

function appliesToItem(data: JsonObject, input: ResolveSalesOptionInput): boolean {
  const itemCode = text(data.item_code);
  if (itemCode && itemCode !== input.itemCode) return false;
  const itemGroup = text(data.item_group);
  if (itemGroup && normalized(itemGroup) !== normalized(input.itemMaster.item_group)) return false;
  return true;
}

function conditionsMatch(value: unknown, facts: Record<string, unknown>): boolean {
  if (value === undefined || value === null || value === "") return true;
  let rows: unknown = value;
  if (typeof value === "string") {
    try { rows = JSON.parse(value); } catch { throw errors.validation("Sales Option.conditions must be valid JSON"); }
  }
  if (!Array.isArray(rows)) throw errors.validation("Sales Option.conditions must be an array");
  return rows.every((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw errors.validation(`Sales Option condition ${index + 1} must be an object`);
    const row = entry as JsonObject;
    const field = text(row.field ?? row.fieldname);
    const op = text(row.operator ?? row.op) || "eq";
    if (!field) throw errors.validation(`Sales Option condition ${index + 1} requires field`);
    const actual = comparable(facts[field]);
    if (op === "in" || op === "not_in") {
      if (!Array.isArray(row.values)) throw errors.validation(`Sales Option condition ${index + 1}.values must be an array`);
      const matched = row.values.map(comparable).some((value) => value === actual);
      return op === "in" ? matched : !matched;
    }
    const expected = comparable(row.value);
    if (op === "eq") return actual === expected;
    if (op === "neq") return actual !== expected;
    const left = Number(actual);
    const right = Number(expected);
    if (!Number.isFinite(left) || !Number.isFinite(right)) return false;
    if (op === "lt") return left < right;
    if (op === "lte") return left <= right;
    if (op === "gt") return left > right;
    if (op === "gte") return left >= right;
    throw errors.validation(`Sales Option condition ${index + 1} has invalid operator ${op}`);
  });
}

function integer(value: unknown): number {
  if (value === undefined || value === null || value === "") return 0;
  const number = Number(value);
  if (!Number.isInteger(number)) throw errors.validation("Sales Option.priority must be an integer");
  return number;
}

function truthy(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || ["true", "yes", "có", "co"].includes(normalized(value));
}

function disabled(value: unknown): boolean {
  return truthy(value);
}

function text(value: unknown): string {
  return typeof value === "string" ? value.normalize("NFC").trim() : "";
}

function normalized(value: unknown): string {
  return String(value ?? "").normalize("NFC").trim().toLocaleLowerCase("vi");
}

function comparable(value: unknown): string | number | boolean | null {
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "string") return normalized(value);
  return value == null ? null : normalized(value);
}
