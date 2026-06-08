"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffPermission } from "@/lib/auth/guard";
import { createProduct, getProduct, setProductStatus, getSupplyOrder, setSupplyOrderStatus, approveListing, rejectListing, replaceListing, brandActiveHolder, setCommission, updateProductDetail, type ProductStatus, type OrderStatus, type ProductParam } from "@/lib/data/supplies-source";

async function requireAssoc() {
  await requireStaffPermission("supplies");
}
function refresh() {
  revalidatePath("/dashboard/association/supplies");
  revalidatePath("/dashboard/enterprise/supplies");
}
// 详情页操作后可回到详情页（传 redirect 字段，仅允许本模块路径）
function redirectTo(fd: FormData, fallback: string): never {
  const to = String(fd.get("redirect") || "");
  if (to.startsWith("/dashboard/association/supplies")) { revalidatePath(to); redirect(to); }
  redirect(fallback);
}

export async function createProductAction(fd: FormData) {
  await requireAssoc();
  const name = String(fd.get("name") || "").trim();
  const category = String(fd.get("category") || "建材").trim();
  const unit = String(fd.get("unit") || "件").trim();
  const market = Number(fd.get("marketPrice") || 0) || 0;
  const member = Number(fd.get("memberPrice") || 0) || 0;
  if (!name || member <= 0) redirect("/dashboard/association/supplies?perr=1");
  createProduct({ name, category, unit, spec: String(fd.get("spec") || "").trim(), supplier: String(fd.get("supplier") || "").trim(), marketPrice: market, memberPrice: member });
  refresh();
  redirect("/dashboard/association/supplies?pok=1");
}

export async function setProductStatusAction(fd: FormData) {
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  const status = String(fd.get("status") || "") as ProductStatus;
  if (getProduct(id) && (status === "active" || status === "off")) setProductStatus(id, status);
  refresh();
  redirectTo(fd, "/dashboard/association/supplies");
}

// 审核通过：先校验品牌排他（同品牌已有在架卖家则拒绝，需走价格擂台·二期）
export async function approveListingAction(fd: FormData) {
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  const p = getProduct(id);
  if (!p || p.status !== "pending") { refresh(); redirect("/dashboard/association/supplies?tab=review"); }
  const holder = brandActiveHolder(p!.brand, p!.id);
  if (holder) {
    refresh();
    redirect(`/dashboard/association/supplies?tab=review&conflict=${id}`);
  }
  approveListing(id);
  refresh();
  redirect("/dashboard/association/supplies?tab=review&rok=1");
}

// 价格擂台裁定：挑战者更低价则替换在架卖家
export async function replaceListingAction(fd: FormData) {
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  const p = getProduct(id);
  if (!p || p.status !== "pending") { refresh(); redirect("/dashboard/association/supplies?tab=review"); }
  const holder = brandActiveHolder(p!.brand, p!.id);
  if (!holder) {
    // 品牌已空缺，直接通过
    approveListing(id);
    refresh();
    redirect("/dashboard/association/supplies?tab=review&rok=1");
  }
  if (p!.memberPrice >= holder!.memberPrice) {
    // 未低于在架价，不能进商城
    refresh();
    redirect(`/dashboard/association/supplies?tab=review&notcheaper=${id}`);
  }
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const note = `价格擂台：被「${p!.sellerName}」以更低价 ¥${p!.memberPrice}/${p!.unit} 替换（${date}）`;
  replaceListing(id, holder!.id, note);
  refresh();
  redirect("/dashboard/association/supplies?tab=review&rok=replaced");
}

export async function rejectListingAction(fd: FormData) {
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  const reason = String(fd.get("reason") || "资格或比价未通过").trim();
  const p = getProduct(id);
  if (p && p.status === "pending") rejectListing(id, reason);
  refresh();
  redirect("/dashboard/association/supplies?tab=review");
}

export async function advanceOrderAction(fd: FormData) {
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  const status = String(fd.get("status") || "") as OrderStatus;
  if (getSupplyOrder(id) && ["pending", "confirmed", "shipped", "done"].includes(status)) setSupplyOrderStatus(id, status);
  refresh();
  redirectTo(fd, "/dashboard/association/supplies?tab=orders");
}

// 平台后台：设置该商品佣金（0-2%）
export async function setCommissionAction(fd: FormData) {
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  const pct = Number(fd.get("commissionPct") || 0);
  if (getProduct(id)) setCommission(id, pct);
  const self = `/dashboard/association/supplies/product/${id}`;
  revalidatePath(self);
  redirect(`${self}?cok=1`);
}

// 平台/卖家：编辑商品 1688 式详情（图文/参数/产地/货期/物流/售后/库存）
export async function updateProductDetailAction(fd: FormData) {
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  if (!getProduct(id)) redirect("/dashboard/association/supplies");
  // 参数表：paramK[] / paramV[] 平行数组
  const ks = fd.getAll("paramK").map((x) => String(x));
  const vs = fd.getAll("paramV").map((x) => String(x));
  const params: ProductParam[] = ks.map((k, i) => ({ k, v: vs[i] ?? "" })).filter((p) => p.k.trim() && p.v.trim());
  updateProductDetail(id, {
    description: String(fd.get("description") || "").trim(),
    params,
    origin: String(fd.get("origin") || "").trim(),
    leadTime: String(fd.get("leadTime") || "").trim(),
    shipping: String(fd.get("shipping") || "").trim(),
    afterSale: String(fd.get("afterSale") || "").trim(),
    stock: Math.max(0, Number(fd.get("stock") || 0) || 0),
  });
  const self = `/dashboard/association/supplies/product/${id}`;
  revalidatePath(self);
  redirect(`${self}?dok=1`);
}
