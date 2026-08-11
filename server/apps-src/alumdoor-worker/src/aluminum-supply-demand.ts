import type { PurchaseFifoEnv } from "./purchase-fifo-receipt.js";

type Json = Record<string, unknown>;
type PlatformCall = (path: string, init?: RequestInit) => Promise<Response>;

export interface AluminumPosition {
  batch_no: string;
  item_code: string;
  warehouse: string;
  length_m: number;
  qty: number;
  color?: string;
  condition?: string;
  is_offcut?: boolean;
}

export interface AluminumReservationDemand {
  source_name: string;
  item_code: string;
  warehouse?: string;
  min_length_m: number;
  qty: number;
  color?: string;
  condition?: string;
}

export interface AluminumDemand {
  work_order: string;
  sales_order: string;
  item_code: string;
  warehouse: string;
  min_length_m: number;
  qty: number;
  color?: string;
  condition?: string;
  stock_uom: string;
  bom_row_id: string;
}

export interface AluminumAllocationPick {
  batch_no: string;
  warehouse: string;
  length_m: number;
  is_offcut: boolean;
  take: number;
  available_before: number;
}

export interface AluminumAllocationResult {
  picks: AluminumAllocationPick[];
  allocated: number;
  shortage: number;
}

export interface AluminumDemandPlan extends AluminumDemand {
  picks: AluminumAllocationPick[];
  allocated: number;
  shortage: number;
  own_reserved: number;
  reserve_target: number;
}

function text(value: unknown): string {
  return String(value ?? "").normalize("NFC").trim();
}

function norm(value: unknown): string {
  return text(value).toLocaleLowerCase("vi");
}

function checked(value: unknown): boolean {
  if (value === true || value === 1 || value === "1") return true;
  return ["true", "yes", "có", "co"].includes(norm(value));
}

function round(value: number, digits = 6): number {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function positive(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function responseJson(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } });
}

function refuse(message: string): Response {
  return responseJson({ message }, 422);
}

function platformCaller(request: Request, env: PurchaseFifoEnv): PlatformCall {
  const callback = request.headers.get("x-cloudforge-callback")?.replace(/\/$/, "");
  if (!callback) throw new Error("Nền tảng không cấp địa chỉ gọi ngược.");
  const forwarded = {
    authorization: request.headers.get("authorization") ?? "",
    "x-cloudforge-app": request.headers.get("x-cloudforge-app") ?? "",
    "x-cloudforge-identity": request.headers.get("x-cloudforge-identity") ?? "",
    "x-cloudforge-identity-signature": request.headers.get("x-cloudforge-identity-signature") ?? "",
  };
  return (path: string, init: RequestInit = {}) => {
    const outbound = new Request(`${callback}/${path.replace(/^\//, "")}`, {
      ...init,
      headers: { "content-type": "application/json", ...forwarded, ...(init.headers as Record<string, string> | undefined) },
    });
    return env.PLATFORM ? env.PLATFORM.fetch(outbound) : fetch(outbound);
  };
}

async function readDoc<T extends Json>(call: PlatformCall, doctype: string, name: string): Promise<T & { modified?: string }> {
  const response = await call(`resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`);
  if (!response.ok) throw new Error(`Không đọc được ${doctype} ${name} (HTTP ${response.status}).`);
  return ((((await response.json()) as { data?: T & { modified?: string } }).data ?? {}) as T & { modified?: string });
}

async function createDoc<T extends Json>(call: PlatformCall, doctype: string, document: T): Promise<T & { name: string; modified?: string }> {
  const response = await call(`resource/${encodeURIComponent(doctype)}`, {
    method: "POST",
    body: JSON.stringify(document),
  });
  if (!response.ok) throw new Error(`Không tạo được ${doctype}: ${(await response.text()).slice(0, 220)}`);
  const data = ((await response.json()) as { data?: T & { name?: string; modified?: string } }).data;
  if (!data?.name) throw new Error(`${doctype} đã tạo nhưng không trả về số chứng từ.`);
  return { ...data, name: data.name };
}

