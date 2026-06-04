import "server-only";
import { getDb } from "@/lib/db/sqlite";

export type MediationStatus = "pending" | "accepted" | "closed" | "rejected";
export type Mediation = {
  id: number; applicant: string; phone: string; respondent: string; detail: string;
  photos: string[]; status: MediationStatus; handledBy: string; handledAt: number; createdAt: number;
};
type Row = { id: number; applicant: string | null; phone: string | null; respondent: string | null; detail: string | null; photos: string | null; status: string; handled_by: string | null; handled_at: number | null; created_at: number | null };

function parsePhotos(s: string | null): string[] {
  if (!s) return [];
  try { const v = JSON.parse(s); return Array.isArray(v) ? v.map(String).filter(Boolean).slice(0, 5) : []; } catch { return []; }
}

function rowTo(r: Row): Mediation {
  return {
    id: r.id, applicant: r.applicant ?? "", phone: r.phone ?? "", respondent: r.respondent ?? "",
    detail: r.detail ?? "", photos: parsePhotos(r.photos), status: (r.status as MediationStatus) ?? "pending",
    handledBy: r.handled_by ?? "", handledAt: r.handled_at ?? 0, createdAt: r.created_at ?? 0,
  };
}

export function createMediation(input: { applicant: string; phone: string; respondent: string; detail: string; photos?: string[]; uid?: string }): number {
  const photos = (input.photos ?? []).filter(Boolean).slice(0, 5);
  const info = getDb()
    .prepare("INSERT INTO mediations (uid, applicant, phone, respondent, detail, photos, status, created_at) VALUES (?,?,?,?,?,?, 'pending', ?)")
    .run(input.uid ?? null, input.applicant, input.phone, input.respondent, input.detail, photos.length ? JSON.stringify(photos) : null, Date.now());
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

export function setMediationStatus(id: number, status: MediationStatus, by?: string) {
  if (by) getDb().prepare("UPDATE mediations SET status = ?, handled_by = ?, handled_at = ? WHERE id = ?").run(status, by, Date.now(), id);
  else getDb().prepare("UPDATE mediations SET status = ? WHERE id = ?").run(status, id);
}
