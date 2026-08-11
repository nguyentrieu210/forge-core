import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, MapPin, Printer, RefreshCw, ShieldCheck } from "lucide-react";
import qrcode from "qrcode-generator";
import { LinkCombobox } from "@metaforge/controls";
import { adapterServices } from "@metaforge/views";
import { useMetaForge } from "@metaforge/views/provider";
import { Button } from "@metaforge/ui";

interface StationQr { station: string; station_name?: string; token: string; token_version: string }
const STORAGE_KEY = "alumdoor-attendance-print-station";

function errorMessage(adapter: { mapError: (error: unknown) => { message: string } }, error: unknown): string {
  const payload = (error as { response?: { data?: unknown }; message?: unknown } | undefined)?.response?.data;
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const message = (payload as Record<string, unknown>).message;
    if (typeof message === "string" && message.trim()) return message.trim();
  }
  const direct = (error as { message?: unknown } | undefined)?.message;
  return typeof direct === "string" && direct.trim() ? direct.trim() : adapter.mapError(error).message;
}

function savedStation() { try { return localStorage.getItem(STORAGE_KEY) ?? ""; } catch { return ""; } }
function saveStation(value: string) { try { localStorage.setItem(STORAGE_KEY, value); } catch { /* no-op */ } }

function qrSvg(value: string): string {
  const code = qrcode(0, "M");
  code.addData(value); code.make();
  return code.createSvgTag({ cellSize: 7, margin: 4, scalable: true });
}

export function AlumdoorAttendanceKiosk() {
  const { adapter } = useMetaForge();
  const links = useMemo(() => adapterServices(adapter), [adapter]);
  const [station, setStation] = useState(savedStation);
  const [qr, setQr] = useState<StationQr>();
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState("");

  const load = async (method = "alumdoor.attendance.station_qr") => {
    if (!station) return;
    setLoading(true); setFailure("");
    try { setQr(await adapter.callPost<StationQr>(method, { station })); }
    catch (error) { setFailure(errorMessage(adapter, error)); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (station) void load(); else setQr(undefined); }, [station]);
  const scanUrl = qr ? `${window.location.origin}/mobile/attendance/?token=${encodeURIComponent(qr.token)}` : "";
  const svg = scanUrl ? qrSvg(scanUrl) : "";

  const rotate = async () => {
    if (!window.confirm("Mã QR cũ sẽ ngừng hoạt động ngay. Bạn có muốn tạo mã mới?")) return;
    await load("alumdoor.attendance.rotate_station_qr");
  };

  const download = () => {
    if (!svg || !qr) return;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `qr-cham-cong-${qr.station}.svg`; anchor.click(); URL.revokeObjectURL(url);
  };

  return <div className="mx-auto max-w-5xl p-4 sm:p-6">
    <div className="print:hidden">
      <h1 className="text-2xl font-bold">In mã QR cố định của trạm</h1>
      <p className="mt-1 text-sm text-muted-foreground">Mã không đổi theo thời gian. GPS và thiết bị đã đăng ký được backend xác minh khi nhân viên quét.</p>
      <div className="mt-5 max-w-xl"><LinkCombobox id="attendance-station" value={station} target="AlumDoor QR Station" label="Trạm chấm công" search={links.searchLink!} resolveDisplay={links.resolveDisplay} onChange={(value) => { const next = value ?? ""; setStation(next); saveStation(next); }} /></div>
      {failure ? <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{failure}</div> : null}
    </div>

    {loading ? <div className="grid min-h-72 place-items-center"><Loader2 className="size-8 animate-spin" /></div> : null}
    {!loading && qr ? <div className="mt-6 rounded-2xl border bg-white p-5 text-slate-950 shadow-sm sm:p-8">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm font-bold uppercase tracking-[.2em]">Alumdoor</p>
        <h2 className="mt-3 text-3xl font-black">TRẠM CHẤM CÔNG</h2>
        <div className="mx-auto mt-6 max-w-[360px]" aria-label={`QR trạm ${qr.station_name ?? qr.station}`} dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="mt-5 text-xl font-bold">{qr.station_name ?? qr.station}</p>
        <p className="text-sm text-slate-500">Mã trạm: {qr.station}</p>
        <p className="mt-5 text-base">Quét QR bằng điện thoại để chấm công</p>
        <div className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500"><MapPin className="size-4" />Cần ở trong vùng GPS của trạm <ShieldCheck className="ml-2 size-4" />Thiết bị phải được đăng ký</div>
      </div>
      <div className="mt-7 flex flex-wrap justify-center gap-3 print:hidden"><Button onClick={() => window.print()}><Printer className="mr-2 size-4" />In QR</Button><Button variant="outline" onClick={download}><Download className="mr-2 size-4" />Tải SVG</Button><Button variant="destructive" onClick={() => void rotate()}><RefreshCw className="mr-2 size-4" />Tạo lại QR</Button></div>
      <p className="mt-4 text-center text-xs text-slate-400 print:hidden">Phiên bản token: {qr.token_version}. Tạo lại QR sẽ vô hiệu hóa toàn bộ bản in cũ nhưng không ảnh hưởng lịch sử công.</p>
    </div> : null}
    {!station && !loading ? <div className="mt-8 rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground print:hidden">Chọn một Trạm QR để xem, in hoặc tải mã cố định.</div> : null}
  </div>;
}
