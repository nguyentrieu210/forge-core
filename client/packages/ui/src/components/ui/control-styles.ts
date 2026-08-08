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
 * Bề mặt "chrome" của các HEADER — header hộp thoại, header lưới con, và bất kỳ dải tiêu đề nào
 * cần tách khỏi vùng dữ liệu ngay bên dưới nó.
 *
 * TRƯỚC ĐÂY là `bg-[var(--mf-brand)]` + chữ nghịch đảo, tức mỗi header là một mảng ĐẶC màu
 * thương hiệu. Bỏ vì hai lý do:
 *   1. Không đồng nhất — `thead` của bảng danh sách đã chuyển sang bề mặt graphite nhạt chữ tối
 *      (xem `table.tsx`); để header hộp thoại/lưới con đảo màu thì cùng một khái niệm "tiêu đề"
 *      lại có hai diện mạo, đúng thứ mục 15 của bản yêu cầu gọi là "mỗi màn một palette".
 *   2. Ở mật độ ERP, một biểu mẫu có thể chứa 3–4 lưới con; bốn dải navy đặc trong một màn hình
 *      hút hết sự chú ý khỏi chính dữ liệu.
 *
 * `--secondary` + `--foreground` cho đúng bậc bề mặt "cao hơn card một nấc" mà vẫn giữ chữ tối,
 * và tự đảo đúng chiều ở dark mode.
 */
export const chromeFill = "bg-secondary";
export const chromeText = "text-foreground";

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
