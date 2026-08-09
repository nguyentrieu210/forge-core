/** @jsxImportSource react */
import { useEffect, useMemo, useState, type ClipboardEvent } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Filter, GripVertical, RotateCcw, Save } from "lucide-react";
import type { Doc, DocField, BulkRenderPolicy } from "@metaforge/core";
import {
  Badge, Button, Checkbox, Input, Popover, PopoverContent, PopoverTrigger,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@metaforge/ui";
import { formatBulkCurrency, parseBulkNumber } from "./bulk-numbers.js";

export interface BulkGridViewProps {
  title: string;
  rows: Doc[];
  policy: BulkRenderPolicy;
  selected: Set<string>;
  dirty: Record<string, Record<string, unknown>>;
  errors?: Record<string, string>;
  saving?: boolean;
  writable?: boolean;
  onSelect: (name: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onCellChange: (name: string, fieldname: string, value: unknown) => void;
  onPasteMatrix: (rowIndex: number, columnIndex: number, matrix: string[][]) => void;
  onFillDown: (fieldname: string) => void;
  onSave: () => void;
  onDiscard: () => void;
}

const EMPTY_SELECT = "__mf_bulk_empty__";
const NUMERIC_TYPES = new Set(["Int", "Float", "Currency", "Percent", "Duration", "Rating"]);

function optionValues(field: DocField): string[] {
  return String(field.options ?? "").split("\n").map((value) => value.trim()).filter(Boolean);
}
function displayValue(row: Doc, patch: Record<string, unknown> | undefined, fieldname: string): unknown {
  return patch && Object.prototype.hasOwnProperty.call(patch, fieldname) ? patch[fieldname] : row[fieldname];
}
function inputValue(value: unknown): string { return value === null || value === undefined ? "" : String(value); }
function parseValue(field: DocField, value: string): unknown {
  if (NUMERIC_TYPES.has(field.fieldtype)) {
    if (value.trim() === "") return null;
    if (field.fieldtype === "Currency") return parseBulkNumber(value) ?? value;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }
  return value;
}
function excelValue(field: DocField, value: unknown): string { return field.fieldtype === "Currency" ? formatBulkCurrency(value) : inputValue(value) || "(trống)"; }
function compareExcel(field: DocField, left: unknown, right: unknown): number {
  if (NUMERIC_TYPES.has(field.fieldtype)) return (parseBulkNumber(inputValue(left)) ?? (Number(left) || 0)) - (parseBulkNumber(inputValue(right)) ?? (Number(right) || 0));
  return inputValue(left).localeCompare(inputValue(right), "vi", { numeric: true, sensitivity: "base" });
}

function ExcelFilter(props: { field: DocField; values: string[]; selected: Set<string>; onChange: (values: Set<string>) => void }) {
  const [query, setQuery] = useState("");
  const shown = props.values.filter((value) => value.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"))).slice(0, 100);
  return <Popover><PopoverTrigger asChild><Button variant="ghost" size="icon" className="size-7" aria-label={`Lọc ${props.field.label ?? props.field.fieldname}`}><Filter className="size-3" /></Button></PopoverTrigger><PopoverContent className="w-60 p-2"><Input className="h-8" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Lọc giá trị…" /><div className="mt-2 max-h-56 space-y-1 overflow-auto">{shown.map((value) => <label key={value} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-xs hover:bg-muted"><Checkbox checked={!props.selected.size || props.selected.has(value)} onCheckedChange={(checked) => { const next = new Set(props.selected.size ? props.selected : props.values); checked ? next.add(value) : next.delete(value); props.onChange(next.size === props.values.length ? new Set() : next); }} /><span className="truncate">{value}</span></label>)}</div><Button variant="ghost" size="sm" className="mt-2" onClick={() => props.onChange(new Set())}>Xóa lọc</Button></PopoverContent></Popover>;
}

export function BulkGridView(props: BulkGridViewProps) {
  const { rows, policy } = props;
  const [order, setOrder] = useState(() => policy.columns.map((field) => field.fieldname));
  const [widths, setWidths] = useState<Record<string, number>>({});
  const [filters, setFilters] = useState<Record<string, Set<string>>>({});
  const [sort, setSort] = useState<{ fieldname: string; desc: boolean } | null>(null);
  const [dragging, setDragging] = useState("");
  const columns = useMemo(() => order.map((name) => policy.columns.find((field) => field.fieldname === name)).filter((field): field is DocField => Boolean(field)), [order, policy.columns]);
  const shownRows = useMemo(() => {
    const result = rows.filter((row) => columns.every((field) => !filters[field.fieldname]?.size || filters[field.fieldname]!.has(excelValue(field, displayValue(row, props.dirty[String(row.name)], field.fieldname)))));
    if (!sort) return result;
    const field = columns.find((candidate) => candidate.fieldname === sort.fieldname); if (!field) return result;
    return [...result].sort((a, b) => compareExcel(field, displayValue(a, props.dirty[String(a.name)], field.fieldname), displayValue(b, props.dirty[String(b.name)], field.fieldname)) * (sort.desc ? -1 : 1));
  }, [columns, filters, props.dirty, rows, sort]);
  const allSelected = shownRows.length > 0 && shownRows.every((row) => props.selected.has(String(row.name)));
  const dirtyCount = Object.keys(props.dirty).length;
  const selectedCount = props.selected.size;
  const editableNames = useMemo(() => [...policy.editable], [policy.editable]);

  const paste = (event: ClipboardEvent<HTMLDivElement>) => {
    if (!policy.allowPaste || !props.writable) return;
    const target = event.target as HTMLElement;
    const row = Number(target.dataset.bulkRow);
    const column = Number(target.dataset.bulkColumn);
    if (!Number.isInteger(row) || !Number.isInteger(column)) return;
    const text = event.clipboardData.getData("text/plain");
    if (!text.includes("\t") && !text.includes("\n")) return;
    event.preventDefault();
    const matrix = text.replace(/\r/g, "").split("\n").filter((line, index, values) => line !== "" || index < values.length - 1).map((line) => line.split("\t"));
    props.onPasteMatrix(row, column, matrix);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-card" onPaste={paste}>
      {dirtyCount > 0 ? <div className="flex flex-wrap items-center justify-end gap-2 border-b px-3 py-2">
        {selectedCount > 0 && policy.allowFillDown && editableNames.length ? (
          <Select onValueChange={(fieldname) => props.onFillDown(fieldname)} disabled={!props.writable}>
            <SelectTrigger className="h-8 w-44"><SelectValue placeholder={`Điền xuống (${selectedCount})`} /></SelectTrigger>
            <SelectContent>{editableNames.map((fieldname) => { const field = policy.columns.find((candidate) => candidate.fieldname === fieldname); return <SelectItem key={fieldname} value={fieldname}>{field?.label ?? fieldname}</SelectItem>; })}</SelectContent>
          </Select>
        ) : null}
        <Button variant="outline" size="sm" className="h-8" onClick={props.onDiscard} disabled={!dirtyCount || props.saving}><RotateCcw /> Bỏ thay đổi</Button>
        <Button size="sm" className="h-8" onClick={props.onSave} disabled={!props.writable || !dirtyCount || props.saving}>{props.saving ? <Save className="animate-pulse" /> : <Check />} Lưu {dirtyCount ? `(${dirtyCount})` : ""}</Button>
      </div> : null}
      <div className="min-h-0 flex-1 overflow-auto">
        <Table className="min-w-max border-separate border-spacing-0">
          <TableHeader className="sticky top-0 z-10 bg-card"><TableRow>
            <TableHead className="sticky left-0 z-20 w-10 min-w-10 max-w-10 border-b border-r bg-card px-0 text-center" style={{ width: 40 }}><Checkbox checked={allSelected} onCheckedChange={(value) => props.onSelectAll(value === true)} aria-label="Chọn tất cả" /></TableHead>
            <TableHead className="w-12 min-w-12 max-w-12 border-b border-r px-0 text-center" style={{ width: 48 }}>STT</TableHead>
            {columns.map((field) => <TableHead key={field.fieldname} className="relative whitespace-nowrap border-b border-r text-center" style={{ width: widths[field.fieldname] ?? 144, minWidth: widths[field.fieldname] ?? 144 }} draggable onDragStart={() => setDragging(field.fieldname)} onDragOver={(event) => event.preventDefault()} onDrop={() => setOrder((current) => { const next = current.filter((name) => name !== dragging); next.splice(Math.max(0, next.indexOf(field.fieldname)), 0, dragging); return next; })}>
              <div className="flex items-center justify-center gap-1"><GripVertical className="size-3 cursor-grab text-muted-foreground" /><Button variant="ghost" size="sm" className="h-7 px-1" onClick={() => setSort((current) => current?.fieldname === field.fieldname ? { fieldname: field.fieldname, desc: !current.desc } : { fieldname: field.fieldname, desc: false })}>{field.label ?? field.fieldname}{sort?.fieldname === field.fieldname ? (sort.desc ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />) : <ArrowUpDown className="size-3" />}</Button><ExcelFilter field={field} values={[...new Set(rows.map((row) => excelValue(field, displayValue(row, props.dirty[String(row.name)], field.fieldname))))]} selected={filters[field.fieldname] ?? new Set()} onChange={(next) => setFilters((current) => ({ ...current, [field.fieldname]: next }))} /></div>
              <span className="absolute right-0 top-0 h-full w-1 cursor-col-resize" onDoubleClick={() => setWidths((current) => ({ ...current, [field.fieldname]: 220 }))} onMouseDown={(event) => { const start = event.clientX; const initial = widths[field.fieldname] ?? 144; const move = (next: MouseEvent) => setWidths((current) => ({ ...current, [field.fieldname]: Math.max(110, Math.min(520, initial + next.clientX - start)) })); const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); }; window.addEventListener("mousemove", move); window.addEventListener("mouseup", up); }} />
            </TableHead>)}
            <TableHead className="min-w-52 border-b border-r text-center">Trạng thái</TableHead>
          </TableRow></TableHeader>
          <TableBody>{shownRows.map((row, rowIndex) => {
            const name = String(row.name); const patch = props.dirty[name];
            return <TableRow key={name} data-state={props.selected.has(name) ? "selected" : undefined}>
              <TableCell className="sticky left-0 z-10 w-10 min-w-10 max-w-10 border-b border-r bg-inherit px-0 text-center" style={{ width: 40 }}><Checkbox checked={props.selected.has(name)} onCheckedChange={(value) => props.onSelect(name, value === true)} aria-label={`Chọn ${name}`} /></TableCell>
              <TableCell className="w-12 min-w-12 max-w-12 border-b border-r px-0 text-center tabular-nums text-muted-foreground" style={{ width: 48 }}>{rowIndex + 1}</TableCell>
              {columns.map((field, columnIndex) => {
                const value = displayValue(row, patch, field.fieldname); const editable = Boolean(props.writable && policy.editable.has(field.fieldname));
                const shown = field.fieldtype === "Currency" ? formatBulkCurrency(value) : inputValue(value);
                return <TableCell key={field.fieldname} className="border-b border-r p-1.5 text-center" style={{ width: widths[field.fieldname] ?? 144, minWidth: widths[field.fieldname] ?? 144 }}>{editable ? <BulkCell field={field} value={value} rowIndex={rowIndex} columnIndex={columnIndex} onChange={(next) => props.onCellChange(name, field.fieldname, next)} /> : <span className="flex h-8 max-w-72 items-center justify-center truncate px-2 text-sm tabular-nums" title={shown}>{shown || "—"}</span>}</TableCell>;
              })}
              <TableCell className="border-b border-r text-center">{props.errors?.[name] ? <span className="text-xs text-destructive">{props.errors[name]}</span> : patch ? <Badge variant="secondary">Chưa lưu</Badge> : <span className="text-xs text-muted-foreground">Đã đồng bộ</span>}</TableCell>
            </TableRow>;
          })}</TableBody>
        </Table>
      </div>
    </div>
  );
}

