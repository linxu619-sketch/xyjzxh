import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   入会 / 注册申请（真实写入 SQLite）
   ============================================================ */

export type AppType = "enterprise" | "individual" | "customer";
export type AppStatus = "pending" | "approved" | "rejected";

export type Application = {
  id: number;
  type: AppType;
  applicant: string;
  phone: string;
  payload: Record<string, unknown>;
  status: AppStatus;
  createdAt: number;
};

type Row = {
  id: number;
  type: string;
  applicant: string | null;
  phone: string | null;
  payload: string | null;
  status: string;
  created_at: number | null;
};

function rowTo(r: Row): Application {
  let payload: Record<string, unknown> = {};
  try { payload = r.payload ? JSON.parse(r.payload) : {}; } catch { payload = {}; }
  return {
    id: r.id,
    type: (r.type as AppType) ?? "customer",
    applicant: r.applicant ?? "",
    phone: r.phone ?? "",
    payload,
    status: (r.status as AppStatus) ?? "pending",
    createdAt: r.created_at ?? 0,
  };
}

export function createApplication(input: {
  type: AppType;
  applicant: string;
  phone: string;
  payload: Record<string, unknown>;
}): number {
  const info = getDb()
    .prepare("INSERT INTO applications (type, applicant, phone, payload, status, created_at) VALUES (?,?,?,?, 'pending', ?)")
    .run(input.type, input.applicant, input.phone, JSON.stringify(input.payload ?? {}), Date.now());
  return Number(info.lastInsertRowid);
}

export function listApplications(status?: AppStatus): Application[] {
  const db = getDb();
  const rows = (status
    ? db.prepare("SELECT * FROM applications WHERE status = ? ORDER BY created_at DESC").all(status)
    : db.prepare("SELECT * FROM applications ORDER BY created_at DESC").all()) as Row[];
  return rows.map(rowTo);
}

export function countByStatus(): Record<AppStatus, number> {
  const rows = getDb()
    .prepare("SELECT status, COUNT(*) AS c FROM applications GROUP BY status")
    .all() as { status: string; c: number }[];
  const out: Record<AppStatus, number> = { pending: 0, approved: 0, rejected: 0 };
  for (const r of rows) if (r.status in out) out[r.status as AppStatus] = r.c;
  return out;
}

export function setApplicationStatus(id: number, status: AppStatus) {
  getDb().prepare("UPDATE applications SET status = ? WHERE id = ?").run(status, id);
}
