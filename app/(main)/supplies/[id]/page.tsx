import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, ShieldCheck, Truck, BadgeCheck, ShoppingCart,
  Sparkles, Award,
} from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { listProducts, getProduct, type ReasonType } from "@/lib/data/supplies-source";
import { resolveSeller } from "@/lib/dashboard/seller";
import { placeOrderAction } from "@/app/(dashboard)/dashboard/store-actions";
import { addToCartAction } from "../cart/actions";
import { cn } from "@/lib/cn";

const REASON: Record<ReasonType, string> = { agent: "独家代理", self: "自产自销", direct: "厂家直供" };
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

export default async function ProductDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ err?: string }> }) {
  const { id } = await params;
  const { err } = await searchParams;
  const p = getProduct(Number(id));
  if (!p || p.status !== "active") notFound();

  const me = await resolveSeller();
  const isOwn = !!me && me.type === p.sellerType && me.id === p.sellerId;
  const saved = p.marketPrice - p.memberPrice;
  const off = p.marketPrice > 0 ? Math.round((saved / p.marketPrice) * 100) : 0;
  const color = colorFor(p.brand || p.category || p.name);
  const related = listProducts().filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4);

  return (
    <Container className="py-4 md:py-12 max-w-6xl pb-28 md:pb-12">
      <Link href="/supplies" className="inline-flex items-center gap-1.5 text-[12px] md:text-[13px] text-muted-foreground hover:text-foreground mb-3 md:mb-5">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回建材超市
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8">
        {/* 图片占位 */}
        <div className="space-y-2 md:space-y-3 -mx-5 md:mx-0">
          <div className={cn("aspect-square md:rounded-3xl rounded-2xl overflow-hidden relative", THUMB[color])}>
            {p.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-foreground/30" />
            <div className="absolute top-3 md:top-4 left-3 md:left-4 flex flex-wrap gap-2">
              <Badge tone="brand">{REASON[p.reasonType]}</Badge>
              <Badge tone="tea"><ShieldCheck className="h-3 w-3 mr-1 inline" /> 协会审核</Badge>
            </div>
            <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 text-white">
              <div className="text-[10px] opacity-80 uppercase tracking-widest">{p.brand}</div>
              {p.spec && <div className="text-[14px] md:text-[16px] font-semibold mt-1">{p.spec}</div>}
            </div>
          </div>
          {p.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 px-5 md:px-0">
              {p.images.slice(0, 4).map((u, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={u} alt={`${p.name} ${i + 1}`} className="aspect-square rounded-xl object-cover border border-border" />
              ))}
            </div>
          )}
        </div>

        {/* 信息 */}
        <div>
          <div className="flex items-center gap-2 mb-2 md:mb-3 flex-wrap">
            <Badge tone="brand">{p.category}</Badge>
            <span className="inline-flex items-center gap-1 text-[11px] text-accent-tea"><ShieldCheck className="h-3 w-3" />{SELLER_LABEL[p.sellerType]} · {p.sellerName}</span>
          </div>
          <h1 className="text-[20px] md:text-[36px] font-semibold tracking-tight leading-tight">{p.name}</h1>
          <div className="mt-2 text-[12px] text-muted-foreground">品牌 {p.brand} · 起批量 {p.moq}{p.unit}</div>

          {/* 价格 */}
          <div className="mt-4 md:mt-6 rounded-3xl bg-foreground text-background p-5 md:p-6 relative overflow-hidden shadow-lg">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cat-decor/30 blur-2xl" />
            <div className="relative flex items-center gap-2 text-[10px] md:text-[11px] text-background/70 tracking-wider uppercase">
              <Award className="h-3 md:h-3.5 w-3 md:w-3.5 text-accent-yellow" /> 会员批发价
            </div>
            <div className="relative mt-2 flex items-baseline gap-2 md:gap-3">
              <span className="text-[36px] md:text-[48px] font-semibold tracking-tight leading-none text-accent-yellow tabular-nums">¥{p.memberPrice}</span>
              <span className="text-background/70 text-[14px]">/{p.unit}</span>
            </div>
            {p.marketPrice > 0 && (
              <div className="relative mt-2 flex items-center gap-2 md:gap-3 text-[11px] md:text-[12px] flex-wrap">
                <span className="line-through text-background/50 tabular-nums">市场价 ¥{p.marketPrice}</span>
                {saved > 0 && <span className="rounded-full bg-cat-decor px-2 py-0.5 font-medium tabular-nums">省 ¥{saved}{off > 0 ? ` · ${off}%` : ""}</span>}
              </div>
            )}
            {p.reasonNote && <p className="relative mt-3 md:mt-4 text-[11px] md:text-[12px] text-background/70 leading-5">{p.reasonNote}</p>}
          </div>

          {/* 阶梯量价 */}
          {p.priceTiers.length > 0 && (
            <div className="mt-3 md:mt-4 rounded-2xl border border-border bg-background p-3 md:p-4">
              <div className="text-[10px] md:text-[12px] text-muted-foreground tracking-wider uppercase mb-2 md:mb-3">阶梯量价 · 买得越多越便宜</div>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${p.priceTiers.length + 1}, minmax(0,1fr))` }}>
                <div className="rounded-xl p-2 md:p-3 text-center border border-border bg-surface">
                  <div className="text-[9px] md:text-[10px] text-muted-foreground">{p.moq}{p.unit} 起</div>
                  <div className="mt-0.5 md:mt-1 text-[14px] md:text-[16px] font-semibold tracking-tight tabular-nums">¥{p.memberPrice}</div>
                </div>
                {p.priceTiers.map((t) => (
                  <div key={t.minQty} className="rounded-xl p-2 md:p-3 text-center border border-accent-tea/40 bg-[#e6f7f1]">
                    <div className="text-[9px] md:text-[10px] text-muted-foreground">满 {t.minQty}{p.unit}</div>
                    <div className="mt-0.5 md:mt-1 text-[14px] md:text-[16px] font-semibold tracking-tight tabular-nums text-accent-tea">¥{t.price}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-[10px] md:text-[11px] text-muted-foreground">下单时按实际数量自动取对应单价。</div>
            </div>
          )}

          {/* 采购 CTA */}
          {err === "self" && <div className="mt-4 rounded-xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-3 text-[12px]">不能购买自己上架的商品。</div>}
          {err === "off" && <div className="mt-4 rounded-xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-3 text-[12px]">该商品已下架，无法下单。</div>}
          <div className="hidden md:block mt-6 rounded-2xl border border-border bg-background p-4">
            <div className="text-[12px] text-muted-foreground mb-3">批发采购 · 起批量 {p.moq}{p.unit} 起 · 仅协会会员可下单</div>
            {isOwn ? (
              <div className="h-12 rounded-full bg-surface text-muted-foreground text-[13px] inline-flex items-center justify-center w-full">这是你上架的商品</div>
            ) : (
              <form className="flex items-center gap-2">
                <input type="hidden" name="productId" value={p.id} />
                <input name="qty" type="number" min={p.moq} defaultValue={p.moq} className="w-20 h-12 rounded-xl border border-border bg-background px-3 text-[14px] outline-none focus:border-foreground/30" />
                <span className="text-[12px] text-muted-foreground">{p.unit}</span>
                <button formAction={addToCartAction} className="ml-auto h-12 px-4 rounded-full border border-border text-[14px] inline-flex items-center justify-center gap-1.5 hover:bg-surface active:scale-95 transition-transform">
                  <ShoppingCart className="h-4 w-4" /> 加入采购车
                </button>
                <button formAction={placeOrderAction} className="h-12 px-5 rounded-full bg-cat-decor text-white text-[14px] font-medium inline-flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                  {me ? "立即下单" : "登录下单"}
                </button>
              </form>
            )}
          </div>

          {/* 服务保障 */}
          <div className="mt-3 md:mt-4 grid grid-cols-3 gap-2">
            <Svc icon={Truck} t="本地直送" />
            <Svc icon={ShieldCheck} t="协会兜底" />
            <Svc icon={BadgeCheck} t="资格核验" />
          </div>
        </div>
      </div>

      {/* 详情 */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-border bg-background p-7">
          <h2 className="text-[20px] font-semibold tracking-tight mb-4">商品详情</h2>
          <div className="space-y-3 text-[13px] leading-7">
            <Row k="品牌" v={p.brand} />
            <Row k="卖家" v={`${SELLER_LABEL[p.sellerType]} · ${p.sellerName}`} />
            <Row k="上架资格" v={REASON[p.reasonType]} />
            {p.spec && <Row k="规格" v={p.spec} />}
            <Row k="单位 / 起批量" v={`${p.unit} · ${p.moq}${p.unit} 起`} />
            <Row k="类别" v={p.category} />
            {p.proofUrl && <Row k="资格证明" v={<a href={p.proofUrl} target="_blank" rel="noreferrer" className="text-brand">查看 →</a>} />}
          </div>

          <h3 className="mt-8 mb-3 text-[16px] font-semibold">集采规则 · 质保</h3>
          <ul className="space-y-1.5 text-[13px] text-muted-foreground">
            <li>· 同品牌平台唯一在售，以最低价为准（价格擂台机制）；</li>
            <li>· 卖家资格经协会核验（独家代理 / 自产自销 / 厂家直供）；</li>
            <li>· 质量问题协会先行介入，支持协会监管账户托管。</li>
          </ul>

          {/* 价格擂台入口：登录会员且非本商品卖家可见 */}
          {me && !isOwn && (
            <Link href={me.base} className="mt-6 flex items-center gap-3 rounded-2xl border border-accent-yellow/40 bg-[#fff6d6] p-4 group">
              <span className="h-9 w-9 rounded-xl bg-accent-yellow/30 text-[#a37200] inline-flex items-center justify-center shrink-0">
                <Award className="h-4.5 w-4.5" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#a37200]">你也代理「{p.brand}」、且能更低价？</div>
                <div className="text-[11px] text-[#a37200]/80 mt-0.5">到「我的店铺」用低于 ¥{p.memberPrice}/{p.unit} 的价上架，发起价格擂台，协会裁定胜出即替换在架。</div>
              </div>
              <ArrowLeft className="h-4 w-4 text-[#a37200] rotate-180 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl bg-foreground text-background p-6">
            <Sparkles className="h-6 w-6 text-accent-yellow" />
            <div className="mt-3 text-[15px] font-semibold">AI 小经 · 帮您比价</div>
            <p className="mt-1.5 text-[11px] text-background/70 leading-5">本品已是该品牌平台唯一在售价。想找同类替代？让 AI 帮你对比。</p>
            <Link href="/ai/biz" className="mt-4 inline-flex items-center gap-1 h-9 px-4 rounded-full bg-accent-yellow text-foreground text-[12px] font-medium">对比方案</Link>
          </div>

          {related.length > 0 && (
            <div className="rounded-3xl border border-border bg-background p-5">
              <div className="text-[12px] text-muted-foreground tracking-wider uppercase mb-3">同类推荐</div>
              <ul className="space-y-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link href={`/supplies/${r.id}`} className="flex gap-3 group">
                      <span className={cn("h-12 w-12 rounded-xl shrink-0", THUMB[colorFor(r.brand || r.category || r.name)])} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium line-clamp-2 group-hover:text-brand">{r.name}</div>
                        <div className="text-[11px] text-cat-decor font-semibold mt-0.5">¥{r.memberPrice}/{r.unit}</div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {/* 移动端 sticky 底部 */}
      <div className="md:hidden fixed bottom-14 inset-x-0 z-30 px-3 pointer-events-none">
        <div className="pointer-events-auto mx-auto max-w-md rounded-full bg-foreground text-background shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] flex items-center gap-2 p-1.5 pl-4">
          <div className="flex-1 min-w-0">
            <div className="text-[9px] text-background/60 tracking-wider uppercase">会员批发价</div>
            <div className="text-[16px] font-semibold text-accent-yellow tabular-nums leading-tight">
              ¥{p.memberPrice}<span className="text-[10px] font-normal text-background/60 ml-0.5">/{p.unit}</span>
            </div>
          </div>
          {isOwn ? (
            <span className="h-11 px-5 rounded-full bg-white/10 text-background/60 text-[13px] inline-flex items-center shrink-0">我的商品</span>
          ) : (
            <form className="shrink-0 flex items-center gap-1.5">
              <input type="hidden" name="productId" value={p.id} />
              <input type="hidden" name="qty" value={p.moq} />
              <button formAction={addToCartAction} aria-label="加入采购车" className="h-11 w-11 rounded-full bg-white/10 text-background inline-flex items-center justify-center active:scale-95 transition-transform">
                <ShoppingCart className="h-4 w-4" />
              </button>
              <button formAction={placeOrderAction} className="h-11 px-5 rounded-full bg-cat-decor text-white text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform">
                {me ? "立即下单" : "登录下单"}
              </button>
            </form>
          )}
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
