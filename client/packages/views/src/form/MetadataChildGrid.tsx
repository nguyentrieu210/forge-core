/** @jsxImportSource react */
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { resolveField, type Doc, type DocField, type DocTypeMeta, type DocTypeView } from "@metaforge/core";
import { FallbackControl } from "@metaforge/controls";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@metaforge/ui";
import {
  ChildGrid as LegacyChildGrid,
  type ChildGridProps,
} from "./ChildGridWithExtensions.js";
import {
  hasMetadataChildGridPresentation,
  metadataChildGridColumns,
} from "./child-grid-presentation.js";

interface ChildRowPreviewResult {
  patch?: Record<string, unknown>;
  clear?: string[];
  field_overrides?: Record<string, Partial<DocField>>;
  source?: string;
  message?: string;
}

function dynamicLinkTarget(field: DocField, row: Doc): string | undefined {
  if (field.fieldtype === "Link") return field.options;
  if (field.fieldtype !== "Dynamic Link" || !field.options) return undefined;
  const target = row[field.options];
  return typeof target === "string" && target.trim() ? target.trim() : undefined;
}

function newRow(meta: DocTypeMeta, rowDefaults?: Record<string, unknown>): Doc {
  const row: Doc = {
    name: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    doctype: meta.name,
  } as Doc;
  for (const field of meta.fields ?? []) {
    if (field.default !== undefined && field.default !== null && field.default !== "") {
      row[field.fieldname] = field.default;
    }
  }
  if (rowDefaults) {
    const fieldNames = new Set((meta.fields ?? []).map((field) => field.fieldname));
    for (const [key, value] of Object.entries(rowDefaults)) {
      if (fieldNames.has(key) && (row[key] === undefined || row[key] === null || row[key] === "")) row[key] = value;
    }
  }
  return row;
}

function label(field: DocField): string {
  return field.label || field.fieldname;
}

function rowKey(row: Doc, index: number): string {
  return String(row.name ?? `row-${index}`);
}

function viewPreviewMethod(view: DocTypeView | undefined): string {
  return typeof view?.previewMethod === "string" ? view.previewMethod.trim() : "";
}

function viewPreviewParentFields(view: DocTypeView | undefined): string[] {
  return Array.isArray(view?.previewParentFields)
    ? view.previewParentFields.map((value) => String(value ?? "").trim()).filter(Boolean)
    : [];
}

/**
 * Business-neutral child-table renderer.
 *
 * Metadata owns columns and may declare a server preview method. The renderer only sends the
 * parent/row snapshot and merges the returned patch; it contains no pricing, UOM, door, purchase
 * or inventory formulas. Doctypes without explicit presentation ownership retain the mature
 * legacy grid unchanged during migration.
 */
