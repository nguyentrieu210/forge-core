import { ExternalLink, ScanLine } from "lucide-react";

const MOBILE_ATTENDANCE_PATH = "/mobile/attendance/";

/** The employee scan surface is intentionally standalone and session-free. */
export function AlumdoorAttendanceScanner() {
  return <div className="grid min-h-[60vh] place-items-center p-6 text-center">
    <div><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground"><ScanLine className="size-8" /></span><h1 className="mt-5 text-xl font-bold">App chấm công trên điện thoại</h1><p className="mt-2 text-sm text-muted-foreground">App dùng camera, GPS và thiết bị đã đăng ký; không cần đăng nhập.</p><a className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" href={MOBILE_ATTENDANCE_PATH}>Mở app <ExternalLink className="ml-2 size-4" /></a></div>
  </div>;
}
