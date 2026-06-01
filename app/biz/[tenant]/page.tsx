import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, ShieldCheck, Star, Phone, MessageSquareHeart,
  Hammer, MessageSquareText, ChevronRight,
} from "lucide-react";
import { ENTERPRISES } from "@/lib/data/enterprises";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { listReviews } from "@/lib/data/reviews";
import { listCasesByEnterprise } from "@/lib/data/cases";
import { listTeamByEnterprise } from "@/lib/data/team";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

const BG: Record<string, string> = {
  build: "bg-cat-build", decor: "bg-cat-decor", design: "bg-cat-design",
  tea: "bg-accent-tea", brand: "bg-brand",
};
const SOFT: Record<string, string> = {
  build: "bg-cat-build-soft text-cat-build",
  decor: "bg-cat-decor-soft text-cat-decor",
  design: "bg-cat-design-soft text-cat-design",
  tea: "bg-[#e6f7f1] text-accent-tea",
  brand: "bg-brand-50 text-brand",
};
const TEXT: Record<string, string> = {
  build: "text-cat-build", decor: "text-cat-decor", design: "text-cat-design",
  tea: "text-accent-tea", brand: "text-brand",
};

const SERVICES: Record<string, { t: string; d: string; h: string }[]> = {
  build: [
    { t: "工程总承包", d: "市政、公共建筑、产业园 EPC 全流程交付", h: "壹级资质" },
    { t: "专业承包", d: "钢结构、机电、装饰装修等专业分包", h: "贰级及以上" },
    { t: "造价咨询", d: "项目预算、招投标、变更签证全程把控", h: "甲级团队" },
  ],
  decor: [
    { t: "整装家装", d: "699 起套餐 · 拎包入住 · 18 道工序", h: "10 年质保" },
    { t: "工装定制", d: "办公、餐饮、零售、酒店全场景", h: "壹级资质" },
    { t: "局部翻新", d: "厨卫翻新 · 旧房改造 · 老房局装", h: "7 天起" },
  ],
  design: [
    { t: "整体设计", d: "户型优化 · 风格定制 · 软硬装统筹", h: "双方案" },
    { t: "施工图深化", d: "节点详图 · 水电点位 · 材料选型", h: "AutoCAD" },
    { t: "软装陈列", d: "样板房 · 别墅 · 主题民宿", h: "进口品牌" },
  ],
};

export async function generateStaticParams() {
  return ENTERPRISES.map((e) => ({ tenant: e.slug }));
}

type TplProps = {
  e: NonNullable<Awaited<ReturnType<typeof getEnterpriseBySlugOrId>>>;
  tenant: string;
  cases: ReturnType<typeof listCasesByEnterprise>;
  team: ReturnType<typeof listTeamByEnterprise>;
  reviews: ReturnType<typeof listReviews>;
};

