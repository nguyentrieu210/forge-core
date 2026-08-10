/** @jsxImportSource react */
/**
 * PrintContainer — nối PrintView vào backend thật (adapter.printHtml → printview.get_html_and_style).
 * Trang riêng full-page (không phải modal) vì cần đủ chỗ xem bản in + nút "In" gọi window.print()
 * trên khung xem — PrintView vẫn giữ sandbox="" (P0-07, chặn JS/form/popup trong HTML in ấn).
 */
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Printer, ArrowLeft, Minus, Plus, RotateCcw, RefreshCw, Download, Loader2, FileQuestion } from "lucide-react";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, toast, useT } from "@metaforge/ui";
import { useMetaForge } from "../container/provider.js";
import { PrintView } from "./PrintView.js";

export interface PrintContainerProps {
  doctype: string;
  name: string;
  format?: string;
  onFormatChange?: (format: string) => void;
  onBack?: () => void;
}

export function PrintContainer({ doctype, name, format, onFormatChange, onBack }: PrintContainerProps) {
  const t = useT();
  const { adapter, scopeKey } = useMetaForge();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [zoom, setZoom] = useState(1);
  const [savingPdf, setSavingPdf] = useState(false);
  const [localFormat, setLocalFormat] = useState(format);
  const formatsQ = useQuery({
    queryKey: [scopeKey, "print-formats", doctype, name],
    queryFn: () => adapter.getPrintFormats(doctype, name),
    enabled: Boolean(doctype && name),
  });
  const formats = formatsQ.data ?? [];
  const defaultFormat = formats.find((candidate) => candidate.is_default)?.name ?? formats[0]?.name;
  const requestedFormat = format ?? localFormat;
  const selectedFormat = requestedFormat && formats.some((candidate) => candidate.name === requestedFormat) ? requestedFormat : defaultFormat;

  useEffect(() => setLocalFormat(format), [format]);

  useEffect(() => {
    if (requestedFormat && defaultFormat && requestedFormat !== selectedFormat) {
      setLocalFormat(defaultFormat);
      onFormatChange?.(defaultFormat);
    }
  }, [defaultFormat, onFormatChange, requestedFormat, selectedFormat]);

  const changeFormat = (next: string) => {
    setLocalFormat(next);
    onFormatChange?.(next);
  };

  const printQ = useQuery({
    queryKey: [scopeKey, "print-html", doctype, name, selectedFormat],
    queryFn: () => adapter.printHtml(doctype, name, selectedFormat),
    enabled: formatsQ.isSuccess && Boolean(selectedFormat),
  });
  const loading = formatsQ.isLoading || printQ.isLoading;
  const requestError = formatsQ.error ?? printQ.error;

  /**
   * Mở hộp thoại in của CHÍNH khung xem (không phải toàn trang MetaForge).
   *
   * Đây cũng là đường duy nhất tạo PDF. Hộp thoại in có sẵn máy in ảo "Lưu thành PDF",
   * và nó dùng bộ phân trang thật của trình duyệt — thứ duy nhất tôn trọng
   * `tr{break-inside:avoid}`, `thead{display:table-header-group}` và lề `@page` của mẫu in.
   * Bản tự chụp ảnh rồi cắt theo chiều cao trang trước đây làm ngược lại: cắt ngang giữa
   * dòng bảng, mất tiêu đề cột ở trang sau, và biến toàn bộ chữ thành ảnh raster không
   * bôi đen / tìm kiếm được.
   */
  const openPrintDialog = (): boolean => {
    const frame = iframeRef.current?.contentWindow;
    if (!frame) return false;
    try {
      frame.focus();
      frame.print();
      return true;
    } catch {
      return false;
    }
  };

  const printBlockedMessage = "Trình duyệt chặn hộp thoại in. Bấm chuột phải trong khung xem → \"In khung\" (Print frame).";

  const doPrint = () => {
    if (!openPrintDialog()) toast.error(printBlockedMessage);
  };

  const doSavePdf = async () => {
    if (!selectedFormat || savingPdf) return;
    setSavingPdf(true);
    try {
      // Đường chính: Worker dựng PDF thật bằng Cloudflare Browser Run, trên đúng HTML đã qua
      // kiểm tra quyền của printview (apps/tenant-worker/src/index-cf6.ts). Chrome headless
      // phân trang theo `@page` với preferCSSPageSize, nên lề áp cho MỌI trang, tiêu đề cột
      // lặp lại và chữ vẫn là chữ — bôi đen, copy và tìm kiếm được.
      const blob = await adapter.downloadPdf(doctype, name, selectedFormat);
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = `${doctype}-${name}.pdf`;
      link.click();
      URL.revokeObjectURL(href);
      toast.success("Đã tải PDF");
    } catch (error) {
      // Bản dev local chạy entrypoint không có route cf6 và cũng không gắn binding BROWSER
      // (Worker trả 501). Hộp thoại in của trình duyệt cho ra PDF đúng phân trang y hệt, chỉ
      // tốn thêm một bước chọn máy in ảo.
      if (openPrintDialog()) toast.info("Máy chủ chưa bật dựng PDF. Trong hộp thoại in, chọn máy in \"Lưu thành PDF\".");
      else toast.error(adapter.mapError(error).message);
    } finally {
      setSavingPdf(false);
    }
  };

  return (
    <div className="mf-print-container flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b bg-card px-4 py-2.5">
        {onBack ? <Button variant="ghost" size="icon-sm" onClick={onBack} aria-label={t("common.back")}><ArrowLeft /></Button> : null}
        <div className="min-w-0 flex-1 truncate text-sm font-semibold">{doctype} — {name}</div>
        {formats.length > 1 ? (
          <Select value={selectedFormat} onValueChange={changeFormat}>
            <SelectTrigger className="h-8 w-full min-w-52 sm:w-auto" aria-label="Chọn mẫu in">
              <SelectValue placeholder="Chọn mẫu in" />
            </SelectTrigger>
            <SelectContent>
              {formats.map((candidate) => (
                <SelectItem key={candidate.name} value={candidate.name}>
                  {candidate.name}{candidate.is_default ? " (mặc định)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        <div className="flex items-center gap-1" role="group" aria-label="Thu phóng bản in">
          <Button variant="ghost" size="icon-sm" onClick={() => setZoom((value) => Math.max(0.5, value - 0.1))} disabled={zoom <= 0.5} aria-label="Thu nhỏ"><Minus /></Button>
          <Button variant="ghost" size="sm" className="min-w-16 tabular-nums" onClick={() => setZoom(1)} aria-label="Đặt lại tỷ lệ"><RotateCcw className="size-3.5" /> {Math.round(zoom * 100)}%</Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setZoom((value) => Math.min(1.5, value + 0.1))} disabled={zoom >= 1.5} aria-label="Phóng to"><Plus /></Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => void doSavePdf()} disabled={loading || !printQ.data || savingPdf}>
          {savingPdf ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {savingPdf ? "Đang tạo PDF…" : "Tải PDF"}
        </Button>
        <Button size="sm" onClick={doPrint} disabled={loading || !printQ.data}><Printer className="size-4" /> {t("form.action.print")}</Button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto bg-muted/30 p-4">
        {requestError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"><div>{adapter.mapError(requestError).message}</div><Button variant="outline" size="sm" className="mt-3" onClick={() => void (formatsQ.error ? formatsQ.refetch() : printQ.refetch())}><RefreshCw /> Thử lại</Button></div>
        ) : formatsQ.isSuccess && formats.length === 0 ? (
          <div className="grid min-h-80 place-items-center p-6 text-center">
            <div className="max-w-md rounded-xl border bg-card p-6 shadow-sm">
              <FileQuestion className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
              <h1 className="mt-3 text-base font-semibold">Chưa có mẫu in</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {doctype} chưa được cấu hình mẫu in. Bạn có thể quay lại chứng từ và tiếp tục làm việc.
              </p>
              {onBack ? <Button variant="outline" className="mt-4" onClick={onBack}><ArrowLeft /> Quay lại chứng từ</Button> : null}
            </div>
          </div>
        ) : (
          <PrintView html={printQ.data ?? ""} title={`${doctype} ${name}`} loading={loading} zoom={zoom} ref={iframeRef} />
        )}
      </div>
    </div>
  );
}
