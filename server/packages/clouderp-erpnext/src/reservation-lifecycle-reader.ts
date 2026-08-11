import type { CanonicalDocument, JsonObject } from "../../contracts/src/index.js";
import type { ControllerContext } from "../../document-kernel/src/index.js";

type DomainReader = ControllerContext<JsonObject>["reader"];

interface ReservationSourceData extends JsonObject {
  source_doctype?: string;
  source_name?: string;
}

/**
 * Projection wrapper: a reservation whose source document is cancelled no longer competes
 * for ATP even if its immutable audit record still says `Đang giữ`.
 *
 * Missing source documents remain conservative/active: creation already requires a source,
 * so disappearance indicates corrupted history and must never silently free promised stock.
 */
export function reservationLifecycleReader(reader: DomainReader, tenantId: string): DomainReader {
  return new Proxy(reader, {
    get(target, property, receiver) {
      if (property === "listDocumentsByDoctype") {
        return async <T extends JsonObject>(requestedTenant: string, doctype: string): Promise<CanonicalDocument<T>[]> => {
          const documents = await target.listDocumentsByDoctype<T>(requestedTenant, doctype);
          if (doctype !== "Stock Reservation" || requestedTenant !== tenantId) return documents;
          const output: CanonicalDocument<T>[] = [];
          for (const document of documents) {
            const data = document.data as ReservationSourceData;
            const sourceDoctype = typeof data.source_doctype === "string" ? data.source_doctype.trim() : "";
            const sourceName = typeof data.source_name === "string" ? data.source_name.trim() : "";
            if (!sourceDoctype || !sourceName) {
              output.push(document);
              continue;
            }
            const source = await target.getDocument<JsonObject>(tenantId, sourceDoctype, sourceName);
            if (source?.docstatus === 2) continue;
            output.push(document);
          }
          return output;
        };
      }
      const value = Reflect.get(target, property, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

export function withReservationLifecycleReader<T extends JsonObject>(
  context: ControllerContext<T>,
): ControllerContext<T> {
  return {
    ...context,
    reader: reservationLifecycleReader(
      context.reader as unknown as DomainReader,
      context.command.tenant_id,
    ),
  };
}
