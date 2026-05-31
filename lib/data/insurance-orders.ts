import "server-only";
import { getDb } from "@/lib/db/sqlite";

export type InsuranceOrder = {
  id: number; uid: string; product: string; applicant: string; phone: string; note: string;
  status: string; createdAt: number;
};
type Row = { id: number; uid: string | null; product: string | null; applicant: string | null; phone: string | null; note: string | null; status: string; created_at: number | null };

function rowTo(r: Row): InsuranceOrder {
  return { id: r.id, uid: r.uid ?? "", product: r.product ?? "", applicant: r.applicant ?? "", phone: r.phone ?? "", note: r.note ?? "", status: r.status ?? "pending", createdAt: r.created_at ?? 0 };
}

export function createInsuranceOrder(input: { product: string; applicant: string; phone: string; note: string; uid?: string }): number {
  const info = getDb()
    .prepare("INSERT INTO insurance_orders (uid, product, applicant, phone, note, status, created_at) VALUES (?,?,?,?,?, 'pending', ?)")
    .run(input.uid ?? null, input.product, input.applicant, input.phone, input.note, Date.now());
  return Number(info.lastInsertRowid);
}

export function listInsuranceOrders(limit = 50): InsuranceOrder[] {
  const rows = getDb().prepare("SELECT * FROM insurance_orders ORDER BY created_at DESC LIMIT ?").all(limit) as Row[];
  return rows.map(rowTo);
}

export function listInsuranceByUid(uid: string): InsuranceOrder[] {
  if (!uid) return [];
  const rows = getDb().prepare("SELECT * FROM insurance_orders WHERE uid = ? ORDER BY created_at DESC").all(uid) as Row[];
  return rows.map(rowTo);
}
