/**
 * Bảng màu dùng chung cho mọi app MetaForge — **Graphite + Enterprise Blue**.
 *
 * TRƯỚC ĐÂY có 13 bảng màu (zinc/blue/warm + sakura/emerald/ocean/violet/indigo/teal/amber/rose/
 * aurora/sunset). Đã thu về một bộ nhỏ có chủ đích: hệ thống nghiệp vụ cần MỘT ngôn ngữ thị giác
 * để người dùng đọc dữ liệu, không phải 13 chủ đề trang trí — và các bảng màu rực (hồng, cam,
 * tím…) không thể vừa giữ tinh thần enterprise vừa giữ tương phản AA trên bảng và biểu mẫu dày đặc.
 *
 * Cả ba brand DÙNG CHUNG nền graphite, viền, mật độ và bóng; chỉ khác họ màu nhấn. Đó là thứ giữ
 * chúng là một hệ thống thay vì ba giao diện.
 *
 *   enterprise — graphite + navy doanh nghiệp (mặc định)
 *   graphite   — trung tính hoàn toàn, primary không màu
 *   red        — graphite + đỏ doanh nghiệp
 *
 * `enterprise` KHÔNG stamp `data-brand` (nó chính là khối `:root` trong `packages/ui/src/
 * styles.css`), đúng cách `zinc` từng là mặc định — nên hợp đồng "không có attribute = brand
 * mặc định" giữ nguyên, phía app không phải sửa gì.
 */
import { useCallback, useEffect, useState } from "react";

export type BrandMode = "enterprise" | "graphite" | "red";


const KEY = "metaforge-brand";
const CHANGE_EVENT = "metaforge-brand-change";
/** Ô màu = đúng `--primary` mà brand đó áp thật lên hệ thống, không phải một swatch quảng cáo. */
export const BRANDS: { id: BrandMode; label: string; swatch: string }[] = [
  { id: "enterprise", label: "Doanh nghiệp", swatch: "#1e40af" },
  { id: "graphite", label: "Than chì", swatch: "#374151" },
  { id: "red", label: "Đỏ doanh nghiệp", swatch: "#991b1b" },
];

export const BRAND_COLOR_COUNT = BRANDS.length;

/**
 * Bảng màu cũ → bảng màu mới.
 *
 * Người dùng đang chạy hệ thống có `metaforge-brand` trong localStorage mang một trong 13 giá trị
 * cũ. Không map thì `isBrandMode` trả false và họ rơi về mặc định — chấp nhận được, nhưng ai đang
 * dùng "Than chì" sẽ mất đúng lựa chọn mà hệ thống MỚI vẫn còn. Chỉ map trường hợp thật sự có
 * bản kế nhiệm (zinc = brand trung tính cũ → graphite); 11 bảng màu trang trí không có, nên rơi
 * về mặc định.
 */
const LEGACY_BRAND_ALIASES: Record<string, BrandMode> = { zinc: "graphite" };

export function isBrandMode(value: unknown): value is BrandMode {
  return BRANDS.some((brand) => brand.id === value);
}

/** Đọc giá trị đã lưu, chấp nhận cả tên cũ. Trả `null` nếu không hiểu được. */
export function normalizeBrand(value: unknown): BrandMode | null {
  if (isBrandMode(value)) return value;
  if (typeof value === "string") return LEGACY_BRAND_ALIASES[value] ?? null;
  return null;
}

export function applyBrand(brand: BrandMode): void {
  if (typeof document === "undefined") return;
  if (brand === "enterprise") document.documentElement.removeAttribute("data-brand");
  else document.documentElement.setAttribute("data-brand", brand);
}

export function useBrand(controlled?: BrandMode, defaultBrand: BrandMode = "enterprise"): [BrandMode, (b: BrandMode) => void] {
  const [userBrand, setUserBrand] = useState<BrandMode>(() => {
    if (typeof localStorage === "undefined") return defaultBrand;
    return normalizeBrand(localStorage.getItem(KEY)) ?? defaultBrand;
  });
  useEffect(() => {
    const effective = controlled ?? userBrand;
    applyBrand(effective);
    if (controlled === undefined && typeof localStorage !== "undefined") {
      localStorage.setItem(KEY, effective);
    }
  }, [controlled, userBrand]);

  // Có thể có nhiều shell/hộp chọn màu cùng mount trong một runtime. Khi một nơi đổi màu,
  // các nơi còn lại phải cập nhật dấu chọn ngay thay vì đợi reload trang.
  useEffect(() => {
    if (controlled !== undefined || typeof window === "undefined" || typeof localStorage === "undefined") return;
    const sync = () => {
      const value = normalizeBrand(localStorage.getItem(KEY));
      if (value) setUserBrand(value);
    };
    const onStorage = (event: StorageEvent) => { if (event.key === KEY) sync(); };
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, [controlled]);

  const set = useCallback((value: BrandMode) => {
    if (controlled !== undefined) return;
    setUserBrand(value);
    applyBrand(value);
    if (typeof localStorage !== "undefined") localStorage.setItem(KEY, value);
    if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
  }, [controlled]);
  return [controlled ?? userBrand, set];
}
