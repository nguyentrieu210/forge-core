import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Clock3, Loader2, RefreshCw, ScanLine, TriangleAlert } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import qrcode from "qrcode-generator";
import { LinkCombobox } from "@metaforge/controls";
import { adapterServices } from "@metaforge/views";
import { useMetaForge } from "@metaforge/views/provider";
import { Button } from "@metaforge/ui";

interface AttendanceChallenge {
  station: string;
  station_name?: string;
  token: string;
  issued_at: string;
  expires_at: string;
  server_time: string;
  refresh_after_seconds: number;
}

interface AttendanceScanResult {
  replayed?: boolean;
  checkin: { name: string; log_type?: string; external_id?: string };
  day: {
    name: string;
    work_date: string;
    segment_code?: string;
    regular_minutes?: number;
    overtime_minutes?: number;
  };
}

const STATION_STORAGE_KEY = "alumdoor-attendance-kiosk-station";
const KIOSK_PATH = `/x/${encodeURIComponent("alumdoor-attendance:kiosk")}`;
const inFlightChallenges = new Map<string, Promise<AttendanceChallenge>>();
const recentChallenges = new Map<string, { challenge: AttendanceChallenge; reusableUntil: number }>();

function savedStation(): string {
  try { return localStorage.getItem(STATION_STORAGE_KEY)?.trim() ?? ""; }
  catch { return ""; }
}

function rememberStation(station: string) {
  try { localStorage.setItem(STATION_STORAGE_KEY, station); }
  catch { /* Private browsing can block storage; the open QR still works. */ }
}

function clampRefresh(value: unknown): number {
  const seconds = typeof value === "number" ? value : Number(value);
  return Number.isInteger(seconds) && seconds >= 5 && seconds <= 60 ? seconds : 15;
}

function messageFromError(adapter: { mapError: (error: unknown) => { message: string } }, error: unknown): string {
  const payload = (error as { response?: { data?: unknown } } | undefined)?.response?.data;
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const message = (payload as Record<string, unknown>).message;
    if (typeof message === "string" && message.trim()) return message.trim();
  }
  // frappe-js-sdk sometimes flattens a Worker JSON error into `{ message, httpStatus }`
  // instead of retaining Axios's `response.data`.  Keep the business error (notably
  // the 410 “QR expired” instruction) rather than degrading it to “unknown error”.
  const directMessage = (error as { message?: unknown } | undefined)?.message;
  if (typeof directMessage === "string" && directMessage.trim() && !/^request failed with status code\s+\d+$/i.test(directMessage.trim())) {
    return directMessage.trim();
  }
  return adapter.mapError(error).message;
}

function requestChallenge(
  adapter: { callPost: <T>(method: string, args: Record<string, string>) => Promise<T> },
  station: string,
  force = false,
): Promise<AttendanceChallenge> {
  const cached = recentChallenges.get(station);
  if (!force && cached && cached.reusableUntil > Date.now()) return Promise.resolve(cached.challenge);
  if (cached) recentChallenges.delete(station);
  const existing = inFlightChallenges.get(station);
  if (existing) return existing;
  const request = adapter.callPost<AttendanceChallenge>("alumdoor.attendance.challenge", { station });
  inFlightChallenges.set(station, request);
  void request.then(
    (challenge) => {
      const refreshWindow = clampRefresh(challenge.refresh_after_seconds) * 1_000;
      const tokenExpiry = Date.parse(challenge.expires_at);
      recentChallenges.set(station, {
        challenge,
        reusableUntil: Number.isFinite(tokenExpiry)
          ? Math.min(Date.now() + refreshWindow, tokenExpiry)
          : Date.now() + refreshWindow,
      });
    },
    () => undefined,
  );
  const clear = () => {
    if (inFlightChallenges.get(station) === request) inFlightChallenges.delete(station);
  };
  void request.then(clear, clear);
  return request;
}

function displaySegment(value: string | undefined): string {
  const key = value?.trim().toUpperCase().replaceAll("-", "_");
  if (key === "SHIFT1" || key === "SHIFT_1") return "Ca 1";
  if (key === "SHIFT2" || key === "SHIFT_2") return "Ca 2";
  if (key === "SHIFT3" || key === "SHIFT_3") return "Ca 3 (tăng ca)";
  return "Ca làm việc";
}

function displayLogType(value: string | undefined): string {
  return value?.trim().toUpperCase() === "OUT" ? "Đã ra ca" : "Đã vào ca";
}

