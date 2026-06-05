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
  const heroImg = cases[0]?.cover;

  return (
    <div className="overflow-x-hidden">
      {/* HERO — 照片导向（企业最佳案例做整屏主视觉） */}
      <section className="relative overflow-hidden text-white">
        <div className="relative min-h-[400px] sm:min-h-[460px] md:min-h-[540px] flex items-end">
          {heroImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImg} alt={e.name} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className={cn("absolute inset-0", BG[e.color])} />
          )}
          {/* 暗渐变压底，保证文字可读 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />

          <Container className="relative w-full pb-8 md:pb-12 pt-24">
            <div className="flex items-center gap-2 mb-3 flex-wrap text-[11px]">
              <span className="inline-flex items-center rounded-full bg-white/15 backdrop-blur px-2.5 py-0.5">{catLabel}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-yellow text-foreground px-2 py-0.5 font-semibold">★ {e.rating.toFixed(1)} · {e.reviews}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 backdrop-blur px-2 py-0.5"><ShieldCheck className="h-3 w-3" /> 协会认证</span>
            </div>
            <h1 className="text-[28px] sm:text-[38px] md:text-[52px] font-semibold tracking-tight leading-[1.08] max-w-3xl break-words drop-shadow-sm">
              {e.hero.tagline}
            </h1>
            <p className="mt-3 text-[13px] sm:text-[15px] text-white/85 max-w-xl leading-6">{e.short}</p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href={`/biz/${tenant}/order`} className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-full bg-white text-foreground text-[14px] font-medium hover:bg-accent-yellow transition-colors active:scale-[0.99]">
                立即下单 / 预约 <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={`/biz/${tenant}/inquiry`} className="inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-full border border-white/50 text-white text-[14px] hover:bg-white/10 backdrop-blur">
                <MessageSquareText className="h-4 w-4" /> 先咨询
              </Link>
            </div>

            {/* 指标 · 紧凑一行 */}
            <div className="mt-7 grid grid-cols-4 gap-3 pt-5 border-t border-white/20 max-w-xl">
              <Metric label="评分" value={e.rating.toFixed(1)} />
              <Metric label="案例" value={`${e.cases}`} />
              <Metric label="成立" value={`${e.founded}`} />
              <Metric label="规模" value={e.staff.split(" ")[0]} />
            </div>
          </Container>
        </div>
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

