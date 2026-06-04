import Link from "next/link";
import { Package, CheckCircle2, TrendingDown, ShoppingCart, ShieldCheck, Clock, AlertTriangle, Swords, ChevronRight } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { Badge } from "@/components/ui/badge";
import { listProducts, listAllSupplyOrders, listByStatus, brandActiveHolder, reconcileAll, type OrderStatus, type ReasonType } from "@/lib/data/supplies-source";
import { PublishProduct } from "./PublishProduct";

export const metadata = { title: "建材集采 · 协会工作台" };

const REASON_LABEL: Record<ReasonType, string> = { agent: "独家代理", self: "自产自销", direct: "厂家直供" };
const SELLER_LABEL: Record<string, string> = { association: "协会自营", enterprise: "企业会员", practitioner: "个人会员" };

const ORDER_LABEL: Record<OrderStatus, string> = { pending: "待确认", confirmed: "已确认", shipped: "已发货", done: "已完成" };
const ORDER_TONE: Record<OrderStatus, "yellow" | "brand" | "build" | "tea"> = { pending: "yellow", confirmed: "brand", shipped: "build", done: "tea" };

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function SuppliesAdmin({ searchParams }: { searchParams: Promise<{ tab?: string; pok?: string; perr?: string; rok?: string; conflict?: string; notcheaper?: string }> }) {
  const { tab, pok, perr, rok, conflict, notcheaper } = await searchParams;
  const showOrders = tab === "orders";
  const showReview = tab === "review";
  const products = listProducts(false);
  const orders = listAllSupplyOrders();
  const pending = listByStatus("pending");
  const active = products.filter((p) => p.status === "active").length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const base = "/dashboard/association/supplies";

  return (
    <AssociationShell title="建材集采" subtitle={`在架 ${active} 款 · 待审核 ${pending.length} · 采购单 ${orders.length}`} actions={<PublishProduct />}>
      {pok && <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>已上架！</b>企业可在「建材采购」按会员价下单。</div></div>}
      {perr && <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 text-[13px]">上架失败：请填写名称与会员价。</div>}
      {rok === "1" && <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>审核通过，已上架。</b></div></div>}
      {rok === "replaced" && <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>价格擂台裁定完成。</b>挑战者已上架，原在架卖家已下架并通知。</div></div>}
      {conflict && <div className="mb-5 rounded-2xl border border-accent-yellow/40 bg-[#fff6d6] text-[#a37200] p-4 flex items-center gap-3"><AlertTriangle className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>该品牌已有在架卖家。</b>请用「价格擂台」裁定：仅当挑战价更低时方可替换在架卖家。</div></div>}
      {notcheaper && <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 flex items-center gap-3"><AlertTriangle className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>挑战价未低于在架价，不能替换。</b>同品牌以最低价为准，请驳回或让其调低价格。</div></div>}

      <StatFilters
        items={[
          { key: "products", label: "在架商品", value: active, color: "text-cat-build", href: base, active: !showOrders && !showReview },
          { key: "review", label: "待审核", value: pending.length, color: "text-accent-yellow", href: `${base}?tab=review`, active: showReview },
          { key: "orders", label: "采购单", value: orders.length, color: "text-cat-decor", href: `${base}?tab=orders`, active: showOrders },
          { key: "pendingOrders", label: "待确认单", value: pendingOrders, color: "text-cat-design" },
        ]}
      />

      {showReview ? (
        <div className="rounded-2xl border border-border bg-background overflow-hidden">
          <div className="px-5 py-3 border-b border-border text-[14px] font-semibold inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> 会员上架待审核（核验资格 + 比价）</div>
          {pending.length === 0 ? (
            <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">暂无待审核。会员在「我的店铺」提交上架后出现在这里。</div>
          ) : (
            <ul className="divide-y divide-border">
              {pending.map((p) => {
                const holder = brandActiveHolder(p.brand, p.id);
                const cheaper = holder ? p.memberPrice < holder.memberPrice : false;
                return (
                  <li key={p.id}>
                    <Link href={`${base}/product/${p.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface transition-colors active:scale-[0.99]">
                      <span className="h-9 w-9 rounded-xl bg-surface inline-flex items-center justify-center shrink-0"><Package className="h-4 w-4 text-cat-build" /></span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">{p.name}</span>
                          <Badge tone="brand" className="!px-2 !py-0.5">{p.brand}</Badge>
                          <span className="inline-flex items-center gap-0.5 text-[11px] text-accent-tea"><ShieldCheck className="h-3 w-3" />{REASON_LABEL[p.reasonType]}</span>
                        </div>
                        <div className="text-[12px] text-muted-foreground mt-0.5">{SELLER_LABEL[p.sellerType]} · {p.sellerName} · 会员价 <b className="text-cat-decor">¥{p.memberPrice}</b>/{p.unit}</div>
                      </div>
                      {holder && <Badge tone={cheaper ? "tea" : "decor"} className="shrink-0 inline-flex items-center gap-1"><Swords className="h-3 w-3" />擂台{cheaper ? "·价更低" : "·未低于"}</Badge>}
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="px-5 py-3 text-[12px] text-muted-foreground border-t border-border">点击任一行进入详情页进行通过 / 驳回 / 价格擂台裁定。</div>
        </div>
      ) : !showOrders ? (
        <div className="rounded-2xl border border-border bg-background overflow-hidden">
          <div className="px-5 py-3 border-b border-border text-[14px] font-semibold">集采商品（点击「上架商品」新增）</div>
          {products.length === 0 ? (
            <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">还没有商品。点右上「上架商品」新增。</div>
          ) : (
            <ul className="divide-y divide-border">
              {products.map((p) => {
                const off = p.marketPrice > 0 ? Math.round((1 - p.memberPrice / p.marketPrice) * 100) : 0;
                return (
                  <li key={p.id}>
                    <Link href={`${base}/product/${p.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface transition-colors active:scale-[0.99]">
                      <span className="h-9 w-9 rounded-xl bg-surface inline-flex items-center justify-center shrink-0"><Package className="h-4 w-4 text-cat-build" /></span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">{p.name}</span>
                          {p.brand && <Badge tone="brand" className="!px-2 !py-0.5">{p.brand}</Badge>}
                          <Badge tone="decor">{p.category}</Badge>
                        </div>
                        <div className="text-[12px] text-muted-foreground mt-0.5">{SELLER_LABEL[p.sellerType]} · {p.sellerName} · ¥{p.memberPrice}<span className="line-through ml-1 text-[11px]">¥{p.marketPrice}</span>/{p.unit}{off > 0 && <span className="text-accent-tea ml-1.5 inline-flex items-center gap-0.5"><TrendingDown className="h-2.5 w-2.5" />省{off}%</span>}</div>
                      </div>
                      <Badge tone={p.status === "active" ? "tea" : "neutral"} className="shrink-0">{p.status === "active" ? "在架" : "已下架"}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="px-5 py-3 text-[12px] text-muted-foreground border-t border-border">点击任一行进入详情页进行上架 / 下架。</div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-background overflow-hidden">
          <div className="px-5 py-3 border-b border-border text-[14px] font-semibold flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5"><ShoppingCart className="h-4 w-4" /> 企业采购单</span>
            <Link href={base} className="text-[12px] text-brand font-normal">← 看商品</Link>
          </div>
          {orders.length > 0 && (() => { const rec = reconcileAll(); return (
            <div className="px-5 py-2.5 border-b border-border bg-surface/50 flex items-center gap-x-5 gap-y-1 flex-wrap text-[12px]">
              <span className="text-muted-foreground">平台对账：</span>
              <span>累计 <b className="tabular-nums">¥{rec.totalAmount.toLocaleString()}</b></span>
              <span className="text-accent-tea">已结 ¥{rec.paid.toLocaleString()}</span>
              <span className="text-cat-decor">未结 ¥{rec.unpaid.toLocaleString()}</span>
              {rec.overdueCount > 0 && <span className="text-cat-decor font-medium">逾期 {rec.overdueCount} 单 · ¥{rec.overdue.toLocaleString()}</span>}
            </div>
          ); })()}
          {orders.length === 0 ? (
            <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">暂无采购单。企业在「建材采购」下单后会出现在这里。</div>
          ) : (
            <ul className="divide-y divide-border">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`${base}/order/${o.id}`} className="flex items-center gap-3 px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{o.productName} <span className="text-muted-foreground font-normal">× {o.qty}{o.unit}</span></div>
                      <div className="text-[11px] text-muted-foreground">{o.enterpriseName} · {fmt(o.createdAt)}</div>
                    </div>
                    <span className="font-semibold text-cat-decor tabular-nums shrink-0">¥{o.total.toLocaleString()}</span>
                    <Badge tone={ORDER_TONE[o.status]} className="shrink-0">{ORDER_LABEL[o.status]}</Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="px-5 py-3 text-[12px] text-muted-foreground border-t border-border">点击任一行进入详情页推进履约状态流转。</div>
        </div>
      )}
    </AssociationShell>
  );
}
