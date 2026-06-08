import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   工装报备（真实写入 SQLite）
   ============================================================ */

export type ReportStatus = "pending" | "approved" | "rejected";

export type ReportInput = {
  projectName: string;
  projectType: string;
  area: string;
  budget: string;
  planStart: string;
  planEnd: string;
  address: string;
  summary: string;
  company: string;
  creditCode: string;
  manager: string;
  managerPhone: string;
  safetyOfficer: string;
  safetyCert: string;
};

export type ProjectReport = {
  id: number;
  code: string;
  project: string;
  type: string;
  enterprise: string;
  area: string;
  budget: string;
  manager: string;
  phone: string;
  payload: Record<string, unknown>;
  status: ReportStatus;
  reviewedBy: string;
  reviewedAt: number;
  createdAt: number;
};

type Row = {
  id: number; code: string | null; project: string | null; type: string | null;
  enterprise: string | null; area: string | null; budget: string | null;
  manager: string | null; phone: string | null; payload: string | null;
  status: string; reviewed_by: string | null; reviewed_at: number | null; created_at: number | null;
};

function rowTo(r: Row): ProjectReport {
  let payload: Record<string, unknown> = {};
  try { payload = r.payload ? JSON.parse(r.payload) : {}; } catch { payload = {}; }
  return {
    id: r.id, code: r.code ?? "", project: r.project ?? "", type: r.type ?? "",
    enterprise: r.enterprise ?? "", area: r.area ?? "", budget: r.budget ?? "",
    manager: r.manager ?? "", phone: r.phone ?? "", payload,
    status: (r.status as ReportStatus) ?? "pending",
    reviewedBy: r.reviewed_by ?? "", reviewedAt: r.reviewed_at ?? 0, createdAt: r.created_at ?? 0,
  };
}

export function createReport(input: ReportInput, uid?: string): { id: number; code: string } {
  const db = getDb();
  const info = db
    .prepare(
      `INSERT INTO project_reports (uid, code, project, type, enterprise, area, budget, manager, phone, payload, status, created_at)
       VALUES (?, '', ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    )
    .run(
      uid ?? null, input.projectName, input.projectType, input.company, input.area, input.budget,
      input.manager, input.managerPhone, JSON.stringify(input), Date.now(),
    );
  const id = Number(info.lastInsertRowid);
  const code = `P-2026-${String(1000 + id).padStart(4, "0")}`;
  db.prepare("UPDATE project_reports SET code = ? WHERE id = ?").run(code, id);
  return { id, code };
}

export function getReport(id: number): ProjectReport | undefined {
  const row = getDb().prepare("SELECT * FROM project_reports WHERE id = ?").get(id) as Row | undefined;
  return row ? rowTo(row) : undefined;
}

export function listReportsByUid(uid: string): ProjectReport[] {
  if (!uid) return [];
  const rows = getDb().prepare("SELECT * FROM project_reports WHERE uid = ? ORDER BY created_at DESC").all(uid) as Row[];
  return rows.map(rowTo);
}

// 按企业名/简称汇总本企业的全部报备（project_reports 无 enterprise_id，按报备时填写的企业名匹配，
// 与口碑评价同款）。让企业 leader 看到本企业所有成员提交的报备，而非仅当前登录人。
export function listReportsByEnterprise(names: string[]): ProjectReport[] {
  const set = new Set(names.map((n) => n.trim()).filter(Boolean));
  if (!set.size) return [];
  return listReports().filter((r) => set.has((r.enterprise || "").trim()));
}

export function listReports(status?: ReportStatus): ProjectReport[] {
  const db = getDb();
  const rows = (status
    ? db.prepare("SELECT * FROM project_reports WHERE status = ? ORDER BY created_at DESC").all(status)
    : db.prepare("SELECT * FROM project_reports ORDER BY created_at DESC").all()) as Row[];
  return rows.map(rowTo);
}

export function setReportStatus(id: number, status: ReportStatus, by?: string) {
  if (by) getDb().prepare("UPDATE project_reports SET status = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?").run(status, by, Date.now(), id);
  else getDb().prepare("UPDATE project_reports SET status = ? WHERE id = ?").run(status, id);
}
