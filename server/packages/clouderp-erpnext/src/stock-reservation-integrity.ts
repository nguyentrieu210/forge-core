import type { JsonObject } from "../../contracts/src/index.js";
import { requireLeafWarehouse } from "../../clouderp-stock/src/index.js";
import { errors } from "../../core/src/index.js";
import type { ControllerContext } from "../../document-kernel/src/index.js";
import { fromScaledInt, toScaledInt } from "../../money/src/index.js";
import { StockReservationController } from "./alumdoor-inventory.js";

type ReservationContext = Parameters<StockReservationController["normalize"]>[0];
type ReservationData = Awaited<ReturnType<StockReservationController["normalize"]>>;

const FROZEN_IDENTITY_FIELDS = [
  "item_code",
  "color",
  "condition",
  "warehouse",
  "source_doctype",
  "source_name",
  "reserved_at",
] as const;

function text(value: unknown): string {
  return String(value ?? "").normalize("NFC").trim();
}

function stateOf(value: unknown): string {
  return text(value) || "Đang giữ";
}

function decimalInput(value: unknown, field: string): string | number {
  if (typeof value === "string" || typeof value === "number") return value;
  throw errors.validation(`${field} là bắt buộc và phải là số`);
}

function timestamp(value: unknown, field: string): number | null {
  const raw = text(value);
  if (!raw) return null;
  const parsed = Date.parse(raw);
  if (!Number.isFinite(parsed)) throw errors.validation(`${field} không phải thời điểm hợp lệ`);
  return parsed;
}

function assertReservationIdentityImmutable(current: ReservationData, previous: ReservationData): void {
  for (const field of FROZEN_IDENTITY_FIELDS) {
    if (text(current[field]) !== text(previous[field])) {
      throw errors.validation(`Giữ chỗ đã tạo: không được đổi ${field}; hãy nhả phiếu cũ và tạo giữ chỗ mới để giữ audit`);
    }
  }

  const currentLength = toScaledInt(current.min_length_m, 6, "min_length_m");
  const previousLength = toScaledInt(previous.min_length_m, 6, "min_length_m");
  if (currentLength !== previousLength) {
    throw errors.validation("Giữ chỗ đã tạo: không được đổi min_length_m; hãy nhả phiếu cũ và tạo giữ chỗ mới để giữ audit");
  }
}

function assertActiveReservationNotZombie(context: ReservationContext, previous: ReservationData, desiredState: string): void {
  if (stateOf(previous.state) !== "Đang giữ") return;
  const expiresAt = timestamp(previous.expires_at, "expires_at");
  const now = timestamp(context.now, "now");
  if (expiresAt != null && now != null && expiresAt <= now && desiredState !== "Hết hạn") {
    throw errors.lifecycle("Giữ chỗ đã quá hạn; phải chuyển Hết hạn trước khi sửa, không được hồi sinh âm thầm");
  }
}

function assertConsumptionIsNotClientDeclared(current: ReservationData, previous: ReservationData, desiredState: string): void {
  if (desiredState === "Đã dùng") {
    throw errors.lifecycle(
      "Trạng thái Đã dùng do chứng từ tiêu thụ/cắt xác nhận; không được chuyển tay trên phiếu giữ chỗ",
    );
  }
  if (desiredState !== "Đang giữ") return;
  const before = toScaledInt(previous.qty_reserved, 6, "qty_reserved");
  const after = toScaledInt(current.qty_reserved, 6, "qty_reserved");
  if (after < before) {
    throw errors.lifecycle(
      "Không được giảm số lượng giữ chỗ bằng tay; phần đã dùng phải được trừ từ bằng chứng cắt/xuất kho",
    );
  }
}

async function assertReservationWarehouseScope(context: ReservationContext, input: ReservationData): Promise<void> {
  if (!input.warehouse) return;
  const source = input.source_doctype && input.source_name
    ? await context.reader.getDocument<JsonObject>(context.command.tenant_id, input.source_doctype, input.source_name)
    : null;
  const sourceCompany = text(source?.data.company);
  await requireLeafWarehouse(
    context as unknown as ControllerContext<JsonObject>,
    input.warehouse,
    sourceCompany || undefined,
  );
}

function reservationsCompete(request: ReservationData, other: ReservationData): boolean {
  if (other.item_code !== request.item_code) return false;
  if (request.color && other.color && other.color !== request.color) return false;
  if (request.condition && other.condition && other.condition !== request.condition) return false;
  if (request.warehouse && other.warehouse && other.warehouse !== request.warehouse) return false;
  return true;
}

