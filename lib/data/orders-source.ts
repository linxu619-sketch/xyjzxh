import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   施工订单（企业的客户工程订单）
   ============================================================ */

export type OrderStage = "signed" | "planning" | "in-progress" | "accepted";

export type Order = {
  id: number;
  enterpriseId: string;
  code: string;
  customerName: string;
  customerPhone: string;
  scope: string;
  type: string;
  area: string;
  district: string;
  amount: number;
  stage: OrderStage;
  progress: number;
  receivedPct: number;
  createdAt: number;
};

type Row = {
  id: number; enterprise_id: string | null; code: string | null; customer_name: string | null; customer_phone: string | null;
  scope: string | null; type: string | null; area: string | null; district: string | null; amount: number | null;
  stage: string; progress: number | null; received_pct: number | null; created_at: number | null;
};

function rowTo(r: Row): Order {
  return {
    id: r.id, enterpriseId: r.enterprise_id ?? "", code: r.code ?? "", customerName: r.customer_name ?? "", customerPhone: r.customer_phone ?? "",
    scope: r.scope ?? "", type: r.type ?? "", area: r.area ?? "", district: r.district ?? "", amount: r.amount ?? 0,
    stage: (r.stage as OrderStage) ?? "signed", progress: r.progress ?? 0, receivedPct: r.received_pct ?? 0, createdAt: r.created_at ?? 0,
  };
}

export function listOrdersByEnterprise(eid: string): Order[] {
  return (getDb().prepare("SELECT * FROM orders WHERE enterprise_id=? ORDER BY created_at DESC").all(eid) as Row[]).map(rowTo);
}
// 业主端「我的项目」：按客户手机号匹配本人订单（含企业维护的真实 stage/progress/收款）
export function listOrdersByCustomer(phone: string): Order[] {
  const p = (phone || "").trim();
  if (!p) return [];
  return (getDb().prepare("SELECT * FROM orders WHERE customer_phone=? ORDER BY created_at DESC").all(p) as Row[]).map(rowTo);
}
export function getOrder(id: number): Order | undefined {
  const r = getDb().prepare("SELECT * FROM orders WHERE id=?").get(id) as Row | undefined;
  return r ? rowTo(r) : undefined;
}
export function createOrder(input: {
  enterpriseId: string; customerName: string; customerPhone: string; scope: string; type?: string; area?: string; district?: string; amount?: number;
}): number {
  const db = getDb();
  const seq = (db.prepare("SELECT COUNT(*) AS c FROM orders").get() as { c: number }).c + 1;
  const code = `ORD-2026-${String(1000 + seq).padStart(4, "0")}`;
  const info = db.prepare(
    "INSERT INTO orders (enterprise_id,code,customer_name,customer_phone,scope,type,area,district,amount,stage,progress,received_pct,created_at) VALUES (?,?,?,?,?,?,?,?,?, 'signed', 0, 0, ?)",
  ).run(input.enterpriseId, code, input.customerName, input.customerPhone, input.scope, input.type ?? "家装", input.area ?? "", input.district ?? "", input.amount ?? 0, Date.now());
  return Number(info.lastInsertRowid);
}
export function updateOrderProgress(id: number, fields: { stage?: OrderStage; progress?: number; receivedPct?: number }) {
  const o = getOrder(id);
  if (!o) return;
  getDb().prepare("UPDATE orders SET stage=?, progress=?, received_pct=? WHERE id=?").run(
    fields.stage ?? o.stage,
    fields.progress ?? o.progress,
    fields.receivedPct ?? o.receivedPct,
    id,
  );
}