function BulkCell(props: { field: DocField; value: unknown; rowIndex: number; columnIndex: number; onChange: (value: unknown) => void }) {
  const marker = { "data-bulk-row": props.rowIndex, "data-bulk-column": props.columnIndex } as const;
  if (props.field.fieldtype === "Check") return <div className="flex h-8 items-center px-2" {...marker} tabIndex={0}><Checkbox checked={Boolean(props.value)} onCheckedChange={(value) => props.onChange(value === true ? 1 : 0)} /></div>;
  if (props.field.fieldtype === "Select" && optionValues(props.field).length) {
    const value = inputValue(props.value);
    return <Select value={value || EMPTY_SELECT} onValueChange={(next) => props.onChange(next === EMPTY_SELECT ? "" : next)}><SelectTrigger className="h-8 min-w-36" {...marker}><SelectValue /></SelectTrigger><SelectContent><SelectItem value={EMPTY_SELECT}>—</SelectItem>{optionValues(props.field).map((option) => <SelectItem key={option} value={option}>{props.field.optionLabels?.[option] ?? option}</SelectItem>)}</SelectContent></Select>;
  }
  if (props.field.fieldtype === "Currency") return <CurrencyBulkCell {...props} marker={marker} />;
  const type = NUMERIC_TYPES.has(props.field.fieldtype) ? "number" : props.field.fieldtype === "Date" ? "date" : props.field.fieldtype === "Datetime" ? "datetime-local" : "text";
  return <Input className="h-8 min-w-36" type={type} value={inputValue(props.value)} onChange={(event) => props.onChange(parseValue(props.field, event.target.value))} {...marker} />;
}

