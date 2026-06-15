import { Package, Crown, AlertCircle, CheckCircle2, Clock, XCircle, ShieldCheck, Truck, ShoppingCart, Swords, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { resolveSeller } from "@/lib/dashboard/seller";
import { listBySeller, listOrdersBySeller, listOrdersByBuyer, reconcileSeller, reconcileBuyer, isOverdue, SUPPLY_TERM_DAYS, type ProductStatus, type ReasonType, type OrderStatus, type SupplyOrder } from "@/lib/data/supplies-source";
import { getMemberTier, quotaOf, nextTierForSeller } from "@/lib/data/member-tier";
import { resolveCapsByMemberRef } from "@/lib/data/member-caps";
import { ListingForm } from "@/components/dashboard/listing-form";

function fmtDay(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; }
function SettleBadge({ o }: { o: SupplyOrder }) {
  if (o.settleStatus === "paid") return <Badge tone="tea" className="shrink-0">已结清</Badge>;
  if (isOverdue(o)) return <Badge tone="decor" className="shrink-0">逾期</Badge>;
  return <Badge tone="yellow" className="shrink-0">账期至 {fmtDay(o.dueAt)}</Badge>;
}

const O_LABEL: Record<OrderStatus, string> = { pending: "待确认", confirmed: "已确认", shipped: "已发货", done: "已完成" };
const O_TONE: Record<OrderStatus, "yellow" | "brand" | "build" | "tea"> = { pending: "yellow", confirmed: "brand", shipped: "build", done: "tea" };
function fmtO(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }

const STATUS: Record<ProductStatus, { label: string; tone: "yellow" | "tea" | "decor" | "neutral"; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: "待审核", tone: "yellow", icon: Clock },
  active: { label: "在架", tone: "tea", icon: CheckCircle2 },
  rejected: { label: "已驳回", tone: "decor", icon: XCircle },
  off: { label: "已下架", tone: "neutral", icon: Package },
};
export const REASON_LABEL: Record<ReasonType, string> = { agent: "独家代理", self: "自产自销", direct: "厂家直供" };