async function updateDoc(call: PlatformCall, doctype: string, name: string, document: Json): Promise<void> {
  const response = await call(`resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`, {
    method: "PUT",
    body: JSON.stringify(document),
  });
  if (!response.ok) throw new Error(`Không cập nhật được ${doctype} ${name}: ${(await response.text()).slice(0, 220)}`);
}

async function listDocs<T extends Json>(
  call: PlatformCall,
  doctype: string,
  fields: string[],
  filters: unknown[] = [],
  limit = 500,
): Promise<T[]> {
  const query = new URLSearchParams({ fields: JSON.stringify(fields), filters: JSON.stringify(filters), limit_page_length: String(limit) });
  const response = await call(`resource/${encodeURIComponent(doctype)}?${query}`);
  if (!response.ok) throw new Error(`Không đọc được danh sách ${doctype} (HTTP ${response.status}).`);
  return (((await response.json()) as { data?: T[] }).data ?? []);
}

async function reportRows<T>(call: PlatformCall, reportName: string, filters: Json): Promise<T[]> {
  const response = await call("method/frappe.desk.query_report.run", {
    method: "POST",
    body: JSON.stringify({ report_name: reportName, ignore_prepared_report: 1, filters }),
  });
  if (!response.ok) throw new Error(`Không đọc được báo cáo ${reportName} (HTTP ${response.status}).`);
  const payload = await response.json() as { message?: { result?: T[] } | T[]; result?: T[] };
  if (Array.isArray(payload.message)) return payload.message;
  if (payload.message && !Array.isArray(payload.message) && Array.isArray(payload.message.result)) return payload.message.result;
  return payload.result ?? [];
}

function matches(position: AluminumPosition, input: {
  item_code: string;
  warehouse?: string;
  min_length_m: number;
  color?: string;
  condition?: string;
}): boolean {
  return position.item_code === input.item_code
    && (!input.warehouse || position.warehouse === input.warehouse)
    && position.length_m + 1e-9 >= input.min_length_m
    && (!input.color || !position.color || position.color === input.color)
    && (!input.condition || !position.condition || position.condition === input.condition)
    && position.qty > 0;
}

function candidateOrder(left: AluminumPosition, right: AluminumPosition): number {
  if (Boolean(left.is_offcut) !== Boolean(right.is_offcut)) return left.is_offcut ? -1 : 1;
  if (left.length_m !== right.length_m) return left.length_m - right.length_m;
  return left.batch_no.localeCompare(right.batch_no);
}

/**
 * Deterministic best-fit allocator: offcuts first, then the smallest full Batch that fits.
 * Mutates the supplied position pool so callers can allocate existing reservations before new demand.
 */
export function allocateAluminumDemand(
  pool: AluminumPosition[],
  input: { item_code: string; warehouse?: string; min_length_m: number; qty: number; color?: string; condition?: string },
): AluminumAllocationResult {
  let remaining = input.qty;
  const picks: AluminumAllocationPick[] = [];
  if (!Number.isInteger(remaining) || remaining < 0) throw new Error("Nhu cầu nhôm phải là số cây/lá nguyên không âm.");
  const candidates = pool.filter((position) => matches(position, input)).sort(candidateOrder);
  for (const position of candidates) {
    if (remaining <= 0) break;
    const availableBefore = position.qty;
    const take = Math.min(remaining, Math.floor(position.qty));
    if (take <= 0) continue;
    position.qty = round(position.qty - take);
    remaining -= take;
    picks.push({
      batch_no: position.batch_no,
      warehouse: position.warehouse,
      length_m: position.length_m,
      is_offcut: Boolean(position.is_offcut),
      take,
      available_before: availableBefore,
    });
  }
  return { picks, allocated: input.qty - remaining, shortage: remaining };
}

