import type { CanonicalDocument, JsonObject, StockLedgerEntry } from "../../contracts/src/index.js";
import type { ControllerContext } from "../../document-kernel/src/index.js";
import { fromScaledInt, toScaledInt } from "../../money/src/index.js";

type DomainReader = ControllerContext<JsonObject>["reader"];

interface ReservationSourceData extends JsonObject {
  item_code?: string;
  color?: string;
  condition?: string;
  warehouse?: string;
  min_length_m?: string | number;
  qty_reserved?: string | number;
  source_doctype?: string;
  source_name?: string;
  state?: string;
}

interface CutOrderSourceData extends JsonObject {
  production_order?: string;
  so_reference?: string;
}

interface ConsumptionFact {
  itemCode: string;
  warehouse: string;
  color: string;
  condition: string;
  lengthMicros: number;
  qtyMicros: number;
  voucher: string;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function decimal(value: unknown): string | number | null {
  return typeof value === "string" || typeof value === "number" ? value : null;
}

/**
 * Projection wrapper for the reservation overlay.
 *
 * Two facts change an effective promise without rewriting its audit record:
 * 1. cancelled source => the promise no longer competes for ATP;
 * 2. submitted Cut Order for that Production Order => committed outward Stock Ledger rows
 *    consume the promise. Consumption is allocated longest-minimum-first, because a long bar
 *    can satisfy a shorter requirement but the reverse is impossible.
 *
 * `excludedSourceNames` is request-scoped ownership, not a stored state mutation. It lets a
 * Cut/Delivery operation consume stock promised to its own Production/Sales source while all
 * other promises remain protected.
 */
export function reservationLifecycleReader(
  reader: DomainReader,
  tenantId: string,
  excludedSourceNames: Iterable<string> = [],
): DomainReader {
  const excluded = new Set([...excludedSourceNames].map(text).filter(Boolean));
  return new Proxy(reader, {
    get(target, property, receiver) {
      if (property === "listDocumentsByDoctype") {
        return async <T extends JsonObject>(requestedTenant: string, doctype: string): Promise<CanonicalDocument<T>[]> => {
          const documents = await target.listDocumentsByDoctype<T>(requestedTenant, doctype);
          if (doctype !== "Stock Reservation" || requestedTenant !== tenantId) return documents;

          const sourceOpen: CanonicalDocument<T>[] = [];
          for (const document of documents) {
            const data = document.data as ReservationSourceData;
            const sourceDoctype = text(data.source_doctype);
            const sourceName = text(data.source_name);
            if (sourceName && excluded.has(sourceName)) continue;
            if (!sourceDoctype || !sourceName) {
              sourceOpen.push(document);
              continue;
            }
            const source = await target.getDocument<JsonObject>(tenantId, sourceDoctype, sourceName);
            if (source?.docstatus === 2) continue;
            sourceOpen.push(document);
          }

          return projectCutConsumption(target, tenantId, sourceOpen);
        };
      }
      const value = Reflect.get(target, property, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

async function projectCutConsumption<T extends JsonObject>(
  reader: DomainReader,
  tenantId: string,
  reservations: CanonicalDocument<T>[],
): Promise<CanonicalDocument<T>[]> {
  const productionReservations = reservations.filter((document) => {
    const data = document.data as ReservationSourceData;
    return text(data.source_doctype) === "Production Order"
      && text(data.source_name)
      && text(data.state || "Đang giữ") === "Đang giữ"
      && decimal(data.qty_reserved) != null
      && decimal(data.min_length_m) != null;
  });
  if (!productionReservations.length) return reservations;

  const sourceNames = new Set(productionReservations.map((document) => text((document.data as ReservationSourceData).source_name)));
  const cutOrders = await reader.listDocumentsByDoctype<JsonObject>(tenantId, "Cut Order");
  const relevantCuts = cutOrders.filter((document) => document.docstatus === 1 && sourceNames.has(text((document.data as CutOrderSourceData).production_order)));
  if (!relevantCuts.length) return reservations;

  const factsBySource = new Map<string, ConsumptionFact[]>();
  for (const cut of relevantCuts) {
    const sourceName = text((cut.data as CutOrderSourceData).production_order);
    const stock = await reader.getVoucherStockEntries(tenantId, "Cut Order", cut.name, cut.version);
    for (const entry of stock) {
      const fact = await toConsumptionFact(reader, tenantId, entry, cut.name);
      if (!fact) continue;
      const facts = factsBySource.get(sourceName) ?? [];
      facts.push(fact);
      factsBySource.set(sourceName, facts);
    }
  }
  if (!factsBySource.size) return reservations;

  const projected = new Map<string, CanonicalDocument<T>>(reservations.map((document) => [document.name, document]));
  for (const sourceName of sourceNames) {
    const sourceReservations = productionReservations
      .filter((document) => text((document.data as ReservationSourceData).source_name) === sourceName)
      .map((document) => ({
        document,
        data: document.data as ReservationSourceData,
        remainingMicros: toScaledInt(decimal((document.data as ReservationSourceData).qty_reserved)!, 6, "qty_reserved"),
        thresholdMicros: toScaledInt(decimal((document.data as ReservationSourceData).min_length_m)!, 6, "min_length_m"),
        consumedMicros: 0,
      }))
      .sort((left, right) => right.thresholdMicros - left.thresholdMicros || left.document.name.localeCompare(right.document.name));

    for (const fact of factsBySource.get(sourceName) ?? []) {
      let unallocated = fact.qtyMicros;
      for (const reservation of sourceReservations) {
        if (unallocated <= 0 || reservation.remainingMicros <= 0) continue;
        if (!matchesReservation(reservation.data, fact, reservation.thresholdMicros)) continue;
        const take = Math.min(unallocated, reservation.remainingMicros);
        reservation.remainingMicros -= take;
        reservation.consumedMicros += take;
        unallocated -= take;
      }
    }

    for (const reservation of sourceReservations) {
      if (reservation.consumedMicros <= 0) continue;
      const effectiveState = reservation.remainingMicros === 0 ? "Đã dùng" : "Đang giữ";
      projected.set(reservation.document.name, {
        ...reservation.document,
        status: effectiveState,
        data: {
          ...reservation.document.data,
          qty_reserved: fromScaledInt(reservation.remainingMicros, 6),
          qty_reserved_micros: reservation.remainingMicros,
          state: effectiveState,
          consumed_qty: fromScaledInt(reservation.consumedMicros, 6),
          consumed_qty_micros: reservation.consumedMicros,
          consumption_source: "Cut Order Stock Ledger",
        } as T,
      });
    }
  }

  return reservations.map((document) => projected.get(document.name) ?? document);
}

async function toConsumptionFact(
  reader: DomainReader,
  tenantId: string,
  entry: StockLedgerEntry,
  voucher: string,
): Promise<ConsumptionFact | null> {
  if (entry.actual_qty_micros >= 0) return null;
  const batchNo = text(entry.batch_no);
  if (!batchNo) return null;
  const batch = await reader.getMasterRecordData(tenantId, "Batch", batchNo);
  if (!batch) return null;
  const length = decimal(batch.length_m);
  if (length == null) return null;
  return {
    itemCode: entry.item_code,
    warehouse: entry.warehouse,
    color: text(batch.color),
    condition: text(batch.condition),
    lengthMicros: toScaledInt(length, 6, `Batch ${batchNo}.length_m`),
    qtyMicros: -entry.actual_qty_micros,
    voucher,
  };
}

function matchesReservation(
  reservation: ReservationSourceData,
  fact: ConsumptionFact,
  thresholdMicros: number,
): boolean {
  return text(reservation.item_code) === fact.itemCode
    && (!text(reservation.warehouse) || text(reservation.warehouse) === fact.warehouse)
    && (!text(reservation.color) || text(reservation.color) === fact.color)
    && (!text(reservation.condition) || text(reservation.condition) === fact.condition)
    && fact.lengthMicros >= thresholdMicros;
}

export function withReservationLifecycleReader<T extends JsonObject>(
  context: ControllerContext<T>,
  excludedSourceNames: Iterable<string> = [],
): ControllerContext<T> {
  return {
    ...context,
    reader: reservationLifecycleReader(
      context.reader as unknown as DomainReader,
      context.command.tenant_id,
      excludedSourceNames,
    ),
  };
}
