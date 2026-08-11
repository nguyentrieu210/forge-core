export type AttendanceOperationalCall = (path: string, init?: RequestInit) => Promise<Response>;

type Json = Record<string, unknown>;

function json(value: unknown, status = 200): Response { return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } }); }
function fail(code: string, message: string, status = 422): Response { return json({ code, message }, status); }
function text(value: unknown): string { return typeof value === "string" ? value.trim() : ""; }
function required(value: unknown, label: string, max = 320): string { const result = text(value); if (!result || result.length > max) throw new Error(`${label} là bắt buộc.`); return result; }
function isoDate(value: unknown, label: string): string { const result = required(value, label, 10); if (!/^\d{4}-\d{2}-\d{2}$/u.test(result) || Number.isNaN(Date.parse(`${result}T00:00:00Z`))) throw new Error(`${label} không hợp lệ.`); return result; }
function monthBounds(value: unknown): { from: string; to: string } {
  const month = required(value, "Tháng", 7);
  if (!/^\d{4}-\d{2}$/u.test(month)) throw new Error("Tháng phải có dạng YYYY-MM.");
  const [year, number] = month.split("-").map(Number);
  if (!year || !number || number < 1 || number > 12) throw new Error("Tháng không hợp lệ.");
  const last = new Date(Date.UTC(year, number, 0)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, "0")}` };
}
async function method(call: AttendanceOperationalCall, name: string, body: Json): Promise<unknown> {
  const response = await call(`method/${name}`, { method: "POST", body: JSON.stringify(body) });
  const payload = await response.json().catch(() => ({})) as Json;
  if (!response.ok) throw new Error(text(payload.message) || text((payload.error as Json | undefined)?.message) || `HTTP ${response.status}`);
  return payload.message ?? payload.data ?? payload;
}
function records(value: unknown): Json[] {
  return Array.isArray(value) ? value.filter((row): row is Json => Boolean(row) && typeof row === "object" && !Array.isArray(row)) : [];
}
async function attendanceDocument(call: AttendanceOperationalCall, row: Json): Promise<Json> {
  const name = text(row.name);
  if (!name) return row;
  const payload = await method(call, "frappe.desk.form.load.getdoc", { doctype: "AlumDoor Attendance Day", name });
  const docs = payload && typeof payload === "object" && !Array.isArray(payload) ? records((payload as Json).docs) : [];
  return docs[0] ? { ...row, ...docs[0] } : row;
}
async function list(call: AttendanceOperationalCall, filters: unknown): Promise<Json[]> {
  const rows = records(await method(call, "frappe.client.get_list", {
    doctype: "AlumDoor Attendance Day",
    fields: ["name", "employee", "company", "branch", "department", "work_date", "state", "locked_by_payroll", "regular_minutes", "overtime_minutes", "payable_work_fraction_bp", "modified"],
    filters,
    order_by: "work_date desc, employee asc",
    limit_page_length: 1000,
  }));
  const hydrated: Json[] = [];
  for (let offset = 0; offset < rows.length; offset += 20) {
    hydrated.push(...await Promise.all(rows.slice(offset, offset + 20).map((row) => attendanceDocument(call, row))));
  }
  return hydrated;
}

export async function attendanceToday(input: { call: AttendanceOperationalCall; args: Json; now?: Date }): Promise<Response> {
  try {
    const today = text(input.args.date) || (input.now ?? new Date()).toISOString().slice(0, 10);
    const date = isoDate(today, "Ngày công");
    const filters: unknown[] = [["work_date", "=", date]];
    if (text(input.args.employee)) filters.push(["employee", "=", text(input.args.employee)]);
    return json(await list(input.call, filters));
  } catch (error) { return fail("ATTENDANCE_TODAY_FAILED", error instanceof Error ? error.message : "Không đọc được công hôm nay."); }
}

export async function attendanceMonth(input: { call: AttendanceOperationalCall; args: Json }): Promise<Response> {
  try {
    const bounds = monthBounds(input.args.month);
    const filters: unknown[] = [["work_date", ">=", bounds.from], ["work_date", "<=", bounds.to]];
    if (text(input.args.employee)) filters.push(["employee", "=", text(input.args.employee)]);
    return json(await list(input.call, filters));
  } catch (error) { return fail("ATTENDANCE_MONTH_FAILED", error instanceof Error ? error.message : "Không đọc được bảng công."); }
}

export async function attendanceExceptions(input: { call: AttendanceOperationalCall; args: Json }): Promise<Response> {
  try {
    const filters: unknown[] = [["state", "in", ["open", "exception"]]];
    if (text(input.args.from)) filters.push(["work_date", ">=", isoDate(input.args.from, "Từ ngày")]);
    if (text(input.args.to)) filters.push(["work_date", "<=", isoDate(input.args.to, "Đến ngày")]);
    if (text(input.args.employee)) filters.push(["employee", "=", text(input.args.employee)]);
    return json(await list(input.call, filters));
  } catch (error) { return fail("ATTENDANCE_EXCEPTION_FAILED", error instanceof Error ? error.message : "Không đọc được ngoại lệ chấm công."); }
}

export async function attendanceCorrectionRequests(input: { call: AttendanceOperationalCall }): Promise<Response> {
  try {
    return json(await method(input.call, "frappe.client.get_list", {
      doctype: "Attendance Request",
      fields: ["name", "employee", "from_date", "to_date", "reason", "workflow_state", "alu_segment_code", "alu_requested_in", "alu_requested_out", "modified"],
      filters: [["request_type", "=", "Sửa chấm công"], ["workflow_state", "=", "Chờ duyệt"]],
      order_by: "modified desc",
      limit_page_length: 200,
    }));
  } catch (error) { return fail("ATTENDANCE_CORRECTION_LIST_FAILED", error instanceof Error ? error.message : "Không đọc được phiếu sửa công."); }
}

export async function attendanceSubmitCorrection(input: { call: AttendanceOperationalCall; args: Json }): Promise<Response> {
  try {
    return json(await method(input.call, "metaforge.api.submit_alumdoor_attendance_correction", {
      work_date: isoDate(input.args.work_date, "Ngày công"),
      segment_code: required(input.args.segment_code, "Ca"),
      ...(text(input.args.requested_in) ? { requested_in: text(input.args.requested_in) } : {}),
      ...(text(input.args.requested_out) ? { requested_out: text(input.args.requested_out) } : {}),
      reason: required(input.args.reason, "Lý do", 1000),
      ...(text(input.args.attachment) ? { attachment: text(input.args.attachment) } : {}),
    }));
  } catch (error) { return fail("ATTENDANCE_CORRECTION_SUBMIT_FAILED", error instanceof Error ? error.message : "Không gửi được yêu cầu sửa công."); }
}

export async function attendanceReviewCorrection(input: { call: AttendanceOperationalCall; args: Json }): Promise<Response> {
  try {
    const action = required(input.args.action, "Quyết định", 16);
    if (action !== "approve" && action !== "reject") throw new Error("Quyết định phải là approve hoặc reject.");
    return json(await method(input.call, "metaforge.api.review_alumdoor_attendance_correction", {
      request: required(input.args.request, "Phiếu sửa công"),
      action,
      ...(text(input.args.note) ? { note: text(input.args.note) } : {}),
    }));
  } catch (error) { return fail("ATTENDANCE_CORRECTION_REVIEW_FAILED", error instanceof Error ? error.message : "Không duyệt được yêu cầu sửa công."); }
}
