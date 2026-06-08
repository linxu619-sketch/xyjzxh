import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   建材集采：协会上架商品(supply_products) + 企业采购单(supply_orders)
   ============================================================ */

export type ProductStatus = "pending" | "active" | "rejected" | "off";
export type SellerType = "association" | "enterprise" | "practitioner";
export type ReasonType = "agent" | "self" | "direct"; // 独家代理 | 自产自销 | 厂家直供
export type OrderStatus = "pending" | "confirmed" | "shipped" | "done";

export type PriceTier = { minQty: number; price: number };
export type ProductParam = { k: string; v: string }; // 规格参数表的一行
export type SupplyProduct = {
  id: number; name: string; category: string; unit: string; spec: string; supplier: string;
  brand: string; sellerType: SellerType; sellerId: string; sellerName: string;
  reasonType: ReasonType; reasonNote: string; proofUrl: string; moq: number;
  imageUrl: string; images: string[]; priceTiers: PriceTier[];
  marketPrice: number; memberPrice: number;
  // 1688 式详情扩展
  description: string; params: ProductParam[]; origin: string; leadTime: string; shipping: string; afterSale: string; stock: number;
  commissionPct: number; // 平台佣金 0-2(%)
  status: ProductStatus; rejectReason: string; createdAt: number;
};
export type SettleStatus = "unpaid" | "paid";
export type SupplyOrder = {
  id: number; enterpriseId: string; enterpriseName: string;
  buyerType: string; buyerId: string; buyerName: string;
  sellerType: string; sellerId: string; sellerName: string;
  productId: number; productName: string;
  unit: string; qty: number; unitPrice: number; total: number; status: OrderStatus;
  settleStatus: SettleStatus; dueAt: number; paidAt: number; createdAt: number;
};

export const SUPPLY_TERM_DAYS = 30; // 默认账期：月结 30 天
export function isOverdue(o: SupplyOrder): boolean {
  return o.settleStatus === "unpaid" && o.dueAt > 0 && Date.now() > o.dueAt;
}

type PRow = {
  id: number; name: string | null; category: string | null; unit: string | null; spec: string | null; supplier: string | null;
  brand: string | null; seller_type: string | null; seller_id: string | null; seller_name: string | null;
  reason_type: string | null; reason_note: string | null; proof_url: string | null; moq: number | null; image_url: string | null; price_tiers: string | null;
  market_price: number | null; member_price: number | null;
  description: string | null; params: string | null; origin: string | null; lead_time: string | null; shipping: string | null; after_sale: string | null; stock: number | null; commission_pct: number | null;
  status: string; reject_reason: string | null; created_at: number | null;
};

// image_url 存 1-3 张图：优先按 JSON 数组解析，兼容旧的单条 URL
function parseImages(s: string | null): string[] {
  if (!s) return [];
  const t = s.trim();
  if (t.startsWith("[")) {
    try {
      const arr = JSON.parse(t) as unknown[];
      if (Array.isArray(arr)) return arr.filter((x): x is string => typeof x === "string" && x.length > 0).slice(0, 3);
    } catch { /* fallthrough */ }
  }
  return t ? [t] : [];
}
function parseParams(s: string | null): ProductParam[] {
  if (!s) return [];
  try {
    const arr = JSON.parse(s) as ProductParam[];
    if (!Array.isArray(arr)) return [];
    return arr.filter((p) => p && typeof p.k === "string" && typeof p.v === "string" && p.k.trim() && p.v.trim())
      .map((p) => ({ k: p.k.trim(), v: p.v.trim() })).slice(0, 30);
  } catch { return []; }
}
function parseTiers(s: string | null): PriceTier[] {
  if (!s) return [];
  try {
    const arr = JSON.parse(s) as PriceTier[];
    if (!Array.isArray(arr)) return [];
    return arr.filter((t) => Number(t.minQty) > 0 && Number(t.price) > 0)
      .map((t) => ({ minQty: Number(t.minQty), price: Number(t.price) }))
      .sort((a, b) => a.minQty - b.minQty);
  } catch { return []; }
}
// 按采购数量取适用单价：取 minQty<=qty 中最大的一档，否则用基础会员价
export function unitPriceFor(p: SupplyProduct, qty: number): number {
  let price = p.memberPrice;
  for (const t of p.priceTiers) if (qty >= t.minQty) price = t.price;
  return price;
}
type ORow = {
  id: number; enterprise_id: string | null; enterprise_name: string | null;
  buyer_type: string | null; buyer_id: string | null; buyer_name: string | null;
  seller_type: string | null; seller_id: string | null; seller_name: string | null;
  product_id: number; product_name: string | null; unit: string | null; qty: number | null; unit_price: number | null; total: number | null; status: string;
  settle_status: string | null; due_at: number | null; paid_at: number | null; created_at: number | null;
};