function CurrencyBulkCell(props: { field: DocField; value: unknown; onChange: (value: unknown) => void; marker: Record<string, number> }) {
  const [text, setText] = useState(() => formatBulkCurrency(props.value));
  const [editing, setEditing] = useState(false);
  // Do not reformat while the operator is typing: formatting every keystroke
  // moves the caret and makes values longer than a few digits impossible to enter.
  useEffect(() => { if (!editing) setText(formatBulkCurrency(props.value)); }, [editing, props.value]);
  return <Input className="h-8 min-w-36 text-right tabular-nums" inputMode="decimal" value={text} onChange={(event) => {
    const next = event.target.value;
    const digitsBeforeCaret = next.slice(0, event.target.selectionStart ?? next.length).replace(/\D/g, "").length;
    // Money is normally entered as an integer in VND. Format on every keystroke
    // while restoring the caret after the same count of digits.
    const integer = next.replace(/[^\d-]/g, "");
    const formatted = /^-?\d*$/.test(integer) ? formatBulkCurrency(integer) : next;
    setText(formatted);
    requestAnimationFrame(() => {
      let seen = 0; let position = formatted.length;
      for (let index = 0; index < formatted.length; index += 1) {
        if (/\d/.test(formatted[index]!)) seen += 1;
        if (seen >= digitsBeforeCaret) { position = index + 1; break; }
      }
      event.target.setSelectionRange(position, position);
    });
    const value = parseBulkNumber(formatted);
    if (value !== null) props.onChange(value);
    else if (next.trim() === "") props.onChange(null);
  }} onFocus={() => setEditing(true)} onBlur={(event) => {
    setEditing(false);
    const value = parseBulkNumber(event.currentTarget.value);
    if (value !== null) {
      props.onChange(value);
      setText(formatBulkCurrency(value));
    } else if (!text.trim()) {
      props.onChange(null);
      setText("");
    } else {
      setText(formatBulkCurrency(props.value));
    }
  }} {...props.marker} />;
}
