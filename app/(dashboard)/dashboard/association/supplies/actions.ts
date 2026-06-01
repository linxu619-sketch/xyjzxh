"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { createProduct, getProduct, setProductStatus, getSupplyOrder, setSupplyOrderStatus, approveListing, rejectListing, replaceListing, brandActiveHolder, type ProductStatus, type OrderStatus } from "@/lib/data/supplies-source";

async function requireAssoc() {
  const s = await getSession();
  if (!s || (s.role !== "association" && s.role !== "system_admin")) throw new Error("无权限：仅协会工作人员可管理建材集采");
}
function refresh() {
  revalidatePath("/dashboard/association/supplies");
  revalidatePath("/dashboard/enterprise/supplies");
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
  redirect("/dashboard/association/supplies");
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
  redirect("/dashboard/association/supplies?tab=orders");
}