function toP(r: PRow): SupplyProduct {
  return {
    id: r.id, name: r.name ?? "", category: r.category ?? "", unit: r.unit ?? "", spec: r.spec ?? "", supplier: r.supplier ?? "",
    brand: r.brand ?? "", sellerType: (r.seller_type as SellerType) ?? "association", sellerId: r.seller_id ?? "", sellerName: r.seller_name ?? "",
    reasonType: (r.reason_type as ReasonType) ?? "direct", reasonNote: r.reason_note ?? "", proofUrl: r.proof_url ?? "", moq: r.moq ?? 1,
    imageUrl: parseImages(r.image_url)[0] ?? "", images: parseImages(r.image_url), priceTiers: parseTiers(r.price_tiers),
    marketPrice: r.market_price ?? 0, memberPrice: r.member_price ?? 0,
    description: r.description ?? "", params: parseParams(r.params), origin: r.origin ?? "", leadTime: r.lead_time ?? "",
    shipping: r.shipping ?? "", afterSale: r.after_sale ?? "", stock: r.stock ?? 0, commissionPct: r.commission_pct ?? 0,
    status: (r.status as ProductStatus) ?? "active", rejectReason: r.reject_reason ?? "", createdAt: r.created_at ?? 0,
  };
}
function toO(r: ORow): SupplyOrder {
  return {
    id: r.id, enterpriseId: r.enterprise_id ?? "", enterpriseName: r.enterprise_name ?? "",
    buyerType: r.buyer_type ?? "enterprise", buyerId: r.buyer_id ?? (r.enterprise_id ?? ""), buyerName: r.buyer_name ?? (r.enterprise_name ?? ""),
    sellerType: r.seller_type ?? "association", sellerId: r.seller_id ?? "assoc", sellerName: r.seller_name ?? "协会集采",
    productId: r.product_id, productName: r.product_name ?? "", unit: r.unit ?? "", qty: r.qty ?? 0, unitPrice: r.unit_price ?? 0, total: r.total ?? 0, status: (r.status as OrderStatus) ?? "pending",
    settleStatus: (r.settle_status as SettleStatus) ?? "unpaid", dueAt: r.due_at ?? 0, paidAt: r.paid_at ?? 0, createdAt: r.created_at ?? 0,
  };
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
// 协会自营上架（直接在架，无需审核）
export function createProduct(input: { name: string; category: string; unit: string; spec?: string; supplier?: string; brand?: string; marketPrice: number; memberPrice: number }): number {
  const brand = (input.brand ?? input.supplier ?? "").trim();
  const info = getDb().prepare(
    `INSERT INTO supply_products (name,category,unit,spec,supplier,brand,seller_type,seller_id,seller_name,reason_type,moq,market_price,member_price,status,created_at)
     VALUES (?,?,?,?,?,?, 'association','assoc','协会集采','direct',1,?,?, 'active', ?)`,
  ).run(input.name, input.category, input.unit, input.spec ?? "", input.supplier ?? "", brand, input.marketPrice, input.memberPrice, Date.now());
  return Number(info.lastInsertRowid);
}

/* ---- 会员自助上架（B2B 互助商城）---- */
export type ListingInput = {
  sellerType: SellerType; sellerId: string; sellerName: string;
  name: string; brand: string; category: string; unit: string; spec?: string;
  reasonType: ReasonType; reasonNote?: string; proofUrl?: string;
  moq?: number; images?: string[]; priceTiers?: PriceTier[]; marketPrice: number; memberPrice: number;
  // 1688 式详情
  description?: string; params?: ProductParam[]; origin?: string; leadTime?: string; shipping?: string; afterSale?: string; stock?: number;
};
function cleanParams(arr?: ProductParam[]): string | null {
  const list = (arr ?? []).filter((p) => p && p.k?.trim() && p.v?.trim()).map((p) => ({ k: p.k.trim(), v: p.v.trim() })).slice(0, 30);
  return list.length ? JSON.stringify(list) : null;
}
// 会员提交上架 → 进入待审核（pending）
export function createListing(input: ListingInput): number {
  const tiers = (input.priceTiers ?? []).filter((t) => t.minQty > 0 && t.price > 0);
  const info = getDb().prepare(
    `INSERT INTO supply_products
       (name,category,unit,spec,supplier,brand,seller_type,seller_id,seller_name,reason_type,reason_note,proof_url,moq,image_url,price_tiers,market_price,member_price,description,params,origin,lead_time,shipping,after_sale,stock,status,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'pending', ?)`,
  ).run(
    input.name, input.category, input.unit, input.spec ?? "", input.brand, input.brand,
    input.sellerType, input.sellerId, input.sellerName,
    input.reasonType, input.reasonNote ?? "", input.proofUrl ?? "",
    input.moq ?? 1, (input.images && input.images.length ? JSON.stringify(input.images.slice(0, 3)) : ""), tiers.length ? JSON.stringify(tiers) : null, input.marketPrice, input.memberPrice,
    input.description ?? "", cleanParams(input.params), input.origin ?? "", input.leadTime ?? "", input.shipping ?? "", input.afterSale ?? "", Math.max(0, input.stock ?? 0),
    Date.now(),
  );
  return Number(info.lastInsertRowid);
}
// 平台后台：设置该商品佣金（0-2%）
export function setCommission(id: number, pct: number) {
  const v = Math.min(2, Math.max(0, Number(pct) || 0));
  getDb().prepare("UPDATE supply_products SET commission_pct=? WHERE id=?").run(v, id);
}
// 卖家/平台编辑商品详情（1688 式字段）
export function updateProductDetail(id: number, f: {
  description?: string; params?: ProductParam[]; origin?: string; leadTime?: string; shipping?: string; afterSale?: string; stock?: number;
}) {
  const p = getProduct(id);
  if (!p) return;
  getDb().prepare(
    "UPDATE supply_products SET description=?, params=?, origin=?, lead_time=?, shipping=?, after_sale=?, stock=? WHERE id=?",
  ).run(
    f.description ?? p.description,
    f.params !== undefined ? cleanParams(f.params) : cleanParams(p.params),
    f.origin ?? p.origin, f.leadTime ?? p.leadTime, f.shipping ?? p.shipping, f.afterSale ?? p.afterSale,
    Math.max(0, f.stock ?? p.stock), id,
  );
}
// 某会员的全部上架（含各状态）
export function listBySeller(sellerType: SellerType, sellerId: string): SupplyProduct[] {
  return (getDb().prepare("SELECT * FROM supply_products WHERE seller_type=? AND seller_id=? ORDER BY created_at DESC").all(sellerType, sellerId) as PRow[]).map(toP);
}
// 按状态取（审核队列用 pending）
export function listByStatus(status: ProductStatus): SupplyProduct[] {
  return (getDb().prepare("SELECT * FROM supply_products WHERE status=? ORDER BY created_at DESC").all(status) as PRow[]).map(toP);
}
// 会员当前在架(active)+待审(pending) 计数（用于等级配额）
export function countListingsBySeller(sellerType: SellerType, sellerId: string): number {
  return (getDb().prepare("SELECT COUNT(*) AS c FROM supply_products WHERE seller_type=? AND seller_id=? AND status IN ('active','pending')").get(sellerType, sellerId) as { c: number }).c;
}
// 品牌排他：返回该品牌当前在架(active)的商品（若有则被占用）
export function brandActiveHolder(brand: string, excludeId?: number): SupplyProduct | undefined {
  const b = brand.trim();
  if (!b) return undefined;
  const r = getDb().prepare("SELECT * FROM supply_products WHERE brand=? AND status='active' AND id!=? ORDER BY created_at ASC").get(b, excludeId ?? -1) as PRow | undefined;
  return r ? toP(r) : undefined;
}
// 协会审核：通过（置为在架）
export function approveListing(id: number) {
  getDb().prepare("UPDATE supply_products SET status='active', reject_reason='' WHERE id=?").run(id);
}
// 协会审核：驳回
export function rejectListing(id: number, reason: string) {
  getDb().prepare("UPDATE supply_products SET status='rejected', reject_reason=? WHERE id=?").run(reason, id);
}
// 价格擂台：挑战者胜出 → 替换在架卖家（在架方下架并留痕，挑战者上架）
export function replaceListing(challengerId: number, incumbentId: number, incumbentNote: string) {
  const db = getDb();
  db.prepare("UPDATE supply_products SET status='off', reject_reason=? WHERE id=?").run(incumbentNote, incumbentId);
  db.prepare("UPDATE supply_products SET status='active', reject_reason='' WHERE id=?").run(challengerId);
}
export function setProductStatus(id: number, status: ProductStatus) {
  getDb().prepare("UPDATE supply_products SET status=? WHERE id=?").run(status, id);
}

/* ---- 采购单（B2B：买家=会员，订单路由到卖家履约）---- */
export type Buyer = { type: string; id: string; name: string };
export function createSupplyOrder(input: { buyer: Buyer; product: SupplyProduct; qty: number }): number {
  const unit = unitPriceFor(input.product, input.qty); // 阶梯量价：按数量取适用单价
  const total = unit * input.qty;
  const eid = input.buyer.type === "enterprise" ? input.buyer.id : ""; // 企业买家同时写 enterprise_id 兼容旧查询
  const ename = input.buyer.type === "enterprise" ? input.buyer.name : "";
  const now = Date.now();
  const dueAt = now + SUPPLY_TERM_DAYS * 86400000;
  const info = getDb().prepare(
    `INSERT INTO supply_orders
       (enterprise_id,enterprise_name,buyer_type,buyer_id,buyer_name,seller_type,seller_id,seller_name,product_id,product_name,unit,qty,unit_price,total,status,settle_status,due_at,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'pending', 'unpaid', ?, ?)`,
  ).run(
    eid, ename, input.buyer.type, input.buyer.id, input.buyer.name,
    input.product.sellerType, input.product.sellerId, input.product.sellerName,
    input.product.id, input.product.name, input.product.unit, input.qty, unit, total, dueAt, now,
  );
  return Number(info.lastInsertRowid);
}

// 结清（卖家/协会确认收款）
export function markOrderPaid(id: number) {
  getDb().prepare("UPDATE supply_orders SET settle_status='paid', paid_at=? WHERE id=?").run(Date.now(), id);
}
// 对账汇总
export type Reconcile = { count: number; totalAmount: number; paid: number; unpaid: number; overdue: number; overdueCount: number };
function reconcile(orders: SupplyOrder[]): Reconcile {
  const now = Date.now();
  let totalAmount = 0, paid = 0, unpaid = 0, overdue = 0, overdueCount = 0;
  for (const o of orders) {
    totalAmount += o.total;
    if (o.settleStatus === "paid") paid += o.total;
    else { unpaid += o.total; if (o.dueAt > 0 && now > o.dueAt) { overdue += o.total; overdueCount++; } }
  }
  return { count: orders.length, totalAmount, paid, unpaid, overdue, overdueCount };
}
export function reconcileBuyer(type: string, id: string): Reconcile { return reconcile(listOrdersByBuyer(type, id)); }
export function reconcileSeller(type: string, id: string): Reconcile { return reconcile(listOrdersBySeller(type, id)); }
export function reconcileAll(): Reconcile { return reconcile(listAllSupplyOrders()); }
export function listOrdersByEnterprise(eid: string): SupplyOrder[] {
  return (getDb().prepare("SELECT * FROM supply_orders WHERE enterprise_id=? ORDER BY created_at DESC").all(eid) as ORow[]).map(toO);
}
export function listOrdersByBuyer(type: string, id: string): SupplyOrder[] {
  return (getDb().prepare("SELECT * FROM supply_orders WHERE buyer_type=? AND buyer_id=? ORDER BY created_at DESC").all(type, id) as ORow[]).map(toO);
}
export function listOrdersBySeller(type: string, id: string): SupplyOrder[] {
  return (getDb().prepare("SELECT * FROM supply_orders WHERE seller_type=? AND seller_id=? ORDER BY created_at DESC").all(type, id) as ORow[]).map(toO);
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

/* ---- 采购车（多商品）---- */
export type CartLine = { cartId: number; qty: number; product: SupplyProduct; unitPrice: number; lineTotal: number };
type CRow = { id: number; product_id: number; qty: number | null };

// 加入采购车：同商品已在车内则累加
export function addToCart(buyerType: string, buyerId: string, productId: number, qty: number) {
  const db = getDb();
  const n = Math.max(1, qty || 1);
  const ex = db.prepare("SELECT id, qty FROM supply_cart WHERE buyer_type=? AND buyer_id=? AND product_id=?").get(buyerType, buyerId, productId) as { id: number; qty: number } | undefined;
  if (ex) db.prepare("UPDATE supply_cart SET qty=? WHERE id=?").run((ex.qty || 0) + n, ex.id);
  else db.prepare("INSERT INTO supply_cart (buyer_type,buyer_id,product_id,qty,created_at) VALUES (?,?,?,?,?)").run(buyerType, buyerId, productId, n, Date.now());
}
export function listCart(buyerType: string, buyerId: string): CartLine[] {
  const rows = getDb().prepare("SELECT id, product_id, qty FROM supply_cart WHERE buyer_type=? AND buyer_id=? ORDER BY created_at ASC").all(buyerType, buyerId) as CRow[];
  const out: CartLine[] = [];
  for (const r of rows) {
    const product = getProduct(r.product_id);
    if (!product || product.status !== "active") continue; // 已下架则不计入
    const qty = Math.max(1, r.qty || 1);
    const unitPrice = unitPriceFor(product, qty);
    out.push({ cartId: r.id, qty, product, unitPrice, lineTotal: unitPrice * qty });
  }
  return out;
}
export function setCartQty(buyerType: string, buyerId: string, cartId: number, qty: number) {
  const db = getDb();
  if (qty <= 0) { db.prepare("DELETE FROM supply_cart WHERE id=? AND buyer_type=? AND buyer_id=?").run(cartId, buyerType, buyerId); return; }
  db.prepare("UPDATE supply_cart SET qty=? WHERE id=? AND buyer_type=? AND buyer_id=?").run(qty, cartId, buyerType, buyerId);
}
export function removeCartItem(buyerType: string, buyerId: string, cartId: number) {
  getDb().prepare("DELETE FROM supply_cart WHERE id=? AND buyer_type=? AND buyer_id=?").run(cartId, buyerType, buyerId);
}
export function clearCart(buyerType: string, buyerId: string) {
  getDb().prepare("DELETE FROM supply_cart WHERE buyer_type=? AND buyer_id=?").run(buyerType, buyerId);
}
export function cartCount(buyerType: string, buyerId: string): number {
  return (getDb().prepare("SELECT COUNT(*) AS c FROM supply_cart WHERE buyer_type=? AND buyer_id=?").get(buyerType, buyerId) as { c: number }).c;
}
