import Link from "next/link";
import { ChevronRight, Briefcase, CheckCircle2, AlertCircle, Users2 } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { listJobsByEnterprise, countApplicants, type JobStatus } from "@/lib/data/jobs";
import { PostJobForm } from "./PostJobForm";
import { effectiveEnterpriseId } from "@/lib/dashboard/preview";

export const metadata = { title: "招聘管理 · 企业工作台" };

const FILTERABLE: JobStatus[] = ["open", "closed"];

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ f?: string; jok?: string; jerr?: string }> }) {
  const { f, jok, jerr } = await searchParams;
  const session = await getSession();
  const all = effectiveEnterpriseId(session) ? listJobsByEnterprise(effectiveEnterpriseId(session)!) : [];

  const active = f && FILTERABLE.includes(f as JobStatus) ? (f as JobStatus) : undefined;
  const list = active ? all.filter((j) => j.status === active) : all;
  const openCount = all.filter((j) => j.status === "open").length;
  const closedCount = all.filter((j) => j.status === "closed").length;
  const totalApps = all.reduce((a, j) => a + countApplicants(j.id), 0);
  const base = "/dashboard/enterprise/jobs";
  const href = (st: JobStatus) => (active === st ? base : `${base}?f=${st}`);

  return (
    <EnterpriseShell title="招聘管理" subtitle={`在招 ${openCount} 岗 · 累计投递 ${totalApps} 份`} actions={<PostJobForm />}>
      {jok && <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>岗位已发布！</b>从业者可在「找活」看到并报名。</div></div>}
      {jerr && <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 flex items-center gap-3"><AlertCircle className="h-5 w-5 shrink-0" /><div className="text-[13px]">发布失败：请填写岗位标题与工种。</div></div>}

      <StatFilters
        items={[
          { key: "open", label: "在招岗位", value: openCount, color: "text-cat-build", href: href("open"), active: active === "open" },
          { key: "closed", label: "已结束", value: closedCount, color: "text-muted-foreground", href: href("closed"), active: active === "closed" },
          { key: "apps", label: "累计投递", value: totalApps, color: "text-accent-tea" },
          { key: "all", label: "全部岗位", value: all.length, color: "text-cat-design", href: base, active: !active },
        ]}
      />

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold flex items-center justify-between">
          <span>招聘岗位 · 点击查看投递并处理</span>
          {active && <Link href={base} className="text-[12px] text-brand font-normal">清除筛选 ✕</Link>}
        </div>
        {list.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">
            {active ? "没有该状态的岗位。" : "还没有招聘岗位。点右上「发布岗位」发布第一个，从业者即可在「找活」报名。"}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((j) => {
              const apps = countApplicants(j.id);
              return (
                <li key={j.id}>
                  <Link href={`/dashboard/enterprise/jobs/${j.id}`} className="flex items-center gap-3 px-5 py-4 hover:bg-surface transition-colors">
                    <span className="h-9 w-9 rounded-xl bg-cat-build-soft text-cat-build inline-flex items-center justify-center shrink-0"><Briefcase className="h-4 w-4" /></span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{j.title}</span>
                        {j.urgent && <Badge tone="decor">急招</Badge>}
                      </div>
                      <div className="text-[12px] text-muted-foreground mt-0.5">{j.kind} · {j.district || "信阳"} · ¥{j.daily}/天 · {j.openings} 名额</div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[12px] text-accent-tea shrink-0"><Users2 className="h-3.5 w-3.5" />{apps} 投递</span>
                    <Badge tone={j.status === "open" ? "tea" : "neutral"} className="shrink-0">{j.status === "open" ? "在招" : "已结束"}</Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </EnterpriseShell>
  );
}
