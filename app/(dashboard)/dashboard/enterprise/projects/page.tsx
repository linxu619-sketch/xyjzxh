import Link from "next/link";
import { Plus, Eye, Search, Sparkles, ShieldCheck } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { FilterBar, DataTable } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { PROJECTS, STATUS_META } from "@/lib/data/projects";
import { getSession } from "@/lib/auth/session";
import { listReportsByUid } from "@/lib/data/reports";

export const metadata = { title: "项目与报备 · 企业工作台" };

const TYPE_TONE = { 家装: "decor", 工装: "build", 公装: "design", 市政: "tea" } as const;
const RPT_STATUS: Record<string, string> = { pending: "待审核", approved: "已通过", rejected: "已驳回" };

export default async function ProjectsPage() {
  const session = await getSession();
  const myReports = session ? listReportsByUid(session.uid) : [];
  return (
    <EnterpriseShell
      title="项目与报备"
      subtitle={`进行中 ${PROJECTS.filter((p) => p.status === "in-progress").length} · 待审 ${PROJECTS.filter((p) => p.status === "submitted" || p.status === "reviewing").length} · 已竣工 ${PROJECTS.filter((p) => p.status === "completed").length}`}
      actions={
        <Link href="/projects/new" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> 新建报备
        </Link>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { l: "进行中", v: PROJECTS.filter((p) => p.status === "in-progress").length, c: "text-cat-build" },
          { l: "待审", v: PROJECTS.filter((p) => p.status === "submitted" || p.status === "reviewing").length, c: "text-cat-decor" },
          { l: "已购履约险", v: PROJECTS.filter((p) => p.insured).length, c: "text-accent-tea" },
          { l: "本月新增", v: 8, c: "text-cat-design" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-background p-5">
            <div className="text-[11px] text-muted-foreground tracking-wider uppercase">{s.l}</div>
            <div className={`mt-1 text-[28px] font-semibold tracking-tight ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* 我提交的报备（实时，本企业账号） */}
      <div className="rounded-2xl border border-border bg-background overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="text-[14px] font-semibold">我提交的报备（实时）</div>
          <Badge tone={myReports.length ? "build" : "tea"}>{myReports.length} 条</Badge>
        </div>
        {myReports.length === 0 ? (
          <div className="px-5 py-8 text-center text-[13px] text-muted-foreground">
            还没有在线报备。点右上「新建报备」走一遍 <Link href="/projects/new" className="text-brand">/projects/new</Link>，提交后会出现在这里。
          </div>
        ) : (
          <div className="divide-y divide-border">
            {myReports.map((r) => (
              <div key={r.id} className="px-5 py-3.5 flex items-center gap-3 text-[13px]">
                <code className="text-[12px] font-mono text-muted-foreground shrink-0">{r.code}</code>
                <span className="font-medium truncate flex-1">{r.project}</span>
                <span className="text-muted-foreground shrink-0 hidden sm:inline">{r.area || "—"}㎡ · {r.budget || "—"}万</span>
                <Badge tone={r.status === "approved" ? "tea" : r.status === "rejected" ? "decor" : "yellow"}>{RPT_STATUS[r.status] ?? r.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <FilterBar className="mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <input placeholder="搜索报备号 / 项目" className="flex-1 bg-transparent outline-none text-[13px] py-1" />
        </div>
        <select className="h-9 rounded-full bg-surface text-[12px] px-3 border border-transparent">
          <option>状态：全部</option><option>草稿</option><option>待审</option><option>施工中</option><option>已竣工</option>
        </select>
        <button className="h-9 px-3 rounded-full bg-surface text-[12px] inline-flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-cat-decor" /> AI 预审
        </button>
      </FilterBar>

      <DataTable
        head={["报备号", "项目名称", "类型", "面积 / 预算", "工期", "状态", "进度", "操作"]}
        rows={PROJECTS.map((p) => [
          <code key="i" className="text-[12px] font-mono">{p.id}</code>,
          <span key="n" className="font-medium">{p.name}{p.insured && <ShieldCheck className="h-3.5 w-3.5 inline ml-1.5 text-accent-tea" />}</span>,
          <Badge key="t" tone={TYPE_TONE[p.type]}>{p.type}</Badge>,
          <span key="a" className="text-muted-foreground">{p.area}㎡ · {p.budget}万</span>,
          <span key="d" className="text-[11px] text-muted-foreground">{p.startDate}<br />{p.endDate}</span>,
          <Badge key="s" tone={STATUS_META[p.status].tone as "brand"}>{STATUS_META[p.status].label}</Badge>,
          <div key="g" className="min-w-[120px]">
            <div className="h-1.5 rounded-full bg-surface w-24"><div className="h-full rounded-full bg-cat-decor" style={{ width: `${p.progress}%` }} /></div>
            <div className="text-[11px] text-muted-foreground mt-1">{p.progress}%</div>
          </div>,
          <Link key="o" href={`/projects/${p.id}`} className="inline-flex items-center gap-1 text-brand font-medium text-[12px]">
            <Eye className="h-3 w-3" /> 详情
          </Link>,
        ])}
      />
    </EnterpriseShell>
  );
}
