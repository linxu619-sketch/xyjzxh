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
    <div className="overflow-x-hidden">
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
          <h1 className="text-[26px] sm:text-[36px] md:text-[52px] font-semibold tracking-tight leading-[1.1] sm:leading-[1.05] max-w-3xl break-words">
            {e.hero.tagline}
          </h1>
          <p className="mt-3 sm:mt-5 text-[13px] sm:text-[15px] md:text-[17px] text-white/85 max-w-xl leading-6 sm:leading-7">
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
          <div className="mt-8 md:mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-6 md:pt-8 border-t border-white/15">
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
                    <Link key={c.id} href={`/biz/${tenant}/cases/${c.id}`} className="snap-start shrink-0 w-[64vw] max-w-[240px] group relative aspect-[4/3] rounded-2xl overflow-hidden bg-foreground/5 active:scale-[0.99] transition-transform">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.cover} alt={c.title} className="absolute inset-0 h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="text-[13px] font-medium line-clamp-1">{c.title}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">{[c.area && `${c.area}㎡`, c.tag].filter(Boolean).join(" · ")}</div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground text-center">← 左右滑动 · 点开看详情 →</div>
              </div>

              {/* 桌面网格 */}
              <div className="hidden md:grid mt-10 grid-cols-4 gap-4">
                {cases.map((c) => (
                  <Link key={c.id} href={`/biz/${tenant}/cases/${c.id}`} className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-foreground/5 hover:shadow-lg transition-all hover:-translate-y-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.cover} alt={c.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-[14px] font-medium line-clamp-1">{c.title}</div>
                      <div className="text-[12px] opacity-80 mt-0.5">{[c.area && `${c.area}㎡`, c.tag].filter(Boolean).join(" · ")}</div>
                    </div>
                  </Link>
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
                <Link key={m.id} href={`/biz/${tenant}/team/${m.id}`} className="snap-start shrink-0 w-[40vw] max-w-[160px] rounded-3xl border border-border bg-background p-4 text-center active:scale-[0.99] transition-transform">
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo} alt={m.name} className="mx-auto h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <div className={cn("mx-auto h-14 w-14 rounded-full text-white flex items-center justify-center text-[20px] font-semibold", BG[e.color])}>
                      {m.name.slice(0, 1)}
                    </div>
                  )}
                  <div className="mt-2 text-[13px] font-semibold">{m.name}</div>
                  <div className="text-[10px] text-muted-foreground">{m.role}</div>
                  <div className="mt-1 text-[9px] text-muted-foreground line-clamp-2">{m.exp}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:grid mt-10 grid-cols-4 gap-4">
            {team.map((m) => (
              <Link key={m.id} href={`/biz/${tenant}/team/${m.id}`} className="rounded-3xl border border-border bg-background p-5 text-center hover:shadow-md transition-shadow hover:-translate-y-0.5">
                {m.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photo} alt={m.name} className="mx-auto h-20 w-20 rounded-full object-cover" />
                ) : (
                  <div className={cn("mx-auto h-20 w-20 rounded-full text-white flex items-center justify-center text-[26px] font-semibold", BG[e.color])}>
                    {m.name.slice(0, 1)}
                  </div>
                )}
                <div className="mt-3 text-[15px] font-semibold">{m.name}</div>
                <div className="text-[12px] text-muted-foreground">{m.role}</div>
                <div className="mt-2 text-[11px] text-muted-foreground line-clamp-2">{m.exp}</div>
              </Link>
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

      {/* 联系 + 保障（精简收尾，一个块搞定）*/}
      <section id="contact" className="py-8 md:py-12">
        <Container>
          <div className={cn("relative overflow-hidden rounded-3xl md:rounded-[32px] text-white p-6 md:p-10", BG[e.color])}>
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 md:items-center">
              <div>
                <h2 className="text-[24px] md:text-[34px] font-semibold tracking-tight leading-tight">准备开工？联系 {e.hero.brand}</h2>
                <p className="mt-2 text-[13px] text-white/85 max-w-md leading-6">
                  协会三重保障：工程履约险先行赔付 · 14 天调解兜底 · 资金监管账户，放心托付。
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/biz/${tenant}/order`} className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-white text-foreground text-[14px] font-medium hover:bg-accent-yellow transition-colors">
                    提交需求 <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href={`tel:${e.contact.tel.replace(/-/g, "")}`} className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full border border-white/40 text-white text-[14px] hover:bg-white/10">
                    <Phone className="h-4 w-4" /> {e.contact.tel}
                  </a>
                  <Link href={`/ai/decor?style=${encodeURIComponent(e.tags[0] ?? "现代极简")}`} className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full border border-white/40 text-white text-[14px] hover:bg-white/10">
                    <Sparkles className="h-4 w-4" /> AI 估价
                  </Link>
                </div>
              </div>
              <ul className="hidden md:block space-y-2 text-[13px] text-white/85 border-l border-white/20 pl-6">
                <li className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent-yellow shrink-0" /> 工程履约险 · 合同 10% 内先行赔付</li>
                <li className="inline-flex items-center gap-2"><MessageSquareHeart className="h-4 w-4 text-accent-yellow shrink-0" /> 14 天协会调解 · 纠纷免诉直达</li>
                <li className="inline-flex items-center gap-2"><Hammer className="h-4 w-4 text-accent-yellow shrink-0" /> 资金监管账户 · 进度匹配付款</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

    </div>
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

