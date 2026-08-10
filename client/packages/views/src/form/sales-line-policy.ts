import type { Doc } from "@metaforge/core";

export type LinearSalesBasis = "RAY" | "TRUC";

const normalized = (value: unknown) => String(value ?? "").normalize("NFC").trim().toLocaleLowerCase("vi");

const DOOR_TYPES = new Set([
  "cửa đức", "cửa úc", "cửa lưới", "cửa đài loan", "cửa siêu trường", "cửa tấm liền úc",
]);

const DOOR_ITEM_GROUPS = new Set([
  "cửa cn đức", "cửa tấm liền úc", "cửa lưới", "cửa đài loan", "cửa đài loan inox",
  "cửa kéo đài loan", "cửa siêu trường",
]);

/** Ray/trục là hàng bán theo mét, không phải mã cửa dù một số mã đang nằm trong nhóm cửa. */
export function deriveLinearSalesBasis(row: Doc | Record<string, unknown>): LinearSalesBasis | undefined {
  const itemName = normalized(row.item_name);
  const itemCode = normalized(row.item_code);
  if (itemName.startsWith("ray") || itemCode.includes("ray")) return "RAY";
  if (itemName.startsWith("trục") || itemName.startsWith("truc") || itemCode.includes("truc")) return "TRUC";
  return undefined;
}

/** Chỉ mã cửa được mặc định 15%; ray/trục và phụ kiện luôn bắt đầu từ 0%. */
export function defaultSalesDiscountPercent(row: Doc | Record<string, unknown>): number {
  if (deriveLinearSalesBasis(row)) return 0;
  if (DOOR_TYPES.has(normalized(row.door_type))) return 15;
  return normalized(row.inventory_mode) === "thành phẩm theo m2"
    && DOOR_ITEM_GROUPS.has(normalized(row.item_group))
    ? 15
    : 0;
}
