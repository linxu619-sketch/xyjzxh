import "server-only";
import { getDb } from "@/lib/db/sqlite";
import { normalizeTier, quotaOf, type TierTrack } from "@/lib/data/member-tier";
import type { SellerType } from "@/lib/data/supplies-source";
import type { Account } from "@/lib/data/accounts";

/* ============================================================
   会员能力（权益）解析：等级给默认，单会员可由协会管理员覆盖。
   - 开店：等级默认都允许（quota>0）；仅管理员显式禁用(cap_store=0)时关闭。
   - 店铺上架额度：默认随等级 quotaOf；管理员可自定义(cap_store_quota)。
   本期能力 = 开店 + 店铺额度；其余（发岗/AI/推荐位）留扩展。
   ============================================================ */

export type MemberCaps = {
  canOpenStore: boolean;
  storeQuota: number;            // 有效上架上限（禁开店时=0）
  storeQuotaOverridden: boolean; // 额度是否被管理员覆盖
  storeDisabledByAdmin: boolean; // 开店是否被管理员显式禁用
};

function trackOfSeller(t: SellerType): TierTrack {
  return t === "practitioner" ? "practitioner" : "enterprise";
}

export function resolveCaps(track: TierTrack, tierRaw: string | null, capStore: number | null, capStoreQuota: number | null): MemberCaps {
  const tier = normalizeTier(track, tierRaw);
  const tierQuota = quotaOf(tier);
  const storeDisabledByAdmin = capStore === 0;
  const canOpenStore = !storeDisabledByAdmin;
  const storeQuotaOverridden = capStoreQuota != null;
  const base = storeQuotaOverridden ? Math.max(0, capStoreQuota as number) : tierQuota;
  return { canOpenStore, storeQuota: canOpenStore ? base : 0, storeQuotaOverridden, storeDisabledByAdmin };
}

// 从 Account 解析（会员管理页用）。业主(customer)非会员，无店铺能力。
export function capsOfAccount(a: Pick<Account, "role" | "tier" | "capStore" | "capStoreQuota">): MemberCaps {
  const track: TierTrack = a.role === "individual" ? "practitioner" : "enterprise";
  return resolveCaps(track, a.tier, a.capStore, a.capStoreQuota);
}

// 按 member_ref（企业 enterprise_id / 从业者 p-id）解析（store-actions / 店铺页用）；平台自身不限。
export function resolveCapsByMemberRef(sellerType: SellerType, memberRef: string): MemberCaps {
  if (sellerType === "association") return { canOpenStore: true, storeQuota: Infinity, storeQuotaOverridden: false, storeDisabledByAdmin: false };
  const row = getDb().prepare("SELECT tier, cap_store, cap_store_quota FROM accounts WHERE member_ref = ? LIMIT 1")
    .get(memberRef) as { tier: string | null; cap_store: number | null; cap_store_quota: number | null } | undefined;
  return resolveCaps(trackOfSeller(sellerType), row?.tier ?? null, row?.cap_store ?? null, row?.cap_store_quota ?? null);
}
