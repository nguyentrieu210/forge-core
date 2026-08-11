import type { DocField, DocTypeMeta, DocTypeView } from "@metaforge/core";

function isLayout(fieldtype: string): boolean {
  return [
    "Section Break", "Column Break", "Tab Break", "Fold", "Heading", "HTML", "Button",
    "Table", "Table MultiSelect",
  ].includes(fieldtype);
}

function declaredFields(view: DocTypeView | undefined): string[] {
  const values = view?.columns?.length ? view.columns : view?.fields;
  return Array.isArray(values)
    ? values.map((value) => String(value ?? "").trim()).filter(Boolean)
    : [];
}

function fieldMap(meta: DocTypeMeta): Map<string, DocField> {
  return new Map((meta.fields ?? []).map((field) => [field.fieldname, field]));
}

function orderedFields(meta: DocTypeMeta, names: readonly string[]): DocField[] {
  const byName = fieldMap(meta);
  return names
    .map((name) => byName.get(name))
    .filter((field): field is DocField => Boolean(field) && !isLayout(field.fieldtype));
}

/**
 * Metadata-only presentation contract for a child table.
 *
 * `form.columns` (or `form.fields`) is the full spreadsheet/detail order.
 * `quickEntry.columns` is the compact order shown in the parent document.
 * `surface=internal` never renders as a business column; `surface=expanded` is available
 * in the full sheet/detail surface but does not clutter the compact entry surface.
 *
 * The resolver deliberately knows nothing about Sales Order, Purchase Order or Alumdoor.
 */
export function metadataChildGridColumns(
  meta: DocTypeMeta,
  expanded: boolean,
): DocField[] | null {
  const fullNames = declaredFields(meta.viewPolicy?.form);
  const compactNames = declaredFields(meta.viewPolicy?.quickEntry);
  const explicitNames = expanded
    ? fullNames
    : compactNames.length ? compactNames : fullNames;

  if (explicitNames.length) {
    return orderedFields(meta, explicitNames).filter((field) => field.surface !== "internal");
  }

  const fields = (meta.fields ?? []).filter((field) => !isLayout(field.fieldtype) && field.surface !== "internal");
  const hasSurfacePolicy = fields.some((field) => field.surface != null);
  if (!hasSurfacePolicy) return null;

  return fields.filter((field) => expanded
    ? field.surface === "quick" || field.surface === "expanded" || field.surface == null
    : field.surface === "quick" || field.surface == null);
}

/**
 * Returns compact-hidden columns only when metadata explicitly owns the grid policy.
 * `null` means the caller may use a legacy fallback during migration; an empty array means
 * metadata explicitly says that no displayed column is hidden.
 */
export function metadataChildGridHiddenColumns(
  meta: DocTypeMeta,
  columns: readonly DocField[],
  expanded: boolean,
): string[] | null {
  if (expanded) {
    return metadataChildGridColumns(meta, true) ? [] : null;
  }

  const compactNames = declaredFields(meta.viewPolicy?.quickEntry);
  if (compactNames.length) {
    const compact = new Set(compactNames);
    return columns.filter((field) => !compact.has(field.fieldname)).map((field) => field.fieldname);
  }

  const hasSurfacePolicy = (meta.fields ?? []).some((field) => field.surface != null);
  if (!hasSurfacePolicy) return null;
  return columns
    .filter((field) => field.surface === "expanded" || field.surface === "internal")
    .map((field) => field.fieldname);
}

/** True when metadata, rather than a doctype-specific client fallback, owns grid layout. */
export function hasMetadataChildGridPresentation(meta: DocTypeMeta): boolean {
  return declaredFields(meta.viewPolicy?.form).length > 0
    || declaredFields(meta.viewPolicy?.quickEntry).length > 0
    || (meta.fields ?? []).some((field) => field.surface != null);
}
