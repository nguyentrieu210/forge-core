/**
 * Style dùng chung cho MỌI control nhập liệu (Input/Textarea/Select/Checkbox/Switch/…).
 *
 * Lý do gom về một chỗ: trước đây mỗi primitive tự viết một bộ, dẫn tới 4 kiểu focus khác nhau
 * (`ring-[3px] ring-ring/25` · `ring-2 ring-ring` · `focus:` thay vì `focus-visible:` · không có
 * gì cả), 2 chiều cao lệch nhau (Input 34px vs Select 36px — đứng cạnh nhau là so le), và
 * shadow lúc có lúc không. Sửa ở đây là sửa cho tất cả.
 */

/** Vòng focus chuẩn — ĐẶC (không phải glow mờ 25%) + offset, chỉ hiện khi dùng bàn phím. */
export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * Bề mặt "chrome" ĐẶC màu thương hiệu — CHỈ dùng cho header của hộp thoại tạo mới (DoctypeWorkspace,
 * provider.tsx). KHÔNG dùng cho `thead` bảng danh sách — bảng đó có bộ token riêng
 * (`--header-foreground` + vạch, xem `table.tsx`) vì lý do khác hẳn: một biểu mẫu có thể mở 3–4
 * lưới con cùng lúc, nên header lưới con dùng bề mặt nhạt để không thành 4 dải đậm chia vụn màn
 * hình.
 *
 * Hộp thoại tạo mới thì khác — chỉ có MỘT cái mở tại một thời điểm, nên mảng đặc màu ở đây không
 * gây ra vấn đề mật độ đó, và giúp hộp thoại nổi rõ là một lớp riêng trên nội dung phía sau.
 *
 * Dùng thẳng `--primary`/`--primary-foreground` — không qua `--mf-brand` (đó là mảng ĐẨY SÁNG
 * dành cho badge/brand mark, xem `brandFill` bên dưới) — để header hộp thoại luôn đúng navy/đỏ/
 * than chì mà brand đang chọn.
 */
export const chromeFill = "bg-primary";
export const chromeText = "text-primary-foreground";

/**
 * Mảng mang MÀU THƯƠNG HIỆU đặc — brand mark, badge nhấn mạnh.
 *
 * Khác `chromeFill` (bề mặt header, graphite): đây là chỗ thực sự cần một mảng màu. Đọc
 * `--mf-brand` — primary đã đẩy sáng một bậc, khai đúng một lần ở `styles.css`.
 */
export const brandFill = "bg-[var(--mf-brand)]";
export const brandText = "text-[color:var(--mf-brand-foreground)]";

/**
 * Nền control = `--card` (gần trắng), KHÔNG phải `--accent`.
 *
 * `--accent` giờ là mảng navy pha loãng dùng cho trạng thái ĐANG CHỌN (hàng được chọn, mục menu
 * đang mở). Dùng nó làm nền mặc định cho mọi ô nhập thì một biểu mẫu 30 ô trông như 30 ô đang
 * được chọn, và mất luôn khả năng thể hiện trạng thái chọn thật. Ô nhập phải là bề mặt trung
 * tính; thứ phân định ranh giới ô là VIỀN (`--input`, bậc viền mạnh), không phải nền.
 */
const controlFill = "bg-card";

/**
 * Chiều cao/viền/nền/chữ chung cho control 1 dòng.
 * `text-base md:text-[13px]`: dưới 16px, Safari iOS TỰ PHÓNG TO trang khi focus vào ô nhập và
 * không thu lại — nên trên màn hình nhỏ dùng 16px, từ md trở lên mới về 13px cho đúng mật độ dày.
 */
export const controlBase =
  `h-8 rounded-md border border-input ${controlFill} text-base md:text-[13px] transition-colors ` +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted " +
  "aria-[invalid=true]:border-destructive aria-[invalid=true]:border-[1.5px]";
