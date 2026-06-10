import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin, Sparkles, ChevronRight, Clock, ShieldCheck, ArrowUpRight, CheckCircle2, SlidersHorizontal } from "lucide-react";
import { PractitionerShell } from "@/components/dashboard/practitioner-shell";
import { JobHireSwitcher } from "@/components/dashboard/job-hire-switcher";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { listOpenJobs, listApplicationsByPractitioner } from "@/lib/data/jobs";
import { getPractitionerByPhone } from "@/lib/data/practitioners-source";
import { matchJobs, type JobMatch } from "@/lib/data/job-matching";
import { applyJobAction } from "./actions";
import { effectivePractitionerPhone, isPractitionerPreview } from "@/lib/dashboard/preview";

export const metadata = { title: "找活 · 从业者门户" };

const STATUS_LABEL: Record<string, string> = { pending: "已投递 · 待企业处理", accepted: "已被录用 🎉", rejected: "未通过" };

export default async function PractitionerJobs({ searchParams }: { searchParams: Promise<{ aok?: string; adup?: string; aerr?: string; pv?: string; all?: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== "practitioner" && !isPractitionerPreview(session))) redirect("/login?role=practitioner");
  const { aok, adup, aerr, pv, all } = await searchParams;

  const phone = effectivePractitionerPhone(session);
  const me = getPractitionerByPhone(phone);
  const myApps = listApplicationsByPractitioner(phone);
  const appliedMap = new Map(myApps.map((a) => [a.jobId, a.status]));

  // 双向匹配：按从业者资料把岗位分成「适配」与「其他」
  const { matched, others } = matchJobs(
    {
      canKinds: me?.canKinds ?? [],
      canDistricts: me?.canDistricts ?? [],
      birthYear: me?.birthYear ?? null,
      expectDaily: me?.expectDaily ?? null,
      expectDailyMax: me?.expectDailyMax ?? null,
      years: me?.years ?? 0,
      city: me?.city ?? "",
      gender: me?.gender ?? "",
      hasCert: me?.hasCert ?? null,
    },
    listOpenJobs(),
  );
  const showAll = all === "1";
  const infoIncomplete = !me?.birthYear || !me?.expectDaily;

  return (
    <PractitionerShell title="找活" subtitle={`零工 · 日薪 · 适配 ${matched.length} 个 · 共 ${matched.length + others.length} 个在招 · 已报名 ${myApps.length}`}>
      <JobHireSwitcher active="gig" />
      {pv && <Banner>预览态为只读体验，操作未提交。以从业者本人账号登录后可正常报名。</Banner>}
      {aok && <Banner ok>报名成功！企业会尽快查看你的投递，请留意电话。</Banner>}
      {adup && <Banner>你已报名过该岗位，无需重复报名。</Banner>}
      {aerr && <Banner err>该岗位已结束招聘，换一个试试。</Banner>}

      {/* 完善资料提示（资料不全则推得不准）*/}
      {infoIncomplete && (
        <Link href="/dashboard/practitioner/profile/edit" className="block rounded-2xl border border-[#f6c915]/40 bg-[#fff6d6] text-[#a37200] p-3.5 mb-4 active:scale-[0.99] transition-transform">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="h-4 w-4 shrink-0" />
            <div className="flex-1 text-[12.5px] leading-5">完善「工种 / 出生年 / 期望日薪 / 可接区域」，岗位推荐更准——只推你会做、够格、够价、就近的。</div>
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>
      )}

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

      {/* 适配岗位 */}
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-[14px] font-semibold tracking-tight">为你推荐 · {matched.length} 个适配岗位</h3>
      </div>
      {matched.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-background p-8 text-center text-[13px] text-muted-foreground">
          暂无完全适配你资料的岗位。<br />
          <Link href="/dashboard/practitioner/profile/edit" className="text-brand">完善找活资料</Link>
          {others.length > 0 && <> 或 <Link href="/dashboard/practitioner/jobs?all=1" className="text-brand">查看全部 {others.length} 个岗位</Link></>}。
        </div>
      ) : (
        <div className="space-y-3">
          {matched.map((m) => <JobCard key={m.job.id} m={m} st={appliedMap.get(m.job.id)} />)}
        </div>
      )}

      {/* 查看全部（不完全适配的岗位，附「差在哪」）*/}
      {others.length > 0 && (
        showAll ? (
          <>
            <div className="flex items-center justify-between px-1 mt-6 mb-2">
              <h3 className="text-[14px] font-semibold tracking-tight text-muted-foreground">其他岗位 · {others.length} 个（不完全适配）</h3>
              <Link href="/dashboard/practitioner/jobs" className="text-[12px] text-brand">收起</Link>
            </div>
            <div className="space-y-3">
              {others.map((m) => <JobCard key={m.job.id} m={m} st={appliedMap.get(m.job.id)} dim />)}
            </div>
          </>
        ) : (
          <Link href="/dashboard/practitioner/jobs?all=1" className="mt-4 block rounded-2xl border border-border bg-background p-3.5 text-center text-[13px] text-brand active:scale-[0.99] transition-transform">
            查看全部 {others.length} 个岗位（含不完全适配，会标注差在哪）
          </Link>
        )
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

function JobCard({ m, st, dim }: { m: JobMatch; st?: string; dim?: boolean }) {
  const j = m.job;
  return (
    <div className={`rounded-3xl border border-border bg-background p-4 relative overflow-hidden ${dim ? "opacity-90" : ""}`}>
      <span className={`absolute left-0 top-0 h-1 w-full ${j.urgent ? "bg-cat-decor" : dim ? "bg-border" : "bg-cat-build"}`} />
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <Badge tone="brand">{j.openings} 名额</Badge>
        {j.urgent && <Badge tone="decor">🔥 急招</Badge>}
        <Badge tone="build">{j.kind}</Badge>
        {j.insurance === "company" && <Badge tone="tea" className="inline-flex items-center gap-0.5"><ShieldCheck className="h-2.5 w-2.5" />含工伤险</Badge>}
        <span className="inline-flex items-center gap-0.5 text-[10px] text-accent-tea ml-auto"><ShieldCheck className="h-2.5 w-2.5" /> 协会监管</span>
      </div>

      <div className="text-[14px] font-semibold leading-5">{j.title}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{j.enterpriseName}</div>

      {/* 匹配理由 / 差距 */}
      {(m.reasons.length > 0 || m.gaps.length > 0) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {m.reasons.map((r) => (
            <span key={r} className="inline-flex items-center gap-0.5 text-[10px] rounded-full bg-[#e6f7f1] text-accent-tea px-2 py-0.5">✓ {r}</span>
          ))}
          {dim && m.gaps.map((g) => (
            <span key={g} className="inline-flex items-center gap-0.5 text-[10px] rounded-full bg-cat-decor-soft text-cat-decor px-2 py-0.5">✗ {g}</span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
        <span className="inline-flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" /> {j.district || "信阳"}</span>
        {j.duration && <><span>·</span><span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{j.duration}</span></>}
        {(j.minAge || j.maxAge) && <><span>·</span><span>年龄 {j.minAge ?? "不限"}-{j.maxAge ?? "不限"}</span></>}
        {j.minYears > 0 && <><span>·</span><span>经验 ≥{j.minYears}年</span></>}
        {j.genderReq && <><span>·</span><span>限{j.genderReq}</span></>}
        {j.needCert && <><span>·</span><span>需持证</span></>}
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
        <div className="text-[18px] font-semibold text-cat-decor tabular-nums">¥{j.daily}{j.dailyMax && j.dailyMax > j.daily ? `-${j.dailyMax}` : ""}<span className="text-[10px] font-normal text-muted-foreground"> /天</span></div>
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
}

function Banner({ children, ok, err }: { children: React.ReactNode; ok?: boolean; err?: boolean }) {
  const cls = ok ? "border-accent-tea/30 bg-[#e6f7f1] text-accent-tea" : err ? "border-cat-decor/30 bg-cat-decor-soft text-cat-decor" : "border-border bg-surface text-foreground";
  return <div className={`mb-4 rounded-2xl border p-3.5 text-[13px] ${cls}`}>{children}</div>;
}
