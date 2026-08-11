import { parseField } from "./compile-brief.mjs";

const SALES_COMPACT_FIELDS = [
  "item_code", "color", "sales_mode", "height_m", "width_m", "set_count", "has_butterfly_bracket",
  "length_m", "qty_bar", "uom", "qty", "rate", "discount_percentage", "amount",
];

const SALES_FULL_FIELDS = [
  "item_code", "color", "sales_mode", "height_m", "width_m", "set_count",
  "leaf_variant", "single_layer_leaf_count", "double_layer_leaf_count", "cut_width_m", "billable_area_sqm",
  "formula_policy", "formula_version", "length_m", "qty_bar", "uom", "qty", "rate",
  "discount_percentage", "amount", "note",
];

const PURCHASE_COMPACT_FIELDS = ["item_code", "qty", "uom", "rate", "amount"];
const PURCHASE_ORDER_FULL_FIELDS = [
  "item_code", "length_m", "theoretical_kg_per_m", "qty_bundle", "qty_bar", "theoretical_kg",
  "qty", "uom", "rate", "amount", "color", "is_stamped", "so_no", "warehouse", "note",
];
const PURCHASE_RECEIPT_FULL_FIELDS = [
  "item_code", "length_m", "qty_bundle", "qty_bar", "qty", "uom", "rate", "amount",
  "theoretical_kg", "actual_weight_kg", "color", "is_stamped", "so_no", "warehouse", "purchase_order", "note",
];

const EXACT = new Map([
  ["Quotation Item", { quick: SALES_COMPACT_FIELDS, full: SALES_FULL_FIELDS }],
  ["Sales Order Item", { quick: SALES_COMPACT_FIELDS, full: SALES_FULL_FIELDS }],
  ["Purchase Order Item", { quick: PURCHASE_COMPACT_FIELDS, full: PURCHASE_ORDER_FULL_FIELDS }],
  ["Purchase Receipt Item", { quick: PURCHASE_COMPACT_FIELDS, full: PURCHASE_RECEIPT_FULL_FIELDS }],
]);

function isLayout(fieldtype) {
  return ["Heading", "Section Break", "Column Break", "HTML", "Tab Break", "Fold", "Button"].includes(fieldtype);
}

function fieldObjects(doctype) {
  return (doctype.fields ?? []).map((field, index) => parseField(field, index, doctype.name));
}

function existing(names, fieldNames) {
  return names.filter((fieldname) => fieldNames.has(fieldname));
}

function requiredEditableNames(fields, full) {
  const allowed = new Set(full);
  return fields
    .filter((field) => allowed.has(field.fieldname) && field.required && !field.read_only && !field.hidden && !isLayout(field.fieldtype))
    .map((field) => field.fieldname);
}

function closeQuickOverRequired(fields, full, preferredQuick) {
  const wanted = new Set([...preferredQuick, ...requiredEditableNames(fields, full)]);
  return full.filter((fieldname) => wanted.has(fieldname));
}

/**
 * `surface` describes how a field itself behaves; it is not a grid-membership flag.
 * `form.fields`/`quickEntry.fields` decide whether the field is shown in this table view.
 */
function exactSurface(field, policy) {
  if (field.hidden || isLayout(field.fieldtype)) return "internal";
  return policy.quick.includes(field.fieldname) ? "quick" : "expanded";
}

function defaultSurface(field, listed) {
  if (field.hidden || isLayout(field.fieldtype)) return "internal";
  if (field.required || listed.has(field.fieldname)) return "quick";
  return "expanded";
}

function genericPolicy(fields, listed) {
  const renderable = fields.filter((field) => !field.hidden && !isLayout(field.fieldtype));
  const full = renderable.map((field) => field.fieldname);
  let quick = renderable
    .filter((field) => field.required || listed.has(field.fieldname))
    .map((field) => field.fieldname);
  if (!quick.length && full.length) quick = [full[0]];
  return { quick, full };
}

/**
 * Make the presentation contract explicit in the Alumdoor source brief.
 *
 * This mutates only child-table presentation. It never changes field order, type, validation,
 * permissions, formulas, defaults or business values. The brief UI-policy adapter attaches the
 * authored form/quickEntry field order to canonical viewPolicy after base compilation.
 */
export function applyAlumdoorChildPresentation(brief) {
  if (!brief || !Array.isArray(brief.doctypes)) return { migrated: 0, doctypes: [] };
  const migrated = [];
  for (const doctype of brief.doctypes) {
    if (!doctype || doctype.child !== true) continue;
    const fields = fieldObjects(doctype);
    const fieldNames = new Set(fields.map((field) => field.fieldname));
    const listed = new Set(doctype.list ?? []);
    const declared = EXACT.get(doctype.name);
    const policy = declared
      ? (() => {
          const full = existing(declared.full, fieldNames);
          const visible = new Set(full);
          const preferredQuick = existing(declared.quick, fieldNames).filter((fieldname) => visible.has(fieldname));
          return { quick: closeQuickOverRequired(fields, full, preferredQuick), full };
        })()
      : genericPolicy(fields, listed);

    doctype.fields = fields.map((field) => ({
      ...field,
      surface: declared ? exactSurface(field, policy) : defaultSurface(field, listed),
    }));
    doctype.form = { fields: policy.full };
    doctype.quickEntry = { fields: policy.quick };
    migrated.push(doctype.name);
  }
  return { migrated: migrated.length, doctypes: migrated };
}

export const alumdoorGoldenChildGridPolicies = Object.freeze({
  salesCompact: [...SALES_COMPACT_FIELDS],
  salesFull: [...SALES_FULL_FIELDS],
  purchaseCompact: [...PURCHASE_COMPACT_FIELDS],
  purchaseOrderFull: [...PURCHASE_ORDER_FULL_FIELDS],
  purchaseReceiptFull: [...PURCHASE_RECEIPT_FULL_FIELDS],
});
