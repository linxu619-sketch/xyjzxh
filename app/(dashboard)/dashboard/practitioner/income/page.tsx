import Link from "next/link";
import { redirect } from "next/navigation";
import { Wallet, Download, ShieldCheck, Sparkles, Building2, BarChart3, ChevronRight } from "lucide-react";
import { PractitionerShell } from "@/components/dashboard/practitioner-shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { listApplicationsByPractitioner, getJob } from "@/lib/data/jobs";
import { effectivePractitionerPhone, isPractitionerPreview } from "@/lib/dashboard/preview";

export const metadata = { title: "钱包 / 收入流水 · 从业者门户" };

function days(duration: string): number {
  const m = (duration || "").match(/(\d+)/);
  return m ? Number(m[1]) : 0;
}
function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default async function PractitionerIncome() {
  const session = await getSession();
  if (!session || (session.role !== "practitioner" && !isPractitionerPreview(session))) redirect("/login?role=practitioner");
  if (session.role === "practitioner" && session.pending) redirect("/dashboard/pending");

  // 收入来自「已录用」的岗位（日薪 × 工期推算，实际以结算为准）
  const apps = listApplicationsByPractitioner(effectivePractitionerPhone(session)).filter((a) => a.status === "accepted");
  const engagements = apps.map((a) => {
    const job = getJob(a.jobId);
    const d = job ? days(job.duration) : 0;
    const est = job ? job.daily * d : 0;
    return { id: a.id, title: job?.title ?? "已录用岗位", enterprise: job?.enterpriseName ?? "", daily: job?.daily ?? 0, duration: job?.duration ?? "", days: d, est, at: a.createdAt };
  });
  const totalEst = engagements.reduce((s, e) => s + e.est, 0);
  const known = engagements.filter((e) => e.days > 0).length;

  return (
    <PractitionerShell
      title="钱包 · 收入流水"
      subtitle={engagements.length ? `${engagements.length} 个录用岗位 · 预计收入 ¥${totalEst.toLocaleString()}` : "暂无收入记录"}
    >
      {engagements.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-background p-10 text-center text-[13px] text-muted-foreground">
          还没有收入记录。在 <Link href="/dashboard/practitioner/jobs" className="text-brand">找活</Link> 报名并被企业录用后，预计收入会汇总在这里，可申请协会盖章收入证明。
        </div>
      ) : (
        <>
          {/* 总览卡（真实推算） */}
          <div className="rounded-3xl bg-gradient-to-br from-cat-decor to-[#e6531f] text-white p-5 mb-4 relative overflow-hidden shadow-lg">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
            <Wallet className="relative h-7 w-7 text-accent-yellow" />
            <div className="relative mt-3 text-[11px] text-white/80 tracking-wider uppercase">录用岗位预计收入</div>
            <div className="relative mt-1 text-[40px] font-semibold tracking-tight leading-none tabular-nums">¥{totalEst.toLocaleString()}</div>
            <div className="relative mt-2 text-[11px] text-white/85">{engagements.length} 个录用岗位 · 实际收入以企业结算为准</div>
            <button className="relative mt-4 w-full h-12 rounded-full bg-accent-yellow text-foreground text-[13px] font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.99] transition-transform">
              <Download className="h-4 w-4" /> 申请协会盖章收入证明
            </button>
          </div>

          {/* 证明用途 */}
          <div className="rounded-2xl bg-[#e6f7f1] p-4 mb-4 flex items-start gap-2.5 text-[12px] text-accent-tea">
            <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="leading-5">收入证明由协会盖章，<b>河南省工行 / 建行 / 信阳农商行</b> 与 <b>市政务大厅</b> 均认可，可用于贷款 / 落户 / 子女入学。</div>
          </div>

          {/* 录用岗位明细 */}
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-[14px] font-semibold tracking-tight inline-flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5 text-muted-foreground" /> 录用岗位收入明细</h2>
            <span className="text-[10px] text-muted-foreground">{engagements.length} 项{known < engagements.length ? ` · ${engagements.length - known} 项长期` : ""}</span>
          </div>
          <div className="space-y-3">
            {engagements.map((e) => (
              <div key={e.id} className="rounded-3xl border border-border bg-background p-5">
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-lg bg-surface inline-flex items-center justify-center shrink-0"><Building2 className="h-4 w-4 text-cat-build" /></span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold truncate">{e.title}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{e.enterprise} · 录用于 {fmt(e.at)}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[18px] font-semibold text-cat-decor tabular-nums">{e.days > 0 ? `¥${e.est.toLocaleString()}` : "长期"}</div>
                    <div className="text-[10px] text-muted-foreground">¥{e.daily}/天{e.days > 0 ? ` × ${e.days}天` : ""}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Link href="/ai/hr" className="mt-4 block rounded-3xl bg-foreground text-background p-5 active:scale-[0.99] transition-transform">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-accent-yellow shrink-0" />
          <div className="flex-1">
            <div className="text-[14px] font-semibold">AI 小才 · 收入证明咨询</div>
            <div className="text-[11px] text-background/70 mt-0.5">「贷 30 万要补几张项目记录？」</div>
          </div>
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>
    </PractitionerShell>
  );
}