export async function SellerPanel({ sp }: { sp?: { ok?: string; err?: string; bp?: string; bn?: string; bu?: string } }) {
  const seller = await resolveSeller();
  if (!seller) {
    return <div className="rounded-2xl border border-border bg-background p-10 text-center text-[14px] text-muted-foreground">仅企业会员 / 个人会员可上架商品。请用会员账号登录。</div>;
  }
  const items = listBySeller(seller.type, seller.id);
  const sold = listOrdersBySeller(seller.type, seller.id);   // 我收到的采购单（待履约）
  const bought = listOrdersByBuyer(seller.type, seller.id);   // 我下的采购单
  const recv = reconcileSeller(seller.type, seller.id);       // 应收对账
  const pay = reconcileBuyer(seller.type, seller.id);         // 应付对账
  const toHandle = sold.filter((o) => o.status !== "done").length;
  const tier = getMemberTier(seller.type, seller.id);
  // 会员能力：开店开关 + 上架额度（等级默认，协会可单会员覆盖）
  const caps = resolveCapsByMemberRef(seller.type, seller.id);
  const storeDisabled = !caps.canOpenStore;
  const quota = caps.storeQuota;
  const used = items.filter((p) => p.status === "active" || p.status === "pending").length;
  const reachedQuota = used >= quota;
  const quotaText = quota === Infinity ? "不限" : String(quota);
  const nextTier = nextTierForSeller(seller.type, tier);
  const nextQuota = nextTier ? quotaOf(nextTier) : 0;
  const nextQuotaText = nextQuota === Infinity ? "不限" : String(nextQuota);

  return (
    <>
      {sp?.ok === "submitted" && <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>已提交审核！</b>协会核验资格与比价后通过即在架。</div></div>}
      {sp?.ok === "challenge" && <div className="mb-5 rounded-2xl border border-accent-yellow/40 bg-[#fff6d6] text-[#a37200] p-4 flex items-center gap-3"><Swords className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>价格擂台已发起！</b>你的价低于在架的「{sp.bn}」（¥{sp.bp}）。协会裁定通过后，将由你替换该品牌的在架卖家。</div></div>}
      {sp?.err === "brand" && <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 text-[13px] flex items-start gap-2"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>该品牌已由「{sp.bn}」以 <b>¥{sp.bp}/{sp.bu}</b> 在售。同品牌平台唯一最低价：你的会员批发价需<b>低于 ¥{sp.bp}</b> 才能发起价格擂台。</span></div>}
      {sp?.ok === "ordered" && <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3"><ShoppingCart className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>已下单！</b>卖家确认后履约，可在下方「我的采购单」跟踪。</div></div>}
      {sp?.err === "store-disabled" && <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 text-[13px] flex items-start gap-2"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>该账号<b>开店权限已被协会关闭</b>，暂不能上架。如有疑问请联系协会秘书处。</span></div>}
      {sp?.err === "quota" && <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 text-[13px] flex items-start gap-2"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>已达上架配额（{quotaText} 款）。请下架旧品，{caps.storeQuotaOverridden ? "或联系协会调整额度。" : nextTier ? <>或<Link href="/services#membership" className="underline font-medium hover:opacity-80">升级到「{nextTier}」</Link>（可上架 {nextQuotaText} 款）。</> : "已是最高等级（不限上架）。"}</span></div>}
      {sp?.err === "form" && <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 text-[13px]">提交失败：请填写商品名称、品牌与会员批发价。</div>}

      {/* 会籍 + 配额 */}
      <div className="mb-5 rounded-2xl bg-foreground text-background p-5 flex items-center gap-4 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-yellow/20 blur-2xl" />
        <Crown className="relative h-7 w-7 text-accent-yellow shrink-0" />
        <div className="relative flex-1 min-w-0">
          <div className="text-[11px] text-background/60 tracking-wider uppercase">会员等级 · 上架配额</div>
          {storeDisabled ? (
            <div className="mt-0.5 text-[18px] font-semibold leading-tight">{tier} <span className="text-[12px] text-cat-decor font-normal ml-1">开店已被协会关闭</span></div>
          ) : (
            <div className="mt-0.5 text-[18px] font-semibold leading-tight">{tier} <span className="text-[12px] text-accent-yellow font-normal ml-1">已用 {used} / {quotaText} 款{caps.storeQuotaOverridden ? "（协会调整）" : ""}</span></div>
          )}
          {!storeDisabled && nextTier && !caps.storeQuotaOverridden && (
            <Link href="/services#membership" className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-background/70 hover:text-background">
              <Crown className="h-3 w-3 text-accent-yellow" />
              {reachedQuota ? "配额已满，" : ""}升级「{nextTier}」可上架 {nextQuotaText} 款 →
            </Link>
          )}
        </div>
        <ListingForm disabled={reachedQuota || storeDisabled} disabledHint={storeDisabled ? "开店权限已被协会关闭" : `已达配额（${quotaText} 款）`} />
      </div>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold">我的商品（点右上「我要卖货」上架）</div>
        {items.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">还没有上架商品。<br />凭独家代理 / 自产自销 / 厂家直供资格，提交给协会审核后即可在商城销售。</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[2fr_1.2fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
              <span>商品</span><span>价格</span><span className="text-right">状态</span>
            </div>
            <ul className="divide-y divide-border">
              {items.map((p) => {
                const st = STATUS[p.status];
                const StIcon = st.icon;
                const off = p.marketPrice > 0 ? Math.round((1 - p.memberPrice / p.marketPrice) * 100) : 0;
                const replaced = p.status === "off" && (p.rejectReason ?? "").startsWith("价格擂台");
                return (
                  <li key={p.id}>
                    <Link href={`${seller.base}/product/${p.id}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1.2fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                      <span className="min-w-0">
                        <span className="font-medium truncate flex items-center gap-1.5">{p.name}<Badge tone="brand" className="!px-1.5 !py-0">{p.brand}</Badge><span className="hidden md:inline-flex items-center gap-0.5 text-[11px] text-accent-tea"><ShieldCheck className="h-3 w-3" />{REASON_LABEL[p.reasonType]}</span></span>
                        <span className="md:hidden text-[11px] text-muted-foreground truncate block">起批 {p.moq}{p.unit} · ¥{p.memberPrice}/{p.unit}</span>
                        {(p.status === "rejected" || p.status === "off") && p.rejectReason && <span className={`text-[11px] mt-0.5 block truncate ${replaced ? "text-[#a37200]" : "text-cat-decor"}`}>{replaced ? "擂台" : p.status === "rejected" ? "驳回" : "下架"}：{p.rejectReason}</span>}
                      </span>
                      <span className="hidden md:block text-muted-foreground">¥{p.memberPrice}<span className="line-through ml-1 text-[11px]">¥{p.marketPrice}</span>/{p.unit}{off > 0 && <span className="text-accent-tea ml-1.5">省{off}%</span>}</span>
                      <span className="inline-flex items-center gap-2 justify-end shrink-0">
                        {replaced
                          ? <Badge tone="decor" className="inline-flex items-center gap-1"><Swords className="h-3 w-3" />擂台被替换</Badge>
                          : <Badge tone={st.tone} className="inline-flex items-center gap-1"><StIcon className="h-3 w-3" />{st.label}</Badge>}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        <div className="px-5 py-3 text-[12px] text-muted-foreground border-t border-border">点击任一商品进入详情页进行上架 / 下架。</div>
      </div>

      {/* 收到的采购单（卖家履约 + 收款对账）*/}
      <div className="mt-5 rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-semibold inline-flex items-center gap-1.5"><Truck className="h-4 w-4" /> 收到的采购单</span>
          {toHandle > 0 && <Badge tone="yellow" className="!px-2 !py-0.5">{toHandle} 待处理</Badge>}
          {sold.length > 0 && (
            <span className="ml-auto text-[11px] text-muted-foreground">待收 <b className="text-cat-decor">¥{recv.unpaid.toLocaleString()}</b>{recv.overdue > 0 && <span className="text-cat-decor"> · 逾期 ¥{recv.overdue.toLocaleString()}</span>} · 已收 ¥{recv.paid.toLocaleString()}</span>
          )}
        </div>
        {sold.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">还没有买家下单。商品在架后，会员下单会出现在这里。</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1.8fr_1fr_0.9fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
              <span>商品 / 数量</span><span>买家</span><span>金额</span><span className="text-right">状态</span>
            </div>
            <ul className="divide-y divide-border">
              {sold.map((o) => (
                <li key={o.id}>
                  <Link href={`${seller.base}/order/${o.id}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[1.8fr_1fr_0.9fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                    <span className="min-w-0">
                      <span className="font-medium truncate block">{o.productName} <span className="text-muted-foreground font-normal">× {o.qty}{o.unit}</span></span>
                      <span className="md:hidden text-[11px] text-muted-foreground truncate block">买家：{o.buyerName} · ¥{o.total.toLocaleString()}</span>
                    </span>
                    <span className="hidden md:block text-muted-foreground truncate">{o.buyerName}</span>
                    <span className="hidden md:block font-semibold text-cat-decor tabular-nums">¥{o.total.toLocaleString()}</span>
                    <span className="inline-flex items-center gap-1.5 justify-end shrink-0 flex-wrap">
                      <Badge tone={O_TONE[o.status]}>{O_LABEL[o.status]}</Badge>
                      <SettleBadge o={o} />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
        {sold.length > 0 && <div className="px-5 py-3 text-[12px] text-muted-foreground border-t border-border">点击任一单进入详情页推进履约 / 确认收款。</div>}
      </div>

      {/* 我的采购单（买家跟踪 + 应付对账）*/}
      <div className="mt-5 rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-semibold inline-flex items-center gap-1.5"><ShoppingCart className="h-4 w-4" /> 我的采购单</span>
          {bought.length > 0 && (
            <span className="ml-auto text-[11px] text-muted-foreground">应付 <b className="text-cat-decor">¥{pay.unpaid.toLocaleString()}</b>{pay.overdue > 0 && <span className="text-cat-decor"> · 逾期 ¥{pay.overdue.toLocaleString()}</span>} · 账期 {SUPPLY_TERM_DAYS} 天</span>
          )}
        </div>
        {bought.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">还没有采购。去<a href="/supplies" className="text-brand">建材超市</a>选购会员好货。</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1.8fr_1fr_0.9fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
              <span>商品 / 数量</span><span>卖家</span><span>金额</span><span className="text-right">状态</span>
            </div>
            <ul className="divide-y divide-border">
              {bought.map((o) => (
                <li key={o.id}>
                  <Link href={`${seller.base}/order/${o.id}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[1.8fr_1fr_0.9fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                    <span className="min-w-0">
                      <span className="font-medium truncate block">{o.productName} <span className="text-muted-foreground font-normal">× {o.qty}{o.unit}</span></span>
                      <span className="md:hidden text-[11px] text-muted-foreground truncate block">卖家：{o.sellerName} · ¥{o.total.toLocaleString()}</span>
                    </span>
                    <span className="hidden md:block text-muted-foreground truncate">{o.sellerName}</span>
                    <span className="hidden md:block font-semibold text-cat-decor tabular-nums">¥{o.total.toLocaleString()}</span>
                    <span className="inline-flex items-center gap-1.5 justify-end shrink-0 flex-wrap">
                      <Badge tone={O_TONE[o.status]}>{O_LABEL[o.status]}</Badge>
                      <SettleBadge o={o} />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