/** Reserve existing commitments first, longest threshold first, before calculating new ATP. */
export function protectExternalReservations(pool: AluminumPosition[], reservations: AluminumReservationDemand[]): void {
  const ordered = [...reservations].sort((a, b) => b.min_length_m - a.min_length_m || a.source_name.localeCompare(b.source_name));
  for (const reservation of ordered) {
    const allocated = allocateAluminumDemand(pool, reservation);
    if (allocated.shortage > 0) {
      // Existing reservation exceeding current stock is already an operational inconsistency.
      // Consume everything possible and keep the shortage visible to the caller through stock state;
      // do not invent negative positions.
      continue;
    }
  }
}

interface BatchBalanceRow {
  batch_no?: string;
  warehouse?: string;
  actual_qty?: number;
}

async function loadPositions(call: PlatformCall, itemCode: string): Promise<AluminumPosition[]> {
  const rows = await reportRows<BatchBalanceRow>(call, "Batch Stock Balance", { item_code: itemCode });
  const positiveRows = rows.filter((row) => text(row.batch_no) && positive(row.actual_qty));
  const uniqueBatch = [...new Set(positiveRows.map((row) => text(row.batch_no)))];
  const batchRows = await Promise.all(uniqueBatch.map(async (batch) => [batch, await readDoc<Json>(call, "Batch", batch)] as const));
  const batchMap = new Map(batchRows);
  return positiveRows.map((row) => {
    const batchNo = text(row.batch_no);
    const batch = batchMap.get(batchNo) ?? {};
    return {
      batch_no: batchNo,
      item_code: text(batch.item_code ?? batch.item) || itemCode,
      warehouse: text(row.warehouse),
      length_m: positive(batch.length_m),
      qty: Math.floor(positive(row.actual_qty)),
      color: text(batch.color) || undefined,
      condition: text(batch.condition) || undefined,
      is_offcut: checked(batch.is_offcut),
    };
  }).filter((row) => row.length_m > 0 && row.qty > 0);
}

interface ReservationDoc extends Json {
  name?: string;
  item_code?: string;
  warehouse?: string;
  min_length_m?: number;
  qty_reserved?: number;
  source_doctype?: string;
  source_name?: string;
  color?: string;
  condition?: string;
  state?: string;
  expires_at?: string;
  modified?: string;
}

async function activeReservations(call: PlatformCall): Promise<ReservationDoc[]> {
  const listed = await listDocs<ReservationDoc>(call, "Stock Reservation", [
    "name", "item_code", "warehouse", "min_length_m", "qty_reserved", "source_doctype", "source_name",
    "color", "condition", "state", "expires_at", "modified",
  ], [["state", "=", "Đang giữ"]], 5000);
  const now = new Date().toISOString();
  return listed.filter((row) => !row.expires_at || text(row.expires_at) > now);
}

interface SnapshotRow extends Json {
  bom_row_id?: string;
  item_code?: string;
  qty_basis?: string;
  required_qty_micros?: number;
  source_warehouse?: string;
}

interface WorkOrderDoc extends Json {
  name?: string;
  docstatus?: number;
  company?: string;
  against_sales_order?: string;
  source_warehouse?: string;
  cut_width_m?: number;
  color?: string;
  manufacturing_snapshot?: { rows?: SnapshotRow[] };
  required_items?: Json[];
}

async function workOrdersForSales(call: PlatformCall, salesOrder: string): Promise<WorkOrderDoc[]> {
  const listed = await listDocs<{ name?: string }>(call, "Work Order", ["name"], [["against_sales_order", "=", salesOrder]], 500);
  return Promise.all(listed.map((row) => readDoc<WorkOrderDoc>(call, "Work Order", text(row.name))));
}

