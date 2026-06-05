import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, Tag, ArrowRight, Phone, MessageSquareText, Star, Award, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { getCase, listCasesByEnterprise } from "@/lib/data/cases";
import { listTeamByEnterprise } from "@/lib/data/team";
import { CaseGallery } from "./CaseGallery";
import { cn } from "@/lib/cn";

const BG: Record<string, string> = { build: "bg-cat-build", decor: "bg-cat-decor", design: "bg-cat-design", tea: "bg-accent-tea", brand: "bg-brand" };

export default async function CaseDetail({ params }: { params: Promise<{ tenant: string; id: string }> }) {
  const { tenant, id } = await params;
  const e = await getEnterpriseBySlugOrId(tenant);
  if (!e) notFound();
  const c = getCase(Number(id));
  if (!c || c.enterpriseId !== e.id) notFound();
  const others = listCasesByEnterprise(e.id).filter((x) => x.id !== c.id).slice(0, 3);
  const team = listTeamByEnterprise(e.id).slice(0, 4);
  const catLabel = e.category === "build" ? "建筑企业" : e.category === "decor" ? "装修企业" : "设计企业";

  return (
    <div className="overflow-x-hidden">
      <Container className="py-6 md:py-10 max-w-5xl">
        <Link href={`/biz/${tenant}#cases`} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> 返回 {e.hero.brand} · 案例
        </Link>

        {/* 图集：一大四小 + 点击看大图 */}
        <CaseGallery images={c.images.length ? c.images : (c.cover ? [c.cover] : [])} title={c.title} />

        {/* 标题 + 元信息 */}
        <div className="mt-5 md:mt-7">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {c.tag && <Badge tone={e.color === "build" ? "build" : e.color === "design" ? "design" : "decor"} className="inline-flex items-center gap-1"><Tag className="h-3 w-3" />{c.tag}</Badge>}
            <span className="inline-flex items-center gap-1 text-[12px] text-accent-tea"><ShieldCheck className="h-3.5 w-3.5" />协会认证企业作品</span>
          </div>
          <h1 className="text-[24px] md:text-[36px] font-semibold tracking-tight leading-tight">{c.title}</h1>
        </div>

        {/* 项目概况 */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Fact label="户型 / 空间" value={c.tag || "—"} />
          <Fact label="建筑面积" value={c.area ? `${c.area} ㎡` : "—"} />
          <Fact label="设计施工" value={e.name} />
          <Fact label="质保保障" value="协会兜底" />
        </div>

        {/* 项目说明 */}
        <div className="mt-7">
          <h2 className="text-[16px] md:text-[18px] font-semibold tracking-tight mb-3">项目说明</h2>
          <p className="text-[14px] md:text-[15px] leading-7 md:leading-8 text-foreground whitespace-pre-line">
            {c.detail || `本案例由协会认证企业 ${e.name} 设计施工。`}
          </p>
          <p className="mt-3 text-[13px] leading-7 text-muted-foreground">
            {e.short}
          </p>
          {/* 协会级保障(平台真实承诺) */}
          <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              "协会认证企业施工，资质与口碑经核验",
              "可投工程履约险，企业跑路也能先行赔付",
              "纠纷 14 天协会调解兜底，免诉化解",
              "资金可进监管账户，按施工进度匹配付款",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent-tea shrink-0 mt-0.5" /> {t}
              </li>
            ))}
          </ul>
        </div>

        {/* 设计 · 施工团队 */}
        {team.length > 0 && (
          <div className="mt-9">
            <h2 className="text-[16px] md:text-[18px] font-semibold tracking-tight">设计 · 施工团队</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">这套案例由 {e.hero.brand} 的专业团队操刀，点开了解每位负责人。</p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {team.map((m) => (
                <Link key={m.id} href={`/biz/${tenant}/team/${m.id}`} className="group rounded-2xl border border-border bg-background overflow-hidden active:scale-[0.99] hover:shadow-md transition-all">
                  <div className="relative aspect-[3/4] bg-surface">
                    {m.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.photo} alt={m.name} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <div className={cn("absolute inset-0 flex items-center justify-center text-white text-[28px] font-semibold", BG[e.color])}>{m.name.slice(0, 1)}</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-[14px] font-semibold truncate">{m.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{m.role}</div>
                    {m.bio && <p className="mt-1.5 text-[11px] text-muted-foreground leading-5 line-clamp-2">{m.bio}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 关于企业 */}
        <div className="mt-9 rounded-3xl border border-border bg-background p-5 md:p-6">
          <div className="flex items-center gap-3">
            <span className={cn("h-12 w-12 rounded-2xl text-white inline-flex items-center justify-center font-semibold shrink-0", BG[e.color])}>{e.hero.brand.slice(0, 1)}</span>
            <div className="min-w-0 flex-1">
              <div className="text-[16px] font-semibold tracking-tight truncate">{e.name}</div>
              <div className="text-[12px] text-muted-foreground truncate">{catLabel} · {e.district} · 成立 {e.founded}</div>
            </div>
            <Link href={`/biz/${tenant}`} className="shrink-0 inline-flex items-center gap-1 text-[13px] text-brand hover:underline">进入企业 <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-surface/60 py-3">
              <div className="text-[18px] font-semibold inline-flex items-center gap-1 justify-center"><Star className="h-4 w-4 fill-[#FFB400] text-[#FFB400]" />{e.rating.toFixed(1)}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{e.reviews} 条评价</div>
            </div>
            <div className="rounded-2xl bg-surface/60 py-3">
              <div className="text-[18px] font-semibold tabular-nums">{e.cases}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">案例作品</div>
            </div>
            <div className="rounded-2xl bg-surface/60 py-3">
              <div className="text-[18px] font-semibold inline-flex items-center gap-1 justify-center"><Award className="h-4 w-4 text-accent-tea" /></div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{e.qualification || "协会认证"}</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className={cn("mt-7 md:mt-9 rounded-3xl text-white p-6 md:p-8 relative overflow-hidden", BG[e.color])}>
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-[18px] md:text-[22px] font-semibold">想要同款效果？</div>
              <div className="text-[13px] text-white/85 mt-1">由 {e.hero.brand} 为你量身设计 · 协会担保 · 14 天调解兜底</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href={`/biz/${tenant}/order`} className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-full bg-white text-foreground text-[14px] font-medium hover:bg-accent-yellow transition-colors">
                预约 / 下单 <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={`/biz/${tenant}/inquiry`} className="inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-full border border-white/40 text-white text-[14px] hover:bg-white/10">
                <MessageSquareText className="h-4 w-4" /> 咨询
              </Link>
            </div>
          </div>
        </div>

        {/* 其他案例 */}
        {others.length > 0 && (
          <div className="mt-10 md:mt-14">
            <h2 className="text-[18px] md:text-[22px] font-semibold tracking-tight mb-4">该企业其他案例</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {others.map((o) => (
                <Link key={o.id} href={`/biz/${tenant}/cases/${o.id}`} className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-foreground/5 hover:shadow-lg transition-all md:hover:-translate-y-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.cover} alt={o.title} className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-[13px] font-medium line-clamp-1">{o.title}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">{[o.area && `${o.area}㎡`, o.tag].filter(Boolean).join(" · ")}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 联系条 */}
        <div className="mt-10 rounded-2xl border border-border bg-surface p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-[13px] text-muted-foreground">电话咨询 {e.hero.brand}</div>
          <a href={`tel:${e.contact.tel.replace(/-/g, "")}`} className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-foreground text-background text-[13px] font-medium">
            <Phone className="h-4 w-4" /> {e.contact.tel}
          </a>
        </div>
      </Container>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3.5">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-1 text-[14px] font-semibold tracking-tight truncate">{value}</div>
    </div>
  );
}
