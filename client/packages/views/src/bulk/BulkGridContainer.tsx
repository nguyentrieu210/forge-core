/** @jsxImportSource react */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";
import { resolveBulkRenderPolicy, type BulkRowSource, type Doc, type DocField, type ListOpts } from "@metaforge/core";
import { mapError } from "@metaforge/adapter-frappe";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, toast } from "@metaforge/ui";
import { deriveColumns } from "../list/columns.js";
import { buildServerQuery } from "../list/filters.js";
import { useListUrlState, type UrlStateBridge } from "../list/useListState.js";
import { useMetaForge } from "../container/provider.js";
import { useCount, useList, useListView, useMeta } from "../container/hooks.js";
import { BulkGridView } from "./BulkGridView.js";
import { parseBulkNumber } from "./bulk-numbers.js";

export interface BulkGridContainerProps {
  doctype: string;
  bridge: UrlStateBridge;
  title?: string;
  onDirtyChange?: (dirty: boolean) => void;
}

export function BulkGridContainer(props: BulkGridContainerProps) {
  const { adapter, roles, scopeKey } = useMetaForge();
  const metaQ = useMeta(props.doctype);
  const meta = metaQ.data;
  const policy = useMemo(() => meta ? resolveBulkRenderPolicy(meta) : undefined, [meta]);
  const listColumns = useMemo(() => meta ? deriveColumns(meta, { roles }) : [], [meta, roles]);
  const [state, patchState] = useListUrlState(props.bridge, meta ?? { name: props.doctype, fields: [], permissions: [] });
  const effectiveState = useMemo(() => ({ ...state, pageSize: policy?.pageSize ?? state.pageSize }), [state, policy?.pageSize]);
  const listOpts = useMemo<ListOpts>(() => {
    if (!meta || !policy?.enabled) return { pageLength: 1 };
    const base = buildServerQuery(meta, effectiveState, listColumns);
    const fields = new Set(["name", "modified", ...(base.fields ?? []), ...policy.columns.map((field) => field.fieldname), ...policy.toolbarFilters.map((field) => field.fieldname)]);
    return { ...base, fields: [...fields], pageLength: policy.pageSize };
  }, [effectiveState, listColumns, meta, policy]);
  const viewQ = useListView(props.doctype, listOpts, Boolean(meta && policy?.enabled));
  const source = policy?.rowSource;
  const selectedPriceList = source
    ? String(state.filters[policy?.toolbarFilters.find((field) => field.fieldname === "price_list")?.fieldname ?? ""] ?? "")
    : "";
  const sourceMetaQ = useMeta(source?.doctype ?? "");
  const sourceFilterField = useMemo(() => source?.filterFields?.map((name) => sourceMetaQ.data?.fields.find((field) => field.fieldname === name)).find((field): field is DocField => Boolean(field)), [source?.filterFields, sourceMetaQ.data?.fields]);
  const [sourceFilter, setSourceFilter] = useState("");
  const sourceFilterOptionsQ = useListView(String(sourceFilterField?.options ?? ""), { fields: ["name", "parent_item_group"], pageLength: 500 }, Boolean(sourceFilterField?.fieldtype === "Link" && sourceFilterField.options));
  const sourceGroupsQ = useList(String(sourceFilterField?.options ?? ""), { fields: ["name", "parent_item_group"], pageLength: 500 }, Boolean(sourceFilterField?.fieldtype === "Link" && sourceFilterField.options));
  const sourceFilterValues = useMemo(() => {
    if (!sourceFilter) return [];
    const rows = sourceGroupsQ.data ?? sourceFilterOptionsQ.data?.rows ?? [];
    const values = new Set([sourceFilter]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const row of rows) {
        const name = String(row.name ?? "");
        if (name && values.has(String(row.parent_item_group ?? "")) && !values.has(name)) { values.add(name); changed = true; }
      }
    }
    return [...values];
  }, [sourceFilter, sourceFilterOptionsQ.data?.rows, sourceGroupsQ.data]);
  const sourceOpts = useMemo<ListOpts>(() => source ? {
    fields: ["name", source.identityField, ...source.uomFields, ...(source.filterFields ?? [])],
    limitStart: (state.page - 1) * (policy?.pageSize ?? 50), pageLength: policy?.pageSize ?? 50,
    ...(sourceFilterField && sourceFilterValues.length ? { filters: [[sourceFilterField.fieldname, "in", sourceFilterValues]] } : {}),
  } : { pageLength: 1 }, [policy?.pageSize, source, sourceFilterField, sourceFilterValues, state.page]);
  const sourceItemsQ = useList(source?.doctype ?? "", sourceOpts, Boolean(source));
  const sourceDocumentsQ = useQueries({ queries: (sourceItemsQ.data ?? []).map((item) => {
    const name = String(item.name ?? "");
    return {
      queryKey: [scopeKey, "bulk-row-source", source?.doctype ?? "", name, item.modified ?? ""],
      queryFn: () => adapter.getDoc(source!.doctype, name).then((result) => result.doc),
      enabled: Boolean(source && name), staleTime: 2 * 60_000, refetchOnWindowFocus: false,
    };
  }) });
  const sourceItems = useMemo(() => sourceDocumentsQ.map((query, index) => query.data ?? sourceItemsQ.data?.[index]).filter((item): item is Doc => Boolean(item)), [sourceDocumentsQ, sourceItemsQ.data]);
  const sourceCountQ = useCount(source?.doctype ?? "", undefined, undefined, Boolean(source));
  const sourceCodes = useMemo(() => source ? sourceItems.map((item) => String(item[source.identityField] ?? item.name ?? "").trim()).filter(Boolean) : [], [source, sourceItems]);
  const sourcePriceOpts = useMemo<ListOpts>(() => source && selectedPriceList && sourceCodes.length ? {
    fields: ["name", "item_code", "uom", "rate", "note", "disabled", "modified"],
    filters: [["price_list", "=", selectedPriceList], [source.targetLinkField, "in", sourceCodes]], pageLength: 100,
  } : { pageLength: 1 }, [selectedPriceList, source, sourceCodes]);
  const sourcePricesQ1 = useList(props.doctype, sourcePriceOpts, Boolean(source && selectedPriceList && sourceCodes.length));
  const sourcePricesQ2 = useList(props.doctype, { ...sourcePriceOpts, limitStart: 100 }, Boolean(source && selectedPriceList && sourceCodes.length));
  const sourcePricesQ3 = useList(props.doctype, { ...sourcePriceOpts, limitStart: 200 }, Boolean(source && selectedPriceList && sourceCodes.length));
  const rows = useMemo(() => source
    ? expandBulkSourceRows(source, sourceItems, [...(sourcePricesQ1.data ?? []), ...(sourcePricesQ2.data ?? []), ...(sourcePricesQ3.data ?? [])], selectedPriceList, props.doctype)
    : (viewQ.data?.rows ?? []), [props.doctype, selectedPriceList, source, sourceItems, sourcePricesQ1.data, sourcePricesQ2.data, sourcePricesQ3.data, viewQ.data?.rows]);
  const writable = Boolean(viewQ.data?.capabilities?.write || (source && viewQ.data?.capabilities?.create));
  const total = source ? (sourceCountQ.data ?? sourceItemsQ.data?.length ?? 0) : (viewQ.data?.count ?? rows.length);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dirty, setDirty] = useState<Record<string, Record<string, unknown>>>({});
  const [originalModified, setOriginalModified] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const dirtyCount = Object.keys(dirty).length;

  const rowByName = useMemo(() => new Map(rows.map((row) => [String(row.name), row])), [rows]);
  const rowSignature = useMemo(() => rows.map((row) => String(row.name)).join("\u001f"), [rows]);
  useEffect(() => setSelected(new Set()), [rowSignature]);
  useEffect(() => { props.onDirtyChange?.(dirtyCount > 0); }, [dirtyCount, props.onDirtyChange]);
  useEffect(() => () => { props.onDirtyChange?.(false); }, [props.onDirtyChange]);
  useEffect(() => {
    if (!dirtyCount) return;
    const guard = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirtyCount]);

  const changeCell = useCallback((name: string, fieldname: string, value: unknown) => {
    if (!policy?.editable.has(fieldname)) return;
    const row = rowByName.get(name);
    if (!row) return;
    if (!Boolean(row.__bulkNew)) setOriginalModified((current) => current[name] ? current : { ...current, [name]: String(row.modified ?? "") });
    setDirty((current) => ({ ...current, [name]: { ...(current[name] ?? {}), [fieldname]: value } }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }, [policy, rowByName]);

  const pasteMatrix = useCallback((rowIndex: number, columnIndex: number, matrix: string[][]) => {
    if (!policy) return;
    matrix.forEach((cells, rowOffset) => {
      const row = rows[rowIndex + rowOffset];
      if (!row) return;
      cells.forEach((raw, columnOffset) => {
        const field = policy.columns[columnIndex + columnOffset];
        if (!field || !policy.editable.has(field.fieldname)) return;
        let value: unknown = raw;
        if (["Int", "Float", "Currency", "Percent", "Duration", "Rating"].includes(field.fieldtype)) {
          value = raw.trim() === "" ? null : parseBulkNumber(raw);
          if (value === null && raw.trim() !== "") value = raw;
        } else if (field.fieldtype === "Check") {
          value = /^(1|true|yes|có|x)$/i.test(raw.trim()) ? 1 : 0;
        }
        changeCell(String(row.name), field.fieldname, value);
      });
    });
  }, [changeCell, policy, rows]);

  const fillDown = useCallback((fieldname: string) => {
    if (!policy?.editable.has(fieldname) || selected.size < 2) return;
    const selectedRows = rows.filter((row) => selected.has(String(row.name)));
    const source = selectedRows[0];
    if (!source) return;
    const sourcePatch = dirty[String(source.name)];
    const value = sourcePatch && Object.prototype.hasOwnProperty.call(sourcePatch, fieldname)
      ? sourcePatch[fieldname]
      : source[fieldname];
    for (const row of selectedRows.slice(1)) changeCell(String(row.name), fieldname, value);
  }, [changeCell, dirty, policy, rows, selected]);

  const discard = useCallback(() => {
    setDirty({});
    setOriginalModified({});
    setErrors({});
  }, []);

  const save = useCallback(async () => {
    if (!writable || saving || !dirtyCount) return;
    setSaving(true);
    const failed: Record<string, string> = {};
    let saved = 0;
    try {
      for (const [name, values] of Object.entries(dirty)) {
        try {
          const row = rowByName.get(name);
          if (row?.__bulkNew) {
            if (!selectedPriceList || values.rate === null || values.rate === undefined || values.rate === "") {
              failed[name] = "Nhập đơn giá để tạo dòng giá mới.";
              continue;
            }
            const create = { ...values, [source?.targetLinkField ?? "item_code"]: row[source?.targetLinkField ?? "item_code"], [source?.targetUomField ?? "uom"]: row[source?.targetUomField ?? "uom"], price_list: selectedPriceList } as Partial<Doc>;
            await adapter.createDoc(props.doctype, create);
          } else {
            await adapter.updateDoc(props.doctype, name, values as Partial<Doc>, originalModified[name] ?? "");
          }
          saved += 1;
        } catch (error) {
          failed[name] = mapError(error).message;
        }
      }
      setErrors(failed);
      if (saved) toast.success(`Đã lưu ${saved} bản ghi`);
      const failedCount = Object.keys(failed).length;
      if (failedCount) toast.error(`${failedCount} bản ghi chưa lưu; xem lỗi trên từng dòng`);
      if (!failedCount) {
        setDirty({});
        setOriginalModified({});
        setSelected(new Set());
      } else {
        setDirty((current) => Object.fromEntries(Object.entries(current).filter(([name]) => failed[name])));
        setOriginalModified((current) => Object.fromEntries(Object.entries(current).filter(([name]) => failed[name])));
      }
      await Promise.all([viewQ.refetch(), sourcePricesQ1.refetch(), sourcePricesQ2.refetch(), sourcePricesQ3.refetch()]);
    } finally {
      setSaving(false);
    }
  }, [adapter, dirty, dirtyCount, originalModified, props.doctype, rowByName, saving, selectedPriceList, source, sourcePricesQ1, sourcePricesQ2, sourcePricesQ3, viewQ, writable]);

  if (metaQ.isLoading) return <div className="grid h-full gap-2 p-3"><Skeleton className="h-10" /><Skeleton className="h-96" /></div>;
  if (metaQ.error) return <div className="p-4 text-sm text-destructive">{mapError(metaQ.error).message}</div>;
  if (!meta || !policy?.enabled) return <div className="grid h-40 place-items-center p-4 text-sm text-muted-foreground">DocType này chưa bật Bulk View an toàn.</div>;
  if (viewQ.error || sourceItemsQ.error || sourcePricesQ1.error) return <div className="p-4 text-sm text-destructive">{mapError(viewQ.error ?? sourceItemsQ.error ?? sourcePricesQ1.error).message}</div>;

  const maxPage = Math.max(1, Math.ceil(total / policy.pageSize));
  const canNavigate = dirtyCount === 0 && !saving;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2">
      <>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2">
        <div className="relative min-w-52 flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-8 pl-8" value={state.q} placeholder="Tìm trong danh sách…" disabled={!canNavigate} onChange={(event) => patchState({ q: event.target.value })} />
        </div>
        {policy.toolbarFilters.map((field) => <BulkToolbarFilter key={field.fieldname} field={field} value={state.filters[field.fieldname] ?? ""} disabled={!canNavigate} onChange={(value) => patchState({ filters: { ...state.filters, [field.fieldname]: value } })} />)}
        {sourceFilterField ? <BulkToolbarFilter field={sourceFilterField} value={sourceFilter} disabled={!canNavigate || sourceFilterOptionsQ.isLoading} options={(sourceFilterOptionsQ.data?.rows ?? []).map((row) => String(row.name))} onChange={setSourceFilter} /> : null}
        <Button variant="ghost" size="icon" className="size-8" onClick={() => viewQ.refetch()} disabled={saving} aria-label="Làm mới"><RefreshCw /></Button>
        <span className="text-xs tabular-nums text-muted-foreground">{total} bản ghi · trang {state.page}/{maxPage}</span>
        <Button variant="outline" size="icon" className="size-8" disabled={!canNavigate || state.page <= 1} onClick={() => patchState({ page: state.page - 1 })} aria-label="Trang trước"><ChevronLeft /></Button>
        <Button variant="outline" size="icon" className="size-8" disabled={!canNavigate || state.page >= maxPage} onClick={() => patchState({ page: state.page + 1 })} aria-label="Trang sau"><ChevronRight /></Button>
      </div>
      <div className="min-h-0 flex-1">
        {source && !selectedPriceList ? <div className="grid h-full place-items-center rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">Chọn Bảng giá ở phía trên để nạp toàn bộ Mặt hàng × ĐVT bán.</div> : <BulkGridView
          title={props.title ?? meta.label ?? meta.name}
          rows={rows}
          policy={policy}
          selected={selected}
          dirty={dirty}
          errors={errors}
          saving={saving}
          writable={writable}
          onSelect={(name, checked) => setSelected((current) => { const next = new Set(current); checked ? next.add(name) : next.delete(name); return next; })}
          onSelectAll={(checked) => setSelected(checked ? new Set(rows.map((row) => String(row.name))) : new Set())}
          onCellChange={changeCell}
          onPasteMatrix={pasteMatrix}
          onFillDown={fillDown}
          onSave={save}
          onDiscard={discard}
        />}
      </div>
      </>
    </div>
  );
}