async function demandsFromWorkOrders(call: PlatformCall, salesOrder: string): Promise<{
  demands: AluminumDemand[];
  unresolved: Json[];
  companies: Set<string>;
}> {
  const works = await workOrdersForSales(call, salesOrder);
  if (!works.length) throw new Error(`Đơn hàng ${salesOrder} chưa có Work Order; tạo kế hoạch sản xuất trước khi tính tồn nhôm.`);
  const demands: AluminumDemand[] = [];
  const unresolved: Json[] = [];
  const companies = new Set<string>();
  const itemCache = new Map<string, Json>();
  for (const work of works) {
    if (work.company) companies.add(text(work.company));
    const rows = Array.isArray(work.manufacturing_snapshot?.rows) ? work.manufacturing_snapshot!.rows! : [];
    for (const row of rows) {
      const itemCode = text(row.item_code);
      if (!itemCode) continue;
      let item = itemCache.get(itemCode);
      if (!item) {
        item = await readDoc<Json>(call, "Item", itemCode);
        itemCache.set(itemCode, item);
      }
      if (text(item.inventory_mode) !== "Nhôm cây/lá" || !checked(item.has_batch_no)) continue;
      const basis = text(row.qty_basis);
      if (basis !== "Theo số lá") {
        unresolved.push({
          work_order: work.name,
          item_code: itemCode,
          bom_row_id: row.bom_row_id,
          qty_basis: basis,
          reason: "Nhôm batch-tracked chưa có dimension contract; chỉ basis Theo số lá được phép dùng cut_width_m.",
        });
        continue;
      }
      const minLength = positive(work.cut_width_m);
      if (!minLength) {
        unresolved.push({ work_order: work.name, item_code: itemCode, bom_row_id: row.bom_row_id, reason: "Work Order thiếu cut_width_m." });
        continue;
      }
      const micros = Number(row.required_qty_micros ?? 0);
      const qty = micros / 1_000_000;
      if (!Number.isInteger(qty) || qty <= 0) {
        unresolved.push({ work_order: work.name, item_code: itemCode, bom_row_id: row.bom_row_id, required_qty_micros: micros, reason: "Số cây/lá theo BOM không phải số nguyên dương." });
        continue;
      }
      const stockUom = text(item.stock_uom);
      if (!stockUom) {
        unresolved.push({ work_order: work.name, item_code: itemCode, reason: "Item thiếu stock_uom." });
        continue;
      }
      demands.push({
        work_order: text(work.name),
        sales_order: salesOrder,
        item_code: itemCode,
        warehouse: text(row.source_warehouse ?? work.source_warehouse),
        min_length_m: minLength,
        qty,
        color: text(work.color) || undefined,
        stock_uom: stockUom,
        bom_row_id: text(row.bom_row_id),
      });
    }
  }
  return { demands, unresolved, companies };
}

async function planSalesOrder(call: PlatformCall, salesOrder: string): Promise<{
  sales_order: string;
  plans: AluminumDemandPlan[];
  unresolved: Json[];
  companies: string[];
}> {
  const { demands, unresolved, companies } = await demandsFromWorkOrders(call, salesOrder);
  const reservations = await activeReservations(call);
  const positionsByItem = new Map<string, AluminumPosition[]>();
  for (const itemCode of [...new Set(demands.map((demand) => demand.item_code))]) {
    positionsByItem.set(itemCode, await loadPositions(call, itemCode));
  }
  const plans: AluminumDemandPlan[] = [];
  for (const demand of demands) {
    const pool = (positionsByItem.get(demand.item_code) ?? []).map((row) => ({ ...row }));
    const external = reservations
      .filter((row) => row.source_name !== demand.work_order)
      .filter((row) => text(row.item_code) === demand.item_code)
      .map((row): AluminumReservationDemand => ({
        source_name: text(row.source_name),
        item_code: demand.item_code,
        warehouse: text(row.warehouse) || undefined,
        min_length_m: positive(row.min_length_m),
        qty: Math.floor(positive(row.qty_reserved)),
        color: text(row.color) || undefined,
        condition: text(row.condition) || undefined,
      }))
      .filter((row) => row.min_length_m > 0 && row.qty > 0);
    protectExternalReservations(pool, external);
    const allocated = allocateAluminumDemand(pool, demand);
    const ownReserved = reservations
      .filter((row) => row.source_name === demand.work_order && text(row.item_code) === demand.item_code)
      .filter((row) => positive(row.min_length_m) + 1e-9 >= demand.min_length_m)
      .reduce((sum, row) => sum + Math.floor(positive(row.qty_reserved)), 0);
    plans.push({
      ...demand,
      ...allocated,
      own_reserved: ownReserved,
      reserve_target: allocated.allocated,
    });
  }
  return { sales_order: salesOrder, plans, unresolved, companies: [...companies] };
}

