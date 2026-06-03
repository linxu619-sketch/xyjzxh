import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* 协会合作保险产品(insurance_products) */
export type InsuranceProduct = {
  id: number; name: string; insurer: string; type: string;
  priceLabel: string; coverLabel: string; forWhom: string; color: string;
  highlights: string[]; featured: boolean; status: string; createdAt: number;
};
export type InsuranceProductInput = {
  name: string; insurer: string; type: string;
  priceLabel: string; coverLabel: string; forWhom: string; color: string;
  highlights: string[]; featured: boolean;
};

type Row = {
  id: number; name: string | null; insurer: string | null; type: string | null;
  price_label: string | null; cover_label: string | null; for_whom: string | null; color: string | null;
  highlights: string | null; featured: number | null; status: string; created_at: number | null;
};

function parseHl(s: string | null): string[] {
  if (!s) return [];
  try { const v = JSON.parse(s); return Array.isArray(v) ? v.map(String).filter(Boolean) : []; } catch { return []; }
}
function toP(r: Row): InsuranceProduct {
  return {
    id: r.id, name: r.name ?? "", insurer: r.insurer ?? "", type: r.type ?? "",
    priceLabel: r.price_label ?? "", coverLabel: r.cover_label ?? "", forWhom: r.for_whom ?? "", color: r.color ?? "decor",
    highlights: parseHl(r.highlights), featured: !!r.featured, status: r.status ?? "active", createdAt: r.created_at ?? 0,
  };
}

export function listInsuranceProducts(): InsuranceProduct[] {
  return (getDb().prepare("SELECT * FROM insurance_products WHERE status='active' ORDER BY featured DESC, created_at ASC").all() as Row[]).map(toP);
}
export function listAllInsuranceProducts(): InsuranceProduct[] {
  return (getDb().prepare("SELECT * FROM insurance_products ORDER BY status ASC, featured DESC, created_at ASC").all() as Row[]).map(toP);
}
export function getInsuranceProduct(id: number): InsuranceProduct | undefined {
  const r = getDb().prepare("SELECT * FROM insurance_products WHERE id=?").get(id) as Row | undefined;
  return r ? toP(r) : undefined;
}
export function createInsuranceProduct(f: InsuranceProductInput): number {
  const info = getDb().prepare(
    "INSERT INTO insurance_products (name,insurer,type,price_label,cover_label,for_whom,color,highlights,featured,status,created_at) VALUES (?,?,?,?,?,?,?,?,?, 'active', ?)",
  ).run(f.name, f.insurer, f.type, f.priceLabel, f.coverLabel, f.forWhom, f.color || "decor", JSON.stringify(f.highlights ?? []), f.featured ? 1 : 0, Date.now());
  return Number(info.lastInsertRowid);
}
export function updateInsuranceProduct(id: number, f: InsuranceProductInput): void {
  getDb().prepare(
    "UPDATE insurance_products SET name=?,insurer=?,type=?,price_label=?,cover_label=?,for_whom=?,color=?,highlights=?,featured=? WHERE id=?",
  ).run(f.name, f.insurer, f.type, f.priceLabel, f.coverLabel, f.forWhom, f.color || "decor", JSON.stringify(f.highlights ?? []), f.featured ? 1 : 0, id);
}
export function setInsuranceProductStatus(id: number, status: "active" | "off"): void {
  getDb().prepare("UPDATE insurance_products SET status=? WHERE id=?").run(status, id);
}
export function deleteInsuranceProduct(id: number): void {
  getDb().prepare("DELETE FROM insurance_products WHERE id=?").run(id);
}