export function MetadataChildGrid(props: ChildGridProps) {
  const { childMeta, rows, onChange, registry, services, readOnly, parentDoc, roles, rowDefaults } = props;
  const ownsPresentation = hasMetadataChildGridPresentation(childMeta);
  const [expanded, setExpanded] = useState(false);
  const [previewErrorByRow, setPreviewErrorByRow] = useState<Record<string, string>>({});
  const [fieldOverridesByRow, setFieldOverridesByRow] = useState<Record<string, Record<string, Partial<DocField>>>>({});
  const latestRows = useRef(rows);
  const previewVersion = useRef(new Map<string, number>());

  useEffect(() => {
    latestRows.current = rows;
  }, [rows]);

  const compact = useMemo(
    () => ownsPresentation ? (metadataChildGridColumns(childMeta, false) ?? []) : [],
    [childMeta, ownsPresentation],
  );
  const full = useMemo(
    () => ownsPresentation ? (metadataChildGridColumns(childMeta, true) ?? compact) : [],
    [childMeta, compact, ownsPresentation],
  );
  const activeView = expanded ? childMeta.viewPolicy?.form : childMeta.viewPolicy?.quickEntry ?? childMeta.viewPolicy?.form;
  const previewMethod = viewPreviewMethod(activeView);
  const previewParentFields = viewPreviewParentFields(activeView);
  const previewParentKey = useMemo(() => JSON.stringify(previewParentFields.map((fieldname) => [fieldname, parentDoc?.[fieldname]])), [parentDoc, previewParentFields.join("\u0000")]);
  const childFields = useMemo(() => (childMeta.fields ?? []).map((field) => field.fieldname), [childMeta.fields]);

  if (!ownsPresentation) return <LegacyChildGrid {...props} />;

  const emitRows = (next: Doc[]) => {
    latestRows.current = next;
    onChange(next);
  };

  const runPreview = async (rowIndex: number, row: Doc, changedField: string) => {
    if (!previewMethod || !services?.callPost) return;
    const key = rowKey(row, rowIndex);
    const version = (previewVersion.current.get(key) ?? 0) + 1;
    previewVersion.current.set(key, version);
    try {
      const result = await services.callPost<ChildRowPreviewResult>(previewMethod, {
        parent_doctype: String(parentDoc?.doctype ?? ""),
        child_doctype: childMeta.name,
        parent: parentDoc ?? {},
        row,
        changed_field: changedField,
        child_fields: childFields,
      });
      if (previewVersion.current.get(key) !== version) return;
      const current = latestRows.current;
      const currentIndex = current.findIndex((entry, index) => rowKey(entry, index) === key);
      if (currentIndex < 0) return;
      const nextRow: Doc = { ...current[currentIndex] } as Doc;
      for (const fieldname of result.clear ?? []) {
        if (childFields.includes(fieldname)) nextRow[fieldname] = undefined;
      }
      for (const [fieldname, value] of Object.entries(result.patch ?? {})) {
        if (childFields.includes(fieldname)) nextRow[fieldname] = value;
      }
      const next = current.map((entry, index) => index === currentIndex ? nextRow : entry);
      emitRows(next);
      setFieldOverridesByRow((currentOverrides) => ({
        ...currentOverrides,
        [key]: result.field_overrides ?? {},
      }));
      setPreviewErrorByRow((currentErrors) => {
        if (!currentErrors[key]) return currentErrors;
        const nextErrors = { ...currentErrors };
        delete nextErrors[key];
        return nextErrors;
      });
    } catch (error) {
      if (previewVersion.current.get(key) !== version) return;
      const message = error instanceof Error ? error.message : "Không preview được dòng chứng từ.";
      setPreviewErrorByRow((current) => ({ ...current, [key]: message }));
    }
  };

  useEffect(() => {
    if (!previewMethod || !services?.callPost || !previewParentFields.length) return;
    latestRows.current.forEach((row, index) => {
      if (row.item_code) void runPreview(index, row, "__parent__");
    });
    // `previewParentKey` is the declarative dependency; row edits invoke preview directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewMethod, previewParentKey]);

  const columns = expanded ? full : compact;
  const canExpand = full.some((field) => !compact.some((compactField) => compactField.fieldname === field.fieldname));

  const setCell = (rowIndex: number, fieldname: string, value: unknown) => {
    const current = latestRows.current;
    const next = current.map((row, index) => index === rowIndex ? { ...row, [fieldname]: value } : row) as Doc[];
    emitRows(next);
    const changed = next[rowIndex];
    if (changed) void runPreview(rowIndex, changed, fieldname);
  };
  const addRow = () => emitRows([...latestRows.current, newRow(childMeta, rowDefaults)]);
  const removeRow = (rowIndex: number) => emitRows(latestRows.current.filter((_, index) => index !== rowIndex));

  const fieldForRow = (row: Doc, rowIndex: number, field: DocField): DocField => {
    const key = rowKey(row, rowIndex);
    const override = fieldOverridesByRow[key]?.[field.fieldname];
    return override ? ({ ...field, ...override } as DocField) : field;
  };

  const renderControl = (row: Doc, rowIndex: number, field: DocField) => {
    const effective = fieldForRow(row, rowIndex, field);
    const gridField: DocField = effective.list_only ? { ...effective, list_only: 0 } : effective;
    const resolved = resolveField(gridField, childMeta, {
      doc: row,
      parent: parentDoc,
      roles,
      assumeWritable: true,
    });
    if (!resolved.visible) return <span className="text-xs text-muted-foreground">—</span>;
    const Control = registry.resolve(gridField.fieldtype) ?? FallbackControl;
    return (
      <Control
        field={gridField}
        value={row[gridField.fieldname]}
        onChange={(value: unknown) => setCell(rowIndex, gridField.fieldname, value)}
        readOnly={Boolean(readOnly || resolved.readOnly)}
        masked={resolved.masked}
        services={services}
        docname={String(row.name ?? "")}
        linkTarget={dynamicLinkTarget(gridField, row)}
        parentDoctype={childMeta.name}
        docValues={row}
        roles={roles}
        compact
      />
    );
  };

  const headerField = (field: DocField): DocField => rows[0] ? fieldForRow(rows[0], 0, field) : field;
  const previewErrors = Object.values(previewErrorByRow).filter(Boolean);

  return (
    <div className="overflow-hidden rounded-md border" data-metadata-child-grid={childMeta.name}>
      <div className="flex items-center justify-between gap-2 border-b bg-muted/20 px-2 py-1.5">
        <span className="text-xs text-muted-foreground">{rows.length} dòng</span>
        <div className="flex items-center gap-1">
          {canExpand ? (
            <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => setExpanded((value) => !value)}>
              {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              {expanded ? "Thu gọn" : "Mở rộng"}
            </Button>
          ) : null}
          {!readOnly ? (
            <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={addRow}>
              <Plus className="size-3.5" /> Thêm dòng
            </Button>
          ) : null}
        </div>
      </div>
      {previewErrors.length ? (
        <div className="border-b bg-destructive/5 px-3 py-2 text-xs text-destructive" role="alert">
          {previewErrors[0]}
        </div>
      ) : null}

      <div className="space-y-3 p-3 md:hidden">
        {rows.map((row, rowIndex) => (
          <section key={rowKey(row, rowIndex)} className="rounded-lg border bg-card p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between border-b pb-2">
              <span className="text-xs font-semibold text-muted-foreground">#{rowIndex + 1}</span>
              {!readOnly ? (
                <Button type="button" variant="ghost" size="icon" className="size-7" aria-label={`Xóa dòng ${rowIndex + 1}`} onClick={() => removeRow(rowIndex)}>
                  <Trash2 className="size-3.5" />
                </Button>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {columns.map((field) => {
                const effective = fieldForRow(row, rowIndex, field);
                return (
                  <div key={field.fieldname} className="min-w-0 space-y-1.5">
                    <div className="text-xs font-medium text-muted-foreground">
                      {label(effective)}{effective.reqd ? <span className="ml-0.5 text-destructive">*</span> : null}
                    </div>
                    {renderControl(row, rowIndex, field)}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        {!rows.length ? <div className="py-4 text-center text-sm text-muted-foreground">Chưa có dòng nào</div> : null}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow className="bg-muted/20 hover:bg-muted/20">
              <TableHead className="w-10 text-right">#</TableHead>
              {columns.map((field) => {
                const effective = headerField(field);
                return <TableHead key={field.fieldname} className="min-w-28">{label(effective)}{effective.reqd ? <span className="ml-0.5 text-destructive">*</span> : null}</TableHead>;
              })}
              {!readOnly ? <TableHead className="w-10" /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowKey(row, rowIndex)}>
                <TableCell className="text-right text-xs text-muted-foreground">{rowIndex + 1}</TableCell>
                {columns.map((field) => (
                  <TableCell key={field.fieldname} className="min-w-28 align-top">{renderControl(row, rowIndex, field)}</TableCell>
                ))}
                {!readOnly ? (
                  <TableCell className="align-top">
                    <Button type="button" variant="ghost" size="icon" className="size-7" aria-label={`Xóa dòng ${rowIndex + 1}`} onClick={() => removeRow(rowIndex)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!rows.length ? <div className="py-6 text-center text-sm text-muted-foreground">Chưa có dòng nào</div> : null}
      </div>
    </div>
  );
}
