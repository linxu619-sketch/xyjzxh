import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, ShieldCheck, Briefcase, GraduationCap, Building2, ArrowUpRight, Sparkles } from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { listRecruitmentJobs, getRecruitmentJob } from "@/lib/data/talents-source";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { cn } from "@/lib/cn";

export const metadata = { title: "职位详情 · 人才中心 · 信阳市建筑装饰装修协会" };

const TONE: Record<string, "build" | "decor" | "design"> = { build: "build", decor: "decor", design: "design" };

export default async function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const j = getRecruitmentJob(id);
  if (!j) notFound();
  const ent = await getEnterpriseBySlugOrId(j.enterpriseId);
  const related = listRecruitmentJobs().filter((x) => x.id !== j.id && x.category === j.category).slice(0, 4);

  return (
    <Container className="py-6 md:py-10 max-w-3xl">
      <Link href="/talents" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回人才中心
      </Link>

      <div className="rounded-3xl border border-border bg-background p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge tone={TONE[j.category]}>{j.type}</Badge>
              {j.hot && <Badge tone="decor">🔥 急招</Badge>}
              <span className="text-[11px] text-muted-foreground">{j.postedAt} 发布</span>
            </div>
            <h1 className="text-[22px] md:text-[28px] font-semibold tracking-tight">{j.title}</h1>
            <div className="mt-1.5 text-[13px] text-muted-foreground inline-flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{j.enterprise}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{j.district}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[22px] md:text-[26px] font-semibold text-cat-decor leading-none">{j.salaryMin}-{j.salaryMax}<span className="text-[13px] font-normal text-muted-foreground"> K</span></div>
            <div className="text-[11px] text-muted-foreground mt-1">月薪</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Meta icon={Briefcase} label="经验" value={j.experience} />
          <Meta icon={GraduationCap} label="学历" value={j.education} />
          <Meta icon={Building2} label="类型" value={j.type} />
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {j.tags.map((t) => (
            <span key={t} className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] text-muted-foreground">{t}</span>
          ))}
        </div>
      </div>

      {/* 职位描述（按字段生成）*/}
      <div className="mt-4 rounded-2xl border border-border bg-background p-5">
        <h2 className="text-[16px] font-semibold mb-2">职位要求</h2>
        <ul className="space-y-1.5 text-[13px] leading-6 text-muted-foreground">
          <li>· 岗位：{j.title}（{j.type}）· 工作地点 {j.district}</li>
          <li>· 经验要求：{j.experience}；学历要求：{j.education}</li>
          <li>· 技能 / 方向：{j.tags.join("、")}</li>
          <li>· 薪资范围：{j.salaryMin}-{j.salaryMax}K（按能力与项目面议，协会会员单位五险）</li>
        </ul>
        <div className="mt-3 text-[12px] text-muted-foreground inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> 协会认证企业发布 · 招聘信息真实可追溯
        </div>
      </div>

      {/* 投递 / 企业 */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/dashboard/practitioner/jobs" className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-foreground text-background text-[14px] font-medium hover:bg-brand transition-colors">
          投递简历 <ArrowUpRight className="h-4 w-4" />
        </Link>
        {ent && (
          <Link href={`/biz/${ent.slug}`} className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full border border-border text-[14px] hover:bg-surface">
            <Building2 className="h-4 w-4" /> 查看企业
          </Link>
        )}
        <Link href="/ai/hr" className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full border border-border text-[14px] hover:bg-surface">
          <Sparkles className="h-4 w-4 text-cat-decor" /> 问 AI 小才
        </Link>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">投递需以从业者身份登录，在工作台「找活」中完成报名与简历投递。</p>

      {/* 相关职位 */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-[16px] md:text-[18px] font-semibold tracking-tight mb-3">相似职位</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {related.map((r) => (
              <Link key={r.id} href={`/talents/${r.id}`} className={cn("rounded-2xl border border-border bg-background p-4 hover:shadow-md transition-all hover:-translate-y-0.5")}>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[14px] font-semibold truncate">{r.title}</div>
                  <div className="text-[13px] font-semibold text-cat-decor shrink-0">{r.salaryMin}-{r.salaryMax}K</div>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">{r.enterprise} · {r.district} · {r.experience}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}

function Meta({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-2.5">
      <Icon className="h-4 w-4 mx-auto text-muted-foreground" />
      <div className="text-[13px] font-medium mt-1 truncate">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
