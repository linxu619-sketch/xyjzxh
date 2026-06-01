"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createListing, countListingsBySeller, setProductStatus, getProduct,
  createSupplyOrder, getSupplyOrder, setSupplyOrderStatus,
  type ReasonType, type OrderStatus,
} from "@/lib/data/supplies-source";
import { getMemberTier, quotaOf } from "@/lib/data/member-tier";
import { resolveSeller } from "@/lib/dashboard/seller";

const REASONS: ReasonType[] = ["agent", "self", "direct"];

export async function createListingAction(fd: FormData) {
  const seller = await resolveSeller();
  if (!seller) throw new Error("无权限：仅企业会员 / 个人会员可上架商品");

  // 等级配额
  const tier = getMemberTier(seller.type, seller.id);
  const quota = quotaOf(tier);
  if (countListingsBySeller(seller.type, seller.id) >= quota) {
    redirect(`${seller.base}?err=quota`);
  }

  const name = String(fd.get("name") || "").trim();
  const brand = String(fd.get("brand") || "").trim();
  const member = Number(fd.get("memberPrice") || 0) || 0;
  const reasonType = String(fd.get("reasonType") || "agent") as ReasonType;
  if (!name || !brand || member <= 0 || !REASONS.includes(reasonType)) {
    redirect(`${seller.base}?err=form`);
  }

  // 阶梯量价（选填，最多两档；仅保留数量与单价都有效、且单价低于基础价的档位）
  const tiers = [
    { minQty: Number(fd.get("tier1Qty") || 0) || 0, price: Number(fd.get("tier1Price") || 0) || 0 },
    { minQty: Number(fd.get("tier2Qty") || 0) || 0, price: Number(fd.get("tier2Price") || 0) || 0 },
  ].filter((t) => t.minQty > 0 && t.price > 0 && t.price < member);

  createListing({
    sellerType: seller.type, sellerId: seller.id, sellerName: seller.name,
    name, brand,
    category: String(fd.get("category") || "主材").trim(),
    unit: String(fd.get("unit") || "件").trim(),
    spec: String(fd.get("spec") || "").trim(),
    reasonType,
    reasonNote: String(fd.get("reasonNote") || "").trim(),
    proofUrl: String(fd.get("proofUrl") || "").trim(),
    moq: Number(fd.get("moq") || 1) || 1,
    images: [fd.get("imageUrl"), fd.get("imageUrl2"), fd.get("imageUrl3")]
      .map((v) => String(v || "").trim()).filter(Boolean).slice(0, 3),
    priceTiers: tiers,
    marketPrice: Number(fd.get("marketPrice") || 0) || 0,
    memberPrice: member,
  });
  revalidatePath(seller.base);
  revalidatePath("/dashboard/association/supplies");
  redirect(`${seller.base}?ok=submitted`);
}

// 会员从前台商城下单（买家=任一会员；订单路由到卖家履约）
export async function placeOrderAction(fd: FormData) {
  const buyer = await resolveSeller(); // 复用：当前登录会员身份（企业/个人）
  const productId = Number(fd.get("productId") || 0);
  const qty = Math.max(1, Number(fd.get("qty") || 1) || 1);
  const product = getProduct(productId);
  const backTo = `/supplies/${productId}`;
  if (!buyer) redirect(`/login?role=association&next=${encodeURIComponent(backTo)}`);
  if (!product || product.status !== "active") redirect(`${backTo}?err=off`);
  if (product!.sellerType === buyer!.type && product!.sellerId === buyer!.id) redirect(`${backTo}?err=self`);
  createSupplyOrder({ buyer: { type: buyer!.type, id: buyer!.id, name: buyer!.name }, product: product!, qty });
  revalidatePath("/dashboard/association/supplies");
  revalidatePath(buyer!.base);
  redirect(`${buyer!.base}?ok=ordered`);
}

// 卖家推进自己收到的采购单状态
export async function advanceSellerOrderAction(fd: FormData) {
  const seller = await resolveSeller();
  if (!seller) throw new Error("无权限");
  const id = Number(fd.get("id") || 0);
  const next = String(fd.get("status") || "") as OrderStatus;
  const o = getSupplyOrder(id);
  const owned = o && o.sellerType === seller.type && o.sellerId === seller.id;
  if (owned && ["pending", "confirmed", "shipped", "done"].includes(next)) {
    setSupplyOrderStatus(id, next);
  }
  revalidatePath(seller.base);
  redirect(seller.base);
}

// 会员对自己的商品：下架 / 重新上架（仅本人，仅 active/off 之间）
export async function toggleMyListingAction(fd: FormData) {
  const seller = await resolveSeller();
  if (!seller) throw new Error("无权限");
  const id = Number(fd.get("id") || 0);
  const next = String(fd.get("status") || "");
  const p = getProduct(id);
  const owned = p && p.sellerType === seller.type && p.sellerId === seller.id;
  if (owned && (next === "off" || next === "active")) {
    setProductStatus(id, next as "off" | "active");
  }
  revalidatePath(seller.base);
  redirect(seller.base);
}
