/** Vietnamese-friendly numeric parsing/formatting for Bulk Grid cells. */
export function parseBulkNumber(value: string): number | null {
  const raw = value.trim().replace(/\s/g, "");
  if (!raw) return null;
  const negative = raw.startsWith("-");
  const unsigned = raw.replace(/^[+-]/, "");
  if (!/^\d[\d.,]*$/.test(unsigned)) return null;

  const commas = [...unsigned.matchAll(/,/g)].map((match) => match.index ?? 0);
  const dots = [...unsigned.matchAll(/\./g)].map((match) => match.index ?? 0);
  const separators = [...commas, ...dots].sort((left, right) => left - right);
  let normalized = unsigned;
  if (separators.length === 1) {
    const index = separators[0]!;
    const tail = unsigned.slice(index + 1);
    normalized = tail.length === 3 ? unsigned.replace(unsigned[index]!, "") : unsigned.replace(unsigned[index]!, ".");
  } else if (separators.length > 1) {
    const index = separators.at(-1)!;
    const tail = unsigned.slice(index + 1);
    const grouped = tail.length === 3 && separators.every((offset) => unsigned.slice(offset + 1, offset + 4).length === 3);
    normalized = grouped ? unsigned.replace(/[.,]/g, "") : `${unsigned.slice(0, index).replace(/[.,]/g, "")}.${tail}`;
  }
  const parsed = Number(`${negative ? "-" : ""}${normalized}`);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatBulkCurrency(value: unknown): string {
  const number = typeof value === "number" ? value : typeof value === "string" ? parseBulkNumber(value) : null;
  if (number === null) return value == null ? "" : String(value);
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 6 }).format(number);
}
