import type { DocumentArchetype } from "./document-presentation.js";

/**
 * Diện mạo theo LOẠI chứng từ (archetype).
 *
 * Ý đồ nghiệp vụ giữ nguyên: mở một màn chi tiết phải nhận ra ngay đang xem hồ sơ danh mục, chứng
 * từ giao dịch, phiếu kho hay bút toán — nên mỗi archetype vẫn mang một sắc riêng.
 *
 * ĐÃ ĐỔI (2026-08-08) cách thể hiện sắc đó:
 *   - Trước: mỗi archetype lấy một màu Tailwind thô (violet/cyan/orange/amber/emerald/indigo/slate)
 *     ⇒ bảy sắc rực nằm NGOÀI hệ token; đổi bảng màu hệ thống thì bảy màu này đứng yên và màn chi
 *     tiết lệch tông với phần còn lại.
 *   - Sau: dùng dải `chart-1..5` — dải đã chọn cho enterprise dashboard, có sẵn bản light/dark và
 *     tự đi theo brand. Ghép với biểu tượng + tiêu đề vốn đã khác nhau, 5 sắc + trung tính là đủ
 *     để phân biệt 8 archetype.
 *   - Bỏ `bg-gradient-to-r` ở dải hero: nền chuyển sắc phía sau tiêu đề và các ô số làm nền vùng
 *     dữ liệu không đồng nhất theo chiều ngang. Thay bằng tint phẳng.
 *
 * VIẾT NGUYÊN VĂN từng chuỗi class, KHÔNG dựng bằng template literal/hàm sinh: Tailwind quét mã
 * nguồn dưới dạng văn bản, nên `bg-[${x}]` không bao giờ được sinh ra CSS và class sẽ im lặng
 * không có tác dụng.
 */
export interface DocumentExperienceProfile {
  accentClass: string;
  heroClass: string;
  iconClass: string;
  metricClass: string;
  kickerClass: string;
  railTitle: string;
  railDescription: string;
}

const PROFILES: Record<DocumentArchetype, DocumentExperienceProfile> = {
  master: {
    accentClass: "bg-chart-4",
    heroClass: "bg-chart-4/[0.04]",
    iconClass: "bg-chart-4/10 text-chart-4 ring-chart-4/25",
    metricClass: "border-chart-4/20 bg-chart-4/[0.04]",
    kickerClass: "text-chart-4",
    railTitle: "Quan hệ & phân loại",
    railDescription: "Thông tin nhận diện, phân nhóm và liên hệ chính của hồ sơ.",
  },
  transaction: {
    accentClass: "bg-primary",
    heroClass: "bg-primary/[0.04]",
    iconClass: "bg-primary/10 text-primary ring-primary/25",
    metricClass: "border-primary/20 bg-primary/[0.04]",
    kickerClass: "text-primary",
    railTitle: "Điều kiện giao dịch",
    railDescription: "Ngày, công ty, kho, tiền tệ và các điều kiện cần đọc nhanh trước khi xử lý.",
  },
  inventory: {
    accentClass: "bg-chart-2",
    heroClass: "bg-chart-2/[0.04]",
    iconClass: "bg-chart-2/10 text-chart-2 ring-chart-2/25",
    metricClass: "border-chart-2/20 bg-chart-2/[0.04]",
    kickerClass: "text-chart-2",
    railTitle: "Nguồn, đích & thời điểm",
    railDescription: "Ngữ cảnh dịch chuyển kho giúp đối chiếu nơi đi, nơi đến và thời điểm ghi nhận.",
  },
  production: {
    accentClass: "bg-chart-3",
    heroClass: "bg-chart-3/[0.04]",
    iconClass: "bg-chart-3/10 text-chart-3 ring-chart-3/25",
    metricClass: "border-chart-3/20 bg-chart-3/[0.04]",
    kickerClass: "text-chart-3",
    railTitle: "Kế hoạch thực thi",
    railDescription: "Sản phẩm, lịch chạy, kho WIP và kho thành phẩm của lệnh sản xuất.",
  },
  approval: {
    // Phê duyệt là trạng thái CHỜ — dùng đúng token cảnh báo của hệ thống chứ không phải một sắc
    // trang trí, để khớp với badge "chờ duyệt" ở danh sách và ở thông báo.
    accentClass: "bg-warning",
    heroClass: "bg-warning/[0.05]",
    iconClass: "bg-warning/12 text-warning-text ring-warning/25",
    metricClass: "border-warning/20 bg-warning/[0.04]",
    kickerClass: "text-warning-text",
    railTitle: "Căn cứ phê duyệt",
    railDescription: "Người yêu cầu, bộ phận, mức ưu tiên và dữ liệu cần thiết cho quyết định.",
  },
  ledger: {
    accentClass: "bg-chart-5",
    heroClass: "bg-chart-5/[0.04]",
    iconClass: "bg-chart-5/10 text-chart-5 ring-chart-5/25",
    metricClass: "border-chart-5/20 bg-chart-5/[0.04]",
    kickerClass: "text-chart-5",
    railTitle: "Hạch toán & đối tượng",
    railDescription: "Tài khoản, đối tượng, phương thức thanh toán và chiều tiền của chứng từ.",
  },
  analysis: {
    accentClass: "bg-chart-1",
    heroClass: "bg-chart-1/[0.04]",
    iconClass: "bg-chart-1/10 text-chart-1 ring-chart-1/25",
    metricClass: "border-chart-1/20 bg-chart-1/[0.04]",
    kickerClass: "text-chart-1",
    railTitle: "Phạm vi phân tích",
    railDescription: "Khoảng thời gian, công ty và chiều dữ liệu đang được tổng hợp trong màn phân tích.",
  },
  generic: {
    accentClass: "bg-muted-foreground",
    heroClass: "bg-card",
    iconClass: "bg-muted text-foreground ring-border",
    metricClass: "border-border bg-muted/25",
    kickerClass: "text-primary",
    railTitle: "Thông tin nhanh",
    railDescription: "Các dữ liệu giúp đọc chứng từ mà không phải rà từng ô trong biểu mẫu.",
  },
};

export function resolveDocumentExperienceProfile(archetype: DocumentArchetype): DocumentExperienceProfile {
  return PROFILES[archetype] ?? PROFILES.generic;
}
