import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, Ruler, Tag, ArrowRight, Phone, MessageSquareText } from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { getCase, listCasesByEnterprise } from "@/lib/data/cases";
import { cn } from "@/lib/cn";

const BG: Record<string, string> = { build: "bg-cat-build", decor: "bg-cat-decor", design: "bg-cat-design" };

export default async function CaseDetail({ params }: { params: Promise<{ tenant: string; id: string }> }) {
  const { tenant, id } = await params;
  const e = await getEnterpriseBySlugOrId(tenant);
  if (!e) notFound();
  const c = getCase(Number(id));
  if (!c || c.enterpriseId !== e.id) notFound();
  const others = listCasesByEnterprise(e.id).filter((x) => x.id !== c.id).slice(0, 3);

  return (
    <div className="overflow-x-hidden">
      <Container className="py-6 md:py-10 max-w-5xl">
        <Link href={`/biz/${tenant}#cases`} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> 返回 {e.hero.brand} · 案例
        </Link>

        {/* 图集（1-10 张）：首图大图 + 其余网格 */}
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-foreground/5 aspect-[16/10] md:aspect-[16/9]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.images[0] || c.cover} alt={c.title} className="absolute inset-0 w-full h-full object-cover" />
        </div>
        {c.images.length > 1 && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {c.images.slice(1).map((u, i) => (
              <div key={i} className="relative aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden bg-foreground/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt={`${c.title} ${i + 2}`} className="absolute inset-0 w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* 标题 + 元信息 */}
        <div className="mt-5 md:mt-7">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {c.tag && <Badge tone={e.color === "build" ? "build" : e.color === "design" ? "design" : "decor"} className="inline-flex items-center gap-1"><Tag className="h-3 w-3" />{c.tag}</Badge>}
            {c.area && <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground"><Ruler className="h-3.5 w-3.5" />{c.area} ㎡</span>}
            <span className="inline-flex items-center gap-1 text-[12px] text-accent-tea"><ShieldCheck className="h-3.5 w-3.5" />协会认证企业作品</span>
          </div>
          <h1 className="text-[24px] md:text-[36px] font-semibold tracking-tight leading-tight">{c.title}</h1>
          <p className="mt-4 text-[14px] md:text-[15px] leading-7 md:leading-8 text-muted-foreground whitespace-pre-line">
            {c.detail || "本案例由企业在协会平台维护。想了解该项目的设计思路、选材与报价，欢迎在线咨询或预约到店详谈。"}
          </p>
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
