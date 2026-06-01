import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, Sparkles, ShieldCheck, Star, Phone, MessageSquareHeart,
  Hammer, MessageSquareText,
} from "lucide-react";
import { ENTERPRISES } from "@/lib/data/enterprises";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { listReviews } from "@/lib/data/reviews";
import { listCasesByEnterprise } from "@/lib/data/cases";
import { listTeamByEnterprise } from "@/lib/data/team";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

const BG: Record<string, string> = {
  build: "bg-cat-build", decor: "bg-cat-decor", design: "bg-cat-design",
};
const SOFT: Record<string, string> = {
  build: "bg-cat-build-soft text-cat-build",
  decor: "bg-cat-decor-soft text-cat-decor",
  design: "bg-cat-design-soft text-cat-design",
};
const GRAD_TO: Record<string, string> = {
  build: "to-[#0e44c9]",
  decor: "to-[#e6531f]",
  design: "to-[#6d3df0]",
};

export async function generateStaticParams() {
  return ENTERPRISES.map((e) => ({ tenant: e.slug }));
}

export default async function TenantHome({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const e = await getEnterpriseBySlugOrId(tenant);
  if (!e) notFound();

  // 真实评价（按企业简称/全称匹配 reviews 表）；新入会企业暂无 → 优雅留空
  const realReviews = listReviews(50).filter((r) => r.enterprise === e.hero.brand || r.enterprise === e.name).slice(0, 6);
  // 真实案例 / 团队（企业自助维护）
  const cases = listCasesByEnterprise(e.id);
  const team = listTeamByEnterprise(e.id);

  return (
    <>
      {/* Hero · 移动收紧 + 渐变 */}
      <section className={cn("relative overflow-hidden text-white py-10 md:py-16", BG[e.color])}>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(at 10% 10%, rgba(255,255,255,0.35) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(0,0,0,0.3) 0px, transparent 50%)",
        }} />
        <div className="absolute -right-16 -top-16 h-72 w-72 md:h-96 md:w-96 rounded-full bg-white/10 blur-2xl" />
        <Container className="relative">
          <div className="flex items-center gap-2 mb-4 md:mb-6 flex-wrap">
            <Badge className="!bg-white/20 !text-white !border-0">{e.category === "build" ? "建筑企业" : e.category === "decor" ? "装修企业" : "设计企业"}</Badge>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px]">
              <ShieldCheck className="h-3 w-3" /> 协会认证 · {e.id}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-yellow text-foreground px-2.5 py-1 text-[11px] font-semibold">
              ★ {e.rating.toFixed(1)} · {e.reviews} 评价
            </span>
          </div>
          <h1 className="text-[32px] sm:text-[44px] md:text-[72px] font-semibold tracking-tight leading-[1.05] sm:leading-[1.02] max-w-3xl">
            {e.hero.tagline}
          </h1>
          <p className="mt-4 sm:mt-6 text-[13px] sm:text-[15px] md:text-[18px] text-white/85 max-w-xl leading-6 sm:leading-7">
            {e.short}
          </p>

          {/* CTA */}
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 max-w-xl">
            <Button
              href={`/biz/${tenant}/order`}
              variant="primary"
              size="lg"
              className="!bg-white !text-foreground hover:!bg-accent-yellow active:scale-[0.99]"
            >
              立即下单 / 预约设计
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Link
              href={`/biz/${tenant}/inquiry`}
              className="inline-flex items-center justify-center gap-2 h-12 md:h-14 px-5 md:px-7 rounded-full border border-white/40 text-white font-medium hover:bg-white/10 text-[14px]"
            >
              <MessageSquareText className="h-4 w-4" /> 先咨询
            </Link>
          </div>

          {/* 信任徽章 */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-white/80">
            <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-accent-yellow" /> 协会担保</span>
            <span className="inline-flex items-center gap-1"><Hammer className="h-3 w-3 text-accent-yellow" /> 工装报备直连</span>
            <span className="inline-flex items-center gap-1"><MessageSquareHeart className="h-3 w-3 text-accent-yellow" /> 14 天调解兜底</span>
          </div>

          {/* 指标 */}
          <div className="mt-10 md:mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-6 md:pt-8 border-t border-white/15">
            <Metric label="评分" value={e.rating.toFixed(1)} sub={`${e.reviews} 评价`} />
            <Metric label="案例" value={`${e.cases}`} sub="近 3 年" />
            <Metric label="成立" value={`${e.founded}`} sub={`${new Date().getFullYear() - e.founded} 年`} />
            <Metric label="规模" value={e.staff.split(" ")[0]} sub={e.staff.split(" ")[1] || ""} />
          </div>
        </Container>
      </section>

      {/* 服务 */}
      <section id="service" className="py-8 md:py-12">
        <Container>
          <SectionTitle eyebrow="SERVICES" title="我们提供" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-6 md:mt-10">
            {(e.category === "build"
              ? [
                  { t: "工程总承包", d: "市政、公共建筑、产业园 EPC 全流程交付", h: "壹级资质" },
                  { t: "专业承包", d: "钢结构、机电、装饰装修等专业分包", h: "贰级及以上" },
                  { t: "造价咨询", d: "项目预算、招投标、变更签证全程把控", h: "甲级团队" },
                ]
              : e.category === "decor"
              ? [
                  { t: "整装家装", d: "699 起套餐 · 拎包入住 · 18 道工序", h: "10 年质保" },
                  { t: "工装定制", d: "办公、餐饮、零售、酒店全场景", h: "壹级资质" },
                  { t: "局部翻新", d: "厨卫翻新 · 旧房改造 · 老房局装", h: "7 天起" },
                ]
              : [
                  { t: "整体设计", d: "户型优化 · 风格定制 · 软硬装统筹", h: "双方案" },
                  { t: "施工图深化", d: "节点详图 · 水电点位 · 材料选型", h: "AutoCAD" },
                  { t: "软装陈列", d: "样板房 · 别墅 · 主题民宿", h: "进口品牌" },
                ]
            ).map((s) => (
              <div key={s.t} className="rounded-3xl border border-border p-5 md:p-6 bg-background hover:shadow-md transition-shadow active:scale-[0.99]">
                <span className={cn("inline-flex h-10 w-10 rounded-xl items-center justify-center text-[18px] font-semibold", SOFT[e.color])}>
                  {s.t.slice(0, 1)}
                </span>
                <div className="mt-4 text-[16px] md:text-[18px] font-semibold">{s.t}</div>
                <p className="mt-2 text-[12px] md:text-[13px] leading-5 md:leading-6 text-muted-foreground">{s.d}</p>
                <div className={cn("mt-3 md:mt-4 inline-block rounded-full px-3 py-1 text-[11px]", SOFT[e.color])}>{s.h}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 案例 · 移动横滑 / 桌面网格 */}
      <section id="cases" className="py-8 md:py-12 bg-surface">
        <Container>
          <SectionTitle eyebrow="CASES" title={cases.length ? `精选案例 · ${cases.length}` : "案例展示"} />

          {cases.length > 0 ? (
            <>
              {/* 移动横滑 */}
              <div className="md:hidden mt-6 -mx-5 px-5 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex gap-3 pb-2">
                  {cases.map((c) => (
                    <div key={c.id} className="snap-start shrink-0 w-[64vw] max-w-[240px] group relative aspect-[4/3] rounded-2xl overflow-hidden bg-foreground/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.cover} alt={c.title} className="absolute inset-0 h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="text-[13px] font-medium line-clamp-1">{c.title}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">{[c.area && `${c.area}㎡`, c.tag].filter(Boolean).join(" · ")}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground text-center">← 左右滑动 →</div>
              </div>

              {/* 桌面网格 */}
              <div className="hidden md:grid mt-10 grid-cols-4 gap-4">
                {cases.map((c) => (
                  <div key={c.id} className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-foreground/5 hover:shadow-lg transition-all hover:-translate-y-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.cover} alt={c.title} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-[14px] font-medium line-clamp-1">{c.title}</div>
                      <div className="text-[12px] opacity-80 mt-0.5">{[c.area && `${c.area}㎡`, c.tag].filter(Boolean).join(" · ")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-8 rounded-3xl border border-dashed border-border bg-background p-10 text-center text-[13px] text-muted-foreground">
              案例陆续完善中 · 该企业为协会新入会会员，可先 <Link href={`/biz/${tenant}/inquiry`} className="text-brand">在线咨询</Link> 或 <Link href={`/biz/${tenant}/order`} className="text-brand">提交需求</Link>。
            </div>
          )}
        </Container>
      </section>

      {/* 团队 · 真实成员（企业维护，无则不显示） */}
      {team.length > 0 && (
      <section id="team" className="py-8 md:py-12">
        <Container>
          <SectionTitle eyebrow="TEAM" title="核心团队" />

          <div className="md:hidden mt-6 -mx-5 px-5 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-3 pb-2">
              {team.map((m) => (
                <div key={m.id} className="snap-start shrink-0 w-[40vw] max-w-[160px] rounded-3xl border border-border bg-background p-4 text-center">
                  <div className={cn("mx-auto h-14 w-14 rounded-full text-white flex items-center justify-center text-[20px] font-semibold", BG[e.color])}>
                    {m.name.slice(0, 1)}
                  </div>
                  <div className="mt-2 text-[13px] font-semibold">{m.name}</div>
                  <div className="text-[10px] text-muted-foreground">{m.role}</div>
                  <div className="mt-1 text-[9px] text-muted-foreground line-clamp-2">{m.exp}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:grid mt-10 grid-cols-4 gap-4">
            {team.map((m) => (
              <div key={m.id} className="rounded-3xl border border-border bg-background p-5 text-center hover:shadow-md transition-shadow">
                <div className={cn("mx-auto h-20 w-20 rounded-full text-white flex items-center justify-center text-[26px] font-semibold", BG[e.color])}>
                  {m.name.slice(0, 1)}
                </div>
                <div className="mt-3 text-[15px] font-semibold">{m.name}</div>
                <div className="text-[12px] text-muted-foreground">{m.role}</div>
                <div className="mt-2 text-[11px] text-muted-foreground">{m.exp}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>
      )}

      {/* 评价 · 真实数据（无则留空） */}
      <section className="py-8 md:py-12 bg-surface">
        <Container>
          <SectionTitle eyebrow="REVIEWS" title={realReviews.length ? "业主真实评价" : "业主评价"} action={realReviews.length ? "查看全部 →" : undefined} />

          {realReviews.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-border bg-background p-10 text-center text-[13px] text-muted-foreground">
              暂无业主评价 · 完工后业主可在协会平台对本企业作出真实评价。
            </div>
          ) : (
            <div className="mt-6 md:mt-10 -mx-5 md:mx-0 px-5 md:px-0 overflow-x-auto snap-x snap-mandatory md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-4 pb-2 md:pb-0">
                {realReviews.map((r) => (
                  <div key={r.id} className="snap-start shrink-0 w-[80vw] max-w-[340px] md:w-auto md:max-w-none rounded-3xl border border-border bg-background p-5 md:p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-10 w-10 rounded-full bg-surface inline-flex items-center justify-center text-[13px] font-semibold">{r.user.slice(0, 1)}</span>
                      <div>
                        <div className="text-[13px] font-medium">{r.user}</div>
                        <div className="text-[10px] text-muted-foreground">{r.project}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {Array.from({ length: 5 }, (_, j) => (
                        <Star key={j} className={cn("h-3.5 w-3.5", j < r.rating ? "fill-[#FFB400] text-[#FFB400]" : "text-border")} />
                      ))}
                    </div>
                    <p className="text-[13px] leading-6 line-clamp-4">&ldquo;{r.content}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* AI + 协会保障 */}
      <section className="py-8 md:py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className={cn("rounded-3xl text-white p-6 md:p-10 relative overflow-hidden bg-gradient-to-br", BG[e.color], GRAD_TO[e.color])}>
              <div className="absolute -right-10 -top-10 h-40 md:h-48 w-40 md:w-48 rounded-full bg-white/20 blur-3xl" />
              <Sparkles className="relative h-6 md:h-7 w-6 md:w-7 text-accent-yellow" />
              <h3 className="relative mt-3 md:mt-4 text-[22px] md:text-[32px] font-semibold tracking-tight leading-tight">
                还在犹豫？<br /> 让 AI 帮你算个价
              </h3>
              <p className="relative mt-2 md:mt-3 text-[12px] md:text-[13px] text-white/85 max-w-sm leading-5 md:leading-6">
                输入户型与诉求，AI 装修顾问 30 秒生成估价与方案建议，结果直达本企业。
              </p>
              <Link
                href={`/ai/decor?style=${encodeURIComponent(e.tags[0] ?? "现代极简")}`}
                className="relative mt-5 md:mt-7 inline-flex items-center gap-2 h-11 md:h-12 px-5 md:px-6 rounded-full bg-accent-yellow text-foreground font-medium text-[13px] md:text-[14px] active:scale-[0.99]"
              >
                免费 AI 估价 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-3xl bg-foreground text-background p-6 md:p-10 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/30 blur-3xl" />
              <ShieldCheck className="relative h-6 md:h-7 w-6 md:w-7 text-accent-yellow" />
              <h3 className="relative mt-3 md:mt-4 text-[22px] md:text-[32px] font-semibold tracking-tight leading-tight">
                协会三重保障<br />企业跑路也能赔
              </h3>
              <ul className="relative mt-3 md:mt-4 space-y-1.5 text-[12px] md:text-[13px] text-background/80 leading-5 md:leading-6">
                <li>· 工程履约险：合同总价 10% 内先行赔付</li>
                <li>· 14 天协会调解：纠纷免诉直达</li>
                <li>· 资金监管账户：施工进度匹配付款</li>
              </ul>
              <Link
                href="/insurance"
                className="relative mt-5 md:mt-7 inline-flex items-center gap-1.5 h-11 md:h-12 px-5 md:px-6 rounded-full bg-accent-yellow text-foreground font-medium text-[13px] md:text-[14px] active:scale-[0.99]"
              >
                了解协会保障 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section id="contact" className="pt-8 md:pt-12 pb-28 md:pb-16">
        <Container>
          <div className={cn(
            "relative overflow-hidden rounded-[28px] md:rounded-[40px] p-7 md:p-14 text-white",
            BG[e.color],
          )}>
            <div className="absolute -left-20 -bottom-20 h-56 md:h-72 w-56 md:w-72 rounded-full bg-white/10 blur-2xl" />
            <h2 className="relative text-[26px] sm:text-[32px] md:text-[48px] font-semibold tracking-tight leading-[1.1] max-w-xl">
              准备开工？<br /> 现在就联系 {e.hero.brand}
            </h2>
            <div className="relative mt-6 md:mt-8 flex flex-col sm:flex-row gap-3">
              <Button href={`/biz/${tenant}/order`} size="lg" variant="primary" className="!bg-white !text-foreground hover:!bg-accent-yellow">
                提交需求
                <ArrowRight className="h-4 w-4" />
              </Button>
              <a href={`tel:${e.contact.tel.replace(/-/g, "")}`} className="inline-flex items-center justify-center gap-2 h-12 md:h-14 px-5 md:px-7 rounded-full border border-white/40 text-white font-medium hover:bg-white/10 text-[13px] md:text-[14px]">
                <Phone className="h-4 w-4" /> {e.contact.tel}
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* 移动端 sticky 底部 CTA · 桌面隐藏 */}
      <div className="md:hidden fixed bottom-3 inset-x-0 z-30 px-3 pointer-events-none">
        <div className="pointer-events-auto mx-auto max-w-md rounded-full bg-foreground text-background shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] flex items-center gap-1.5 p-1.5">
          <a
            href={`tel:${e.contact.tel.replace(/-/g, "")}`}
            className="h-11 w-11 inline-flex items-center justify-center rounded-full bg-accent-tea text-white shrink-0"
            aria-label={`致电 ${e.contact.tel}`}
          >
            <Phone className="h-4 w-4" />
          </a>
          <Link
            href={`/biz/${tenant}/inquiry`}
            className="h-11 w-11 inline-flex items-center justify-center rounded-full bg-white/10 text-background shrink-0"
            aria-label="在线咨询"
          >
            <MessageSquareText className="h-4 w-4" />
          </Link>
          <Link
            href={`/biz/${tenant}/order`}
            className={cn(
              "flex-1 h-11 inline-flex items-center justify-center gap-1.5 rounded-full text-white text-[13px] font-medium",
              BG[e.color],
            )}
          >
            立即下单 / 预约
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div className="text-[10px] md:text-[11px] uppercase tracking-wider text-white/60">{label}</div>
      <div className="mt-0.5 md:mt-1 text-[22px] md:text-[36px] font-semibold leading-tight">{value}</div>
      <div className="text-[10px] md:text-[11px] text-white/70">{sub}</div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <div className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">{eyebrow}</div>
        <h2 className="mt-1.5 md:mt-2 text-[24px] md:text-[40px] font-semibold tracking-tight leading-tight">{title}</h2>
      </div>
      {action && <Link href="#" className="text-[12px] md:text-[13px] text-brand hover:underline shrink-0">{action}</Link>}
    </div>
  );
}

