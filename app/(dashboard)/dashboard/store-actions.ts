"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createListing, countListingsBySeller, setProductStatus, getProduct,
  type ReasonType,
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
    marketPrice: Number(fd.get("marketPrice") || 0) || 0,
    memberPrice: member,
  });
  revalidatePath(seller.base);
  revalidatePath("/dashboard/association/supplies");
  redirect(`${seller.base}?ok=submitted`);
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
