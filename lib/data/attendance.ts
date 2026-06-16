import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   考勤打卡（E2）
   ------------------------------------------------------------
   每个录用工人(application) × 每个工作日一条：
   - 工人「今日打卡」→ status=checked
   - 企业「确认出勤」→ status=confirmed（确认出勤=E3 自动结算的唯一依据）
   - 企业「标缺勤」→ status=rejected
   - 企业也可「补登」某天直接 confirmed（工人没打卡但实际出勤）
   每个 (application_id, work_date) 唯一（代码层去重）。
   ============================================================ */

export type AttendStatus = "checked" | "confirmed" | "rejected";

export type WorkAttendance = {
  id: number;
  applicationId: number;
  jobId: number;
  phone: string;
  workDate: string;
  status: AttendStatus;
  checkInAt: number;
  confirmedAt: number;
  confirmedBy: string;
  createdAt: number;
};

type Row = {
  id: number; application_id: number | null; job_id: number | null; practitioner_phone: string | null;
  work_date: string | null; status: string | null; check_in_at: number | null; confirmed_at: number | null;
  confirmed_by: string | null; created_at: number | null;
};
function rowTo(r: Row): WorkAttendance {
  return {
    id: r.id, applicationId: r.application_id ?? 0, jobId: r.job_id ?? 0, phone: r.practitioner_phone ?? "",
    workDate: r.work_date ?? "", status: (r.status as AttendStatus) ?? "checked",
    checkInAt: r.check_in_at ?? 0, confirmedAt: r.confirmed_at ?? 0, confirmedBy: r.confirmed_by ?? "", createdAt: r.created_at ?? 0,
  };
}

// 服务端「今天」YYYY-MM-DD
export function todayStr(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function getByDay(applicationId: number, date: string): WorkAttendance | undefined {
  const row = getDb().prepare("SELECT * FROM work_attendance WHERE application_id = ? AND work_date = ? LIMIT 1").get(applicationId, date) as Row | undefined;
  return row ? rowTo(row) : undefined;
}

// 工人打卡（幂等：当天已有则不重复建；rejected 的当天允许重新打卡为 checked）
export function checkIn(input: { applicationId: number; jobId: number; phone: string; date: string }): { ok: boolean; already?: boolean } {
  const exist = getByDay(input.applicationId, input.date);
  if (exist) {
    if (exist.status === "rejected") {
      getDb().prepare("UPDATE work_attendance SET status='checked', check_in_at=?, confirmed_at=0, confirmed_by='' WHERE id=?").run(Date.now(), exist.id);
      return { ok: true };
    }
    return { ok: true, already: true };
  }
  getDb().prepare(
    "INSERT INTO work_attendance (application_id,job_id,practitioner_phone,work_date,status,check_in_at,created_at) VALUES (?,?,?,?, 'checked', ?, ?)",
  ).run(input.applicationId, input.jobId, input.phone, input.date, Date.now(), Date.now());
  return { ok: true };
}

// 企业确认出勤
export function confirmAttendance(id: number, by: string): void {
  getDb().prepare("UPDATE work_attendance SET status='confirmed', confirmed_at=?, confirmed_by=? WHERE id=?").run(Date.now(), by || "企业", id);
}
// 企业标缺勤 / 驳回
export function rejectAttendance(id: number): void {
  getDb().prepare("UPDATE work_attendance SET status='rejected', confirmed_at=0, confirmed_by='' WHERE id=?").run(id);
}

// 企业补登某天（工人没打卡但实际出勤）→ 直接 confirmed
export function enterpriseAddDay(input: { applicationId: number; jobId: number; phone: string; date: string; by: string }): void {
  const exist = getByDay(input.applicationId, input.date);
  if (exist) { confirmAttendance(exist.id, input.by); return; }
  getDb().prepare(
    "INSERT INTO work_attendance (application_id,job_id,practitioner_phone,work_date,status,check_in_at,confirmed_at,confirmed_by,created_at) VALUES (?,?,?,?, 'confirmed', 0, ?, ?, ?)",
  ).run(input.applicationId, input.jobId, input.phone, input.date, Date.now(), input.by || "企业", Date.now());
}

export function getAttendance(id: number): WorkAttendance | undefined {
  const row = getDb().prepare("SELECT * FROM work_attendance WHERE id = ?").get(id) as Row | undefined;
  return row ? rowTo(row) : undefined;
}

export function listAttendanceByApplication(applicationId: number): WorkAttendance[] {
  const rows = getDb().prepare("SELECT * FROM work_attendance WHERE application_id = ? ORDER BY work_date DESC").all(applicationId) as Row[];
  return rows.map(rowTo);
}

// 已确认出勤天数（E3 结算依据）
export function countConfirmedDays(applicationId: number): number {
  return (getDb().prepare("SELECT COUNT(*) AS c FROM work_attendance WHERE application_id = ? AND status = 'confirmed'").get(applicationId) as { c: number }).c;
}
// 待确认(工人已打卡未确认)天数
export function countPendingDays(applicationId: number): number {
  return (getDb().prepare("SELECT COUNT(*) AS c FROM work_attendance WHERE application_id = ? AND status = 'checked'").get(applicationId) as { c: number }).c;
}

// 工人端：今天的打卡状态（null=今天还没打卡）
export function todayAttendanceStatus(applicationId: number): AttendStatus | null {
  return getByDay(applicationId, todayStr())?.status ?? null;
}
