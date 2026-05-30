import Link from "next/link";
import {
  ArrowRight, ShieldCheck, Sparkles, Star, MessageSquareText,
  Building2, Search, Umbrella, Hammer, CheckCircle2, Phone,
} from "lucide-react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/site";
import { ENTERPRISES } from "@/lib/data/enterprises";
import { cn } from "@/lib/cn";

export const metadata = {
  title: "找装修不踩坑 · 信阳建装 · 协会担保的装修平台",
  description:
    "在信阳找装修公司？1,052 家协会认证企业 · 实名评价 · 工装报备 · 消费保险 · AI 30 秒估价 · 14 天协会调解兜底。",
};

const BG: Record<string, string> = {
  build: "bg-cat-build", decor: "bg-cat-decor", design: "bg-cat-design",
};

const C_REVIEWS = [
  { user: "刘女士", area: "120㎡ 整装", rating: 5, content: "项目经理特别负责，水电改造的时候多次主动来工地，质量超预期。", enterprise: "名家装饰" },
  { user: "陈先生", area: "168㎡ 整装", rating: 5, content: "设计师很懂年轻人审美，方案改了两版就定稿。", enterprise: "壹品装饰" },
  { user: "王女士", area: "98㎡ 半包",  rating: 4, content: "整体满意，材料到场比预计晚了 3 天，沟通后补偿到位。", enterprise: "佳和苑装饰" },
];

const FEATURED = ENTERPRISES.filter((e) => e.featured).slice(0, 6);

