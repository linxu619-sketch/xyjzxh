import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin, Sparkles, ChevronRight, Clock, ShieldCheck, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { PractitionerShell } from "@/components/dashboard/practitioner-shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { listOpenJobs, listApplicationsByPractitioner } from "@/lib/data/jobs";
import { applyJobAction } from "./actions";
import { effectivePractitionerPhone, isPractitionerPreview } from "@/lib/dashboard/preview";

export const metadata = { title: "找活 · 从业者门户" };

const STATUS_LABEL: Record<string, string> = { pending: "已投递 · 待企业处理", accepted: "已被录用 🎉", rejected: "未通过" };

export default async function PractitionerJobs({ searchParams }: { searchParams: Promise<{ aok?: string; adup?: string; aerr?: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== "practitioner" && !isPractitionerPreview(session))) redirect("/login?role=practitioner");
  const { aok, adup, aerr } = await searchParams;

  const jobs = listOpenJobs();
  const myApps = listApplicationsByPractitioner(effectivePractitionerPhone(session));
  const appliedMap = new Map(myApps.map((a) => [a.jobId, a.status]));
  const urgentCount = jobs.filter((j) => j.urgent).length;

  return (
    <PractitionerShell title="找活" subtitle={`${jobs.length} 个在招岗位${urgentCount > 0 ? ` · ${urgentCount} 急招` : ""} · 已投递 ${myApps.length}`}>
      {aok && <Banner ok>报名成功！企业会尽快查看你的投递，请留意电话。</Banner>}
      {adup && <Banner>你已报名过该岗位，无需重复报名。</Banner>}
      {aerr && <Banner err>该岗位已结束招聘，换一个试试。</Banner>}

      {/* AI 推荐 · 置顶 */}
      <Link href="/ai/hr" className="block rounded-3xl bg-gradient-to-br from-foreground via-brand-600 to-brand text-white p-4 mb-4 active:scale-[0.99] transition-transform relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-yellow/20 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <span className="h-11 w-11 rounded-2xl bg-accent-yellow text-foreground inline-flex items-center justify-center shrink-0"><Sparkles className="h-5 w-5" /></span>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold">问 AI 小才 · 帮你挑岗位 / 算工钱</div>
            <div className="text-[11px] text-white/80 mt-0.5">遇到欠薪还能让 TA 草拟申诉</div>
          </div>
          <ChevronRight className="h-5 w-5" />
        </div>
      </Link>

      {jobs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-background p-10 text-center text-[13px] text-muted-foreground">
          暂无在招岗位。协会会员企业发布后会实时出现在这里。
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => {
            const st = appliedMap.get(j.id);
            return (
              <div key={j.id} className="rounded-3xl border border-border bg-background p-4 relative overflow-hidden">
                <span className={`absolute left-0 top-0 h-1 w-full ${j.urgent ? "bg-cat-decor" : "bg-cat-build"}`} />
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  <Badge tone="brand">{j.openings} 名额</Badge>
                  {j.urgent && <Badge tone="decor">🔥 急招</Badge>}
                  <Badge tone="build">{j.kind}</Badge>
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-accent-tea ml-auto"><ShieldCheck className="h-2.5 w-2.5" /> 协会监管</span>
                </div>

                <div className="text-[14px] font-semibold leading-5">{j.title}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{j.enterpriseName}</div>
                {j.detail && <p className="text-[12px] text-muted-foreground mt-2 leading-5 line-clamp-2">{j.detail}</p>}

                <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                  <span className="inline-flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" /> {j.district || "信阳"}</span>
                  {j.duration && <><span>·</span><span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{j.duration}</span></>}
                </div>

                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <div className="text-[18px] font-semibold text-cat-decor tabular-nums">¥{j.daily}<span className="text-[10px] font-normal text-muted-foreground"> /天</span></div>
                  {st ? (
                    <span className={`inline-flex items-center gap-1 h-10 px-3.5 rounded-full text-[12px] font-medium ${st === "accepted" ? "bg-[#e6f7f1] text-accent-tea" : st === "rejected" ? "bg-surface text-muted-foreground" : "bg-surface text-foreground"}`}>
                      {st === "accepted" && <CheckCircle2 className="h-3.5 w-3.5" />}{STATUS_LABEL[st]}
                    </span>
                  ) : (
                    <form action={applyJobAction}>
                      <input type="hidden" name="jobId" value={j.id} />
                      <button className="h-10 px-4 rounded-full bg-foreground text-background text-[12px] font-medium inline-flex items-center gap-1 active:scale-95 transition-transform">
                        立即报名 <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 rounded-3xl bg-foreground text-background p-5 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-tea/30 blur-2xl" />
        <div className="relative flex items-start gap-3">
          <ShieldCheck className="h-6 w-6 text-accent-yellow mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="text-[14px] font-semibold">所有岗位 · 协会监管账户保障</div>
            <p className="mt-1.5 text-[12px] text-background/70 leading-5">工资由协会监管账户托管 · 如发生欠薪，<b className="text-accent-yellow">协会 7 天内先行垫付 ≤ 5 万</b>。</p>
          </div>
        </div>
      </div>
    </PractitionerShell>
  );
}

function Banner({ children, ok, err }: { children: React.ReactNode; ok?: boolean; err?: boolean }) {
  const cls = ok ? "border-accent-tea/30 bg-[#e6f7f1] text-accent-tea" : err ? "border-cat-decor/30 bg-cat-decor-soft text-cat-decor" : "border-border bg-surface text-foreground";
  return <div className={`mb-4 rounded-2xl border p-3.5 text-[13px] ${cls}`}>{children}</div>;
}
