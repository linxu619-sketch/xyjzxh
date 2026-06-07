import Link from "next/link";
import { requireLogin } from "@/lib/auth/guard";
import { Briefcase, ArrowUpRight, GraduationCap, ShieldCheck, MapPin, Sparkles } from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listRecruitmentJobs, listCertificates } from "@/lib/data/talents-source";
import { listOpenTrainings, countEnrolled } from "@/lib/data/training";

const TONE: Record<string, "build" | "decor" | "design"> = {
  build: "build", decor: "decor", design: "design",
};

export const metadata = { title: "人才中心 · 信阳市建筑装饰装修协会" };

export default async function TalentsPage() {
  await requireLogin();
  const JOBS = listRecruitmentJobs();
  const CERTIFICATES = listCertificates();
  const TRAININGS = listOpenTrainings().slice(0, 4).map((t) => ({
    id: t.id, tag: t.category, date: t.schedule || "待定", title: t.title,
    enrolled: countEnrolled(t.id), seats: t.capacity, feeText: t.fee || "免费",
  }));
  return (
    <>
      <PageHeader
        eyebrow="TALENTS · 人才中心"
        tone="tea"
        title={<>本地行业人才 <br className="md:hidden" />招聘 · 求职 · 培训</>}
        description="协会会员单位优质岗位 · 双向匹配 · 证书在线查询 · 培训认证一站式。"
        actions={
          <>
            <Button href="/ai/hr" variant="secondary">AI 小才匹配</Button>
            <Button href="/dashboard/enterprise/jobs" variant="outline">发布岗位</Button>
          </>
        }
      />

      <Container className="py-12 md:py-16">
        {/* 岗位 */}
        <section>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-[24px] md:text-[28px] font-semibold tracking-tight">最新职位</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {JOBS.map((j) => (
              <Link key={j.id} href={`/talents/${j.id}`} className="group rounded-3xl border border-border bg-background p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge tone={TONE[j.category]}>{j.type}</Badge>
                      {j.hot && <Badge tone="decor">🔥 急招</Badge>}
                      <span className="text-[11px] text-muted-foreground">{j.postedAt}</span>
                    </div>
                    <h3 className="text-[18px] font-semibold tracking-tight group-hover:text-brand">{j.title}</h3>
                    <div className="text-[12px] text-muted-foreground mt-1">
                      {j.enterprise} · <MapPin className="h-3 w-3 inline" /> {j.district} · {j.experience} · {j.education}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[18px] font-semibold text-cat-decor">{j.salaryMin}-{j.salaryMax}<span className="text-[12px] font-normal text-muted-foreground">K</span></div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {j.tags.map((t) => (
                    <span key={t} className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] text-muted-foreground">{t}</span>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">协会认证企业 <ShieldCheck className="h-3 w-3 inline text-accent-tea" /></span>
                  <span className="inline-flex items-center gap-1 text-brand font-medium">投递 <ArrowUpRight className="h-3 w-3" /></span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 证书查询 */}
        <section className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-border bg-background p-6 md:p-8">
            <ShieldCheck className="h-7 w-7 text-accent-tea" />
            <h3 className="mt-4 text-[22px] font-semibold tracking-tight">证书查询</h3>
            <p className="mt-2 text-[13px] text-muted-foreground">输入证书编号或姓名查询本地从业人员证书真伪。</p>
            <div className="mt-5 flex gap-2">
              <input placeholder="证书编号 / 姓名" className="flex-1 h-12 rounded-xl border border-border px-4 outline-none focus:border-foreground/30 text-[14px]" />
              <button className="h-12 px-6 rounded-xl bg-foreground text-background text-[13px] font-medium">查询</button>
            </div>
            <div className="mt-6 text-[12px] text-muted-foreground mb-2">最近查询示例</div>
            <ul className="space-y-2">
              {CERTIFICATES.map((c) => (
                <li key={c.code} className="rounded-xl bg-surface p-3 flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-cat-design" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{c.holder} · {c.enterprise} · 颁发 {c.issued}</div>
                  </div>
                  <code className="text-[10px] text-muted-foreground">{c.code}</code>
                </li>
              ))}
            </ul>
          </div>

          {/* 培训 */}
          <div className="rounded-3xl bg-foreground text-background p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cat-design/30 blur-2xl" />
            <Briefcase className="relative h-7 w-7 text-accent-yellow" />
            <h3 className="relative mt-4 text-[22px] font-semibold tracking-tight">即将开班 · 培训认证</h3>
            <p className="relative mt-2 text-[13px] text-background/70">协会会员单位员工享 7 折优惠</p>
            <ul className="relative mt-6 space-y-3">
              {TRAININGS.map((t) => (
                <li key={t.id} className="rounded-2xl bg-white/10 backdrop-blur p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] tracking-wider uppercase text-accent-yellow">{t.tag}</span>
                    <span className="text-[11px] text-background/70">{t.date}</span>
                  </div>
                  <div className="text-[14px] font-semibold">{t.title}</div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-background/70">已报 {t.enrolled}/{t.seats || "不限"}</span>
                    <span className="font-semibold">{t.feeText}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="mt-16 rounded-[28px] bg-brand-50 p-7 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-7 w-7 text-brand mt-0.5" />
            <div>
              <div className="text-[18px] md:text-[22px] font-semibold">不知道该投哪个？</div>
              <div className="text-[13px] text-muted-foreground mt-1">AI 小才根据您的简历自动匹配最合适的 3 个岗位。</div>
            </div>
          </div>
          <Button href="/ai/hr" variant="primary">问问小才</Button>
        </div>
      </Container>
    </>
  );
}
