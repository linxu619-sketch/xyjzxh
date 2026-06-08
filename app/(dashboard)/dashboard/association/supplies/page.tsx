import Link from "next/link";
import { Package, CheckCircle2, TrendingDown, ShieldCheck, Clock, AlertTriangle, Swords, ChevronRight } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { Badge } from "@/components/ui/badge";
import { listProducts, listByStatus, brandActiveHolder, type ReasonType } from "@/lib/data/supplies-source";
import { PublishProduct } from "./PublishProduct";

export const metadata = { title: "建材商品 · 上架审核 · 协会工作台" };

const REASON_LABEL: Record<ReasonType, string> = { agent: "独家代理", self: "自产自销", direct: "厂家直供" };
const SELLER_LABEL: Record<string, string> = { association: "协会自营", enterprise: "企业会员", practitioner: "个人会员" };

export default async function SuppliesAdmin({ searchParams }: { searchParams: Promise<{ tab?: string; pok?: string; perr?: string; rok?: string; conflict?: string; notcheaper?: string }> }) {
  const { tab, pok, perr, rok, conflict, notcheaper } = await searchParams;
  // 默认进来＝「商品待审核」队列；?tab=products 看在架。订单在侧栏独立菜单「建材订单」。
  const showProducts = tab === "products";
  const showReview = !showProducts;
  const products = listProducts(false);
  const pending = listByStatus("pending");
  const active = products.filter((p) => p.status === "active").length;
  const base = "/dashboard/association/supplies";

  return (
    <AssociationShell title="建材商品 · 上架审核" subtitle={`待审核 ${pending.length} · 在架 ${active} 款`} actions={<PublishProduct />}>
      {pok && <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>已上架！</b>企业可在「建材采购」按会员价下单。</div></div>}
      {perr && <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 text-[13px]">上架失败：请填写名称与会员价。</div>}
      {rok === "1" && <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>审核通过，已上架。</b></div></div>}
      {rok === "replaced" && <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>价格擂台裁定完成。</b>挑战者已上架，原在架卖家已下架并通知。</div></div>}
      {conflict && <div className="mb-5 rounded-2xl border border-accent-yellow/40 bg-[#fff6d6] text-[#a37200] p-4 flex items-center gap-3"><AlertTriangle className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>该品牌已有在架卖家。</b>请用「价格擂台」裁定：仅当挑战价更低时方可替换在架卖家。</div></div>}
      {notcheaper && <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 flex items-center gap-3"><AlertTriangle className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>挑战价未低于在架价，不能替换。</b>同品牌以最低价为准，请驳回或让其调低价格。</div></div>}

      <StatFilters
        items={[
          { key: "review", label: "商品待审", value: pending.length, color: "text-accent-yellow", href: base, active: showReview },
          { key: "products", label: "在架商品", value: active, color: "text-cat-build", href: `${base}?tab=products`, active: showProducts },
        ]}
      />

      {/* 平台职责说明：商品＝平台审核（订单对账见侧栏「建材订单」）*/}
      <div className="mb-4 rounded-2xl border border-border bg-surface/50 px-4 py-2.5 text-[12px] text-muted-foreground leading-5">
        <b className="text-foreground">商品＝平台审核</b>：企业 / 个人商家上架须经平台核验资格、比价与品牌排他（价格擂台），通过后才在架。成交订单的对账 / 佣金 / 争议在侧栏「建材订单」。
      </div>

      {showReview ? (
        <div className="rounded-2xl border border-border bg-background overflow-hidden">
          <div className="px-5 py-3 border-b border-border text-[14px] font-semibold inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> 会员上架待审核（核验资格 + 比价）</div>
          {pending.length === 0 ? (
            <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">暂无待审核。会员在「我的店铺」提交上架后出现在这里。</div>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-[2fr_1.3fr_1fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
                <span>商品</span><span>卖家</span><span>会员价</span><span className="text-right">擂台</span>
              </div>
              <ul className="divide-y divide-border">
                {pending.map((p) => {
                  const holder = brandActiveHolder(p.brand, p.id);
                  const cheaper = holder ? p.memberPrice < holder.memberPrice : false;
                  return (
                    <li key={p.id}>
                      <Link href={`${base}/product/${p.id}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1.3fr_1fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                        <span className="min-w-0">
                          <span className="font-medium truncate flex items-center gap-1.5">{p.name}<Badge tone="brand" className="!px-1.5 !py-0">{p.brand}</Badge><span className="hidden md:inline-flex items-center gap-0.5 text-[11px] text-accent-tea"><ShieldCheck className="h-3 w-3" />{REASON_LABEL[p.reasonType]}</span></span>
                          <span className="md:hidden text-[11px] text-muted-foreground truncate block">{SELLER_LABEL[p.sellerType]} · {p.sellerName} · ¥{p.memberPrice}/{p.unit}</span>
                        </span>
                        <span className="hidden md:block text-muted-foreground truncate">{SELLER_LABEL[p.sellerType]} · {p.sellerName}</span>
                        <span className="hidden md:block"><b className="text-cat-decor">¥{p.memberPrice}</b><span className="text-muted-foreground">/{p.unit}</span></span>
                        <span className="inline-flex items-center gap-2 justify-end shrink-0">
                          {holder ? <Badge tone={cheaper ? "tea" : "decor"} className="inline-flex items-center gap-1"><Swords className="h-3 w-3" />{cheaper ? "价更低" : "未低于"}</Badge> : <span className="text-[11px] text-muted-foreground hidden md:inline">—</span>}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          <div className="px-5 py-3 text-[12px] text-muted-foreground border-t border-border">点击任一行进入详情页进行通过 / 驳回 / 价格擂台裁定。</div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-background overflow-hidden">
          <div className="px-5 py-3 border-b border-border text-[14px] font-semibold">集采商品（点击「上架商品」新增）</div>
          {products.length === 0 ? (
            <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">还没有商品。点右上「上架商品」新增。</div>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-[2fr_1.3fr_1.1fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
                <span>商品</span><span>卖家</span><span>价格</span><span className="text-right">状态</span>
              </div>
              <ul className="divide-y divide-border">
                {products.map((p) => {
                  const off = p.marketPrice > 0 ? Math.round((1 - p.memberPrice / p.marketPrice) * 100) : 0;
                  return (
                    <li key={p.id}>
                      <Link href={`${base}/product/${p.id}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1.3fr_1.1fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                        <span className="min-w-0">
                          <span className="font-medium truncate flex items-center gap-1.5">{p.name}{p.brand && <Badge tone="brand" className="!px-1.5 !py-0">{p.brand}</Badge>}<Badge tone="decor" className="!px-1.5 !py-0">{p.category}</Badge></span>
                          <span className="md:hidden text-[11px] text-muted-foreground truncate block">{SELLER_LABEL[p.sellerType]} · {p.sellerName} · ¥{p.memberPrice}/{p.unit}</span>
                        </span>
                        <span className="hidden md:block text-muted-foreground truncate">{SELLER_LABEL[p.sellerType]} · {p.sellerName}</span>
                        <span className="hidden md:block text-muted-foreground">¥{p.memberPrice}<span className="line-through ml-1 text-[11px]">¥{p.marketPrice}</span>/{p.unit}{off > 0 && <span className="text-accent-tea ml-1.5">省{off}%</span>}</span>
                        <span className="inline-flex items-center gap-2 justify-end shrink-0">
                          <Badge tone={p.status === "active" ? "tea" : "neutral"}>{p.status === "active" ? "在架" : "已下架"}</Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          <div className="px-5 py-3 text-[12px] text-muted-foreground border-t border-border">点击任一行进入详情页进行上架 / 下架。</div>
        </div>
      )}
    </AssociationShell>
  );
}
