import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, ShieldCheck, Truck, BadgeCheck, ShoppingCart, Crown,
  Minus, Plus, Star, Sparkles,
} from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getProduct, PRODUCTS, CURRENT_TIER, tierBadgeColor, tierLabel,
  type SupplyTier,
} from "@/lib/data/supplies";
import { cn } from "@/lib/cn";

const THUMB: Record<string, string> = {
  build: "bg-cat-build", decor: "bg-cat-decor", design: "bg-cat-design",
  tea: "bg-accent-tea", yellow: "bg-accent-yellow", brand: "bg-brand",
};

const TIERS: SupplyTier[] = ["市场", "普通会员", "高级会员", "理事单位"];

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getProduct(id);
  if (!p) notFound();

  const my = p.prices[CURRENT_TIER];
  const saved = p.marketPrice - my;
  const related = PRODUCTS.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4);

  return (
    <Container className="py-4 md:py-12 max-w-6xl pb-28 md:pb-12">
      <Link href="/supplies" className="inline-flex items-center gap-1.5 text-[12px] md:text-[13px] text-muted-foreground hover:text-foreground mb-3 md:mb-5">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回建材超市
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8">
        {/* 图片 */}
        <div className="space-y-2 md:space-y-3 -mx-5 md:mx-0">
          <div className={cn("aspect-square md:rounded-3xl rounded-2xl overflow-hidden relative", THUMB[p.thumbColor])}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-foreground/30" />
            <div className="absolute top-3 md:top-4 left-3 md:left-4 flex flex-wrap gap-2">
              {p.hot && <Badge tone="decor">🔥 本周热销</Badge>}
              <Badge tone="tea"><ShieldCheck className="h-3 w-3 mr-1 inline" /> 协会认证</Badge>
            </div>
            <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 text-white">
              <div className="text-[10px] opacity-80 uppercase tracking-widest">{p.brand}</div>
              <div className="text-[14px] md:text-[16px] font-semibold mt-1">{p.spec}</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 px-5 md:px-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={cn("aspect-square rounded-xl opacity-60 hover:opacity-100 cursor-pointer", THUMB[p.thumbColor])} />
            ))}
          </div>
        </div>

        {/* 信息 */}
        <div>
          <div className="flex items-center gap-2 mb-2 md:mb-3 flex-wrap">
            <Badge tone="brand">{p.categoryLabel}</Badge>
            <span className="text-[11px] text-muted-foreground">{p.brand} · {p.supplierName}</span>
          </div>
          <h1 className="text-[20px] md:text-[36px] font-semibold tracking-tight leading-tight">{p.name}</h1>

          <div className="mt-2 flex items-center gap-2 text-[11px] md:text-[12px] flex-wrap">
            <Star className="h-3.5 w-3.5 fill-[#FFB400] text-[#FFB400]" />
            <span className="font-semibold tabular-nums">{p.rating.toFixed(1)}</span>
            <span className="text-muted-foreground tabular-nums">· 月销 {p.sales30d.toLocaleString()} {p.unit}</span>
            <span className="text-muted-foreground tabular-nums">· 库存 {p.stock.toLocaleString()}</span>
          </div>

          {/* 我的价 */}
          <div className="mt-4 md:mt-6 rounded-3xl bg-foreground text-background p-5 md:p-6 relative overflow-hidden shadow-lg">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cat-decor/30 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-accent-yellow/15 blur-2xl" />
            <div className="relative flex items-center gap-2 text-[10px] md:text-[11px] text-background/70 tracking-wider uppercase">
              <Crown className="h-3 md:h-3.5 w-3 md:w-3.5 text-accent-yellow" /> {CURRENT_TIER} 专享价
            </div>
            <div className="relative mt-2 flex items-baseline gap-2 md:gap-3">
              <span className="text-[36px] md:text-[48px] font-semibold tracking-tight leading-none text-accent-yellow tabular-nums">¥{my}</span>
              <span className="text-background/70 text-[14px]">/{p.unit}</span>
            </div>
            <div className="relative mt-2 flex items-center gap-2 md:gap-3 text-[11px] md:text-[12px] flex-wrap">
              <span className="line-through text-background/50 tabular-nums">市场价 ¥{p.marketPrice}</span>
              <span className="rounded-full bg-cat-decor px-2 py-0.5 font-medium tabular-nums">省 ¥{saved}</span>
            </div>
            <p className="relative mt-3 md:mt-4 text-[11px] md:text-[12px] text-background/70 leading-5">
              {p.desc}
            </p>
          </div>

          {/* 分层价格 */}
          <div className="mt-3 md:mt-4 rounded-2xl border border-border bg-background p-3 md:p-4">
            <div className="text-[10px] md:text-[12px] text-muted-foreground tracking-wider uppercase mb-2 md:mb-3">阶梯价 · 升会籍立省</div>
            <div className="grid grid-cols-4 gap-1.5 md:gap-2">
              {TIERS.map((t) => {
                const isCurr = t === CURRENT_TIER;
                const price = p.prices[t];
                return (
                  <div key={t} className={cn(
                    "rounded-xl p-2 md:p-3 text-center border transition-all",
                    isCurr ? "border-accent-yellow bg-[#fff6d6] ring-2 ring-accent-yellow/20" : "border-border bg-surface",
                  )}>
                    <div className="text-[9px] md:text-[10px] text-muted-foreground tracking-wider uppercase truncate">{t === "市场" ? "市场" : t}</div>
                    <div className={cn("mt-0.5 md:mt-1 text-[14px] md:text-[16px] font-semibold tracking-tight tabular-nums", isCurr && "text-cat-decor")}>¥{price}</div>
                    {isCurr && <Badge tone="yellow" className="mt-1 !text-[8px]">您的</Badge>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 加车 — 桌面端 */}
          <div className="hidden md:block mt-6 rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[12px] text-muted-foreground">数量</div>
              <div className="inline-flex items-center gap-1 rounded-full border border-border">
                <button type="button" className="h-8 w-8 inline-flex items-center justify-center hover:bg-surface rounded-l-full"><Minus className="h-3 w-3" /></button>
                <input defaultValue="1" className="h-8 w-12 text-center bg-transparent outline-none text-[14px]" />
                <button type="button" className="h-8 w-8 inline-flex items-center justify-center hover:bg-surface rounded-r-full"><Plus className="h-3 w-3" /></button>
                <span className="text-[11px] text-muted-foreground px-3">{p.unit}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/supplies/cart" className="flex-1 h-12 rounded-full bg-foreground text-background text-[14px] font-medium inline-flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                <ShoppingCart className="h-4 w-4" /> 加入采购车
              </Link>
              <Link href="/supplies/cart" className="h-12 px-6 rounded-full bg-cat-decor text-white text-[14px] font-medium inline-flex items-center justify-center active:scale-95 transition-transform">
                立即采购
              </Link>
            </div>
          </div>

          {/* 服务保障 */}
          <div className="mt-3 md:mt-4 grid grid-cols-3 gap-2">
            <Svc icon={Truck} t="本地 T+1" />
            <Svc icon={ShieldCheck} t="协会兜底" />
            <Svc icon={BadgeCheck} t="质量退换" />
          </div>
        </div>
      </div>

      {/* badges */}
      <div className="mt-10 flex flex-wrap gap-2">
        {p.badges.map((b) => (
          <span key={b} className="inline-flex items-center gap-1 rounded-full bg-surface px-3.5 py-1.5 text-[12px]">
            <BadgeCheck className="h-3.5 w-3.5 text-accent-tea" /> {b}
          </span>
        ))}
      </div>

      {/* 详情 */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-border bg-background p-7">
          <h2 className="text-[20px] font-semibold tracking-tight mb-4">商品详情</h2>
          <div className="space-y-3 text-[13px] leading-7">
            <Row k="品牌" v={p.brand} />
            <Row k="供应商" v={`${p.supplierName} · 协会认证`} />
            <Row k="规格" v={p.spec} />
            <Row k="单位" v={p.unit} />
            <Row k="库存" v={`${p.stock.toLocaleString()} ${p.unit}`} />
            <Row k="月销" v={`${p.sales30d.toLocaleString()} ${p.unit}`} />
            <Row k="评分" v={`${p.rating.toFixed(1)} / 5.0`} />
          </div>

          <h3 className="mt-8 mb-3 text-[16px] font-semibold">质保 · 退换</h3>
          <ul className="space-y-1.5 text-[13px] text-muted-foreground">
            <li>· 协会平台采购，质量问题 7 天无理由退换；</li>
            <li>· 供应商跑路或拒不履约，协会先行赔付；</li>
            <li>· 大宗采购可申请到货付款 / 协会监管账户托管。</li>
          </ul>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl bg-foreground text-background p-6">
            <Sparkles className="h-6 w-6 text-accent-yellow" />
            <div className="mt-3 text-[15px] font-semibold">AI 小经 · 帮您比价</div>
            <p className="mt-1.5 text-[11px] text-background/70 leading-5">
              已扫描全市 8 家供应商：本品已是会员最优价；同类替代品有 2 款，可看下要不要换。
            </p>
            <Link href="/ai/biz" className="mt-4 inline-flex items-center gap-1 h-9 px-4 rounded-full bg-accent-yellow text-foreground text-[12px] font-medium">
              对比方案
            </Link>
          </div>

          <div className="rounded-3xl border border-border bg-background p-5">
            <div className="text-[12px] text-muted-foreground tracking-wider uppercase mb-3">同类推荐</div>
            <ul className="space-y-3">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={`/supplies/${r.id}`} className="flex gap-3 group">
                    <span className={cn("h-12 w-12 rounded-xl shrink-0", THUMB[r.thumbColor])} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium line-clamp-2 group-hover:text-brand">{r.name}</div>
                      <div className="text-[11px] text-cat-decor font-semibold mt-0.5">¥{r.prices[CURRENT_TIER]}/{r.unit}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* 移动端 sticky 底部加车 */}
      <div className="md:hidden fixed bottom-14 inset-x-0 z-30 px-3 pointer-events-none">
        <div className="pointer-events-auto mx-auto max-w-md rounded-full bg-foreground text-background shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] flex items-center gap-2 p-1.5 pl-4">
          <div className="flex-1 min-w-0">
            <div className="text-[9px] text-background/60 tracking-wider uppercase">{CURRENT_TIER} 专享价</div>
            <div className="text-[16px] font-semibold text-accent-yellow tabular-nums leading-tight">
              ¥{my}<span className="text-[10px] font-normal text-background/60 ml-0.5">/{p.unit}</span>
            </div>
          </div>
          <Link href="/supplies/cart" className="h-11 w-11 inline-flex items-center justify-center rounded-full bg-white/10 text-background shrink-0" aria-label="加入采购车">
            <ShoppingCart className="h-4 w-4" />
          </Link>
          <Link href="/supplies/cart" className="h-11 px-5 rounded-full bg-cat-decor text-white text-[13px] font-medium inline-flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform">
            立即采购
          </Link>
        </div>
      </div>
    </Container>
  );
}

function Svc({ icon: Ic, t }: { icon: React.ComponentType<{ className?: string }>; t: string }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-2 text-center">
      <Ic className="h-3.5 w-3.5 mx-auto text-cat-build" />
      <div className="text-[10px] mt-1 text-muted-foreground">{t}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="col-span-2 font-medium">{v}</span>
    </div>
  );
}
