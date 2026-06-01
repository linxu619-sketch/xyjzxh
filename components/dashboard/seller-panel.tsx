import { Package, Crown, AlertCircle, CheckCircle2, Clock, XCircle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { resolveSeller } from "@/lib/dashboard/seller";
import { listBySeller, type ProductStatus, type ReasonType } from "@/lib/data/supplies-source";
import { getMemberTier, quotaOf } from "@/lib/data/member-tier";
import { ListingForm } from "@/components/dashboard/listing-form";
import { toggleMyListingAction } from "@/app/(dashboard)/dashboard/store-actions";

const STATUS: Record<ProductStatus, { label: string; tone: "yellow" | "tea" | "decor" | "neutral"; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: "待审核", tone: "yellow", icon: Clock },
  active: { label: "在架", tone: "tea", icon: CheckCircle2 },
  rejected: { label: "已驳回", tone: "decor", icon: XCircle },
  off: { label: "已下架", tone: "neutral", icon: Package },
};
export const REASON_LABEL: Record<ReasonType, string> = { agent: "独家代理", self: "自产自销", direct: "厂家直供" };

export async function SellerPanel({ sp }: { sp?: { ok?: string; err?: string } }) {
  const seller = await resolveSeller();
  if (!seller) {
    return <div className="rounded-2xl border border-border bg-background p-10 text-center text-[14px] text-muted-foreground">仅企业会员 / 个人会员可上架商品。请用会员账号登录。</div>;
  }
  const items = listBySeller(seller.type, seller.id);
  const tier = getMemberTier(seller.type, seller.id);
  const quota = quotaOf(tier);
  const used = items.filter((p) => p.status === "active" || p.status === "pending").length;
  const reachedQuota = used >= quota;
  const quotaText = quota === Infinity ? "不限" : String(quota);

  return (
    <>
      {sp?.ok === "submitted" && <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>已提交审核！</b>协会核验资格与比价后通过即在架。</div></div>}
      {sp?.err === "quota" && <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 text-[13px] flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />已达 {tier} 上架配额（{quotaText} 款）。下架旧品或升级会员等级后再上新。</div>}
      {sp?.err === "form" && <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 text-[13px]">提交失败：请填写商品名称、品牌与会员批发价。</div>}

      {/* 会籍 + 配额 */}
      <div className="mb-5 rounded-2xl bg-foreground text-background p-5 flex items-center gap-4 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-yellow/20 blur-2xl" />
        <Crown className="relative h-7 w-7 text-accent-yellow shrink-0" />
        <div className="relative flex-1 min-w-0">
          <div className="text-[11px] text-background/60 tracking-wider uppercase">会员等级 · 上架配额</div>
          <div className="mt-0.5 text-[18px] font-semibold leading-tight">{tier} <span className="text-[12px] text-accent-yellow font-normal ml-1">已用 {used} / {quotaText} 款</span></div>
        </div>
        <ListingForm disabled={reachedQuota} disabledHint={`已达 ${tier} 配额（${quotaText} 款）`} />
      </div>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold">我的商品（点右上「我要卖货」上架）</div>
        {items.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">还没有上架商品。<br />凭独家代理 / 自产自销 / 厂家直供资格，提交给协会审核后即可在商城销售。</div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((p) => {
              const st = STATUS[p.status];
              const StIcon = st.icon;
              const off = p.marketPrice > 0 ? Math.round((1 - p.memberPrice / p.marketPrice) * 100) : 0;
              return (
                <li key={p.id} className="px-5 py-3.5 flex items-center gap-3">
                  <span className="h-9 w-9 rounded-xl bg-surface inline-flex items-center justify-center shrink-0"><Package className="h-4 w-4 text-cat-build" /></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{p.name}</span>
                      <Badge tone="brand" className="!px-2 !py-0.5">{p.brand}</Badge>
                      <span className="inline-flex items-center gap-0.5 text-[11px] text-accent-tea"><ShieldCheck className="h-3 w-3" />{REASON_LABEL[p.reasonType]}</span>
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">{p.spec ? p.spec + " · " : ""}起批 {p.moq}{p.unit} · ¥{p.memberPrice}<span className="line-through ml-1 text-[11px]">¥{p.marketPrice}</span>/{p.unit}{off > 0 && <span className="text-accent-tea ml-1.5">省{off}%</span>}</div>
                    {p.status === "rejected" && p.rejectReason && <div className="text-[11px] text-cat-decor mt-0.5">驳回原因：{p.rejectReason}</div>}
                  </div>
                  <Badge tone={st.tone} className="shrink-0 inline-flex items-center gap-1"><StIcon className="h-3 w-3" />{st.label}</Badge>
                  {(p.status === "active" || p.status === "off") && (
                    <form action={toggleMyListingAction} className="shrink-0">
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="status" value={p.status === "active" ? "off" : "active"} />
                      <button className="h-8 px-3 rounded-full border border-border text-[12px] hover:bg-surface">{p.status === "active" ? "下架" : "上架"}</button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