export async function assertReservationFeasibleAcrossThresholds(
  context: ReservationContext,
  request: ReservationData,
  excludeName: string,
): Promise<void> {
  if (stateOf(request.state) !== "Đang giữ") return;

  const requestThreshold = toScaledInt(request.min_length_m, 6, "min_length_m");
  const requestQty = toScaledInt(request.qty_reserved, 6, "qty_reserved");
  const positions = await context.reader.listTrackedStockPositions(
    context.command.tenant_id,
    request.item_code,
  );
  const eligible: Array<{ qtyMicros: number; lengthMicros: number }> = [];

  for (const position of positions) {
    if (position.qty_micros <= 0) continue;
    if (request.warehouse && position.warehouse !== request.warehouse) continue;
    const batch = await context.reader.getMasterRecordData(
      context.command.tenant_id,
      "Batch",
      position.batch_no,
    );
    if (!batch || (batch.item_code && batch.item_code !== request.item_code)) continue;
    if (request.color && batch.color !== request.color) continue;
    if (request.condition && batch.condition !== request.condition) continue;
    const warehouse = await context.reader.getMasterRecordData(
      context.command.tenant_id,
      "Warehouse",
      position.warehouse,
    );
    if (warehouse?.stock_role !== "Kho chính") continue;
    const lengthMicros = toScaledInt(
      decimalInput(batch.length_m, `Batch ${position.batch_no}.length_m`),
      6,
      `Batch ${position.batch_no}.length_m`,
    );
    eligible.push({ qtyMicros: position.qty_micros, lengthMicros });
  }

  const documents = await context.reader.listDocumentsByDoctype<ReservationData>(
    context.command.tenant_id,
    "Stock Reservation",
  );
  const active = documents.filter((document) => {
    if (document.name === excludeName) return false;
    if (stateOf(document.data.state) !== "Đang giữ") return false;
    if (document.data.expires_at && document.data.expires_at <= context.now) return false;
    return reservationsCompete(request, document.data);
  });

  const thresholds = new Set<number>([requestThreshold]);
  for (const document of active) {
    thresholds.add(toScaledInt(document.data.min_length_m, 6, "min_length_m"));
  }

  for (const threshold of [...thresholds].sort((left, right) => left - right)) {
    const stockMicros = eligible
      .filter((position) => position.lengthMicros >= threshold)
      .reduce((total, position) => total + position.qtyMicros, 0);
    const alreadyReservedMicros = active
      .filter((document) => toScaledInt(document.data.min_length_m, 6, "min_length_m") >= threshold)
      .reduce((total, document) => total + toScaledInt(document.data.qty_reserved, 6, "qty_reserved"), 0);
    const newDemandMicros = requestThreshold >= threshold ? requestQty : 0;
    const demandMicros = alreadyReservedMicros + newDemandMicros;

    if (demandMicros > stockMicros) {
      throw errors.reference(
        `Không đủ tồn khả dụng theo cơ cấu khổ: tại ngưỡng ≥ ${fromScaledInt(threshold, 6)} m `
        + `chỉ có ${fromScaledInt(stockMicros, 6)} lá nhưng tổng giữ sẽ là ${fromScaledInt(demandMicros, 6)} lá`,
        {
          min_length_micros: threshold,
          stock_qty_micros: stockMicros,
          existing_reserved_qty_micros: alreadyReservedMicros,
          requested_qty_micros: newDemandMicros,
          resulting_reserved_qty_micros: demandMicros,
        },
      );
    }
  }
}

export class StockReservationIntegrityController extends StockReservationController {
  override async normalize(context: ReservationContext): Promise<ReservationData> {
    const input = context.command.document;
    const previous = context.existing?.data;
    const desiredState = stateOf(input.state ?? previous?.state);

    await assertReservationWarehouseScope(context, input);

    if (!previous) {
      if (desiredState !== "Đang giữ") {
        throw errors.lifecycle("Giữ chỗ mới phải bắt đầu ở trạng thái Đang giữ");
      }
      const normalized = await super.normalize(context);
      const qtyMicros = toScaledInt(normalized.qty_reserved, 6, "qty_reserved");
      const withSnapshot = {
        ...normalized,
        initial_qty_reserved: fromScaledInt(qtyMicros, 6),
        initial_qty_reserved_micros: qtyMicros,
      } as ReservationData;
      await assertReservationFeasibleAcrossThresholds(context, withSnapshot, context.command.aggregate.name);
      return withSnapshot;
    }

    assertReservationIdentityImmutable(input, previous);
    assertActiveReservationNotZombie(context, previous, desiredState);
    assertConsumptionIsNotClientDeclared(input, previous, desiredState);
    const normalized = await super.normalize(context);
    const initialMicros = typeof previous.initial_qty_reserved_micros === "number"
      ? previous.initial_qty_reserved_micros
      : toScaledInt(
          decimalInput(previous.initial_qty_reserved ?? previous.qty_reserved, "initial_qty_reserved"),
          6,
          "initial_qty_reserved",
        );
    const withSnapshot = {
      ...normalized,
      initial_qty_reserved: fromScaledInt(initialMicros, 6),
      initial_qty_reserved_micros: initialMicros,
    } as ReservationData;
    await assertReservationFeasibleAcrossThresholds(context, withSnapshot, context.command.aggregate.name);
    return withSnapshot;
  }
}
