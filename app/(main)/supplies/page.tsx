import Link from "next/link";
import {
  Search, ShieldCheck, Truck, BadgeCheck, ShoppingCart, Sparkles,
  ArrowUpRight, Tags, Crown, ArrowRight, Filter,
} from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PRODUCTS, SUPPLY_CATEGORIES, SUPPLIES_STATS, SUPPLIERS,
  CURRENT_TIER, tierBadgeColor, tierLabel,
} from "@/lib/data/supplies";
import { cn } from "@/lib/cn";

export const metadata = { title: "建材超市 · 信阳市建筑装饰装修协会" };

const THUMB: Record<string, string> = {
  build: "bg-cat-build", decor: "bg-cat-decor", design: "bg-cat-design",
  tea: "bg-accent-tea", yellow: "bg-accent-yellow", brand: "bg-brand",
};

const L1 = SUPPLY_CATEGORIES.filter((c) => !c.parent);

export default function SuppliesHome() {
  return (
    <>
      <PageHeader
        eyebrow="SUPPLIES · 协会建材超市"
        tone="tea"
        title={<>肥水不流外人田<br className="md:hidden" /> <span className="text-muted-foreground">协会会员专属采购</span></>}
        description={
          <>
            12 家协会认证供应商 · {SUPPLIES_STATS.products.toLocaleString()} 款建材 / 设备 · 会员均价 <b>低于市场 {SUPPLIES_STATS.avgSavingPct}%</b> · 集采议价 · 信用账期。
          </>
        }
        actions={
          <>
            <Button href="/supplies/cart" variant="secondary">
              <ShoppingCart className="h-4 w-4" /> 我的采购车
            </Button>
            <Button href="/ai/biz" variant="outline">
              <Sparkles className="h-4 w-4" /> AI 比价
            </Button>
          </>
        }
      />

      <Container className="py-6 md:py-12">
        {/* 你的会籍 */}
        <div className="mb-5 md:mb-8 rounded-3xl bg-foreground text-background p-5 md:p-7 flex items-center gap-3 md:gap-4">
          <Crown className="h-6 md:h-7 w-6 md:w-7 text-accent-yellow shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] md:text-[12px] text-background/60 tracking-wider uppercase">您的会籍</div>
            <div className="mt-0.5 md:mt-1 text-[16px] md:text-[24px] font-semibold leading-tight">
              {CURRENT_TIER}
              <span className="ml-2 md:ml-3 text-[11px] md:text-[12px] text-accent-yellow font-normal">专享 -21%</span>
            </div>
          </div>
          <Link href="/services" className="hidden sm:inline-flex text-[11px] md:text-[12px] text-accent-yellow items-center gap-1">
            升级理事 -28% <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* 搜索 — sticky on mobile */}
        <div className="sticky top-16 lg:top-20 z-30 -mx-5 sm:-mx-8 lg:-mx-12 px-5 sm:px-8 lg:px-12 py-2 bg-background/85 backdrop-blur-xl border-b border-border lg:border-0 lg:bg-transparent lg:backdrop-blur-none lg:relative lg:top-0 lg:p-0 mb-4">
          <div className="rounded-3xl border border-border bg-background p-3 md:p-4 flex items-center gap-2 md:gap-3">
            <Search className="h-4 w-4 text-muted-foreground ml-1.5 md:ml-2 shrink-0" />
            <input placeholder={`搜 ${SUPPLIES_STATS.products.toLocaleString()} 款建材…`} className="flex-1 bg-transparent outline-none text-[14px] md:text-[15px] py-2" />
            <Link href="/supplies/cart" className="relative inline-flex items-center gap-1 h-9 px-3 rounded-full bg-surface text-[12px]">
              <ShoppingCart className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">4 件</span>
              <span className="sm:hidden absolute -top-1 -right-1 h-4 w-4 rounded-full bg-cat-decor text-white text-[9px] font-semibold inline-flex items-center justify-center">4</span>
            </Link>
          </div>
        </div>

        {/* 一级分类 · 移动 2 列紧凑 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3 mb-6 md:mb-8">
          {L1.map((c, i) => {
            const palette = ["build", "decor", "design", "tea"][i % 4];
            return (
              <Link key={c.key} href={`/supplies?cat=${c.key}`} className={cn(
                "group rounded-2xl md:rounded-3xl overflow-hidden text-white p-4 md:p-5 active:scale-[0.99] hover:-translate-y-1 transition-all relative",
                THUMB[palette],
              )}>
                <div className="absolute -right-6 -top-6 h-24 md:h-32 w-24 md:w-32 rounded-full bg-white/15" />
                <Tags className="relative h-5 md:h-6 w-5 md:w-6 text-white/80" />
                <div className="relative mt-2 md:mt-3 text-[16px] md:text-[20px] font-semibold tracking-tight">{c.label}</div>
                <div className="relative mt-0.5 md:mt-1 text-[10px] md:text-[12px] text-white/80">{c.count} 款</div>
                <ArrowRight className="relative mt-2 md:mt-3 h-3.5 md:h-4 w-3.5 md:w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            );
          })}
        </div>

        {/* 信任栏 · 移动 1 行横滑 */}
        <div className="mb-8 md:mb-10 -mx-5 px-5 md:mx-0 md:px-0 overflow-x-auto snap-x snap-mandatory md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex md:grid md:grid-cols-3 gap-3 pb-1">
            <Pillar icon={ShieldCheck} title="协会认证供应商" desc="12 家进入白名单 · 资质 / 检验报告全套留档" tone="tea" />
            <Pillar icon={Truck} title="本地仓 T+1 送达" desc="市区 24h · 县域 48h · 工地直送" tone="brand" />
            <Pillar icon={BadgeCheck} title="质保 + 协会兜底" desc="质量问题 7 天无理由退 · 协会担保赔付" tone="decor" />
          </div>
        </div>

        {/* 热销 · 移动横滑 */}
        <div className="flex items-end justify-between mb-3 md:mb-4">
          <div>
            <div className="text-[11px] md:text-[12px] tracking-[0.2em] text-cat-decor uppercase font-medium">HOT · 本周热销</div>
            <h2 className="mt-1.5 md:mt-2 text-[22px] md:text-[32px] font-semibold tracking-tight">{CURRENT_TIER} 专享价</h2>
          </div>
          <Link href="/supplies?sort=hot" className="text-[12px] md:text-[13px] text-brand">全部 →</Link>
        </div>
        <div className="md:hidden -mx-5 px-5 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-3 pb-2">
            {PRODUCTS.filter((p) => p.hot).slice(0, 8).map((p) => (
              <div key={p.id} className="snap-start shrink-0 w-[44vw] max-w-[200px]">
                <ProductCard p={p} />
              </div>
            ))}
          </div>
        </div>
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-3">
          {PRODUCTS.filter((p) => p.hot).slice(0, 8).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>

        {/* 全部 */}
        <div className="flex items-end justify-between mt-12 mb-4">
          <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight">全部商品</h2>
          <Link href="#" className="text-[13px] text-brand">高级筛选</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>

        {/* 供应商 */}
        <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight mt-14 mb-4">协会认证供应商</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SUPPLIERS.slice(0, 8).map((s) => (
            <div key={s.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <ShieldCheck className="h-3.5 w-3.5 text-accent-tea" />
                <span className="text-[11px] text-accent-tea font-medium">协会认证</span>
              </div>
              <div className="text-[14px] font-semibold">{s.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{s.category} · {s.district}</div>
              <div className="mt-3 flex items-center gap-1 text-[11px]">
                <span className="text-[#FFB400]">★</span>
                <span className="font-medium">{s.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">· {s.fulfilmentSLA} 履约</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-[28px] bg-mesh border border-border p-7 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="text-[12px] tracking-[0.2em] text-cat-decor uppercase font-medium">集采议价</div>
            <h2 className="mt-3 text-[28px] md:text-[36px] font-semibold tracking-tight leading-tight">单笔 ≥ 50 万<br />让协会替您议价</h2>
            <p className="mt-3 text-[13px] text-muted-foreground max-w-md leading-7">
              协会对接供应商总部，单笔 50 万以上可申请项目集采，在理事单位价基础上再降 5-10%。
            </p>
            <Button href="/dashboard/enterprise/supplies" size="lg" variant="primary" className="mt-6">
              发起集采申请 <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="rounded-2xl bg-foreground text-background p-6 grid grid-cols-2 gap-3">
            {[
              { l: "本月撮合 GMV", v: `¥${SUPPLIES_STATS.monthlyGmv}万`, c: "text-accent-yellow" },
              { l: "采购企业", v: `${SUPPLIES_STATS.enterprisesPurchased}+`, c: "text-cat-decor" },
              { l: "认证供应商", v: SUPPLIES_STATS.suppliers, c: "text-cat-design" },
              { l: "平均省下", v: `${SUPPLIES_STATS.avgSavingPct}%`, c: "text-accent-tea" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-white/5 p-3">
                <div className="text-[10px] text-background/60">{s.l}</div>
                <div className={`text-[22px] font-semibold tracking-tight mt-0.5 ${s.c}`}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}

function ProductCard({ p }: { p: typeof PRODUCTS[number] }) {
  const myPrice = p.prices[CURRENT_TIER];
  const saved = p.marketPrice - myPrice;
  const savedPct = Math.round((saved / p.marketPrice) * 100);
  return (
    <Link
      href={`/supplies/${p.id}`}
      className="group rounded-2xl border border-border bg-background overflow-hidden active:scale-[0.98] hover:shadow-md md:hover:-translate-y-0.5 transition-all block"
    >
      <div className={cn("relative aspect-square", THUMB[p.thumbColor])}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-foreground/30" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {p.hot && <Badge tone="decor" className="!text-[9px]">🔥 热销</Badge>}
          <span className="inline-flex items-center gap-0.5 rounded-full bg-accent-yellow text-foreground px-1.5 py-0.5 text-[9px] font-semibold">
            省 {savedPct}%
          </span>
        </div>
        <div className="absolute bottom-2 left-2 right-2 text-white">
          <div className="text-[10px] opacity-80">{p.brand}</div>
        </div>
      </div>
      <div className="p-2.5 md:p-3">
        <div className="text-[12px] md:text-[13px] font-medium line-clamp-2 leading-4 md:leading-5 min-h-[32px] md:min-h-[40px]">
          {p.name}
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{p.spec}</div>
        <div className="mt-2 flex items-baseline gap-1 flex-wrap">
          <Badge tone={tierBadgeColor(CURRENT_TIER)} className="!text-[9px] !py-0 !px-1.5">
            {tierLabel(CURRENT_TIER)}
          </Badge>
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-[16px] md:text-[18px] font-semibold tracking-tight text-cat-decor tabular-nums">¥{myPrice}</span>
          <span className="text-[10px] text-muted-foreground">/{p.unit}</span>
        </div>
        <div className="text-[10px] text-muted-foreground line-through tabular-nums">市场价 ¥{p.marketPrice}</div>
        <div className="mt-1 text-[10px] text-muted-foreground">
          已售 {p.sales30d.toLocaleString()}
        </div>
      </div>
    </Link>
  );
}

function Pillar({ icon: Ic, title, desc, tone }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; desc: string;
  tone: "tea" | "brand" | "decor";
}) {
  const TONE: Record<string, string> = {
    tea: "bg-[#e6f7f1] text-accent-tea",
    brand: "bg-brand-50 text-brand",
    decor: "bg-cat-decor-soft text-cat-decor",
  };
  return (
    <div className="rounded-2xl border border-border bg-background p-5 flex gap-3">
      <span className={cn("h-10 w-10 rounded-xl inline-flex items-center justify-center shrink-0", TONE[tone])}>
        <Ic className="h-4 w-4" />
      </span>
      <div>
        <div className="text-[14px] font-semibold">{title}</div>
        <div className="text-[12px] text-muted-foreground mt-1 leading-5">{desc}</div>
      </div>
    </div>
  );
}