function argsOf(body: unknown): Json {
  if (!body || typeof body !== "object" || Array.isArray(body)) return {};
  const args = (body as { args?: unknown }).args;
  return args && typeof args === "object" && !Array.isArray(args) ? args as Json : {};
}

export async function handleAluminumSalesPlan(request: Request, env: PurchaseFifoEnv): Promise<Response> {
  try {
    const body = await request.json().catch(() => ({}));
    const args = argsOf(body);
    const salesOrder = text(args.sales_order);
    if (!salesOrder) return refuse("Cần chọn Đơn hàng.");
    const plan = await planSalesOrder(platformCaller(request, env), salesOrder);
    return responseJson({
      ...plan,
      required: plan.plans.reduce((sum, row) => sum + row.qty, 0),
      allocated: plan.plans.reduce((sum, row) => sum + row.allocated, 0),
      shortage: plan.plans.reduce((sum, row) => sum + row.shortage, 0),
      ready: plan.unresolved.length === 0 && plan.plans.every((row) => row.shortage === 0),
    });
  } catch (error) {
    return refuse(error instanceof Error ? error.message : "Không tính được ATP nhôm cho đơn hàng.");
  }
}

export async function handleReserveAluminumForSales(request: Request, env: PurchaseFifoEnv): Promise<Response> {
  try {
    const body = await request.json().catch(() => ({}));
    const args = argsOf(body);
    const salesOrder = text(args.sales_order);
    if (!salesOrder) return refuse("Cần chọn Đơn hàng.");
    const call = platformCaller(request, env);
    const plan = await planSalesOrder(call, salesOrder);
    if (plan.unresolved.length) {
      return refuse(`Còn ${plan.unresolved.length} dòng nhôm chưa có dimension contract; không tự giữ hàng một phần trong trạng thái mơ hồ.`);
    }
    const expiresAt = text(args.expires_at) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const current = await activeReservations(call);
    const changes: Json[] = [];
    for (const row of plan.plans) {
      if (row.reserve_target <= 0) continue;
      const existing = current.find((reservation) =>
        reservation.source_doctype === "Work Order"
        && reservation.source_name === row.work_order
        && text(reservation.item_code) === row.item_code
        && text(reservation.warehouse) === row.warehouse
        && Math.abs(positive(reservation.min_length_m) - row.min_length_m) < 1e-6
        && text(reservation.color) === text(row.color));
      if (existing?.name) {
        if (!equalReservationQty(existing.qty_reserved, row.reserve_target)) {
          await updateDoc(call, "Stock Reservation", existing.name, {
            qty_reserved: row.reserve_target,
            expires_at: expiresAt,
            state: "Đang giữ",
            modified: existing.modified,
          });
          changes.push({ reservation: existing.name, action: "updated", qty_reserved: row.reserve_target });
        } else {
          changes.push({ reservation: existing.name, action: "unchanged", qty_reserved: row.reserve_target });
        }
        continue;
      }
      const created = await createDoc(call, "Stock Reservation", {
        item_code: row.item_code,
        ...(row.color ? { color: row.color } : {}),
        warehouse: row.warehouse,
        min_length_m: row.min_length_m,
        qty_reserved: row.reserve_target,
        source_doctype: "Work Order",
        source_name: row.work_order,
        reserved_at: new Date().toISOString(),
        expires_at: expiresAt,
        state: "Đang giữ",
        note: `Giữ cho ${salesOrder}; ATP theo Batch/Stock Ledger, khổ ≥ ${row.min_length_m} m.`,
      });
      changes.push({ reservation: created.name, action: "created", qty_reserved: row.reserve_target });
    }
    return responseJson({
      sales_order: salesOrder,
      changes,
      shortage: plan.plans.reduce((sum, row) => sum + row.shortage, 0),
      plans: plan.plans,
      message: `Đã đồng bộ ${changes.length} phiếu giữ chỗ; tồn kho không bị ghi giảm cho tới khi Cut Order submit.`,
    });
  } catch (error) {
    return refuse(error instanceof Error ? error.message : "Không giữ được tồn nhôm cho đơn hàng.");
  }
}

