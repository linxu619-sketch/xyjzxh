import Link from "next/link";
import { requireLogin } from "@/lib/auth/guard";
import {
  Search, ShieldCheck, Truck, Store, ShoppingCart,
  ArrowRight, Package, TrendingDown, Award,
} from "lucide-react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listProducts, cartCount, type SupplyProduct, type ReasonType } from "@/lib/data/supplies-source";
import { resolveSeller } from "@/lib/dashboard/seller";
import { cn } from "@/lib/cn";

export const metadata = { title: "建材超市 · 信阳市建筑装饰装修协会" };

const REASON: Record<ReasonType, { label: string; tone: "tea" | "build" | "brand" }> = {
  agent: { label: "独家代理", tone: "brand" },
  self: { label: "自产自销", tone: "tea" },
  direct: { label: "厂家直供", tone: "build" },
};
const SELLER_LABEL: Record<string, string> = { association: "协会自营", enterprise: "企业会员", practitioner: "个人会员" };
const PALETTE = ["build", "decor", "design", "tea", "yellow", "brand"];
const THUMB: Record<string, string> = {
  build: "bg-cat-build", decor: "bg-cat-decor", design: "bg-cat-design",
  tea: "bg-accent-tea", yellow: "bg-accent-yellow", brand: "bg-brand",
};
function colorFor(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export default async function SuppliesHome({ searchParams }: { searchParams: Promise<{ cat?: string; q?: string }> }) {
  await requireLogin();
  const { cat, q } = await searchParams;
  const all = listProducts(); // 仅在架(active)
  const cats = Array.from(new Set(all.map((p) => p.category).filter(Boolean)));
  const sellers = Array.from(new Set(all.map((p) => `${p.sellerType}|${p.sellerId}|${p.sellerName}`)));
  const brands = new Set(all.map((p) => p.brand).filter(Boolean));

  const buyer = await resolveSeller();
  const cCount = buyer ? cartCount(buyer.type, buyer.id) : 0;

  let products = all;
  if (cat) products = products.filter((p) => p.category === cat);
  if (q?.trim()) {
    const k = q.trim().toLowerCase();
    products = products.filter((p) => p.name.toLowerCase().includes(k) || p.brand.toLowerCase().includes(k) || p.sellerName.includes(q.trim()));
  }

  return (
    <>
      <Container className="py-5 md:py-10">
        {/* 一行标语 + 卖货入口（搜索栏上方只留一行） */}
        <div className="mb-3 md:mb-4 flex items-center justify-between gap-3">
          <h1 className="text-[16px] md:text-[22px] font-semibold tracking-tight min-w-0 truncate">
            建材超市<span className="text-muted-foreground font-normal text-[12px] md:text-[14px] ml-1.5">会员互助 集采平价</span>
          </h1>
          <div className="shrink-0 flex items-center gap-2">
            <Link href="/supplies/cart" className="relative inline-flex items-center gap-1 h-9 px-3 rounded-full border border-border text-[12px] md:text-[13px] hover:bg-surface active:scale-95 transition-transform">
              <ShoppingCart className="h-3.5 w-3.5" /> 采购车
              {cCount > 0 && <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-cat-decor text-white text-[9px] font-semibold inline-flex items-center justify-center">{cCount}</span>}
            </Link>
            <Link href="/dashboard/enterprise/store" className="inline-flex items-center gap-1 h-9 px-3.5 rounded-full bg-foreground text-background text-[12px] md:text-[13px] font-medium active:scale-95 transition-transform">
              <Store className="h-3.5 w-3.5" /> 我要卖货
            </Link>
          </div>
        </div>

        {/* 搜索 */}
        <form className="mb-5" action="/supplies">
          <div className="rounded-3xl border border-border bg-background p-3 md:p-4 flex items-center gap-2 md:gap-3">
            <Search className="h-4 w-4 text-muted-foreground ml-1.5 md:ml-2 shrink-0" />
            <input name="q" defaultValue={q ?? ""} placeholder="搜商品名 / 品牌 / 卖家…" className="flex-1 bg-transparent outline-none text-[14px] md:text-[15px] py-2" />
            <button className="h-9 px-4 rounded-full bg-foreground text-background text-[12px] font-medium">搜索</button>
          </div>
        </form>

        {/* 分类 chips */}
        {cats.length > 0 && (
          <div className="mb-6 md:mb-8 -mx-1 px-1 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link href="/supplies" className={cn("shrink-0 h-9 px-4 rounded-full text-[13px] font-medium border inline-flex items-center", !cat ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground border-border")}>全部 {all.length}</Link>
            {cats.map((c) => {
              const n = all.filter((p) => p.category === c).length;
              const active = cat === c;
              return (
                <Link key={c} href={`/supplies?cat=${encodeURIComponent(c)}`} className={cn("shrink-0 h-9 px-4 rounded-full text-[13px] font-medium border inline-flex items-center gap-1.5", active ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground border-border")}>
                  {c}<span className="text-[10px] opacity-70 tabular-nums">{n}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* 商品 */}
        <div className="flex items-end justify-between mb-3 md:mb-4">
          <div>
            <div className="text-[11px] md:text-[12px] tracking-[0.2em] text-cat-decor uppercase font-medium">PRODUCTS · 在售商品</div>
            <h2 className="mt-1.5 md:mt-2 text-[22px] md:text-[32px] font-semibold tracking-tight">{cat ? cat : "全部商品"}<span className="text-[14px] font-normal text-muted-foreground ml-2">{products.length} 款</span></h2>
          </div>
        </div>
        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center text-[13px] text-muted-foreground">
            <Package className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
            {all.length === 0 ? "商城暂无在架商品。会员在「我的店铺」上架并经协会审核后会显示在这里。" : "没有匹配的商品，换个分类或搜索词试试。"}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}

        {/* 信任栏（移到商品下方，保持搜索区清爽）*/}
        <div className="mt-8 md:mt-10 -mx-5 px-5 md:mx-0 md:px-0 overflow-x-auto md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex md:grid md:grid-cols-3 gap-3 pb-1">
            <Pillar icon={Award} title="同品牌唯一最低价" desc="一个品牌只由一家会员销售 · 价格擂台逼出最低价" tone="tea" />
            <Pillar icon={ShieldCheck} title="资格审核 + 协会兜底" desc="独家代理 / 自产自销 / 厂家直供，凭证上架经协会审核" tone="brand" />
            <Pillar icon={Truck} title="本地批发 · 起批量" desc="会员互助 · 批发为主 · 本地直送" tone="decor" />
          </div>
        </div>

        {/* 在售会员 */}
        {sellers.length > 0 && (
          <>
            <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight mt-12 md:mt-14 mb-4">在售会员 · {sellers.length} 家</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sellers.slice(0, 8).map((s) => {
                const [type, , name] = s.split("|");
                const cnt = all.filter((p) => `${p.sellerType}|${p.sellerId}|${p.sellerName}` === s).length;
                return (
                  <div key={s} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-accent-tea" />
                      <span className="text-[11px] text-accent-tea font-medium">{SELLER_LABEL[type] ?? "会员"}</span>
                    </div>
                    <div className="text-[14px] font-semibold truncate">{name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">在售 {cnt} 款</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* 集采议价 CTA */}
        <div className="mt-12 md:mt-14 rounded-[28px] bg-mesh border border-border p-7 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="text-[12px] tracking-[0.2em] text-cat-decor uppercase font-medium">集采议价</div>
            <h2 className="mt-3 text-[28px] md:text-[36px] font-semibold tracking-tight leading-tight">有好货好价？<br />上架到协会商城</h2>
            <p className="mt-3 text-[13px] text-muted-foreground max-w-md leading-7">
              你是某品牌信阳代理、或自产自销，且价格够低？提交资格给协会审核，通过即可面向全协会会员批发销售。
            </p>
            <Button href="/dashboard/enterprise/store" size="lg" variant="primary" className="mt-6">
              我要卖货 <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="rounded-2xl bg-foreground text-background p-6 grid grid-cols-2 gap-3">
            {[
              { l: "在售商品", v: all.length, c: "text-accent-yellow" },
              { l: "在售会员", v: sellers.length, c: "text-cat-decor" },
              { l: "覆盖品牌", v: brands.size, c: "text-cat-design" },
              { l: "品类", v: cats.length, c: "text-accent-tea" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-white/5 p-3">
                <div className="text-[10px] text-background/60">{s.l}</div>
                <div className={`text-[22px] font-semibold tracking-tight mt-0.5 tabular-nums ${s.c}`}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}

function ProductCard({ p }: { p: SupplyProduct }) {
  const off = p.marketPrice > 0 ? Math.round((1 - p.memberPrice / p.marketPrice) * 100) : 0;
  const color = colorFor(p.brand || p.category || p.name);
  const reason = REASON[p.reasonType] ?? REASON.direct;
  return (
    <Link href={`/supplies/${p.id}`} className="group rounded-2xl border border-border bg-background overflow-hidden active:scale-[0.98] hover:shadow-md md:hover:-translate-y-0.5 transition-all block">
      <div className={cn("relative aspect-square", THUMB[color])}>
        {p.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imageUrl} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-foreground/30" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge tone={reason.tone} className="!text-[9px]">{reason.label}</Badge>
          {off > 0 && <span className="inline-flex items-center gap-0.5 rounded-full bg-accent-yellow text-foreground px-1.5 py-0.5 text-[9px] font-semibold">省 {off}%</span>}
        </div>
        <div className="absolute bottom-2 left-2 right-2 text-white">
          <div className="text-[10px] opacity-80 truncate">{p.brand}</div>
        </div>
      </div>
      <div className="p-2.5 md:p-3">
        <div className="text-[12px] md:text-[13px] font-medium line-clamp-2 leading-4 md:leading-5 min-h-[32px] md:min-h-[40px]">{p.name}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5 truncate inline-flex items-center gap-1"><ShieldCheck className="h-2.5 w-2.5 text-accent-tea" />{p.sellerName}</div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-[16px] md:text-[18px] font-semibold tracking-tight text-cat-decor tabular-nums">¥{p.memberPrice}</span>
          <span className="text-[10px] text-muted-foreground">/{p.unit}</span>
        </div>
        {p.marketPrice > 0 && <div className="text-[10px] text-muted-foreground line-through tabular-nums">市场价 ¥{p.marketPrice}</div>}
        <div className="mt-1 text-[10px] text-muted-foreground">起批 {p.moq}{p.unit}{off > 0 && <span className="text-accent-tea ml-1.5 inline-flex items-center gap-0.5"><TrendingDown className="h-2.5 w-2.5" />省{off}%</span>}</div>
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
    <div className="rounded-2xl border border-border bg-background p-5 flex gap-3 shrink-0 w-[80vw] max-w-[340px] md:w-auto md:max-w-none">
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
