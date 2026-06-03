import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   金融：协会合作金融产品(finance_products) + 企业申请(finance_applications)
   ============================================================ */

export type FinAppStatus = "pending" | "approved" | "rejected" | "disbursed";

export type FinanceProduct = {
  id: number; name: string; provider: string; type: string;
  rateLabel: string; amountLabel: string; termLabel: string; forWhom: string; color: string; highlights: string[]; status: string; createdAt: number;
};
export type FinanceApplication = {
  id: number; enterpriseId: string; enterpriseName: string; productId: number; productName: string;
  amount: string; note: string; status: FinAppStatus; createdAt: number;
};

type PRow = { id: number; name: string | null; provider: string | null; type: string | null; rate_label: string | null; amount_label: string | null; term_label: string | null; for_whom: string | null; color: string | null; highlights: string | null; status: string; created_at: number | null };
type ARow = { id: number; enterprise_id: string | null; enterprise_name: string | null; product_id: number; product_name: string | null; amount: string | null; note: string | null; status: string; created_at: number | null };

function parseHl(s: string | null): string[] {
  if (!s) return [];
  try { const v = JSON.parse(s); return Array.isArray(v) ? v.map(String).filter(Boolean) : []; } catch { return []; }
}
function toP(r: PRow): FinanceProduct {
  return { id: r.id, name: r.name ?? "", provider: r.provider ?? "", type: r.type ?? "", rateLabel: r.rate_label ?? "", amountLabel: r.amount_label ?? "", termLabel: r.term_label ?? "", forWhom: r.for_whom ?? "", color: r.color ?? "brand", highlights: parseHl(r.highlights), status: r.status ?? "active", createdAt: r.created_at ?? 0 };
}
function toA(r: ARow): FinanceApplication {
  return { id: r.id, enterpriseId: r.enterprise_id ?? "", enterpriseName: r.enterprise_name ?? "", productId: r.product_id, productName: r.product_name ?? "", amount: r.amount ?? "", note: r.note ?? "", status: (r.status as FinAppStatus) ?? "pending", createdAt: r.created_at ?? 0 };
}

export function listFinanceProducts(): FinanceProduct[] {
  return (getDb().prepare("SELECT * FROM finance_products WHERE status='active' ORDER BY created_at ASC").all() as PRow[]).map(toP);
}
export function getFinanceProduct(id: number): FinanceProduct | undefined {
  const r = getDb().prepare("SELECT * FROM finance_products WHERE id=?").get(id) as PRow | undefined;
  return r ? toP(r) : undefined;
}
// 协会后台用：全部产品(含已下架)
export function listAllFinanceProducts(): FinanceProduct[] {
  return (getDb().prepare("SELECT * FROM finance_products ORDER BY status ASC, created_at ASC").all() as PRow[]).map(toP);
}
export type FinanceProductInput = {
  name: string; provider: string; type: string;
  rateLabel: string; amountLabel: string; termLabel: string; forWhom: string; color: string; highlights: string[];
};
export function createFinanceProduct(f: FinanceProductInput): number {
  const info = getDb().prepare(
    "INSERT INTO finance_products (name,provider,type,rate_label,amount_label,term_label,for_whom,color,highlights,status,created_at) VALUES (?,?,?,?,?,?,?,?,?, 'active', ?)",
  ).run(f.name, f.provider, f.type, f.rateLabel, f.amountLabel, f.termLabel, f.forWhom, f.color || "brand", JSON.stringify(f.highlights ?? []), Date.now());
  return Number(info.lastInsertRowid);
}
export function updateFinanceProduct(id: number, f: FinanceProductInput): void {
  getDb().prepare(
    "UPDATE finance_products SET name=?,provider=?,type=?,rate_label=?,amount_label=?,term_label=?,for_whom=?,color=?,highlights=? WHERE id=?",
  ).run(f.name, f.provider, f.type, f.rateLabel, f.amountLabel, f.termLabel, f.forWhom, f.color || "brand", JSON.stringify(f.highlights ?? []), id);
}
export function setFinanceProductStatus(id: number, status: "active" | "off"): void {
  getDb().prepare("UPDATE finance_products SET status=? WHERE id=?").run(status, id);
}
export function deleteFinanceProduct(id: number): void {
  getDb().prepare("DELETE FROM finance_products WHERE id=?").run(id);
}

export function createFinanceApplication(input: { enterpriseId: string; enterpriseName: string; product: FinanceProduct; amount: string; note?: string }): number {
  const info = getDb().prepare(
    "INSERT INTO finance_applications (enterprise_id,enterprise_name,product_id,product_name,amount,note,status,created_at) VALUES (?,?,?,?,?,?, 'pending', ?)",
  ).run(input.enterpriseId, input.enterpriseName, input.product.id, input.product.name, input.amount, input.note ?? "", Date.now());
  return Number(info.lastInsertRowid);
}
export function listFinanceAppsByEnterprise(eid: string): FinanceApplication[] {
  return (getDb().prepare("SELECT * FROM finance_applications WHERE enterprise_id=? ORDER BY created_at DESC").all(eid) as ARow[]).map(toA);
}
export function listAllFinanceApps(): FinanceApplication[] {
  return (getDb().prepare("SELECT * FROM finance_applications ORDER BY created_at DESC").all() as ARow[]).map(toA);
}
export function getFinanceApplication(id: number): FinanceApplication | undefined {
  const r = getDb().prepare("SELECT * FROM finance_applications WHERE id=?").get(id) as ARow | undefined;
  return r ? toA(r) : undefined;
}
export function setFinanceAppStatus(id: number, status: FinAppStatus) {
  getDb().prepare("UPDATE finance_applications SET status=? WHERE id=?").run(status, id);
}