function equalReservationQty(value: unknown, expected: number): boolean {
  return Math.abs(Number(value ?? 0) - expected) < 1e-6;
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function handleMaterialRequestFromAluminumShortage(request: Request, env: PurchaseFifoEnv): Promise<Response> {
  try {
    const body = await request.json().catch(() => ({}));
    const args = argsOf(body);
    const salesOrder = text(args.sales_order);
    if (!salesOrder) return refuse("Cần chọn Đơn hàng.");
    const call = platformCaller(request, env);
    const plan = await planSalesOrder(call, salesOrder);
    if (plan.unresolved.length) {
      return refuse(`Còn ${plan.unresolved.length} dòng nhôm chưa có dimension contract; không tạo Yêu cầu vật tư từ số liệu đoán.`);
    }
    const shortages = plan.plans.filter((row) => row.shortage > 0);
    if (!shortages.length) {
      return responseJson({ sales_order: salesOrder, material_request: null, shortage: 0, message: "Tồn khả dụng đủ; không cần tạo Yêu cầu vật tư." });
    }
    if (plan.companies.length !== 1) throw new Error("Các Work Order thuộc nhiều Công ty; phải tách Yêu cầu vật tư.");
    const grouped = new Map<string, AluminumDemandPlan>();
    for (const row of shortages) {
      const key = [row.item_code, row.warehouse, row.color ?? "", row.min_length_m].join("\u001f");
      const prior = grouped.get(key);
      if (prior) prior.shortage += row.shortage;
      else grouped.set(key, { ...row });
    }
    const items = [...grouped.values()].map((row, index) => ({
      row_id: `AL-SHORT-${index + 1}`,
      item_code: row.item_code,
      qty: row.shortage,
      qty_bar: row.shortage,
      uom: row.stock_uom,
      stock_uom: row.stock_uom,
      stock_qty: row.shortage,
      length_m: row.min_length_m,
      ...(row.color ? { color: row.color } : {}),
      warehouse: row.warehouse,
      note: `Thiếu cho ${salesOrder}; cần ${row.shortage} ${row.stock_uom} khổ ≥ ${row.min_length_m} m.`,
    }));
    const fingerprint = await sha256(JSON.stringify({ sales_order: salesOrder, company: plan.companies[0], items }));
    const marker = `[alu-shortage:${salesOrder}:${fingerprint}]`;
    const existing = await listDocs<{ name?: string; note?: string; docstatus?: number }>(
      call,
      "Material Request",
      ["name", "note", "docstatus"],
      [["material_request_type", "=", "Purchase"]],
      500,
    );
    const replay = existing.find((row) => text(row.note).includes(marker));
    if (replay?.name) {
      return responseJson({ sales_order: salesOrder, material_request: replay.name, replayed: true, shortage: shortages.reduce((sum, row) => sum + row.shortage, 0), items });
    }
    const created = await createDoc(call, "Material Request", {
      company: plan.companies[0],
      transaction_date: new Date().toISOString().slice(0, 10),
      material_request_type: "Purchase",
      items,
      note: `${marker} Thiếu nhôm từ ATP của ${salesOrder}; số cây/lá là authority, chưa bịa kg hay giá mua.`,
    });
    return responseJson({
      sales_order: salesOrder,
      material_request: created.name,
      replayed: false,
      shortage: shortages.reduce((sum, row) => sum + row.shortage, 0),
      items,
      message: `Đã tạo Yêu cầu vật tư nháp ${created.name}; Procurement tiếp tục chọn NCC/PO, chưa ghi tồn hay công nợ.`,
    });
  } catch (error) {
    return refuse(error instanceof Error ? error.message : "Không tạo được Yêu cầu vật tư thiếu nhôm.");
  }
}