const ALL_VALUES = "__mf_bulk_all__";

function BulkToolbarFilter(props: { field: DocField; value: string; disabled: boolean; onChange: (value: string) => void; options?: string[] }) {
  const isLink = props.field.fieldtype === "Link" && Boolean(props.field.options);
  const optionsQ = useListView(String(props.field.options ?? ""), { fields: ["name"], pageLength: 500 }, isLink);
  const options = props.options ?? (props.field.fieldtype === "Select"
    ? String(props.field.options ?? "").split("\n").map((value) => value.trim()).filter(Boolean)
    : (optionsQ.data?.rows ?? []).map((row) => String(row.name)));

  return <Select value={props.value || ALL_VALUES} onValueChange={(value) => props.onChange(value === ALL_VALUES ? "" : value)} disabled={props.disabled || optionsQ.isLoading}>
    <SelectTrigger className="h-8 w-56"><SelectValue placeholder={props.field.label ?? props.field.fieldname} /></SelectTrigger>
    <SelectContent>
      <SelectItem value={ALL_VALUES}>Tất cả {props.field.label ?? props.field.fieldname}</SelectItem>
      {options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
    </SelectContent>
  </Select>;
}

function expandBulkSourceRows(source: BulkRowSource, items: Doc[], prices: Doc[], priceList: string, targetDoctype: string): Doc[] {
  if (!priceList) return [];
  const fallbackUomByItem = new Map(items.map((item) => [String(item[source.identityField] ?? item.name ?? ""), String(item[source.uomFields[0]!] ?? item[source.uomFields[1]!] ?? "")]));
  const existing = new Map<string, Doc>();
  for (const price of prices) {
    const item = String(price[source.targetLinkField] ?? "").trim();
    const uom = String(price[source.targetUomField] ?? fallbackUomByItem.get(item) ?? "").trim();
    if (item && uom) existing.set(`${item}\u001f${uom}`, price);
  }
  const rows: Doc[] = [];
  for (const item of items) {
    const identity = String(item[source.identityField] ?? item.name ?? "").trim();
    if (!identity) continue;
    const uoms = new Set(source.uomFields.map((field) => String(item[field] ?? "").trim()).filter(Boolean));
    if (source.uomTable && source.uomTableField && Array.isArray(item[source.uomTable])) {
      for (const row of item[source.uomTable] as Doc[]) {
        const uom = String(row[source.uomTableField] ?? "").trim();
        if (uom) uoms.add(uom);
      }
    }
    for (const uom of uoms) {
      const current = existing.get(`${identity}\u001f${uom}`);
      rows.push({
        doctype: targetDoctype,
        name: current ? String(current.name) : `__bulk_new__:${encodeURIComponent(identity)}:${encodeURIComponent(uom)}`,
        modified: current?.modified,
        [source.targetLinkField]: identity,
        [source.targetUomField]: uom,
        rate: current?.rate ?? null,
        note: current?.note ?? "",
        disabled: current?.disabled ?? 0,
        ...(current ? {} : { __bulkNew: true }),
      });
    }
  }
  return rows;
}
