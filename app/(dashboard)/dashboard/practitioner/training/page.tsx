import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, Clock, Sparkles, ChevronRight, MapPin, Users2, CheckCircle2 } from "lucide-react";
import { PractitionerShell } from "@/components/dashboard/practitioner-shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { listOpenTrainings, listEnrollmentsByPractitioner, countEnrolled } from "@/lib/data/training";
import { enrollTrainingAction } from "./actions";
import { effectivePractitionerPhone, isPractitionerPreview } from "@/lib/dashboard/preview";

export const metadata = { title: "培训 · 从业者门户" };

export default async function PractitionerTraining({ searchParams }: { searchParams: Promise<{ tok?: string; tdup?: string; terr?: string; pv?: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== "practitioner" && !isPractitionerPreview(session))) redirect("/login?role=practitioner");
  if (session.role === "practitioner" && session.pending) redirect("/dashboard/pending");
  const { tok, tdup, terr, pv } = await searchParams;

  const trainings = listOpenTrainings();
  const myEnrolls = listEnrollmentsByPractitioner(effectivePractitionerPhone(session));
  const enrolledSet = new Set(myEnrolls.map((e) => e.trainingId));

  return (
    <PractitionerShell title="培训 · 继续教育" subtitle={`${trainings.length} 门在招课程 · 已报名 ${myEnrolls.length}`}>
      {pv && <Banner>预览态为只读体验，操作未提交。以从业者本人账号登录后可正常报名。</Banner>}
      {tok && <Banner ok>报名成功！协会会通知开课时间与地点。</Banner>}
      {tdup && <Banner>你已报名该课程，无需重复报名。</Banner>}
      {terr && <Banner err>该课程已结束报名。</Banner>}

      <Link href="/ai/hr" className="block rounded-3xl bg-gradient-to-br from-foreground via-brand-600 to-brand text-white p-4 mb-4 active:scale-[0.99] transition-transform relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-yellow/20 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <span className="h-11 w-11 rounded-2xl bg-accent-yellow text-foreground inline-flex items-center justify-center shrink-0"><Sparkles className="h-5 w-5" /></span>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold">问 AI 小才 · 该考什么证 / 怎么报班</div>
            <div className="text-[11px] text-white/80 mt-0.5">按你的工种与工龄给建议</div>
          </div>
          <ChevronRight className="h-5 w-5" />
        </div>
      </Link>

      {trainings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-background p-10 text-center text-[13px] text-muted-foreground">暂无在招课程。协会发布培训后会出现在这里。</div>
      ) : (
        <div className="space-y-3">
          {trainings.map((t) => {
            const enrolled = enrolledSet.has(t.id);
            const count = countEnrolled(t.id);
            const full = t.capacity > 0 && count >= t.capacity;
            return (
              <div key={t.id} className="rounded-3xl border border-border bg-background p-5 relative overflow-hidden">
                <span className="absolute left-0 top-0 h-1 w-full bg-cat-design" />
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  <Badge tone="design">{t.category}</Badge>
                  <Badge tone={t.fee === "免费" ? "tea" : "build"}>{t.fee}</Badge>
                  <span className="text-[10px] text-muted-foreground ml-auto inline-flex items-center gap-0.5"><Users2 className="h-2.5 w-2.5" />{count}{t.capacity > 0 ? `/${t.capacity}` : ""} 人</span>
                </div>
                <div className="text-[14px] font-semibold leading-5">{t.title}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{t.instructor}</div>
                {t.detail && <p className="text-[12px] text-muted-foreground mt-2 leading-5 line-clamp-2">{t.detail}</p>}
                <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                  <span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{t.schedule}</span>
                  {t.location && <><span>·</span><span className="inline-flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{t.location}</span></>}
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-end">
                  {enrolled ? (
                    <span className="inline-flex items-center gap-1 h-10 px-4 rounded-full bg-[#e6f7f1] text-accent-tea text-[12px] font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> 已报名</span>
                  ) : full ? (
                    <span className="inline-flex items-center h-10 px-4 rounded-full bg-surface text-muted-foreground text-[12px]">名额已满</span>
                  ) : (
                    <form action={enrollTrainingAction}>
                      <input type="hidden" name="trainingId" value={t.id} />
                      <button className="h-10 px-5 rounded-full bg-foreground text-background text-[12px] font-medium inline-flex items-center gap-1 active:scale-95 transition-transform"><GraduationCap className="h-3.5 w-3.5" /> 报名</button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PractitionerShell>
  );
}

function Banner({ children, ok, err }: { children: React.ReactNode; ok?: boolean; err?: boolean }) {
  const cls = ok ? "border-accent-tea/30 bg-[#e6f7f1] text-accent-tea" : err ? "border-cat-decor/30 bg-cat-decor-soft text-cat-decor" : "border-border bg-surface text-foreground";
  return <div className={`mb-4 rounded-2xl border p-3.5 text-[13px] ${cls}`}>{children}</div>;
}
