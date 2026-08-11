/** @jsxImportSource react */
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { resolveField, type Doc, type DocField, type DocTypeMeta } from "@metaforge/core";
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

/**
 * Business-neutral child-table renderer.
 *
 * Metadata owns column order and compact/expanded surfaces. This component deliberately has no
 * Sales/Purchase/Alumdoor branches. Doctypes without an explicit presentation policy fall back to
 * the established grid unchanged while the migration is in progress.
 */
export function MetadataChildGrid(props: ChildGridProps) {
  const { childMeta, rows, onChange, registry, services, readOnly, parentDoc, roles, rowDefaults } = props;
  const ownsPresentation = hasMetadataChildGridPresentation(childMeta);
  const [expanded, setExpanded] = useState(false);

  const compact = useMemo(
    () => ownsPresentation ? (metadataChildGridColumns(childMeta, false) ?? []) : [],
    [childMeta, ownsPresentation],
  );
  const full = useMemo(
    () => ownsPresentation ? (metadataChildGridColumns(childMeta, true) ?? compact) : [],
    [childMeta, compact, ownsPresentation],
  );

  if (!ownsPresentation) return <LegacyChildGrid {...props} />;

  const columns = expanded ? full : compact;
  const canExpand = full.some((field) => !compact.some((compactField) => compactField.fieldname === field.fieldname));

  const setCell = (rowIndex: number, fieldname: string, value: unknown) => {
    onChange(rows.map((row, index) => index === rowIndex ? { ...row, [fieldname]: value } : row));
  };
  const addRow = () => onChange([...rows, newRow(childMeta, rowDefaults)]);
  const removeRow = (rowIndex: number) => onChange(rows.filter((_, index) => index !== rowIndex));

  const renderControl = (row: Doc, rowIndex: number, field: DocField) => {
    const gridField: DocField = field.list_only ? { ...field, list_only: 0 } : field;
    const resolved = resolveField(gridField, childMeta, {
      doc: row,
      parent: parentDoc,
      roles,
      assumeWritable: true,
    });
    if (!resolved.visible) return <span className="text-xs text-muted-foreground">—</span>;
    const Control = registry.resolve(field.fieldtype) ?? FallbackControl;
    return (
      <Control
        field={gridField}
        value={row[field.fieldname]}
        onChange={(value: unknown) => setCell(rowIndex, field.fieldname, value)}
        readOnly={Boolean(readOnly || resolved.readOnly)}
        masked={resolved.masked}
        services={services}
        docname={String(row.name ?? "")}
        linkTarget={dynamicLinkTarget(field, row)}
        parentDoctype={childMeta.name}
        docValues={row}
        roles={roles}
        compact
      />
    );
  };

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

      <div className="space-y-3 p-3 md:hidden">
        {rows.map((row, rowIndex) => (
          <section key={String(row.name ?? rowIndex)} className="rounded-lg border bg-card p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between border-b pb-2">
              <span className="text-xs font-semibold text-muted-foreground">#{rowIndex + 1}</span>
              {!readOnly ? (
                <Button type="button" variant="ghost" size="icon" className="size-7" aria-label={`Xóa dòng ${rowIndex + 1}`} onClick={() => removeRow(rowIndex)}>
                  <Trash2 className="size-3.5" />
                </Button>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {columns.map((field) => (
                <div key={field.fieldname} className="min-w-0 space-y-1.5">
                  <div className="text-xs font-medium text-muted-foreground">
                    {label(field)}{field.reqd ? <span className="ml-0.5 text-destructive">*</span> : null}
                  </div>
                  {renderControl(row, rowIndex, field)}
                </div>
              ))}
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
              {columns.map((field) => <TableHead key={field.fieldname} className="min-w-28">{label(field)}</TableHead>)}
              {!readOnly ? <TableHead className="w-10" /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={String(row.name ?? rowIndex)}>
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