export default async function TenantHome({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const e = await getEnterpriseBySlugOrId(tenant);
  if (!e) notFound();

  const reviews = listReviews(200).filter((r) => r.enterprise === e.hero.brand || r.enterprise === e.name);
  const cases = listCasesByEnterprise(e.id);
  const team = listTeamByEnterprise(e.id);

  // 子站模板注册表：将来新增模板放进 TEMPLATES，企业在「我的子站」按 e.template 选择
  const Tpl = TEMPLATES[e.template ?? "standard"] ?? StandardTemplate;
  return <Tpl e={e} tenant={tenant} cases={cases} team={team} reviews={reviews} />;
}

function StandardTemplate({ e, tenant, cases, team, reviews }: TplProps) {
  const services = SERVICES[e.category] ?? SERVICES.decor;
  const catLabel = e.category === "build" ? "建筑企业" : e.category === "decor" ? "装修企业" : "设计企业";

  return (
    <div className="overflow-x-hidden">
      {/* HERO — 紧凑 */}
      <section className={cn("relative overflow-hidden text-white py-8 md:py-12", BG[e.color])}>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(at 10% 10%, rgba(255,255,255,0.35) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(0,0,0,0.3) 0px, transparent 50%)",
        }} />
        <div className="absolute -right-16 -top-16 h-64 w-64 md:h-96 md:w-96 rounded-full bg-white/10 blur-2xl" />
        <Container className="relative">
          <div className="flex items-center gap-2 mb-3 flex-wrap text-[11px]">
            <Badge className="!bg-white/20 !text-white !border-0">{catLabel}</Badge>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-yellow text-foreground px-2 py-0.5 font-semibold">★ {e.rating.toFixed(1)} · {e.reviews}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5"><ShieldCheck className="h-3 w-3" /> 协会认证</span>
          </div>
          <h1 className="text-[24px] sm:text-[34px] md:text-[46px] font-semibold tracking-tight leading-[1.12] max-w-3xl break-words">
            {e.hero.tagline}
          </h1>
          <p className="mt-2.5 text-[13px] sm:text-[15px] text-white/85 max-w-xl leading-6">{e.short}</p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link href={`/biz/${tenant}/order`} className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-full bg-white text-foreground text-[14px] font-medium hover:bg-accent-yellow transition-colors active:scale-[0.99]">
              立即下单 / 预约 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={`/biz/${tenant}/inquiry`} className="inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-full border border-white/40 text-white text-[14px] hover:bg-white/10">
              <MessageSquareText className="h-4 w-4" /> 先咨询
            </Link>
          </div>

          {/* 指标 · 紧凑一行 */}
          <div className="mt-6 grid grid-cols-4 gap-3 pt-5 border-t border-white/15 max-w-xl">
            <Metric label="评分" value={e.rating.toFixed(1)} />
            <Metric label="案例" value={`${e.cases}`} />
            <Metric label="成立" value={`${e.founded}`} />
            <Metric label="规模" value={e.staff.split(" ")[0]} />
          </div>
        </Container>
      </section>

      {/* 精选案例 — 内容优先 */}
      <section id="cases" className="py-7 md:py-10 bg-surface">
        <Container>
          <SectionTitle eyebrow="CASES · 作品" title="精选案例" moreHref={cases.length > 0 ? `/biz/${tenant}/cases` : undefined} moreClassName={TEXT[e.color]} />
          {cases.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
              {cases.slice(0, 4).map((c) => (
                <Link key={c.id} href={`/biz/${tenant}/cases/${c.id}`} className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-foreground/5 active:scale-[0.99] hover:shadow-lg md:hover:-translate-y-1 transition-all">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.cover} alt={c.title} className="absolute inset-0 h-full w-full object-cover md:transition-transform md:duration-500 md:group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <div className="text-[13px] md:text-[14px] font-medium line-clamp-1">{c.title}</div>
                    <div className="text-[11px] opacity-80">{[c.area && `${c.area}㎡`, c.tag].filter(Boolean).join(" · ")}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-background p-8 text-center text-[13px] text-muted-foreground">
              案例陆续完善中 · 可先 <Link href={`/biz/${tenant}/inquiry`} className={TEXT[e.color]}>在线咨询</Link> 或 <Link href={`/biz/${tenant}/order`} className={TEXT[e.color]}>提交需求</Link>。
            </div>
          )}
        </Container>
      </section>

      {/* 服务 — 可点击直达预约 */}
      <section id="service" className="py-7 md:py-10">
        <Container>
          <SectionTitle eyebrow="SERVICES · 服务" title="我们提供" sub="点选服务直接预约" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 md:gap-3">
            {services.map((s) => (
              <Link
                key={s.t}
                href={`/biz/${tenant}/order?service=${encodeURIComponent(s.t)}`}
                className="group rounded-2xl border border-border p-4 bg-background hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.99] flex items-start gap-3"
              >
                <span className={cn("inline-flex h-10 w-10 rounded-xl items-center justify-center text-[16px] font-semibold shrink-0", SOFT[e.color])}>{s.t.slice(0, 1)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold truncate">{s.t}</span>
                    <span className={cn("ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px]", SOFT[e.color])}>{s.h}</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-5 text-muted-foreground line-clamp-2">{s.d}</p>
                  <div className={cn("mt-2 inline-flex items-center gap-0.5 text-[12px] font-medium", TEXT[e.color])}>
                    预约咨询 <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 核心团队 — 可点击 */}
      {team.length > 0 && (
        <section id="team" className="py-7 md:py-10 bg-surface">
          <Container>
            <SectionTitle eyebrow="TEAM · 团队" title="核心团队" sub={`${team.length} 位`} />
            <div className="mt-4 grid grid-cols-3 md:grid-cols-4 gap-2.5 md:gap-3">
              {team.map((m) => (
                <Link key={m.id} href={`/biz/${tenant}/team/${m.id}`} className="rounded-2xl border border-border bg-background overflow-hidden active:scale-[0.99] hover:shadow-md md:hover:-translate-y-0.5 transition-all">
                  <div className="relative aspect-[3/4] bg-surface">
                    {m.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.photo} alt={m.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className={cn("absolute inset-0 flex items-center justify-center text-white text-[32px] font-semibold", BG[e.color])}>{m.name.slice(0, 1)}</div>
                    )}
                  </div>
                  <div className="p-2 md:p-3">
                    <div className="text-[13px] md:text-[15px] font-semibold truncate">{m.name}</div>
                    <div className="text-[10px] md:text-[12px] text-muted-foreground truncate">{m.role}</div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 业主评价 */}
      {reviews.length > 0 && (
        <section className="py-7 md:py-10">
          <Container>
            <SectionTitle eyebrow="REVIEWS · 口碑" title="业主真实评价" moreHref={`/biz/${tenant}/reviews`} moreClassName={TEXT[e.color]} />
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {reviews.slice(0, 3).map((r) => (
                <div key={r.id} className="rounded-2xl border border-border bg-background p-4 md:p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-9 w-9 rounded-full bg-surface inline-flex items-center justify-center text-[13px] font-semibold shrink-0">{r.user.slice(0, 1)}</span>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium">{r.user}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{r.project}</div>
                    </div>
                    <span className="ml-auto inline-flex items-center gap-0.5 text-[12px] shrink-0"><Star className="h-3.5 w-3.5 fill-[#FFB400] text-[#FFB400]" />{r.rating}</span>
                  </div>
                  <p className="text-[13px] leading-6 line-clamp-3 text-muted-foreground">&ldquo;{r.content}&rdquo;</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 联系 + 保障 — 精简收尾 */}
      <section id="contact" className="py-7 md:py-10">
        <Container>
          <div className={cn("relative overflow-hidden rounded-3xl text-white p-6 md:p-8", BG[e.color])}>
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 md:items-center">
              <div>
                <h2 className="text-[22px] md:text-[30px] font-semibold tracking-tight leading-tight">准备开工？联系 {e.hero.brand}</h2>
                <p className="mt-2 text-[13px] text-white/85 max-w-md leading-6">协会三重保障：履约险先行赔付 · 14 天调解 · 资金监管，放心托付。</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/biz/${tenant}/order`} className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-white text-foreground text-[14px] font-medium hover:bg-accent-yellow transition-colors">提交需求 <ArrowRight className="h-4 w-4" /></Link>
                  <a href={`tel:${e.contact.tel.replace(/-/g, "")}`} className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full border border-white/40 text-white text-[14px] hover:bg-white/10"><Phone className="h-4 w-4" /> {e.contact.tel}</a>
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

// 模板注册表（当前仅 standard；新增模板在此登记即可）
const TEMPLATES: Record<string, typeof StandardTemplate> = {
  standard: StandardTemplate,
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[20px] md:text-[26px] font-semibold leading-none tabular-nums">{value}</div>
      <div className="mt-1 text-[10px] text-white/65">{label}</div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, sub, moreHref, moreClassName }: { eyebrow: string; title: string; sub?: string; moreHref?: string; moreClassName?: string }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <h2 className="text-[20px] md:text-[26px] font-semibold tracking-tight">{title}</h2>
      {sub && <span className="text-[12px] text-muted-foreground">{sub}</span>}
      {moreHref ? (
        <Link href={moreHref} className={cn("ml-auto text-[13px] font-medium shrink-0 inline-flex items-center gap-0.5", moreClassName)}>更多 →</Link>
      ) : (
        <span className="ml-auto text-[10px] tracking-[0.2em] text-muted-foreground uppercase hidden sm:block">{eyebrow}</span>
      )}
    </div>
  );
}
