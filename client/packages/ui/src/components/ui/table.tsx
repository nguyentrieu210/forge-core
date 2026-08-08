import * as React from "react";
import { cn } from "../../lib/cn.js";

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Bỏ khung cuộn bọc ngoài. Cần khi bảng đã nằm trong một vùng cuộn của cha (vd ListView có
   * khung cuộn riêng để làm header dính + ảo hoá dòng) — lồng 2 vùng cuộn sẽ sinh 2 thanh cuộn
   * và làm `position: sticky` neo nhầm khung. */
  unwrapped?: boolean;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, unwrapped, ...props }, ref) => {
    const table = <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />;
    return unwrapped ? table : <div className="relative w-full overflow-auto">{table}</div>;
  },
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  // ĐỤC chứ không phải bán trong suốt: khi thead dính (sticky) thì nền mờ để các dòng dữ liệu
  // trôi bên dưới hiện xuyên qua chữ tiêu đề. Nền là `--secondary` (graphite nhạt) chứ KHÔNG phải
  // mảng primary đảo màu — header đảo màu biến mỗi bảng thành một khối nặng, và ở màn nhiều bảng
  // thì các dải đậm chia vụn màn hình. Màu do VẠCH navy 2px trên đỉnh + chữ tiêu đề navy đảm
  // nhiệm (đặt ở `TableHead`, vì viền phải nằm trên từng `<th>` mới liền mạch khi cuộn ngang).
  ({ className, ...props }, ref) => <thead ref={ref} className={cn("[&_tr]:border-b bg-secondary", className)} {...props} />,
);
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />,
);
TableBody.displayName = "TableBody";

export const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tfoot ref={ref} className={cn("border-t bg-muted font-medium", className)} {...props} />,
);
TableFooter.displayName = "TableFooter";

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-accent", className)} {...props} />
  ),
);
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    /*
      Tiêu đề cột phải đọc được ở khoảng cách liếc mắt: người nhập liệu quét ngang hàng tiêu đề để
      tìm cột cần gõ, chứ không đọc từng chữ. `text-xs` + `text-muted-foreground` làm hàng tiêu đề
      nhạt gần bằng dữ liệu bên dưới, mất luôn ranh giới giữa "tên cột" và "nội dung".
    */
    <th ref={ref} className={cn("h-9 whitespace-nowrap border-t-2 border-b border-t-primary border-b-input bg-secondary px-3 text-left align-middle text-[13px] font-semibold text-header-foreground", className)} {...props} />
  ),
);
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  // `max-w-0` + `truncate` KHÔNG đặt ở đây (nhiều ô cần xuống dòng), nhưng `align-middle` + padding
  // cố định giữ nhịp dòng ổn định giữa ô 1 dòng và ô nhiều dòng.
  ({ className, ...props }, ref) => <td ref={ref} className={cn("px-3 py-2 align-middle", className)} {...props} />,
);
TableCell.displayName = "TableCell";
