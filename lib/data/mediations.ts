import "server-only";
import { getDb } from "@/lib/db/sqlite";

export type MediationStatus = "pending" | "accepted" | "closed" | "rejected";
export type Mediation = {
  id: number; applicant: string; phone: string; respondent: string; detail: string;
  status: MediationStatus; createdAt: number;
};
type Row = { id: number; applicant: string | null; phone: string | null; respondent: string | null; detail: string | null; status: string; created_at: number | null };

function rowTo(r: Row): Mediation {
  return {
    id: r.id, applicant: r.applicant ?? "", phone: r.phone ?? "", respondent: r.respondent ?? "",
    detail: r.detail ?? "", status: (r.status as MediationStatus) ?? "pending", createdAt: r.created_at ?? 0,
  };
}

export function createMediation(input: { applicant: string; phone: string; respondent: string; detail: string; uid?: string }): number {
  const info = getDb()
    .prepare("INSERT INTO mediations (uid, applicant, phone, respondent, detail, status, created_at) VALUES (?,?,?,?,?, 'pending', ?)")
    .run(input.uid ?? null, input.applicant, input.phone, input.respondent, input.detail, Date.now());
  return Number(info.lastInsertRowid);
}

export function getMediation(id: number): Mediation | undefined {
  const row = getDb().prepare("SELECT * FROM mediations WHERE id = ?").get(id) as Row | undefined;
  return row ? rowTo(row) : undefined;
}

export function listMediationsByUid(uid: string): Mediation[] {
  if (!uid) return [];
  const rows = getDb().prepare("SELECT * FROM mediations WHERE uid = ? ORDER BY created_at DESC").all(uid) as Row[];
  return rows.map(rowTo);
}

export function listMediations(status?: MediationStatus): Mediation[] {
  const db = getDb();
  const rows = (status
    ? db.prepare("SELECT * FROM mediations WHERE status = ? ORDER BY created_at DESC").all(status)
    : db.prepare("SELECT * FROM mediations ORDER BY created_at DESC").all()) as Row[];
  return rows.map(rowTo);
}

export function setMediationStatus(id: number, status: MediationStatus) {
  getDb().prepare("UPDATE mediations SET status = ? WHERE id = ?").run(status, id);
}
