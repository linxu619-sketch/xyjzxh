import Link from "next/link";
import { Package, CheckCircle2, TrendingDown, Truck, ShoppingCart, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { Badge } from "@/components/ui/badge";
import { listProducts, listAllSupplyOrders, listByStatus, brandActiveHolder, type OrderStatus, type ReasonType } from "@/lib/data/supplies-source";
import { PublishProduct } from "./PublishProduct";
import { setProductStatusAction, advanceOrderAction, approveListingAction, rejectListingAction } from "./actions";

export const metadata = { title: "建材集采 · 协会工作台" };

const REASON_LABEL: Record<ReasonType, string> = { agent: "独家代理", self: "自产自销", direct: "厂家直供" };
const SELLER_LABEL: Record<string, string> = { association: "协会自营", enterprise: "企业会员", practitioner: "个人会员" };

const ORDER_LABEL: Record<OrderStatus, string> = { pending: "待确认", confirmed: "已确认", shipped: "已发货", done: "已完成" };
const ORDER_TONE: Record<OrderStatus, "yellow" | "brand" | "build" | "tea"> = { pending: "yellow", confirmed: "brand", shipped: "build", done: "tea" };
const NEXT: Record<OrderStatus, OrderStatus | null> = { pending: "confirmed", confirmed: "shipped", shipped: "done", done: null };
const NEXT_LABEL: Record<string, string> = { confirmed: "确认", shipped: "发货", done: "完成" };

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function SuppliesAdmin({ searchParams }: { searchParams: Promise<{ tab?: string; pok?: string; perr?: string; rok?: string; conflict?: string }> }) {
  const { tab, pok, perr, rok, conflict } = await searchParams;
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
      {rok && <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>审核通过，已上架。</b></div></div>}
      {conflict && <div className="mb-5 rounded-2xl border border-accent-yellow/40 bg-[#fff6d6] text-[#a37200] p-4 flex items-center gap-3"><AlertTriangle className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>该品牌已有在架卖家，无法直接通过。</b>同品牌仅允许一家在售，需走「价格擂台」由最低价者胜出（擂台功能二期上线）。当前可驳回本申请。</div></div>}

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
                return (
                  <li key={p.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span className="h-9 w-9 rounded-xl bg-surface inline-flex items-center justify-center shrink-0"><Package className="h-4 w-4 text-cat-build" /></span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{p.name}</span>
                          <Badge tone="brand" className="!px-2 !py-0.5">{p.brand}</Badge>
                          <span className="inline-flex items-center gap-0.5 text-[11px] text-accent-tea"><ShieldCheck className="h-3 w-3" />{REASON_LABEL[p.reasonType]}</span>
                        </div>
                        <div className="text-[12px] text-muted-foreground mt-0.5">{SELLER_LABEL[p.sellerType]} · {p.sellerName} · {p.category}{p.spec ? " · " + p.spec : ""} · 起批 {p.moq}{p.unit}</div>
                        <div className="text-[12px] mt-0.5">会员批发价 <b className="text-cat-decor">¥{p.memberPrice}</b><span className="line-through ml-1 text-[11px] text-muted-foreground">¥{p.marketPrice}</span>/{p.unit}</div>
                        {p.reasonNote && <div className="text-[12px] text-muted-foreground mt-0.5">说明：{p.reasonNote}</div>}
                        {p.proofUrl && <a href={p.proofUrl} target="_blank" rel="noreferrer" className="text-[12px] text-brand mt-0.5 inline-block">查看资格证明 →</a>}
                        {holder && (
                          <div className="mt-1.5 text-[11px] text-[#a37200] bg-[#fff6d6] rounded-lg px-2 py-1 inline-flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> 品牌冲突：「{p.brand}」已由 {holder.sellerName} 在售（¥{holder.memberPrice}/{holder.unit}）
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 pl-12">
                      <form action={approveListingAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="h-8 px-4 rounded-full bg-accent-tea text-white text-[12px] font-medium inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> 通过上架</button>
                      </form>
                      <form action={rejectListingAction} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={p.id} />
                        <input name="reason" placeholder="驳回原因（选填）" className="h-8 px-3 rounded-full border border-border text-[12px] bg-background outline-none focus:border-foreground/30 w-40" />
                        <button className="h-8 px-4 rounded-full border border-cat-decor/40 text-cat-decor text-[12px] hover:bg-cat-decor-soft">驳回</button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
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
                  <li key={p.id} className="px-5 py-3.5 flex items-center gap-3">
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
                    <form action={setProductStatusAction} className="shrink-0">
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="status" value={p.status === "active" ? "off" : "active"} />
                      <button className="h-8 px-3 rounded-full border border-border text-[12px] hover:bg-surface">{p.status === "active" ? "下架" : "上架"}</button>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-background overflow-hidden">
          <div className="px-5 py-3 border-b border-border text-[14px] font-semibold flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5"><ShoppingCart className="h-4 w-4" /> 企业采购单</span>
            <Link href={base} className="text-[12px] text-brand font-normal">← 看商品</Link>
          </div>
          {orders.length === 0 ? (
            <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">暂无采购单。企业在「建材采购」下单后会出现在这里。</div>
          ) : (
            <ul className="divide-y divide-border">
              {orders.map((o) => {
                const nx = NEXT[o.status];
                return (
                  <li key={o.id} className="px-5 py-3.5 flex items-center gap-3 text-[13px]">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{o.productName} <span className="text-muted-foreground font-normal">× {o.qty}{o.unit}</span></div>
                      <div className="text-[11px] text-muted-foreground">{o.enterpriseName} · {fmt(o.createdAt)}</div>
                    </div>
                    <span className="font-semibold text-cat-decor tabular-nums shrink-0">¥{o.total.toLocaleString()}</span>
                    <Badge tone={ORDER_TONE[o.status]} className="shrink-0">{ORDER_LABEL[o.status]}</Badge>
                    {nx && (
                      <form action={advanceOrderAction} className="shrink-0">
                        <input type="hidden" name="id" value={o.id} />
                        <input type="hidden" name="status" value={nx} />
                        <button className="h-8 px-3 rounded-full bg-foreground text-background text-[12px] inline-flex items-center gap-1"><Truck className="h-3 w-3" /> {NEXT_LABEL[nx]}</button>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </AssociationShell>
  );
}