function displayMinutes(value: number | undefined): string {
  const minutes = Number.isFinite(value) ? Math.max(0, Math.round(value!)) : 0;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours} giờ${rest ? ` ${rest} phút` : ""}` : `${rest} phút`;
}

function scanHref(token: string): string {
  const url = new URL(KIOSK_PATH, window.location.origin);
  url.searchParams.set("token", token);
  return url.toString();
}

function AttendanceQr({ token }: { token: string }) {
  const image = useMemo(() => {
    const code = qrcode(0, "M");
    code.addData(scanHref(token));
    code.make();
    const count = code.getModuleCount();
    let path = "";
    for (let row = 0; row < count; row += 1) {
      for (let column = 0; column < count; column += 1) {
        if (code.isDark(row, column)) path += `M${column} ${row}h1v1h-1z`;
      }
    }
    return { count, path };
  }, [token]);

  return (
    <svg
      viewBox={`0 0 ${image.count} ${image.count}`}
      className="block size-full"
      shapeRendering="crispEdges"
      role="img"
      aria-label="Mã QR chấm công đang hoạt động"
      data-attendance-token={token}
    >
      <rect width={image.count} height={image.count} fill="#fff" />
      <path d={image.path} fill="#000" />
    </svg>
  );
}

function KioskNotice({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "error" }) {
  return (
    <div className={tone === "error"
      ? "flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
      : "flex items-start gap-3 rounded-xl border bg-muted/35 p-4 text-sm text-muted-foreground"}
    >
      <TriangleAlert className={tone === "error" ? "mt-0.5 size-4 shrink-0" : "mt-0.5 size-4 shrink-0 text-primary"} />
      <div>{children}</div>
    </div>
  );
}

function AttendanceKiosk() {
  const { adapter } = useMetaForge();
  const linkServices = useMemo(() => adapterServices(adapter), [adapter]);
  const [params, setParams] = useSearchParams();
  const stationFromUrl = params.get("station")?.trim() ?? "";
  const [stationDraft, setStationDraft] = useState(() => stationFromUrl || savedStation());
  const [station, setStation] = useState(stationFromUrl || savedStation());
  const [challenge, setChallenge] = useState<AttendanceChallenge>();
  const [failure, setFailure] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number>();

  useEffect(() => {
    if (!stationFromUrl || stationFromUrl === station) return;
    setStation(stationFromUrl);
    setStationDraft(stationFromUrl || savedStation());
  }, [station, stationFromUrl]);

  useEffect(() => {
    if (!station) {
      setChallenge(undefined);
      setFailure("");
      return;
    }
    let active = true;
    let timer: number | undefined;
    const load = async (force = refreshKey > 0) => {
      if (!active) return;
      setLoading(true);
      try {
        // React dev mode deliberately mounts effects twice. Share the in-flight request
        // so a station never emits two challenges before the first one has returned.
        const result = await requestChallenge(adapter, station, force);
        if (!active) return;
        setChallenge(result);
        setFailure("");
        timer = window.setTimeout(() => { void load(true); }, clampRefresh(result.refresh_after_seconds) * 1_000);
      } catch (error) {
        if (!active) return;
        setChallenge(undefined);
        setFailure(messageFromError(adapter, error));
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [adapter, refreshKey, station]);

  useEffect(() => {
    if (!challenge?.expires_at) {
      setSecondsLeft(undefined);
      return;
    }
    const refreshCountdown = () => {
      const remaining = Math.max(0, Math.ceil((Date.parse(challenge.expires_at) - Date.now()) / 1_000));
      setSecondsLeft(remaining);
    };
    refreshCountdown();
    const timer = window.setInterval(refreshCountdown, 1_000);
    return () => window.clearInterval(timer);
  }, [challenge?.expires_at]);

  const chooseStation = useCallback((next: string) => {
    const selected = next.trim();
    setStationDraft(selected);
    if (!selected) {
      setParams({}, { replace: true });
      setStation("");
      setChallenge(undefined);
      setFailure("");
      return;
    }
    rememberStation(selected);
    setParams({ station: selected }, { replace: true });
  }, [setParams]);

  const changeStation = useCallback(() => {
    setParams({}, { replace: true });
    setStation("");
    setChallenge(undefined);
    setFailure("");
  }, [setParams]);

  return (
    <div className="h-full overflow-auto bg-muted/20 p-3 sm:p-5 lg:p-7">
      <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)] lg:items-start">
        <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-7">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><ScanLine className="size-5" /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Chấm công AlumDoor</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Màn QR chấm công</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Nhân viên chỉ cần dùng camera điện thoại quét mã. Hệ thống tự nhận tài khoản đăng nhập, ca hiện tại và thời điểm quét.</p>
            </div>
          </div>

          {!station ? (
            <div className="mt-7 max-w-md space-y-3">
              <div>
                <p className="mb-1.5 text-sm font-medium">Trạm QR</p>
                <LinkCombobox
                  id="attendance-station"
                  value={stationDraft}
                  target="AlumDoor QR Station"
                  label="Trạm QR"
                  search={linkServices.searchLink!}
                  resolveDisplay={linkServices.resolveDisplay}
                  onChange={chooseStation}
                />
              </div>
              {failure ? <KioskNotice tone="error">{failure}</KioskNotice> : <KioskNotice>Chỉ dùng mã của Trạm QR đã tạo và gắn Chính sách ca đang được duyệt.</KioskNotice>}
            </div>
          ) : (
            <div className="mt-7 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
                <div><p className="text-xs font-medium text-muted-foreground">Đang mở trạm</p><p className="mt-0.5 font-semibold">{challenge?.station_name || station}</p><p className="text-xs text-muted-foreground">Mã trạm: {station}</p></div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setRefreshKey((value) => value + 1)} disabled={loading}><RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} /> Làm mới</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={changeStation}>Đổi trạm</Button>
                </div>
              </div>
              {failure ? <KioskNotice tone="error">{failure}</KioskNotice> : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border p-4"><p className="font-medium">Cách dùng</p><ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-muted-foreground"><li>Mở camera trên điện thoại.</li><li>Đưa camera vào mã QR bên phải.</li><li>Chờ màn hình báo ghi nhận.</li></ol></div>
                <div className="rounded-xl border p-4"><p className="font-medium">Quy tắc công</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Ca 1: 07:00–11:30. Ca 2: 13:00–17:00. Từ 17:30 là Ca 3, tự tính tăng ca.</p></div>
              </div>
            </div>
          )}
        </section>

        <section className="min-h-[22rem] rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><p className="font-semibold">Mã quét hiện tại</p><p className="mt-1 text-sm text-muted-foreground">QR tự đổi để tránh dùng lại.</p></div><Clock3 className="size-5 text-muted-foreground" /></div>
          <div className="mt-6 flex min-h-64 items-center justify-center">
            {challenge ? <div className="w-full max-w-[22rem] rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-black/10"><AttendanceQr token={challenge.token} /></div>
              : loading ? <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground"><Loader2 className="size-6 animate-spin text-primary" /> Đang tạo QR…</div>
                : <div className="text-center text-sm text-muted-foreground">Chọn trạm để hiển thị QR.</div>}
          </div>
          {challenge ? <div className="mt-5 text-center"><p className="text-sm font-medium">Mã đổi sau {secondsLeft ?? clampRefresh(challenge.refresh_after_seconds)} giây</p><a className="mt-2 inline-block text-xs text-primary underline underline-offset-4" href={scanHref(challenge.token)}>Mở chấm công trên điện thoại này</a></div> : null}
        </section>
      </div>
    </div>
  );
}

function AttendanceScan() {
  const { adapter } = useMetaForge();
  const [params] = useSearchParams();
  const token = params.get("token")?.trim() ?? "";
  const [result, setResult] = useState<AttendanceScanResult>();
  const [failure, setFailure] = useState("");
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setFailure("Chưa có mã QR để chấm công. Hãy dùng camera quét mã mới tại trạm.");
      return;
    }
    let active = true;
    const submit = async () => {
      setLoading(true);
      setResult(undefined);
      setFailure("");
      try {
        // Only the signed QR goes from the browser. The server derives employee, time and shift.
        const response = await adapter.callPost<AttendanceScanResult>("alumdoor.attendance.scan", { token });
        if (!active) return;
        setResult(response);
      } catch (error) {
        if (active) setFailure(messageFromError(adapter, error));
      } finally {
        if (active) setLoading(false);
      }
    };
    void submit();
    return () => { active = false; };
  }, [adapter, token]);

  return (
    <div className="grid min-h-full place-items-center bg-muted/20 p-4 sm:p-6">
      <section className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8">
        {loading ? <><Loader2 className="mx-auto size-9 animate-spin text-primary" /><h1 className="mt-5 text-xl font-semibold">Đang ghi nhận chấm công…</h1><p className="mt-2 text-sm text-muted-foreground">Không đóng trang này trong giây lát.</p></> : null}
        {!loading && result ? <><CheckCircle2 className="mx-auto size-10 text-emerald-600" /><h1 className="mt-5 text-xl font-semibold">Chấm công thành công</h1><p className="mt-2 text-sm text-muted-foreground">{displayLogType(result.checkin.log_type)} · {displaySegment(result.day.segment_code)}</p><div className="mt-5 grid grid-cols-2 gap-3 text-left"><div className="rounded-xl bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Công thường hôm nay</p><p className="mt-1 font-semibold">{displayMinutes(result.day.regular_minutes)}</p></div><div className="rounded-xl bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Tăng ca hôm nay</p><p className="mt-1 font-semibold">{displayMinutes(result.day.overtime_minutes)}</p></div></div><p className="mt-5 text-xs text-muted-foreground">Ngày công: {result.day.work_date}{result.replayed ? " · Lần quét này đã được ghi nhận trước đó." : ""}</p></> : null}
        {!loading && failure ? <><TriangleAlert className="mx-auto size-10 text-destructive" /><h1 className="mt-5 text-xl font-semibold">Chưa thể chấm công</h1><p className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm leading-6 text-destructive">{failure}</p><p className="mt-4 text-sm text-muted-foreground">Hãy quay lại trạm và quét mã QR mới.</p></> : null}
      </section>
    </div>
  );
}

/** A single experience serves the manager's station screen and the employee scan deep-link. */
export function AlumdoorAttendanceKiosk() {
  const [params] = useSearchParams();
  return params.get("token") ? <AttendanceScan /> : <AttendanceKiosk />;
}
