import Link from "next/link";
import { Plus, Eye, Pencil, Pause, MoreHorizontal, Briefcase } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { DataTable } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { JOBS } from "@/lib/data/talents";

export const metadata = { title: "招聘管理 · 企业工作台" };

const TONE = { build: "build", decor: "decor", design: "design" } as const;

// 给每个岗位假投递数 / 浏览数
function fakeStats(id: string) {
  const n = id.charCodeAt(1);
  return { views: 200 + n * 17, apps: 4 + (n % 12) };
}

export default function JobsPage() {
  const mine = JOBS.filter((j) => j.enterpriseId === "e002").concat(JOBS.slice(0, 2));
  return (
    <EnterpriseShell
      title="招聘管理"
      subtitle={`在招 ${mine.length} 岗 · 本月新增简历 ${mine.reduce((a, j) => a + fakeStats(j.id).apps, 0)} 份 · 待面试 9 人`}
      actions={
        <button className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> 发布岗位
        </button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { l: "在招岗位", v: mine.length, c: "text-cat-build", icon: Briefcase },
          { l: "本月浏览", v: "12.6K", c: "text-cat-decor", icon: Eye },
          { l: "新简历", v: mine.reduce((a, j) => a + fakeStats(j.id).apps, 0), c: "text-accent-tea", icon: Briefcase },
          { l: "面试中", v: 9, c: "text-cat-design", icon: Briefcase },
        ].map((s) => {
          const Ic = s.icon;
          return (
            <div key={s.l} className="rounded-2xl border border-border bg-background p-5">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Ic className="h-3.5 w-3.5" /> {s.l}</div>
              <div className={`mt-1 text-[28px] font-semibold tracking-tight ${s.c}`}>{s.v}</div>
            </div>
          );
        })}
      </div>

      <DataTable dropActionCol
        head={["职位", "类型", "薪资", "区域", "浏览", "简历", "发布时间", "状态", "操作"]}
        rows={mine.map((j) => {
          const s = fakeStats(j.id);
          return [
            <div key="t">
              <div className="font-medium">{j.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{j.experience} · {j.education}</div>
            </div>,
            <Badge key="c" tone={TONE[j.category]}>{j.type}</Badge>,
            <span key="s" className="font-medium text-cat-decor">{j.salaryMin}-{j.salaryMax}K</span>,
            <span key="d" className="text-muted-foreground">{j.district}</span>,
            <span key="v" className="text-muted-foreground">{s.views.toLocaleString()}</span>,
            <Link key="a" href="#" className="text-brand font-medium">{s.apps} 份 →</Link>,
            <span key="p" className="text-[11px] text-muted-foreground">{j.postedAt}</span>,
            j.hot ? <Badge key="st" tone="decor">急招</Badge> : <Badge key="st" tone="tea">在招</Badge>,
            <div key="o" className="flex items-center gap-1">
              <button className="h-8 w-8 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground"><Eye className="h-3.5 w-3.5" /></button>
              <button className="h-8 w-8 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
              <button className="h-8 w-8 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground"><Pause className="h-3.5 w-3.5" /></button>
              <button className="h-8 w-8 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
            </div>,
          ];
        })}
      />
    </EnterpriseShell>
  );
}
