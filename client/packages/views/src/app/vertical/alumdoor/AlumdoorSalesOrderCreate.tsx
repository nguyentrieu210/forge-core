/** @jsxImportSource react */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Copy, Eye, Loader2, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import {
  applyContextPolicy,
  mapError,
  serializeCreateDocument,
  type Doc,
  type DocField,
  type DocTypeMeta,
} from "@metaforge/core";
import type { ControlRegistry, FieldServices } from "@metaforge/controls";
import { Button, toast } from "@metaforge/ui";
import { useMetaForge } from "../../../container/provider.js";

interface AlumdoorSalesOrderCreateProps {
  closeRequest?: number;
  onCreated: (name: string) => void;
  onPreviewCreated: (name: string) => void;
  onCancel: () => void;
}

type Json = Record<string, unknown>;
type FieldOverride = {
  hidden?: number | boolean;
  reqd?: number | boolean;
  read_only?: number | boolean;
  label?: string;
};
type ItemContext = Json & {
  item_group?: string;
  door_type?: string | null;
  inventory_mode?: string;
  allowed_uoms?: string[];
  price_missing?: boolean;
  price_error?: string | null;
  availability_status?: string;
};

interface SalesLine extends Json {
  _key: string;
  _itemLabel?: string;
  _context?: ItemContext;
  _salesOptions?: Doc[];
  _allowedColors?: string[];
  _overrides?: Record<string, FieldOverride>;
  _loading?: boolean;
  _error?: string;
  item_code?: string;
  sales_option?: string;
  color?: string;
  sales_mode?: string;
  leaf_variant?: string;
  uom?: string;
  qty?: number;
  rate?: number;
  amount?: number;
  discount_percentage?: number;
  discount_amount?: number;
  adjustment_amount?: number;
  net_amount?: number;
  width_m?: number;
  height_m?: number;
  mesh_height_m?: number;
  set_count?: number;
  has_butterfly_bracket?: number;
  length_m?: number;
  qty_bar?: number;
}

const LAYOUT_TYPES = new Set(["Section Break", "Column Break", "Tab Break", "Heading", "HTML", "Button"]);

function text(value: unknown): string {
  return String(value ?? "").normalize("NFC").trim();
}