export default function ConsumerHome() {
  return (
    <>
      {/* HERO — 强 C 端转化 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh" aria-hidden />
        <div className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-cat-decor/20 blur-3xl" aria-hidden />
        <div className="absolute -top-20 right-0 h-80 w-80 rounded-full bg-cat-build/15 blur-3xl" aria-hidden />

        <Container className="relative pt-12 md:pt-20 pb-16 md:pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border px-3 py-1 text-[11px] mb-6 shadow-sm">
              <Badge tone="decor" className="!px-2 !py-0">协会担保</Badge>
              <span className="text-muted-foreground">1,052 家认证企业 · 32.4 万业主已保护</span>
            </div>
            <h1 className="text-[36px] sm:text-[44px] md:text-[68px] font-semibold tracking-tight leading-[1.05] sm:leading-[1.02]">
              在信阳找装修<br className="hidden sm:block" />
              <span className="text-gradient-brand">不再踩坑</span>
            </h1>
            <p className="mt-5 sm:mt-6 text-[14px] sm:text-[15px] md:text-[18px] leading-6 sm:leading-7 md:leading-8 text-muted-foreground max-w-xl">
              <b className="text-foreground">协会牵头 · 实名评价 · 跑路赔付</b> — 找企业、估价、签约、施工、验收，每一步都有协会守护。
            </p>

            {/* 估价器 — GET 把字段传到 /ai/decor */}
            <form method="GET" action="/ai/decor" className="mt-7 md:mt-10 rounded-3xl border border-border bg-background p-4 md:p-5 shadow-[0_30px_80px_-30px_rgba(20,86,240,0.25)] max-w-xl">
              <div className="text-[12px] text-muted-foreground mb-3 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cat-decor" />
                AI 30 秒估价 · 免费匹配 3 家企业
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <input
                  name="area"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="面积 (㎡)"
                  className="h-12 rounded-xl border border-border px-4 outline-none focus:border-foreground/30 text-[14px]"
                />
                <input
                  name="budget"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="预算 (万)"
                  className="h-12 rounded-xl border border-border px-4 outline-none focus:border-foreground/30 text-[14px]"
                />
                <select
                  name="style"
                  className="col-span-2 sm:col-span-1 h-12 rounded-xl border border-border px-4 text-[14px] bg-background"
                  defaultValue=""
                >
                  <option value="">风格不限</option>
                  <option>现代极简</option><option>新中式</option><option>原木</option><option>北欧</option><option>美式</option>
                </select>
              </div>
              <button type="submit" className="mt-3 w-full h-12 rounded-full bg-foreground text-background text-[14px] font-medium inline-flex items-center justify-center gap-2 hover:bg-brand transition-colors active:scale-[0.98]">
                <Sparkles className="h-4 w-4 text-accent-yellow" /> 让 AI 小装免费估价 <ArrowRight className="h-4 w-4" />
              </button>
              <div className="mt-3 flex items-center justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground flex-wrap">
                <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-accent-tea" /> 100% 免费</span>
                <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-accent-tea" /> 不卖电话</span>
                <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-accent-tea" /> 协会留痕</span>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-muted-foreground">
              <span>已为</span>
              {["金茂悦府", "南湖一号", "万象城", "御景湾", "弦山街"].map((p) => (
                <span key={p} className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-foreground">
                  {p}
                </span>
              ))}
              <span>提供过装修服务</span>
            </div>
          </div>
        </Container>
      </section>

      {/* 三大品类 */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="flex items-end justify-between mb-10 gap-4 flex-col md:flex-row">
            <div>
              <div className="text-[12px] tracking-[0.2em] text-brand uppercase font-medium">FIND · 找企业</div>
              <h2 className="mt-2 text-[34px] md:text-[44px] font-semibold tracking-tight leading-tight">按需求挑企业</h2>
            </div>
            <p className="text-[13px] text-muted-foreground max-w-md">所有企业经资质核验 · 信用评估 · 现场核查 · 实名业主评价</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {CATEGORIES.map((cat) => (
              <Link key={cat.key} href={`/members?cat=${cat.key}`} className={cn(
                "group relative overflow-hidden rounded-3xl p-7 min-h-[260px] flex flex-col justify-between text-white transition-all hover:-translate-y-1 hover:shadow-xl",
                BG[cat.color],
              )}>
                <div className="absolute -right-12 -bottom-12 h-56 w-56 rounded-full bg-white/10" />
                <div className="relative">
                  <div className="text-[11px] tracking-[0.2em] uppercase opacity-80">{cat.en}</div>
                  <h3 className="mt-3 text-[32px] font-semibold tracking-tight">{cat.title}</h3>
                  <p className="mt-2 text-[12px] text-white/85 max-w-xs leading-5">{cat.desc}</p>
                </div>
                <div className="relative flex items-end justify-between">
                  <div className="text-[28px] font-semibold">{cat.count}<span className="text-[12px] font-normal opacity-80"> 家</span></div>
                  <span className="text-[12px] inline-flex items-center gap-1">浏览 <ArrowRight className="h-3 w-3" /></span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 推荐企业 · 移动横滑 / 桌面网格 */}
      <section className="py-14 md:py-20 bg-surface">
        <Container>
          <div className="flex items-end justify-between mb-6 md:mb-10 gap-4 flex-col md:flex-row">
            <div>
              <div className="text-[12px] tracking-[0.2em] text-cat-decor uppercase font-medium">FEATURED · 推荐企业</div>
              <h2 className="mt-2 text-[28px] md:text-[44px] font-semibold tracking-tight leading-tight">本月口碑 TOP 6</h2>
            </div>
            <Link href="/members" className="text-[13px] text-brand">查看全部 1,052 家 →</Link>
          </div>

          {/* 移动：横向 snap 滑动 */}
          <div className="md:hidden -mx-5 px-5 overflow-x-auto snap-x snap-mandatory scroll-px-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-3 pb-2">
              {FEATURED.map((e) => (
                <Link
                  key={e.id}
                  href={`/members/${e.slug}`}
                  className="snap-start shrink-0 w-[78vw] max-w-[300px] rounded-3xl border border-border bg-background p-5 active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <span className={cn("h-12 w-12 rounded-2xl text-white inline-flex items-center justify-center font-semibold", BG[e.color])}>
                      {e.hero.brand.slice(0, 1)}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold truncate">{e.name}</div>
                      <div className="text-[10px] text-muted-foreground">{e.district} · {e.staff}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-[12px] text-muted-foreground line-clamp-2 min-h-[36px]">{e.short}</div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px]">
                    <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-[#FFB400] text-[#FFB400]" /><span className="font-semibold">{e.rating.toFixed(1)}</span><span className="text-muted-foreground">({e.reviews})</span></span>
                    <span className="text-muted-foreground">{e.cases} 案例</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground text-center">← 左右滑动查看更多 →</div>
          </div>

          {/* 桌面：网格 */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURED.map((e) => (
              <Link key={e.id} href={`/members/${e.slug}`} className="group rounded-3xl border border-border bg-background p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="flex items-center gap-3">
                  <span className={cn("h-12 w-12 rounded-2xl text-white inline-flex items-center justify-center font-semibold", BG[e.color])}>
                    {e.hero.brand.slice(0, 1)}
                  </span>
                  <div>
                    <div className="text-[15px] font-semibold">{e.name}</div>
                    <div className="text-[11px] text-muted-foreground">{e.district} · {e.staff}</div>
                  </div>
                </div>
                <div className="mt-3 text-[13px] text-muted-foreground line-clamp-2">{e.short}</div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[12px]">
                  <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-[#FFB400] text-[#FFB400]" /><span className="font-semibold">{e.rating.toFixed(1)}</span><span className="text-muted-foreground">({e.reviews})</span></span>
                  <span className="text-muted-foreground">{e.cases} 案例</span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 业主 4 大服务 */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <div className="text-[12px] tracking-[0.2em] text-brand uppercase font-medium">SERVICES · 业主服务</div>
            <h2 className="mt-2 text-[34px] md:text-[44px] font-semibold tracking-tight">不只是找企业</h2>
            <p className="mt-3 text-[14px] text-muted-foreground">协会还为业主提供这些</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <ServiceTile icon={Sparkles} t="AI 估价" d="30 秒生成方案" href="/ai/decor" tone="brand" />
            <ServiceTile icon={Umbrella} t="家装质保险" d="299 起 · 10 年" href="/insurance" tone="decor" />
            <ServiceTile icon={MessageSquareText} t="实名评价" d="发布后企业不可删" href="/review" tone="design" />
            <ServiceTile icon={Hammer} t="协会调解" d="14 天先行赔付" href="/ai/mediate" tone="tea" />
          </div>
        </Container>
      </section>

      {/* 真实评价 · 移动横滑 */}
      <section className="py-14 md:py-20 bg-surface">
        <Container>
          <div className="flex items-end justify-between mb-6 md:mb-10 gap-4 flex-col md:flex-row">
            <div>
              <div className="text-[12px] tracking-[0.2em] text-cat-design uppercase font-medium">REVIEWS · 真实评价</div>
              <h2 className="mt-2 text-[28px] md:text-[44px] font-semibold tracking-tight leading-tight">12,640 位业主<br className="md:hidden" />给出 <span className="text-cat-decor">4.8 ★</span></h2>
            </div>
            <Link href="/review" className="text-[13px] text-brand">所有评价 →</Link>
          </div>

          {/* 移动横滑 */}
          <div className="md:hidden -mx-5 px-5 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-3 pb-2">
              {C_REVIEWS.map((r, i) => (
                <div key={i} className="snap-start shrink-0 w-[80vw] max-w-[320px] rounded-3xl border border-border bg-background p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-10 w-10 rounded-full bg-surface inline-flex items-center justify-center text-[13px] font-semibold">{r.user.slice(0, 1)}</span>
                    <div>
                      <div className="text-[13px] font-medium">{r.user}</div>
                      <div className="text-[10px] text-muted-foreground">{r.area} · {r.enterprise}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 mb-2">
                    {Array.from({ length: 5 }, (_, j) => (
                      <Star key={j} className={cn("h-3.5 w-3.5", j < r.rating ? "fill-[#FFB400] text-[#FFB400]" : "text-border")} />
                    ))}
                  </div>
                  <p className="text-[13px] leading-6">&ldquo;{r.content}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>

          {/* 桌面 */}
          <div className="hidden md:grid grid-cols-3 gap-4">
            {C_REVIEWS.map((r, i) => (
              <div key={i} className="rounded-3xl border border-border bg-background p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-10 w-10 rounded-full bg-surface inline-flex items-center justify-center text-[13px] font-semibold">{r.user.slice(0, 1)}</span>
                  <div>
                    <div className="text-[13px] font-medium">{r.user}</div>
                    <div className="text-[10px] text-muted-foreground">{r.area} · {r.enterprise}</div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: 5 }, (_, j) => (
                    <Star key={j} className={cn("h-3.5 w-3.5", j < r.rating ? "fill-[#FFB400] text-[#FFB400]" : "text-border")} />
                  ))}
                </div>
                <p className="text-[13px] leading-6 text-foreground">&ldquo;{r.content}&rdquo;</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="relative overflow-hidden rounded-[28px] md:rounded-[40px] bg-foreground text-background p-7 md:p-12">
            <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-cat-decor/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="!bg-accent-yellow !text-foreground mb-4">START NOW</Badge>
                <h2 className="text-[36px] md:text-[52px] font-semibold tracking-tight leading-[1.05]">
                  开始你的<br />装修计划
                </h2>
                <p className="mt-4 text-[14px] text-background/70 max-w-md leading-7">
                  3 分钟告诉 AI 小装你的想法 · 30 秒匹配 3 家企业 · 全程协会监管 · 不满意可调解
                </p>
                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <Button href="/ai/decor" size="lg" variant="primary" className="!bg-accent-yellow !text-foreground hover:!bg-white">
                    AI 估价 <Sparkles className="h-4 w-4" />
                  </Button>
                  <Button href="/members" size="lg" variant="outline" className="!border-white/30 !text-background hover:!bg-white/10">
                    自己浏览 <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 p-6 grid grid-cols-2 gap-3">
                {[
                  { l: "今日新业主", v: "286" },
                  { l: "本月装修开工", v: "187" },
                  { l: "调解满意度", v: "96%" },
                  { l: "保险出单", v: "1,284" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl bg-foreground/30 p-3">
                    <div className="text-[10px] text-background/60">{s.l}</div>
                    <div className="text-[24px] font-semibold text-accent-yellow tracking-tight mt-0.5">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* footer 强调"另一个面" */}
      <section className="pb-20">
        <Container>
          <div className="rounded-3xl border border-border bg-background p-7 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-6 w-6 text-brand mt-0.5" />
              <div>
                <div className="text-[16px] font-semibold">您是企业 / 从业者？</div>
                <div className="text-[12px] text-muted-foreground mt-1">协会门户 <code className="font-mono text-foreground">xh.xyjzxh.com</code> 提供入会、工装报备、子站、招工、培训等服务</div>
              </div>
            </div>
            <Link href="/xh" className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-foreground text-background text-[13px] font-medium">
              进入协会门户 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

function ServiceTile({ icon: Ic, t, d, href, tone }: {
  icon: React.ComponentType<{ className?: string }>;
  t: string; d: string; href: string;
  tone: "brand" | "decor" | "design" | "tea";
}) {
  const TONE: Record<string, string> = {
    brand: "bg-brand-50 text-brand",
    decor: "bg-cat-decor-soft text-cat-decor",
    design: "bg-cat-design-soft text-cat-design",
    tea: "bg-[#e6f7f1] text-accent-tea",
  };
  return (
    <Link href={href} className="rounded-3xl border border-border bg-background p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
      <span className={cn("inline-flex h-11 w-11 rounded-2xl items-center justify-center", TONE[tone])}>
        <Ic className="h-5 w-5" />
      </span>
      <div className="mt-4 text-[15px] font-semibold">{t}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{d}</div>
    </Link>
  );
}
