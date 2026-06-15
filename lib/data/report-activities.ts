import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   报备跟进记录（CRM 时间线，与线索 lead_activities 同款）
   ============================================================ */

export type ReportActivity = {
  id: number;
  reportId: number;
  authorName: string;
  authorRole: string;
  kind: "note" | "status";
  note: string;
  createdAt: number;
};

type Row = {
  id: number; report_id: number | null; author_name: string | null; author_role: string | null;
  kind: string | null; note: string | null; created_at: number | null;
};
function rowTo(r: Row): ReportActivity {
  return {
    id: r.id, reportId: r.report_id ?? 0, authorName: r.author_name ?? "", authorRole: r.author_role ?? "",
    kind: (r.kind as ReportActivity["kind"]) ?? "note", note: r.note ?? "", createdAt: r.created_at ?? 0,
  };
}

export function addReportActivity(input: { reportId: number; authorName: string; authorRole: string; kind?: "note" | "status"; note: string }): number | null {
  const note = input.note.trim();
  if (!input.reportId || !note) return null;
  const info = getDb()
    .prepare("INSERT INTO report_activities (report_id,author_name,author_role,kind,note,created_at) VALUES (?,?,?,?,?,?)")
    .run(input.reportId, input.authorName || "—", input.authorRole || "owner", input.kind ?? "note", note, Date.now());
  return Number(info.lastInsertRowid);
}

export function listReportActivities(reportId: number): ReportActivity[] {
  if (!reportId) return [];
  const rows = getDb()
    .prepare("SELECT * FROM report_activities WHERE report_id = ? ORDER BY created_at DESC")
    .all(reportId) as Row[];
  return rows.map(rowTo);
}
