import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   建材集采：协会上架商品(supply_products) + 企业采购单(supply_orders)
   ============================================================ */

export type ProductStatus = "active" | "off";
export type OrderStatus = "pending" | "confirmed" | "shipped" | "done";

export type SupplyProduct = {
  id: number; name: string; category: string; unit: string; spec: string; supplier: string;
  marketPrice: number; memberPrice: number; status: ProductStatus; createdAt: number;
};
export type SupplyOrder = {
  id: number; enterpriseId: string; enterpriseName: string; productId: number; productName: string;
  unit: string; qty: number; unitPrice: number; total: number; status: OrderStatus; createdAt: number;
};

type PRow = { id: number; name: string | null; category: string | null; unit: string | null; spec: string | null; supplier: string | null; market_price: number | null; member_price: number | null; status: string; created_at: number | null };
type ORow = { id: number; enterprise_id: string | null; enterprise_name: string | null; product_id: number; product_name: string | null; unit: string | null; qty: number | null; unit_price: number | null; total: number | null; status: string; created_at: number | null };

function toP(r: PRow): SupplyProduct {
  return { id: r.id, name: r.name ?? "", category: r.category ?? "", unit: r.unit ?? "", spec: r.spec ?? "", supplier: r.supplier ?? "", marketPrice: r.market_price ?? 0, memberPrice: r.member_price ?? 0, status: (r.status as ProductStatus) ?? "active", createdAt: r.created_at ?? 0 };
}
function toO(r: ORow): SupplyOrder {
  return { id: r.id, enterpriseId: r.enterprise_id ?? "", enterpriseName: r.enterprise_name ?? "", productId: r.product_id, productName: r.product_name ?? "", unit: r.unit ?? "", qty: r.qty ?? 0, unitPrice: r.unit_price ?? 0, total: r.total ?? 0, status: (r.status as OrderStatus) ?? "pending", createdAt: r.created_at ?? 0 };
}

/* ---- 商品 ---- */
export function listProducts(onlyActive = true): SupplyProduct[] {
  const db = getDb();
  const rows = (onlyActive ? db.prepare("SELECT * FROM supply_products WHERE status='active' ORDER BY created_at DESC").all() : db.prepare("SELECT * FROM supply_products ORDER BY created_at DESC").all()) as PRow[];
  return rows.map(toP);
}
export function getProduct(id: number): SupplyProduct | undefined {
  const r = getDb().prepare("SELECT * FROM supply_products WHERE id=?").get(id) as PRow | undefined;
  return r ? toP(r) : undefined;
}
export function createProduct(input: { name: string; category: string; unit: string; spec?: string; supplier?: string; marketPrice: number; memberPrice: number }): number {
  const info = getDb().prepare(
    "INSERT INTO supply_products (name,category,unit,spec,supplier,market_price,member_price,status,created_at) VALUES (?,?,?,?,?,?,?, 'active', ?)",
  ).run(input.name, input.category, input.unit, input.spec ?? "", input.supplier ?? "", input.marketPrice, input.memberPrice, Date.now());
  return Number(info.lastInsertRowid);
}
export function setProductStatus(id: number, status: ProductStatus) {
  getDb().prepare("UPDATE supply_products SET status=? WHERE id=?").run(status, id);
}

/* ---- 采购单 ---- */
export function createSupplyOrder(input: { enterpriseId: string; enterpriseName: string; product: SupplyProduct; qty: number }): number {
  const total = input.product.memberPrice * input.qty;
  const info = getDb().prepare(
    "INSERT INTO supply_orders (enterprise_id,enterprise_name,product_id,product_name,unit,qty,unit_price,total,status,created_at) VALUES (?,?,?,?,?,?,?,?, 'pending', ?)",
  ).run(input.enterpriseId, input.enterpriseName, input.product.id, input.product.name, input.product.unit, input.qty, input.product.memberPrice, total, Date.now());
  return Number(info.lastInsertRowid);
}
export function listOrdersByEnterprise(eid: string): SupplyOrder[] {
  return (getDb().prepare("SELECT * FROM supply_orders WHERE enterprise_id=? ORDER BY created_at DESC").all(eid) as ORow[]).map(toO);
}
export function listAllSupplyOrders(): SupplyOrder[] {
  return (getDb().prepare("SELECT * FROM supply_orders ORDER BY created_at DESC").all() as ORow[]).map(toO);
}
export function getSupplyOrder(id: number): SupplyOrder | undefined {
  const r = getDb().prepare("SELECT * FROM supply_orders WHERE id=?").get(id) as ORow | undefined;
  return r ? toO(r) : undefined;
}
export function setSupplyOrderStatus(id: number, status: OrderStatus) {
  getDb().prepare("UPDATE supply_orders SET status=? WHERE id=?").run(status, id);
}
