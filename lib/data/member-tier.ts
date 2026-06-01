import "server-only";
import { getDb } from "@/lib/db/sqlite";
import type { SellerType } from "@/lib/data/supplies-source";

/* ============================================================
   会员等级（普通 / 高级 / 理事）— 决定卖家可上架商品的数量配额
   ============================================================ */

export type MemberTier = "普通会员" | "高级会员" | "理事单位";

// 每个等级可上架的 SKU 数量上限（Infinity = 不限）
export const TIER_QUOTA: Record<MemberTier, number> = {
  "普通会员": 5,
  "高级会员": 20,
  "理事单位": Infinity,
};

export const TIER_ORDER: MemberTier[] = ["普通会员", "高级会员", "理事单位"];

// seller 身份 → accounts.member_ref：企业=enterprise_id，从业者=p-id
function memberRef(sellerType: SellerType, sellerId: string): string {
  return sellerId; // 企业 e00x 与从业者 p-x 都直接存于 accounts.member_ref
}

// 取某会员的等级（未登记则默认普通会员）
export function getMemberTier(sellerType: SellerType, sellerId: string): MemberTier {
  if (sellerType === "association") return "理事单位";
  const ref = memberRef(sellerType, sellerId);
  const row = getDb().prepare("SELECT tier FROM accounts WHERE member_ref=? AND tier IS NOT NULL LIMIT 1").get(ref) as { tier: string } | undefined;
  const t = (row?.tier as MemberTier) || "普通会员";
  return TIER_ORDER.includes(t) ? t : "普通会员";
}

export function quotaOf(tier: MemberTier): number {
  return TIER_QUOTA[tier] ?? 5;
}