function normalized(value: unknown): string {
  return text(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLocaleLowerCase("vi");
}

function today(): string {
  const d = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function defaultValue(field: DocField): unknown {
  if (field.default == null || field.default === "") return undefined;
  if (field.default === "Today" && field.fieldtype === "Date") return today();
  if (field.default === "Now" && field.fieldtype === "Datetime") {
    return new Date().toISOString().slice(0, 19).replace("T", " ");
  }
  return field.default;
}

function blankFromMeta(meta: DocTypeMeta): Json {
  const values: Json = {};
  for (const field of meta.fields ?? []) {
    const value = defaultValue(field);
    if (value !== undefined) values[field.fieldname] = value;
  }
  return values;
}

function optionList(meta: DocTypeMeta | null, fieldname: string, fallback: string[]): string[] {
  const values = text(meta?.fields.find((field) => field.fieldname === fieldname)?.options)
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean);
  return values.length ? values : fallback;
}

function money(value: unknown): string {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? parsed.toLocaleString("vi-VN", { maximumFractionDigits: 0 })
    : "—";
}

function newLine(index: number): SalesLine {
  return {
    _key: `sales-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    qty: 1,
    set_count: 1,
  };
}

function lineTotal(line: SalesLine): number {
  const net = Number(line.net_amount);
  if (Number.isFinite(net)) return net;
  const gross = Number(line.amount);
  if (!Number.isFinite(gross)) return 0;
  return gross - Math.max(0, Number(line.discount_amount) || 0) + (Number(line.adjustment_amount) || 0);
}

function isAreaDoor(line: SalesLine): boolean {
  return text(line._context?.inventory_mode) === "Thành phẩm theo m2";
}

function family(line: SalesLine): "german" | "australian" | "mesh" | "taiwan" | "super" | "door" | "ordinary" {
  const group = normalized(line._context?.item_group);
  const door = normalized(line._context?.door_type);
  if (group.includes("cua cn duc") || door.includes("cua duc")) return "german";
  if (group.includes("cua tam lien uc") || door.includes("cua uc")) return "australian";
  if (group.includes("cua luoi") || door.includes("cua luoi")) return "mesh";
  if (group.includes("cua dai loan") || door.includes("dai loan")) return "taiwan";
  if (group.includes("sieu truong") || door.includes("sieu truong")) return "super";
  return isAreaDoor(line) ? "door" : "ordinary";
}

function fieldVisible(line: SalesLine, fieldname: string, fallback = false): boolean {
  const hidden = line._overrides?.[fieldname]?.hidden;
  return hidden == null ? fallback : !(hidden === 1 || hidden === true);
}

function fieldRequired(line: SalesLine, fieldname: string): boolean {
  const value = line._overrides?.[fieldname]?.reqd;
  return value === 1 || value === true;
}

function fieldReadonly(line: SalesLine, fieldname: string): boolean {
  const value = line._overrides?.[fieldname]?.read_only;
  return value === 1 || value === true;
}

function fieldLabel(line: SalesLine, fieldname: string, fallback: string): string {
  return text(line._overrides?.[fieldname]?.label).replace("\n", " ") || fallback;
}

function fallbackField(
  fieldname: string,
  label: string,
  fieldtype: DocField["fieldtype"] = "Data",
  options?: string,
): DocField {
  return { fieldname, label, fieldtype, ...(options ? { options } : {}) } as DocField;
}

function selectField(
  base: DocField | undefined,
  fieldname: string,
  label: string,
  options: string[],
  optionLabels?: Record<string, string>,
): DocField {
  const unique = [...new Set(options.map(text).filter(Boolean))];
  return {
    ...(base ?? fallbackField(fieldname, label)),
    fieldname,
    label,
    fieldtype: "Select",
    options: ["", ...unique].join("\n"),
    ...(optionLabels ? { optionLabels } : {}),
  } as DocField;
}

function StandardField(props: {
  id: string;
  field: DocField;
  value: unknown;
  onChange: (value: unknown) => void;
  registry: ControlRegistry;
  services: FieldServices;
  parentDoctype: string;
  docValues: Json;
  roles: string[];
  label?: string;
  required?: boolean;
  readOnly?: boolean;
  compact?: boolean;
  className?: string;
  onCommit?: () => void;
}) {
  const Control = props.registry.resolve(props.field.fieldtype);
  const displayLabel = props.label || text(props.field.label) || props.field.fieldname;
  if (!Control) {
    return <div className={props.className}><div className="text-xs text-destructive">Ch??a c?? control cho {props.field.fieldtype}</div></div>;
  }
  const control = (
    <Control
      field={props.field}
      id={props.id}
      value={props.value}
      onChange={props.onChange}
      readOnly={props.readOnly}
      required={props.required}
      label={displayLabel}
      services={props.services}
      parentDoctype={props.parentDoctype}
      docValues={props.docValues}
      roles={props.roles}
      compact={props.compact}
    />
  );
  if (props.field.fieldtype === "Check") {
    return (
      <div className={"min-w-0 " + (props.className ?? "")}>
        <div className="flex h-9 items-center gap-2">
          {control}
          <label htmlFor={props.id} className="cursor-pointer text-[13px] font-medium text-foreground">
            {displayLabel}{props.required ? <span className="ml-0.5 text-destructive">*</span> : null}
          </label>
        </div>
      </div>
    );
  }
  return (
    <div
      className={"min-w-0 " + (props.className ?? "")}
      onBlurCapture={() => props.onCommit?.()}
      onKeyDownCapture={(event) => { if (event.key === "Enter") props.onCommit?.(); }}
    >
      <label htmlFor={props.id} className="mb-1 block text-[13px] font-medium leading-tight text-foreground">
        {displayLabel}{props.required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </label>
      {control}
    </div>
  );
}

export function AlumdoorSalesOrderCreate(props: AlumdoorSalesOrderCreateProps) {
  const { adapter, scopeKey, businessContext, contextPolicies, registry, services, roles } = useMetaForge();
  const queryClient = useQueryClient();
  const [meta, setMeta] = useState<DocTypeMeta | null>(null);
  const [childMeta, setChildMeta] = useState<DocTypeMeta | null>(null);
  const [header, setHeader] = useState<Json>({});
  const [customerPhone, setCustomerPhone] = useState("");
  const [lines, setLines] = useState<SalesLine[]>([newLine(0)]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [fatal, setFatal] = useState("");
  const closeSeen = useRef(props.closeRequest ?? 0);
  const lineSeq = useRef(new Map<string, number>());

  const childFields = useMemo(
    () => childMeta?.fields.map((field) => field.fieldname).filter(Boolean) ?? [],
    [childMeta],
  );
  const childFieldSet = useMemo(() => new Set(childFields), [childFields]);
  const salesPhoneField = useMemo(() => {
    const candidates = ["customer_phone", "contact_phone", "contact_mobile", "mobile_no", "phone_no", "phone"];
    return candidates.find((name) => meta?.fields.some((field) => field.fieldname === name));
  }, [meta]);
  const salesModes = useMemo(
    () => optionList(childMeta, "sales_mode", ["Tách món", "Trọn bộ"]),
    [childMeta],
  );
  const leafVariants = useMemo(
    () => optionList(childMeta, "leaf_variant", ["Kéo tay", "Motor ngoài", "Motor trong"]),
    [childMeta],
  );

  useEffect(() => {
    if ((props.closeRequest ?? 0) === closeSeen.current) return;
    closeSeen.current = props.closeRequest ?? 0;
    props.onCancel();
  }, [props.closeRequest, props.onCancel]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const salesMeta = await adapter.getMeta("Sales Order");
        const table = salesMeta.fields.find(
          (field) => field.fieldname === "items" && field.fieldtype === "Table",
        );
        const childDoctype = text(table?.options) || "Sales Order Item";
        const [itemMeta, boot, caps] = await Promise.all([
          adapter.getMeta(childDoctype),
          adapter.getBoot(),
          adapter.getCapabilities("Sales Order"),
        ]);
        if (!active) return;
        const defaults: Json = {
          ...blankFromMeta(salesMeta),
          ...applyContextPolicy("Sales Order", businessContext, contextPolicies).defaults,
        };
        if (!defaults.transaction_date) defaults.transaction_date = today();
        if (!defaults.delivery_date) defaults.delivery_date = today();
        if (!defaults.currency) defaults.currency = boot.sysdefaults.currency || "VND";
        setMeta(salesMeta);
        setChildMeta(itemMeta);
        setCanCreate(Boolean(caps.create));
        setHeader(defaults);
      } catch (error) {
        if (active) setFatal(mapError(error).message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [adapter, businessContext, contextPolicies]);

  useEffect(() => {
    const customerName = text(header.customer);
    if (!customerName) {
      setCustomerPhone("");
      return;
    }
    let active = true;
    void adapter.getDoc("Customer", customerName)
      .then((result) => {
        if (!active) return;
        const customer = result.doc as Json;
        const phone = [
          customer.phone,
          customer.mobile_no,
          customer.mobile,
          customer.phone_no,
          customer.contact_phone,
          customer.contact_mobile,
        ].map(text).find(Boolean) ?? "";
        setCustomerPhone(phone);
        if (salesPhoneField && phone) {
          setHeader((current) => ({ ...current, [salesPhoneField]: phone }));
        }
      })
      .catch(() => {
        if (active) setCustomerPhone("");
      });
    return () => {
      active = false;
    };
  }, [adapter, header.customer, salesPhoneField]);

  const cleanLine = useCallback((line: SalesLine): Json => {
    const result: Json = {};
    for (const [key, value] of Object.entries(line)) {
      if (!key.startsWith("_") && childFieldSet.has(key) && value !== undefined) {
        result[key] = value;
      }
    }
    return result;
  }, [childFieldSet]);

  const patchLine = useCallback((key: string, patch: Partial<SalesLine>) => {
    setLines((current) => current.map((line) => (
      line._key === key ? { ...line, ...patch } : line
    )));
  }, []);

  const previewDocument = useCallback(async (
    next: Json,
    changedField: string,
    currentLines = lines,
  ): Promise<Json> => {
    const result = await adapter.callPost<Json>("alumdoor.ui.preview_document", {
      doctype: "Sales Order",
      doc: { ...next, items: currentLines.map(cleanLine) },
      changed_field: changedField,
    });
    const patch = result.patch && typeof result.patch === "object" && !Array.isArray(result.patch)
      ? result.patch as Json
      : {};
    const merged = { ...next, ...patch };
    for (const field of Array.isArray(result.clear) ? result.clear.map(text) : []) {
      delete merged[field];
    }
    return merged;
  }, [adapter, cleanLine, lines]);

  const setHeaderField = useCallback((field: string, value: unknown, preview = false) => {
    const next = { ...header, [field]: value };
    setHeader(next);
    if (!preview) return;
    void previewDocument(next, field)
      .then((resolved) => setHeader(resolved))
      .catch((error) => toast.error(mapError(error).message));
  }, [header, previewDocument]);

  const loadSalesOptions = useCallback(async (itemCode: string, itemGroup: string): Promise<Doc[]> => {
    if (!itemGroup) return [];
    try {
      const rows = await adapter.getList("Sales Option", {
        fields: [
          "name",
          "option_label",
          "item_group",
          "item_code",
          "is_default",
          "disabled",
          "sales_mode",
          "price_variant",
          "sales_package",
        ],
        filters: { item_group: itemGroup, disabled: 0 },
        pageLength: 100,
      });
      return rows.filter((row) => !text(row.item_code) || text(row.item_code) === itemCode);
    } catch {
      return [];
    }
  }, [adapter]);

  const previewLine = useCallback(async (
    source: SalesLine,
    changedField: string,
    patch: Partial<SalesLine> = {},
  ) => {
    if (!childMeta) return;
    const row = { ...source, ...patch } as SalesLine;
    if (!text(row.item_code)) return;
    const seq = (lineSeq.current.get(row._key) ?? 0) + 1;
    lineSeq.current.set(row._key, seq);
    patchLine(row._key, { ...patch, _loading: true, _error: "" });
    try {
      const parent = { ...header, items: undefined };
      const colorsPromise: Promise<Json> = adapter
        .callPost<Json>("alumdoor.catalog.allowed_colors", {
          item_code: row.item_code,
          usage_scope: "sales",
        })
        .catch((): Json => ({}));
      const [context, preview, colors] = await Promise.all([
        adapter.callPost<ItemContext>("alumdoor.sales.item_context", {
          item_code: row.item_code,
          uom: row.uom,
          warehouse: row.warehouse,
          price_list: header.selling_price_list,
          currency: header.currency || "VND",
          qty: row.qty,
          sales_option: row.sales_option,
        }),
        adapter.callPost<Json>("alumdoor.ui.preview_child_row", {
          child_doctype: childMeta.name,
          child_fields: childFields,
          row,
          parent,
          changed_field: changedField,
        }),
        colorsPromise,
      ]);
      if (lineSeq.current.get(row._key) !== seq) return;
      const serverPatch = preview.patch && typeof preview.patch === "object" && !Array.isArray(preview.patch)
        ? preview.patch as Json
        : {};
      const overrides = preview.field_overrides
        && typeof preview.field_overrides === "object"
        && !Array.isArray(preview.field_overrides)
        ? preview.field_overrides as Record<string, FieldOverride>
        : {};
      const allowedColors = Array.isArray(colors.allowed_colors)
        ? colors.allowed_colors.map(text).filter(Boolean)
        : [];
      const next: Partial<SalesLine> = {
        ...patch,
        ...serverPatch,
        _context: context,
        _allowedColors: allowedColors,
        _overrides: overrides,
        _loading: false,
        _error: "",
      };
      for (const field of Array.isArray(preview.clear) ? preview.clear.map(text) : []) {
        if (childFieldSet.has(field)) next[field] = undefined;
      }
      if (changedField === "item_code") {
        const options = await loadSalesOptions(text(row.item_code), text(context.item_group));
        if (lineSeq.current.get(row._key) !== seq) return;
        next._salesOptions = options;
        if (!text(row.sales_option)) {
          const defaultOption = options.find(
            (candidate) => candidate.is_default === true || candidate.is_default === 1,
          );
          if (defaultOption?.name) next.sales_option = String(defaultOption.name);
        }
      }
      patchLine(row._key, next);
      if (
        changedField === "item_code"
        && text(next.sales_option)
        && text(next.sales_option) !== text(row.sales_option)
      ) {
        void previewLine(
          { ...row, ...next } as SalesLine,
          "sales_option",
          { sales_option: next.sales_option },
        );
      }
    } catch (error) {
      if (lineSeq.current.get(row._key) === seq) {
        patchLine(row._key, {
          ...patch,
          _loading: false,
          _error: mapError(error).message,
        });
      }
    }
  }, [adapter, childFieldSet, childFields, childMeta, header, loadSalesOptions, patchLine]);

  const commitLine = useCallback((key: string, field: string, value: unknown) => {
    const current = lines.find((line) => line._key === key);
    if (!current) return;
    patchLine(key, { [field]: value });
    void previewLine(current, field, { [field]: value });
  }, [lines, patchLine, previewLine]);

  useEffect(() => {
    if (!childMeta) return;
    const timer = window.setTimeout(() => {
      for (const line of lines) {
        if (text(line.item_code)) void previewLine(line, "parent_context");
      }
    }, 120);
    return () => window.clearTimeout(timer);
    // Re-preview only when commercial parent context changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.customer_group, header.selling_price_list, header.currency]);

  const validate = useCallback((): string | null => {
    if (!meta || !childMeta) return "Chưa tải xong cấu trúc Sales Order.";
    for (const field of meta.fields) {
      if (!field.reqd || LAYOUT_TYPES.has(field.fieldtype) || field.fieldtype === "Table") continue;
      if (header[field.fieldname] == null || header[field.fieldname] === "") {
        return `Thiếu ${field.label || field.fieldname}.`;
      }
    }
    if (!text(header.customer)) return "Cần chọn khách hàng.";
    if (!lines.length) return "Đơn hàng phải có ít nhất một dòng.";
    for (const [index, line] of lines.entries()) {
      if (!text(line.item_code)) return `Dòng ${index + 1}: cần chọn mặt hàng.`;
      if (line._loading) return `Dòng ${index + 1}: đang tính lại.`;
      if (line._error) return `Dòng ${index + 1}: ${line._error}`;
      for (const [field, rule] of Object.entries(line._overrides ?? {})) {
        if (!(rule.reqd === 1 || rule.reqd === true)) continue;
        if (rule.hidden === 1 || rule.hidden === true) continue;
        if (line[field] == null || line[field] === "") {
          return `Dòng ${index + 1}: thiếu ${text(rule.label).replace("\n", " ") || field}.`;
        }
      }
      if (isAreaDoor(line) && !["Đại lý", "Lẻ"].includes(text(header.customer_group))) {
        return `Dòng ${index + 1}: khách hàng chưa có nhóm giá Đại lý/Lẻ hợp lệ.`;
      }
    }
    return null;
  }, [childMeta, header, lines, meta]);

  const save = useCallback(async (previewAfterSave: boolean) => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    if (!meta) return;
    setSaving(true);
    try {
      const parentFields = new Set(meta.fields.map((field) => field.fieldname));
      const document: Json = {};
      for (const [field, value] of Object.entries(header)) {
        if (parentFields.has(field) && value !== undefined) document[field] = value;
      }
      document.items = lines.map(cleanLine);
      const finalPreview = await previewDocument(document, "items", lines);
      const created = await adapter.createDoc(
        "Sales Order",
        serializeCreateDocument(meta, finalPreview) as Partial<Doc>,
      );
      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: [scopeKey, "list-view", "Sales Order"],
          refetchType: "active",
        }),
        queryClient.invalidateQueries({
          queryKey: [scopeKey, "list", "Sales Order"],
          refetchType: "active",
        }),
        queryClient.invalidateQueries({
          queryKey: [scopeKey, "count", "Sales Order"],
          refetchType: "active",
        }),
        queryClient.invalidateQueries({
          queryKey: [scopeKey, "overview"],
          refetchType: "none",
        }),
      ]).catch(() => undefined);
      toast.success(`Đã tạo đơn ${created.name}`);
      if (previewAfterSave) props.onPreviewCreated(String(created.name));
      else props.onCreated(String(created.name));
    } catch (cause) {
      toast.error(mapError(cause).message);
    } finally {
      setSaving(false);
    }
  }, [adapter, cleanLine, header, lines, meta, previewDocument, props, queryClient, scopeKey, validate]);

  if (loading) {
    return (
      <div className="grid h-full place-items-center text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Đang mở màn bán hàng AlumDoor…
        </span>
      </div>
    );
  }
  if (fatal) return <div className="p-6 text-sm text-destructive">{fatal}</div>;
  if (!meta || !childMeta) {
    return <div className="p-6 text-sm text-muted-foreground">Không đọc được cấu trúc đơn hàng.</div>;
  }

  const metaField = (fieldname: string) => meta.fields.find((field) => field.fieldname === fieldname);
  const childField = (fieldname: string) => childMeta.fields.find((field) => field.fieldname === fieldname);
  const headerField = (fieldname: string, label: string, fieldtype: DocField["fieldtype"] = "Data", options?: string) =>
    metaField(fieldname) ?? fallbackField(fieldname, label, fieldtype, options);
  const lineBaseField = (fieldname: string, label: string, fieldtype: DocField["fieldtype"] = "Data", options?: string) =>
    childField(fieldname) ?? fallbackField(fieldname, label, fieldtype, options);
  const metaRequired = (fieldname: string) => Boolean(metaField(fieldname)?.reqd);
  const phoneValue = salesPhoneField ? text(header[salesPhoneField]) || customerPhone : customerPhone;

  const parentTotal = Number(header.grand_total);
  const displayedTotal = Number.isFinite(parentTotal) && parentTotal > 0
    ? parentTotal
    : lines.reduce((sum, line) => sum + lineTotal(line), 0);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background" data-surface="alumdoor-sales-order-create">
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1760px] space-y-3 px-4 py-3">
          <section className="rounded-lg border bg-card p-3" data-section="sales-customer-meta-header">
  <div className="mb-2 flex items-center justify-between gap-3">
    <h2 className="text-sm font-semibold">Th??ng tin kh??ch h??ng</h2>
    <span className="text-[11px] text-muted-foreground">????n b??n h??ng m???i</span>
  </div>

  <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(320px,2.2fr)_minmax(150px,.8fr)_minmax(260px,1.5fr)_150px_150px]">
    <StandardField
      id="sales-customer"
      field={headerField("customer", "Kh??ch h??ng", "Link", "Customer")}
      value={header.customer}
      onChange={(value) => setHeaderField("customer", text(value) || undefined, true)}
      registry={registry}
      services={services}
      parentDoctype="Sales Order"
      docValues={header}
      roles={roles}
      required={metaRequired("customer")}
      className="xl:order-1"
    />

    <StandardField
      id="sales-phone"
      field={salesPhoneField ? headerField(salesPhoneField, "S??T") : fallbackField("__customer_phone", "S??T")}
      value={phoneValue}
      onChange={(value) => {
        const phone = text(value);
        setCustomerPhone(phone);
        if (salesPhoneField) setHeaderField(salesPhoneField, phone || undefined);
      }}
      registry={registry}
      services={services}
      parentDoctype="Sales Order"
      docValues={header}
      roles={roles}
      readOnly={!salesPhoneField}
      className="xl:order-2"
    />

    <StandardField
      id="sales-address"
      field={headerField("install_address", "?????a ch??? giao / l???p ?????t")}
      value={header.install_address}
      onChange={(value) => setHeaderField("install_address", text(value) || undefined)}
      registry={registry}
      services={services}
      parentDoctype="Sales Order"
      docValues={header}
      roles={roles}
      required={metaRequired("install_address")}
      label="?????a ch??? giao / l???p ?????t"
      className="md:col-span-2 xl:order-6 xl:col-span-5"
    />

    <StandardField
      id="sales-order-date"
      field={headerField("transaction_date", "Ng??y ?????t h??ng", "Date")}
      value={header.transaction_date}
      onChange={(value) => setHeaderField("transaction_date", text(value), true)}
      registry={registry}
      services={services}
      parentDoctype="Sales Order"
      docValues={header}
      roles={roles}
      required={metaRequired("transaction_date")}
      label="Ng??y ?????t h??ng"
      className="xl:order-4"
    />

    <StandardField
      id="sales-delivery-date"
      field={headerField("delivery_date", "Ng??y giao", "Date")}
      value={header.delivery_date}
      onChange={(value) => setHeaderField("delivery_date", text(value))}
      registry={registry}
      services={services}
      parentDoctype="Sales Order"
      docValues={header}
      roles={roles}
      required={metaRequired("delivery_date")}
      label="Ng??y giao"
      className="xl:order-5"
    />

    <StandardField
      id="sales-responsible-person"
      field={headerField("responsible_person", "Nh??n vi??n b??n h??ng", "Link", "Employee")}
      value={header.responsible_person}
      onChange={(value) => setHeaderField("responsible_person", text(value) || undefined)}
      registry={registry}
      services={services}
      parentDoctype="Sales Order"
      docValues={header}
      roles={roles}
      required={metaRequired("responsible_person")}
      label="Nh??n vi??n b??n h??ng"
      className="md:col-span-2 xl:order-3 xl:col-span-1"
    />
  </div>
</section>

<section className="space-y-2" data-section="hardcoded-sales-lines">
            <div className="flex min-h-8 items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Chi tiết bán hàng</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setLines((current) => [...current, newLine(current.length)])}
              >
                <Plus className="mr-1 size-4" /> Thêm sản phẩm
              </Button>
            </div>

            {lines.map((line, index) => {
              const kind = family(line);
              const area = isAreaDoor(line);
              const uoms = Array.isArray(line._context?.allowed_uoms)
                ? line._context.allowed_uoms.map(text).filter(Boolean)
                : [];
              const colors = line._allowedColors ?? [];
              const salesOptions = line._salesOptions ?? [];
              const showSalesMode = area && fieldVisible(
                line,
                "sales_mode",
                ["australian", "mesh", "taiwan", "super"].includes(kind),
              );
              const showLeafVariant = fieldVisible(line, "leaf_variant", kind === "australian");
              const showWidth = area || fieldVisible(line, "width_m");
              const showHeight = area || fieldVisible(line, "height_m");
              const showSets = area || fieldVisible(line, "set_count");
              const showLength = fieldVisible(line, "length_m")
                && (fieldRequired(line, "length_m") || line.length_m != null);
              const showBars = fieldVisible(line, "qty_bar")
                && (fieldRequired(line, "qty_bar") || line.qty_bar != null);

              return (
                <article key={line._key} className="overflow-hidden rounded-lg border bg-card">
                  <div className="flex min-h-9 items-center justify-between gap-2 border-b bg-muted/25 px-2.5 py-1.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold">
                          {line._itemLabel || text(line.item_code) || "Chọn mặt hàng"}
                        </div>
                        {text(line._context?.availability_status) ? (
                          <div className="truncate text-[10px] text-muted-foreground">
                            {text(line._context?.availability_status)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {line._loading ? <Loader2 className="mr-1 size-3.5 animate-spin text-muted-foreground" /> : null}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        title="Nhân dòng"
                        onClick={() => setLines((current) => [
                          ...current,
                          { ...line, _key: newLine(current.length)._key, _loading: false, _error: "" },
                        ])}
                      >
                        <Copy className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        title="Xoá dòng"
                        disabled={lines.length === 1}
                        onClick={() => setLines((current) => current.filter((entry) => entry._key !== line._key))}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 p-2.5">
                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-12">
            <StandardField
              id={\`sales-line-\${index}-item\`}
              field={lineBaseField("item_code", "M???t h??ng", "Link", "Item")}
              value={line.item_code}
              onChange={(value) => {
                const itemCode = text(value);
                const reset: Partial<SalesLine> = {
                  item_code: itemCode || undefined,
                  _itemLabel: undefined,
                  sales_option: undefined,
                  _context: undefined,
                  _salesOptions: [],
                  _allowedColors: [],
                  _overrides: {},
                  _error: "",
                };
                patchLine(line._key, reset);
                if (itemCode) void previewLine({ ...line, ...reset } as SalesLine, "item_code", reset);
              }}
              registry={registry}
              services={services}
              parentDoctype="Sales Order"
              docValues={{ ...header, ...line }}
              roles={roles}
              required
              compact
              label="M???t h??ng"
              className={text(line.item_code) ? "md:col-span-2 xl:col-span-5" : "md:col-span-2 xl:col-span-8"}
            />

            {salesOptions.length ? (
              <StandardField
                id={\`sales-line-\${index}-sales-option\`}
                field={selectField(
                  childField("sales_option"),
                  "sales_option",
                  "Ph????ng ??n b??n",
                  salesOptions.map((option) => String(option.name)),
                  Object.fromEntries(salesOptions.map((option) => [String(option.name), text(option.option_label) || String(option.name)])),
                )}
                value={line.sales_option}
                onChange={(value) => commitLine(line._key, "sales_option", text(value) || undefined)}
                registry={registry}
                services={services}
                parentDoctype="Sales Order Item"
                docValues={line}
                roles={roles}
                label="Ph????ng ??n b??n"
                className="md:col-span-2 xl:col-span-3"
              />
            ) : null}

            {colors.length ? (
              <StandardField
                id={\`sales-line-\${index}-color\`}
                field={selectField(childField("color"), "color", "M??u", colors)}
                value={line.color}
                onChange={(value) => commitLine(line._key, "color", text(value) || undefined)}
                registry={registry}
                services={services}
                parentDoctype="Sales Order Item"
                docValues={line}
                roles={roles}
                label="M??u"
                className="xl:col-span-2"
              />
            ) : null}

            {uoms.length ? (
              <StandardField
                id={\`sales-line-\${index}-uom\`}
                field={selectField(childField("uom"), "uom", "??VT", uoms)}
                value={line.uom}
                onChange={(value) => commitLine(line._key, "uom", text(value) || undefined)}
                registry={registry}
                services={services}
                parentDoctype="Sales Order Item"
                docValues={line}
                roles={roles}
                label="??VT"
                className="xl:col-span-2"
              />
            ) : text(line.uom) ? (
              <StandardField
                id={\`sales-line-\${index}-uom\`}
                field={fallbackField("uom", "??VT")}
                value={line.uom}
                onChange={() => undefined}
                registry={registry}
                services={services}
                parentDoctype="Sales Order Item"
                docValues={line}
                roles={roles}
                readOnly
                label="??VT"
                className="xl:col-span-2"
              />
            ) : null}
          </div>

          {text(line.item_code) ? (
            <div className="grid gap-2 rounded-md border bg-muted/10 p-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {showWidth ? (
                <StandardField
                  id={\`sales-line-\${index}-width\`}
                  field={lineBaseField("width_m", fieldLabel(line, "width_m", "R???ng (m)"), "Float")}
                  value={line.width_m}
                  onChange={(value) => patchLine(line._key, { width_m: value == null || value === "" ? undefined : Number(value) })}
                  onCommit={() => commitLine(line._key, "width_m", line.width_m)}
                  registry={registry} services={services} parentDoctype="Sales Order Item" docValues={line} roles={roles}
                  required={area || fieldRequired(line, "width_m")} readOnly={fieldReadonly(line, "width_m")}
                  label={fieldLabel(line, "width_m", "R???ng (m)")}
                />
              ) : null}

              {showHeight ? (
                <StandardField
                  id={\`sales-line-\${index}-height\`}
                  field={lineBaseField("height_m", fieldLabel(line, "height_m", "Cao (m)"), "Float")}
                  value={line.height_m}
                  onChange={(value) => patchLine(line._key, { height_m: value == null || value === "" ? undefined : Number(value) })}
                  onCommit={() => commitLine(line._key, "height_m", line.height_m)}
                  registry={registry} services={services} parentDoctype="Sales Order Item" docValues={line} roles={roles}
                  required={area || fieldRequired(line, "height_m")} readOnly={fieldReadonly(line, "height_m")}
                  label={fieldLabel(line, "height_m", "Cao (m)")}
                />
              ) : null}

              {showSets ? (
                <StandardField
                  id={\`sales-line-\${index}-sets\`}
                  field={lineBaseField("set_count", fieldLabel(line, "set_count", area ? "S??? b???" : "S??? l?????ng"), "Int")}
                  value={line.set_count}
                  onChange={(value) => patchLine(line._key, { set_count: value == null || value === "" ? undefined : Number(value) })}
                  onCommit={() => commitLine(line._key, "set_count", line.set_count)}
                  registry={registry} services={services} parentDoctype="Sales Order Item" docValues={line} roles={roles}
                  required={area || fieldRequired(line, "set_count")} readOnly={fieldReadonly(line, "set_count")}
                  label={fieldLabel(line, "set_count", area ? "S??? b???" : "S??? l?????ng")}
                />
              ) : null}

              {showSalesMode ? (
                <StandardField
                  id={\`sales-line-\${index}-sales-mode\`}
                  field={selectField(childField("sales_mode"), "sales_mode", "C??ch b??n", salesModes)}
                  value={line.sales_mode || "Tr???n b???"}
                  onChange={(value) => commitLine(line._key, "sales_mode", text(value) || undefined)}
                  registry={registry} services={services} parentDoctype="Sales Order Item" docValues={line} roles={roles}
                  label="C??ch b??n"
                />
              ) : null}

              {showLeafVariant ? (
                <StandardField
                  id={\`sales-line-\${index}-leaf-variant\`}
                  field={selectField(childField("leaf_variant"), "leaf_variant", "Ki???u k??o / motor", leafVariants)}
                  value={line.leaf_variant}
                  onChange={(value) => commitLine(line._key, "leaf_variant", text(value) || undefined)}
                  registry={registry} services={services} parentDoctype="Sales Order Item" docValues={line} roles={roles}
                  label="Ki???u k??o / motor"
                />
              ) : null}

              {kind === "mesh" ? (
                <StandardField
                  id={\`sales-line-\${index}-mesh-height\`}
                  field={lineBaseField("mesh_height_m", "Cao l?????i (m)", "Float")}
                  value={line.mesh_height_m}
                  onChange={(value) => patchLine(line._key, { mesh_height_m: value == null || value === "" ? undefined : Number(value) })}
                  onCommit={() => commitLine(line._key, "mesh_height_m", line.mesh_height_m)}
                  registry={registry} services={services} parentDoctype="Sales Order Item" docValues={line} roles={roles}
                  label="Cao l?????i (m)"
                />
              ) : null}

              {fieldVisible(line, "has_butterfly_bracket") ? (
                <StandardField
                  id={\`sales-line-\${index}-butterfly\`}
                  field={lineBaseField("has_butterfly_bracket", "C?? b???n b?????m", "Check")}
                  value={line.has_butterfly_bracket}
                  onChange={(value) => commitLine(line._key, "has_butterfly_bracket", value ? 1 : 0)}
                  registry={registry} services={services} parentDoctype="Sales Order Item" docValues={line} roles={roles}
                  readOnly={fieldReadonly(line, "has_butterfly_bracket")}
                  label="C?? b???n b?????m"
                />
              ) : null}

              {showLength ? (
                <StandardField
                  id={\`sales-line-\${index}-length\`}
                  field={lineBaseField("length_m", fieldLabel(line, "length_m", "D??i m???t c??y/??o???n (m)"), "Float")}
                  value={line.length_m}
                  onChange={(value) => patchLine(line._key, { length_m: value == null || value === "" ? undefined : Number(value) })}
                  onCommit={() => commitLine(line._key, "length_m", line.length_m)}
                  registry={registry} services={services} parentDoctype="Sales Order Item" docValues={line} roles={roles}
                  required={fieldRequired(line, "length_m")} readOnly={fieldReadonly(line, "length_m")}
                  label={fieldLabel(line, "length_m", "D??i m???t c??y/??o???n (m)")}
                />
              ) : null}

              {showBars ? (
                <StandardField
                  id={\`sales-line-\${index}-bars\`}
                  field={lineBaseField("qty_bar", fieldLabel(line, "qty_bar", "S??? c??y/??o???n"), "Int")}
                  value={line.qty_bar}
                  onChange={(value) => patchLine(line._key, { qty_bar: value == null || value === "" ? undefined : Number(value) })}
                  onCommit={() => commitLine(line._key, "qty_bar", line.qty_bar)}
                  registry={registry} services={services} parentDoctype="Sales Order Item" docValues={line} roles={roles}
                  required={fieldRequired(line, "qty_bar")} readOnly={fieldReadonly(line, "qty_bar")}
                  label={fieldLabel(line, "qty_bar", "S??? c??y/??o???n")}
                />
              ) : null}

              {!area && !showSets && !showBars ? (
                <StandardField
                  id={\`sales-line-\${index}-qty\`}
                  field={lineBaseField("qty", "Kh???i l?????ng", "Float")}
                  value={line.qty}
                  onChange={(value) => patchLine(line._key, { qty: value == null || value === "" ? undefined : Number(value) })}
                  onCommit={() => commitLine(line._key, "qty", line.qty)}
                  registry={registry} services={services} parentDoctype="Sales Order Item" docValues={line} roles={roles}
                  required readOnly={fieldReadonly(line, "qty")}
                  label="Kh???i l?????ng"
                />
              ) : null}
            </div>
          ) : null}

          {line._error ? (
                      <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs text-destructive">
                        {line._error}
                      </div>
                    ) : null}
                    {line._context?.price_missing ? (
                      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-300">
                        {text(line._context.price_error) || "Chưa khai đơn giá phù hợp."}
                      </div>
                    ) : null}

                    {text(line.item_code) ? (
                      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 rounded-md bg-muted/20 px-2.5 py-1.5 text-[11px] tabular-nums">
                        <span className="text-muted-foreground">
                          {Number.isFinite(Number(line.qty)) ? Number(line.qty).toLocaleString("vi-VN", { maximumFractionDigits: 6 }) : "—"} {text(line.uom)}
                        </span>
                        <span>ĐG <strong>{money(line.rate)} ₫</strong></span>
                        {Number(line.discount_amount) > 0 ? (
                          <span className="text-emerald-700 dark:text-emerald-400">CK -{money(line.discount_amount)} ₫</span>
                        ) : null}
                        {Number(line.adjustment_amount) !== 0 ? (
                          <span>Phụ thu +{money(line.adjustment_amount)} ₫</span>
                        ) : null}
                        <span className="ml-1 text-xs font-semibold">Thành tiền <strong className="text-sm">{money(lineTotal(line))} ₫</strong></span>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      </div>

      <div className="shrink-0 border-t bg-card px-4 py-2 shadow-[0_-4px_14px_rgba(0,0,0,0.035)]">
        <div className="mx-auto flex w-full max-w-[1760px] flex-wrap items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] text-muted-foreground">Tạm tính</span>
            <strong className="text-xl font-bold tabular-nums">{money(displayedTotal)} ₫</strong>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button type="button" variant="ghost" size="sm" onClick={props.onCancel}>Huỷ</Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => {
                for (const line of lines) {
                  if (text(line.item_code)) void previewLine(line, "manual_refresh");
                }
              }}
            >
              <RefreshCw className="mr-1 size-3.5" /> Tính lại
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving || !canCreate}
              onClick={() => void save(true)}
            >
              <Eye className="mr-1 size-3.5" /> Lưu & xem
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={saving || !canCreate}
              onClick={() => void save(false)}
            >
              {saving ? <Loader2 className="mr-1 size-3.5 animate-spin" /> : <Save className="mr-1 size-3.5" />}
              Lưu đơn hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
