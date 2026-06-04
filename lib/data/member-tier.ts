import "server-only";
import { getDb } from "@/lib/db/sqlite";
import type { SellerType } from "@/lib/data/supplies-source";

/* ============================================================
   会员等级 —— 两套互不相干的体系
   ① 企业会员：治理地位梯队（会员单位 → 理事 → 常务理事 → 副会长 → 会长）
   ② 个人(专业)会员：专业资历梯队（注册 → 资深 → 专家）
   两套梯队各自的名称 / 配额 / 权益 / 进阶完全独立，靠 accounts.role 分流。
   等级值存于 accounts.tier；解析时按角色校验到对应梯队，非法值回落到该梯队最低档。
   ============================================================ */

export type EnterpriseTier = "会员单位" | "理事单位" | "常务理事单位" | "副会长单位" | "会长单位";
export type PractitionerTier = "注册会员" | "资深会员" | "专家会员";
export type MemberTier = EnterpriseTier | PractitionerTier;

// 哪类会员（与 accounts.role 对应；association 视作平台自身）
export type TierTrack = "enterprise" | "practitioner";

export type TierMeta<T extends string = MemberTier> = {
  tier: T;
  level: number;        // 1 起，越大越高
  quota: number;        // 商城可上架 SKU 上限（Infinity = 不限）
  perks: string[];      // 该档权益（用于设置页 / 商城 / 公开会籍页）
};

// ① 企业会员梯队（治理地位）
export const ENTERPRISE_TIERS: TierMeta<EnterpriseTier>[] = [
  { tier: "会员单位",     level: 1, quota: 5,        perks: ["会员目录展示", "工装报备直通", "知识库基础权限", "商城上架 5 款", "AI 助手 100 次/月"] },
  { tier: "理事单位",     level: 2, quota: 20,       perks: ["以上全部", "首页推荐位", "商城上架 20 款", "调解优先受理", "AI 助手 1,000 次/月"] },
  { tier: "常务理事单位", level: 3, quota: 50,       perks: ["以上全部", "金融保险专项优惠", "商城上架 50 款", "年度品牌曝光"] },
  { tier: "副会长单位",   level: 4, quota: Infinity, perks: ["以上全部", "参与协会决策", "商城上架不限", "专属客户经理"] },
  { tier: "会长单位",     level: 5, quota: Infinity, perks: ["以上全部", "联合品牌活动", "定制 AI 员工", "战略合作"] },
];

// ② 个人(专业)会员梯队（专业资历）
export const PRACTITIONER_TIERS: TierMeta<PractitionerTier>[] = [
  { tier: "注册会员", level: 1, quota: 3,        perks: ["个人主页基础展示", "知识库基础权限", "商城上架 3 款"] },
  { tier: "资深会员", level: 2, quota: 10,       perks: ["以上全部", "搜索结果靠前", "调解优先受理", "商城上架 10 款"] },
  { tier: "专家会员", level: 3, quota: Infinity, perks: ["以上全部", "专家认证标识", "培训讲师资格", "商城上架不限"] },
];

export const ENTERPRISE_TIER_ORDER: EnterpriseTier[] = ENTERPRISE_TIERS.map((t) => t.tier);
export const PRACTITIONER_TIER_ORDER: PractitionerTier[] = PRACTITIONER_TIERS.map((t) => t.tier);

// 统一查表（两套梯队的名称互不重复，可合并查找）
const META_BY_TIER = new Map<string, TierMeta>(
  [...ENTERPRISE_TIERS, ...PRACTITIONER_TIERS].map((m) => [m.tier, m as TierMeta]),
);

// SellerType → 梯队轨道；association(平台自身) 归入企业轨
function trackOf(sellerType: SellerType): TierTrack {
  return sellerType === "practitioner" ? "practitioner" : "enterprise";
}

// 某轨道的梯队定义与最低档
export function tierLadder(track: TierTrack): TierMeta[] {
  return track === "practitioner" ? PRACTITIONER_TIERS : ENTERPRISE_TIERS;
}
export function baseTier(track: TierTrack): MemberTier {
  return track === "practitioner" ? "注册会员" : "会员单位";
}

// 给定轨道，把任意存储值规整为该轨道的合法等级（非法/旧值 → 最低档）
export function normalizeTier(track: TierTrack, raw: string | null | undefined): MemberTier {
  if (raw && tierLadder(track).some((m) => m.tier === raw)) return raw as MemberTier;
  return baseTier(track);
}

// 取某会员的等级（按 sellerType 分流到对应梯队；未登记则该梯队最低档）
export function getMemberTier(sellerType: SellerType, sellerId: string): MemberTier {
  if (sellerType === "association") return "会长单位"; // 平台自身：不限配额
  const track = trackOf(sellerType);
  const row = getDb()
    .prepare("SELECT tier FROM accounts WHERE member_ref=? AND tier IS NOT NULL LIMIT 1")
    .get(sellerId) as { tier: string } | undefined;
  return normalizeTier(track, row?.tier);
}

export function quotaOf(tier: MemberTier): number {
  return META_BY_TIER.get(tier)?.quota ?? 5;
}

export function metaOf(tier: MemberTier): TierMeta | undefined {
  return META_BY_TIER.get(tier);
}

// 同轨道的下一档（已是最高档返回 null）
export function nextTierOf(track: TierTrack, tier: MemberTier): MemberTier | null {
  const ladder = tierLadder(track);
  const i = ladder.findIndex((m) => m.tier === tier);
  return i >= 0 && i < ladder.length - 1 ? ladder[i + 1].tier : null;
}

// SellerType 版本（商城卖家面板用）
export function nextTierForSeller(sellerType: SellerType, tier: MemberTier): MemberTier | null {
  return nextTierOf(trackOf(sellerType), tier);
}