// ============================================================
//  模板二：editorial（简约杂志风）——浅色 hero + 一大三小案例 + 编号服务列表
//  遵守全站风格锁：团队矩形照片、纵向网格、移动端紧凑、无横向滚动
// ============================================================
function EditorialTemplate({ e, tenant, cases, team, reviews }: TplProps) {
  const services = SERVICES[e.category] ?? SERVICES.decor;
  const catLabel = e.category === "build" ? "建筑企业" : e.category === "decor" ? "装修企业" : "设计企业";
  const feat = cases[0];
  const rest = cases.slice(1, 4);

  return (
    <div className="overflow-x-hidden">
      {/* HERO — 浅色杂志风 */}
      <section className="py-8 md:py-14 border-b border-border">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              <div className="flex items-center gap-2 flex-wrap text-[11px] mb-4">
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium", SOFT[e.color])}>{catLabel}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-muted-foreground"><Star className="h-3 w-3 fill-[#FFB400] text-[#FFB400]" /> {e.rating.toFixed(1)} · {e.reviews}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-muted-foreground"><ShieldCheck className="h-3 w-3 text-accent-tea" /> 协会认证</span>
              </div>
              <div className={cn("h-1 w-12 rounded-full mb-4", BG[e.color])} />
              <h1 className="text-[26px] sm:text-[36px] md:text-[48px] font-semibold tracking-tight leading-[1.1] break-words">{e.hero.tagline}</h1>
              <p className="mt-3 text-[14px] md:text-[16px] text-muted-foreground max-w-xl leading-7">{e.short}</p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link href={`/biz/${tenant}/order`} className={cn("inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-full text-white text-[14px] font-medium active:scale-[0.99] transition-transform", BG[e.color])}>
                  立即下单 / 预约 <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={`/biz/${tenant}/inquiry`} className="inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-full border border-border text-[14px] hover:bg-surface">
                  <MessageSquareText className="h-4 w-4" /> 先咨询
                </Link>
              </div>
              <div className="mt-7 grid grid-cols-4 gap-3 pt-5 border-t border-border max-w-md">
                {[["评分", e.rating.toFixed(1)], ["案例", `${e.cases}`], ["成立", `${e.founded}`], ["规模", e.staff.split(" ")[0]]].map(([l, v]) => (
                  <div key={l}>
                    <div className={cn("text-[20px] md:text-[26px] font-semibold leading-none tabular-nums", TEXT[e.color])}>{v}</div>
                    <div className="mt-1 text-[10px] text-muted-foreground">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* 右侧：首个案例做视觉主图 */}
            <div className="relative">
              {feat ? (
                <Link href={`/biz/${tenant}/cases/${feat.id}`} className="group block relative aspect-[4/3] rounded-3xl overflow-hidden bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={feat.cover} alt={feat.title} className="absolute inset-0 h-full w-full object-cover md:transition-transform md:duration-500 md:group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="text-[11px] opacity-80 uppercase tracking-widest mb-1">精选案例</div>
                    <div className="text-[16px] font-semibold line-clamp-1">{feat.title}</div>
                    <div className="text-[12px] opacity-85">{[feat.area && `${feat.area}㎡`, feat.tag].filter(Boolean).join(" · ")}</div>
                  </div>
                </Link>
              ) : (
                <div className={cn("aspect-[4/3] rounded-3xl flex items-center justify-center text-white text-[40px] font-semibold", BG[e.color])}>{e.hero.brand.slice(0, 1)}</div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* 案例 — 一大三小 */}
      {rest.length > 0 && (
        <section id="cases" className="py-7 md:py-10">
          <Container>
            <SectionTitle eyebrow="CASES · 作品" title="更多案例" moreHref={`/biz/${tenant}/cases`} moreClassName={TEXT[e.color]} />
            <div className="mt-4 grid grid-cols-3 gap-2.5 md:gap-3">
              {rest.map((c) => (
                <Link key={c.id} href={`/biz/${tenant}/cases/${c.id}`} className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface active:scale-[0.99] hover:shadow-lg md:hover:-translate-y-1 transition-all">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.cover} alt={c.title} className="absolute inset-0 h-full w-full object-cover md:transition-transform md:duration-500 md:group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                    <div className="text-[12px] md:text-[13px] font-medium line-clamp-1">{c.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 服务 — 编号列表 */}
      <section id="service" className="py-7 md:py-10 bg-surface">
        <Container>
          <SectionTitle eyebrow="SERVICES · 服务" title="我们提供" sub="点选直接预约" />
          <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-background overflow-hidden">
            {services.map((s, i) => (
              <Link key={s.t} href={`/biz/${tenant}/order?service=${encodeURIComponent(s.t)}`} className="group flex items-center gap-4 p-4 md:p-5 hover:bg-surface transition-colors active:scale-[0.99]">
                <span className={cn("text-[18px] md:text-[22px] font-semibold tabular-nums w-8 shrink-0", TEXT[e.color])}>{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold truncate">{s.t}</span>
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px]", SOFT[e.color])}>{s.h}</span>
                  </div>
                  <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground line-clamp-1">{s.d}</p>
                </div>
                <ChevronRight className={cn("h-4 w-4 shrink-0 group-hover:translate-x-0.5 transition-transform", TEXT[e.color])} />
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 团队 — 矩形（遵守风格锁） */}
      {team.length > 0 && (
        <section id="team" className="py-7 md:py-10">
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

      {/* 评价 — 单列大字引用 */}
      {reviews.length > 0 && (
        <section className="py-7 md:py-10 bg-surface">
          <Container>
            <SectionTitle eyebrow="REVIEWS · 口碑" title="业主真实评价" moreHref={`/biz/${tenant}/reviews`} moreClassName={TEXT[e.color]} />
            <div className="mt-4 space-y-3">
              {reviews.slice(0, 3).map((r) => (
                <div key={r.id} className="rounded-2xl border border-border bg-background p-4 md:p-5">
                  <p className="text-[14px] md:text-[15px] leading-7 text-foreground">&ldquo;{r.content}&rdquo;</p>
                  <div className="mt-3 flex items-center gap-2 text-[12px] text-muted-foreground">
                    <span className="font-medium text-foreground">{r.user}</span>
                    <span className="truncate">· {r.project}</span>
                    <span className="ml-auto inline-flex items-center gap-0.5 shrink-0"><Star className="h-3.5 w-3.5 fill-[#FFB400] text-[#FFB400]" />{r.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 联系 — 浅色 + 色条 */}
      <section id="contact" className="py-7 md:py-10">
        <Container>
          <div className="rounded-3xl border border-border bg-background p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 md:items-center">
            <div>
              <div className={cn("h-1 w-12 rounded-full mb-4", BG[e.color])} />
              <h2 className="text-[22px] md:text-[30px] font-semibold tracking-tight leading-tight">准备开工？联系 {e.hero.brand}</h2>
              <p className="mt-2 text-[13px] text-muted-foreground max-w-md leading-6">协会三重保障：履约险先行赔付 · 14 天调解 · 资金监管，放心托付。</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/biz/${tenant}/order`} className={cn("inline-flex items-center gap-1.5 h-11 px-5 rounded-full text-white text-[14px] font-medium", BG[e.color])}>提交需求 <ArrowRight className="h-4 w-4" /></Link>
                <a href={`tel:${e.contact.tel.replace(/-/g, "")}`} className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full border border-border text-[14px] hover:bg-surface"><Phone className="h-4 w-4" /> {e.contact.tel}</a>
              </div>
            </div>
            <ul className="space-y-2 text-[13px] text-muted-foreground md:border-l md:border-border md:pl-6">
              <li className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent-tea shrink-0" /> 工程履约险 · 合同 10% 内先行赔付</li>
              <li className="inline-flex items-center gap-2"><MessageSquareHeart className="h-4 w-4 text-accent-tea shrink-0" /> 14 天协会调解 · 纠纷免诉直达</li>
              <li className="inline-flex items-center gap-2"><Hammer className="h-4 w-4 text-accent-tea shrink-0" /> 资金监管账户 · 进度匹配付款</li>
            </ul>
          </div>
        </Container>
      </section>
    </div>
  );
}

// ============================================================
//  模板三：showcase（作品优先/画廊风）——压缩 Hero，首屏即大幅案例画廊
//  遵守全站风格锁：团队矩形照片、纵向网格、移动端紧凑、无横向滚动
// ============================================================
function ShowcaseTemplate({ e, tenant, cases, team, reviews }: TplProps) {
  const services = SERVICES[e.category] ?? SERVICES.decor;
  const catLabel = e.category === "build" ? "建筑企业" : e.category === "decor" ? "装修企业" : "设计企业";

  return (
    <div className="overflow-x-hidden">
      {/* HERO — 压缩条 */}
      <section className="py-5 md:py-7 border-b border-border">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap text-[11px] mb-2">
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium", SOFT[e.color])}>{catLabel}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-muted-foreground"><Star className="h-3 w-3 fill-[#FFB400] text-[#FFB400]" /> {e.rating.toFixed(1)} · {e.reviews}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-muted-foreground"><ShieldCheck className="h-3 w-3 text-accent-tea" /> 协会认证</span>
              </div>
              <h1 className="text-[22px] sm:text-[28px] md:text-[34px] font-semibold tracking-tight leading-tight break-words">{e.hero.tagline}</h1>
              <p className="mt-1.5 text-[13px] text-muted-foreground max-w-2xl leading-6 line-clamp-2">{e.short}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href={`/biz/${tenant}/order`} className={cn("inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-full text-white text-[14px] font-medium active:scale-[0.99]", BG[e.color])}>立即下单 <ArrowRight className="h-4 w-4" /></Link>
              <Link href={`/biz/${tenant}/inquiry`} className="inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-full border border-border text-[14px] hover:bg-surface"><MessageSquareText className="h-4 w-4" /> 咨询</Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 作品画廊 — 首屏主角，大幅网格 */}
      <section id="cases" className="py-6 md:py-9">
        <Container>
          <SectionTitle eyebrow="WORKS · 作品" title="作品画廊" moreHref={cases.length > 0 ? `/biz/${tenant}/cases` : undefined} moreClassName={TEXT[e.color]} />
          {cases.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
              {cases.slice(0, 6).map((c, i) => (
                <Link
                  key={c.id}
                  href={`/biz/${tenant}/cases/${c.id}`}
                  className={cn(
                    "group relative rounded-2xl overflow-hidden bg-surface active:scale-[0.99] hover:shadow-lg md:hover:-translate-y-1 transition-all",
                    i === 0 ? "col-span-2 md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto" : "aspect-[4/3]",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.cover} alt={c.title} className="absolute inset-0 h-full w-full object-cover md:transition-transform md:duration-500 md:group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <div className={cn("font-medium line-clamp-1", i === 0 ? "text-[15px] md:text-[18px]" : "text-[12px] md:text-[13px]")}>{c.title}</div>
                    {i === 0 && <div className="text-[11px] opacity-85">{[c.area && `${c.area}㎡`, c.tag].filter(Boolean).join(" · ")}</div>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-background p-8 text-center text-[13px] text-muted-foreground">
              案例陆续完善中 · 可先 <Link href={`/biz/${tenant}/inquiry`} className={TEXT[e.color]}>在线咨询</Link>。
            </div>
          )}
        </Container>
      </section>

      {/* 服务 — 紧凑胶囊 */}
      <section id="service" className="py-6 md:py-9 bg-surface">
        <Container>
          <SectionTitle eyebrow="SERVICES · 服务" title="我们提供" sub="点选直接预约" />
          <div className="mt-4 flex flex-wrap gap-2.5">
            {services.map((s) => (
              <Link key={s.t} href={`/biz/${tenant}/order?service=${encodeURIComponent(s.t)}`} className="group inline-flex items-center gap-2 rounded-full border border-border bg-background pl-3 pr-3.5 py-2 hover:shadow-md transition-all active:scale-[0.99]">
                <span className={cn("inline-flex h-6 w-6 rounded-full items-center justify-center text-[12px] font-semibold shrink-0", SOFT[e.color])}>{s.t.slice(0, 1)}</span>
                <span className="text-[13px] font-medium">{s.t}</span>
                <span className={cn("text-[10px] rounded-full px-1.5 py-0.5", SOFT[e.color])}>{s.h}</span>
                <ChevronRight className={cn("h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform", TEXT[e.color])} />
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 团队 — 矩形（遵守风格锁） */}
      {team.length > 0 && (
        <section id="team" className="py-6 md:py-9">
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

      {/* 评价 + 联系 — 紧凑收尾 */}
      {reviews.length > 0 && (
        <section className="py-6 md:py-9 bg-surface">
          <Container>
            <SectionTitle eyebrow="REVIEWS · 口碑" title="业主真实评价" moreHref={`/biz/${tenant}/reviews`} moreClassName={TEXT[e.color]} />
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {reviews.slice(0, 3).map((r) => (
                <div key={r.id} className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-[13px] leading-6 line-clamp-3 text-muted-foreground">&ldquo;{r.content}&rdquo;</p>
                  <div className="mt-2 flex items-center gap-2 text-[12px]">
                    <span className="font-medium">{r.user}</span>
                    <span className="ml-auto inline-flex items-center gap-0.5"><Star className="h-3.5 w-3.5 fill-[#FFB400] text-[#FFB400]" />{r.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section id="contact" className="py-6 md:py-9">
        <Container>
          <div className="rounded-3xl border border-border bg-background p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
            <div>
              <h2 className="text-[20px] md:text-[26px] font-semibold tracking-tight">准备开工？联系 {e.hero.brand}</h2>
              <p className="mt-1.5 text-[13px] text-muted-foreground">协会三重保障：履约险先行赔付 · 14 天调解 · 资金监管。</p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link href={`/biz/${tenant}/order`} className={cn("inline-flex items-center gap-1.5 h-11 px-5 rounded-full text-white text-[14px] font-medium", BG[e.color])}>提交需求 <ArrowRight className="h-4 w-4" /></Link>
              <a href={`tel:${e.contact.tel.replace(/-/g, "")}`} className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full border border-border text-[14px] hover:bg-surface"><Phone className="h-4 w-4" /> {e.contact.tel}</a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

// 模板注册表（standard 经典色块 / editorial 简约杂志 / showcase 作品画廊；新增模板在此登记即可）
const TEMPLATES: Record<string, typeof StandardTemplate> = {
  standard: StandardTemplate,
  editorial: EditorialTemplate,
  showcase: ShowcaseTemplate,
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
