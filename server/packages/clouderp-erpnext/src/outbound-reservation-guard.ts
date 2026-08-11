import type { JsonObject, StockLedgerEntry } from "../../contracts/src/index.js";
import { errors } from "../../core/src/index.js";
import type { ControllerContext } from "../../document-kernel/src/index.js";
import { fromScaledInt, toScaledInt } from "../../money/src/index.js";
import { withReservationLifecycleReader } from "./reservation-lifecycle-reader.js";

interface ReservationData extends JsonObject {
  item_code: string;
  color?: string;
  condition?: string;
  min_length_m: string | number;
  warehouse?: string;
  qty_reserved: string | number;
  source_name: string;
  expires_at?: string;
  state?: string;
}

interface ConsumptionGroup {
  itemCode: string;
  warehouse: string;
  color: string;
  condition: string;
  cuts: Array<{ qtyMicros: number; lengthMicros: number }>;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function decimal(value: unknown, field: string): string | number {
  if (typeof value === "string" || typeof value === "number") return value;
  throw errors.validation(`${field} là bắt buộc và phải là số`);
}

export async function assertStockPlanRespectsReservations<T extends JsonObject>(
  context: ControllerContext<T>,
  stockEntries: readonly StockLedgerEntry[],
  ownSourceNames: Iterable<string> = [],
): Promise<void> {
  const outbound = stockEntries.filter((entry) => entry.actual_qty_micros < 0 && text(entry.batch_no));
  if (!outbound.length) return;

  const effectiveContext = withReservationLifecycleReader(context);
  const ownSources = new Set([...ownSourceNames].map(text).filter(Boolean));
  const reservations = await effectiveContext.reader.listDocumentsByDoctype<ReservationData>(
    effectiveContext.command.tenant_id,
    "Stock Reservation",
  );
  const active = reservations.filter((document) =>
    document.data.state === "Đang giữ"
    && (!document.data.expires_at || document.data.expires_at > effectiveContext.now)
    && !ownSources.has(text(document.data.source_name)));
  if (!active.length) return;

  const groups = new Map<string, ConsumptionGroup>();
  for (const entry of outbound) {
    const batchNo = text(entry.batch_no);
    const batch = await effectiveContext.reader.getMasterRecordData(effectiveContext.command.tenant_id, "Batch", batchNo);
    if (!batch) throw errors.reference(`Lô ${batchNo} không tồn tại`);
    if (batch.item_code && text(batch.item_code) !== entry.item_code) {
      throw errors.reference(`Lô ${batchNo} không thuộc mặt hàng ${entry.item_code}`);
    }
    const color = text(batch.color);
    const condition = text(batch.condition);
    const lengthMicros = toScaledInt(decimal(batch.length_m, `Batch ${batchNo}.length_m`), 6);
    const key = `${entry.item_code}\u0000${entry.warehouse}\u0000${color}\u0000${condition}`;
    const group = groups.get(key) ?? {
      itemCode: entry.item_code,
      warehouse: entry.warehouse,
      color,
      condition,
      cuts: [],
    };
    group.cuts.push({ qtyMicros: -entry.actual_qty_micros, lengthMicros });
    groups.set(key, group);
  }

  for (const group of groups.values()) {
    const compatible = active.filter((document) => {
      const reservation = document.data;
      return reservation.item_code === group.itemCode
        && (!reservation.warehouse || reservation.warehouse === group.warehouse)
        && (!reservation.color || reservation.color === group.color)
        && (!reservation.condition || reservation.condition === group.condition);
    });
    if (!compatible.length) continue;

    const positions = await effectiveContext.reader.listTrackedStockPositions(effectiveContext.command.tenant_id, group.itemCode);
    const stock: Array<{ qtyMicros: number; lengthMicros: number }> = [];
    for (const position of positions) {
      if (position.warehouse !== group.warehouse || position.qty_micros <= 0) continue;
      const batch = await effectiveContext.reader.getMasterRecordData(effectiveContext.command.tenant_id, "Batch", position.batch_no);
      if (!batch) throw errors.reference(`Lô ${position.batch_no} không tồn tại`);
      if (text(batch.color) !== group.color || text(batch.condition) !== group.condition) continue;
      stock.push({
        qtyMicros: position.qty_micros,
        lengthMicros: toScaledInt(decimal(batch.length_m, `Batch ${position.batch_no}.length_m`), 6),
      });
    }

    const thresholds = [...new Set(compatible.map((document) =>
      toScaledInt(document.data.min_length_m, 6, "min_length_m")))];
    for (const threshold of thresholds) {
      const totalMicros = stock
        .filter((position) => position.lengthMicros >= threshold)
        .reduce((total, position) => total + position.qtyMicros, 0);
      const outboundMicros = group.cuts
        .filter((cut) => cut.lengthMicros >= threshold)
        .reduce((total, cut) => total + cut.qtyMicros, 0);
      const reservedMicros = compatible
        .filter((document) => toScaledInt(document.data.min_length_m, 6, "min_length_m") >= threshold)
        .reduce((total, document) => total + toScaledInt(document.data.qty_reserved, 6, "qty_reserved"), 0);

      if (totalMicros - outboundMicros < reservedMicros) {
        throw errors.reference(
          `Không thể xuất ${fromScaledInt(outboundMicros, 6)} ${group.itemCode} tại ${group.warehouse}: `
          + `phải chừa ${fromScaledInt(reservedMicros, 6)} lá khổ ≥ ${fromScaledInt(threshold, 6)} m cho chứng từ khác`,
          {
            total_qty_micros: totalMicros,
            outbound_qty_micros: outboundMicros,
            reserved_for_other_sources_micros: reservedMicros,
            min_length_micros: threshold,
          },
        );
      }
    }
  }
}
