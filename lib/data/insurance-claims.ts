import "server-only";
import { getDb } from "@/lib/db/sqlite";

export type ClaimStatus = "pending" | "reviewing" | "settled" | "rejected";
export type InsuranceClaim = {
  id: number; uid: string; applicant: string; phone: string;
  policy: string; product: string; subject: string; detail: string;
  status: ClaimStatus; createdAt: number;
};
type Row = {
  id: number; uid: string | null; applicant: string | null; phone: string | null;
  policy: string | null; product: string | null; subject: string | null; detail: string | null;
  status: string; created_at: number | null;
};
function toC(r: Row): InsuranceClaim {
  return {
    id: r.id, uid: r.uid ?? "", applicant: r.applicant ?? "", phone: r.phone ?? "",
    policy: r.policy ?? "", product: r.product ?? "", subject: r.subject ?? "", detail: r.detail ?? "",
    status: (r.status as ClaimStatus) ?? "pending", createdAt: r.created_at ?? 0,
  };
}

export function createClaim(input: { uid?: string; applicant: string; phone: string; policy: string; product: string; subject: string; detail?: string }): number {
  const info = getDb().prepare(
    "INSERT INTO insurance_claims (uid,applicant,phone,policy,product,subject,detail,status,created_at) VALUES (?,?,?,?,?,?,?, 'pending', ?)",
  ).run(input.uid ?? null, input.applicant, input.phone, input.policy, input.product, input.subject, input.detail ?? "", Date.now());
  return Number(info.lastInsertRowid);
}
export function listClaimsByUid(uid: string): InsuranceClaim[] {
  return (getDb().prepare("SELECT * FROM insurance_claims WHERE uid=? ORDER BY created_at DESC").all(uid) as Row[]).map(toC);
}
export function listAllClaims(): InsuranceClaim[] {
  return (getDb().prepare("SELECT * FROM insurance_claims ORDER BY created_at DESC").all() as Row[]).map(toC);
}
export function getClaim(id: number): InsuranceClaim | undefined {
  const r = getDb().prepare("SELECT * FROM insurance_claims WHERE id=?").get(id) as Row | undefined;
  return r ? toC(r) : undefined;
}
export function setClaimStatus(id: number, status: ClaimStatus): void {
  getDb().prepare("UPDATE insurance_claims SET status=? WHERE id=?").run(status, id);
}
