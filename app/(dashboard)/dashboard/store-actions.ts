"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createListing, countListingsBySeller, setProductStatus, getProduct,
  createSupplyOrder, getSupplyOrder, setSupplyOrderStatus, markOrderPaid,
  brandActiveHolder,
  type ReasonType, type OrderStatus,
} from "@/lib/data/supplies-source";
import { resolveCapsByMemberRef } from "@/lib/data/member-caps";
import { resolveSeller } from "@/lib/dashboard/seller";

const REASONS: ReasonType[] = ["agent", "self", "direct"];

// 详情页操作后可回到详情页（仅允许 /dashboard 内路径），否则回卖家工作台
function backTo(fd: FormData, fallback: string): never {
  const to = String(fd.get("redirect") || "");
  if (to.startsWith("/dashboard/")) { revalidatePath(to); redirect(to); }
  redirect(fallback);
}

export async function createListingAction(fd: FormData) {
  const seller = await resolveSeller();
  if (!seller) throw new Error("无权限：仅企业会员 / 个人会员可上架商品");

  // 会员能力：开店开关 + 上架额度（等级默认，管理员可单会员覆盖）
  const caps = resolveCapsByMemberRef(seller.type, seller.id);
  if (!caps.canOpenStore) {
    redirect(`${seller.base}?err=store-disabled`);
  }
  if (countListingsBySeller(seller.type, seller.id) >= caps.storeQuota) {
    redirect(`${seller.base}?err=quota`);
  }

  const name = String(fd.get("name") || "").trim();
  const brand = String(fd.get("brand") || "").trim();
  const member = Number(fd.get("memberPrice") || 0) || 0;
  const reasonType = String(fd.get("reasonType") || "agent") as ReasonType;
  if (!name || !brand || member <= 0 || !REASONS.includes(reasonType)) {
    redirect(`${seller.base}?err=form`);
  }

  // 品牌排他 + 价格擂台：同品牌已有他人在架时，必须低于在架价才能发起擂台
  const holder = brandActiveHolder(brand);
  const sameSeller = holder && holder.sellerType === seller.type && holder.sellerId === seller.id;
  const isChallenge = !!holder && !sameSeller;
  if (isChallenge && member >= holder!.memberPrice) {
    redirect(`${seller.base}?err=brand&bp=${holder!.memberPrice}&bu=${encodeURIComponent(holder!.unit)}&bn=${encodeURIComponent(holder!.sellerName)}`);
  }

  // 阶梯量价（选填，最多两档；仅保留数量与单价都有效、且单价低于基础价的档位）
  const tiers = [
    { minQty: Number(fd.get("tier1Qty") || 0) || 0, price: Number(fd.get("tier1Price") || 0) || 0 },
    { minQty: Number(fd.get("tier2Qty") || 0) || 0, price: Number(fd.get("tier2Price") || 0) || 0 },
  ].filter((t) => t.minQty > 0 && t.price > 0 && t.price < member);

  // 1688 式详情：规格参数表（paramK[]/paramV[] 平行数组）
  const pks = fd.getAll("paramK").map((x) => String(x));
  const pvs = fd.getAll("paramV").map((x) => String(x));
  const params = pks.map((k, i) => ({ k, v: pvs[i] ?? "" })).filter((p) => p.k.trim() && p.v.trim());

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
    description: String(fd.get("description") || "").trim(),
    params,
    origin: String(fd.get("origin") || "").trim(),
    leadTime: String(fd.get("leadTime") || "").trim(),
    shipping: String(fd.get("shipping") || "").trim(),
    afterSale: String(fd.get("afterSale") || "").trim(),
    stock: Math.max(0, Number(fd.get("stock") || 0) || 0),
  });
  revalidatePath(seller.base);
  revalidatePath("/dashboard/association/supplies");
  redirect(
    isChallenge
      ? `${seller.base}?ok=challenge&bn=${encodeURIComponent(holder!.sellerName)}&bp=${holder!.memberPrice}`
      : `${seller.base}?ok=submitted`,
  );
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
  revalidatePath("/dashboard/association/supply-orders");
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
  backTo(fd, seller.base);
}

// 卖家确认收款（结清账期）：仅本人为卖家的订单
export async function markOrderPaidAction(fd: FormData) {
  const seller = await resolveSeller();
  if (!seller) throw new Error("无权限");
  const id = Number(fd.get("id") || 0);
  const o = getSupplyOrder(id);
  if (o && o.sellerType === seller.type && o.sellerId === seller.id) markOrderPaid(id);
  revalidatePath(seller.base);
  backTo(fd, seller.base);
}

// 会员对自己的商品：下架 / 重新上架（仅本人，仅 active/off 之间）
export async function toggleMyListingAction(fd: FormData) {
  const seller = await resolveSeller();
  if (!seller) throw new Error("无权限");
  const id = Number(fd.get("id") || 0);
  const next = String(fd.get("status") || "");
  const p = getProduct(id);
  const owned = p && p.sellerType === seller.type && p.sellerId === seller.id;
  if (owned && next === "off") {
    setProductStatus(id, "off");
  } else if (owned && next === "active") {
    // 复活校验品牌排他：该品牌已被他人占据在架时，不能直接上架，需以更低价重新发起擂台
    const holder = brandActiveHolder(p!.brand, p!.id);
    if (holder && (holder.sellerType !== seller.type || holder.sellerId !== seller.id)) {
      redirect(`${seller.base}?err=brand&bp=${holder.memberPrice}&bu=${encodeURIComponent(holder.unit)}&bn=${encodeURIComponent(holder.sellerName)}`);
    }
    setProductStatus(id, "active");
  }
  revalidatePath(seller.base);
  backTo(fd, seller.base);
}
