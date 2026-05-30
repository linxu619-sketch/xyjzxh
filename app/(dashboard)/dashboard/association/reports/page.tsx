import Link from "next/link";
import { CheckCircle2, XCircle, Eye, ShieldCheck, Sparkles, Search } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { FilterBar, DataTable } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { PROJECTS, STATUS_META } from "@/lib/data/projects";

export const metadata = { title: "工装报备审批 · 协会工作台" };

const TYPE_TONE = { 家装: "decor", 工装: "build", 公装: "design", 市政: "tea" } as const;

export default function ReportsAdmin() {
  const pending = PROJECTS.filter((p) => p.status === "submitted" || p.status === "reviewing");
  return (
    <AssociationShell
      title="工装报备审批"
      subtitle={`待审 ${pending.length} 项 · 本月已受理 187 项 · 一次通过率 82%`}
      actions={
        <Link href="#" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-accent-yellow" /> AI 批量预审
        </Link>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { l: "待审", v: pending.length, c: "text-cat-decor" },
          { l: "本月已受理", v: 187, c: "text-cat-build" },
          { l: "已购履约险", v: "63%", c: "text-accent-tea" },
          { l: "省厅同步", v: "100%", c: "text-cat-design" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-background p-5">
            <div className="text-[11px] text-muted-foreground tracking-wider uppercase">{s.l}</div>
            <div className={`mt-1 text-[28px] font-semibold tracking-tight ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mb-3">
        {["待审 (2)", "审核中", "已通过", "施工中", "已竣工", "全部"].map((t, i) => (
          <button key={t} className={`h-9 px-4 rounded-full text-[13px] font-medium ${i === 0 ? "bg-foreground text-background" : "bg-background border border-border text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      <FilterBar className="mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <input placeholder="搜索报备号 / 项目名 / 企业" className="flex-1 bg-transparent outline-none text-[13px] py-1" />
        </div>
        <select className="h-9 rounded-full bg-surface text-[12px] px-3 border border-transparent">
          <option>类型：全部</option><option>家装</option><option>工装</option><option>公装</option><option>市政</option>
        </select>
      </FilterBar>

      <DataTable
        head={["报备号", "项目名称", "类型", "施工企业", "面积 / 预算", "状态", "投保", "AI 预审", "操作"]}
        rows={PROJECTS.map((p) => [
          <code key="i" className="text-[12px] font-mono">{p.id}</code>,
          <span key="n" className="font-medium">{p.name}</span>,
          <Badge key="t" tone={TYPE_TONE[p.type]}>{p.type}</Badge>,
          <Link key="e" href={`/members/${p.enterpriseId}`} className="text-brand hover:underline">{p.enterprise}</Link>,
          <span key="a" className="text-muted-foreground">{p.area}㎡ · {p.budget}万</span>,
          <Badge key="s" tone={STATUS_META[p.status].tone as "brand"}>{STATUS_META[p.status].label}</Badge>,
          p.insured ? <ShieldCheck key="ins" className="h-4 w-4 text-accent-tea" /> : <span key="ni" className="text-muted-foreground text-[11px]">未投</span>,
          <span key="ai" className="inline-flex items-center gap-1 text-[12px] text-accent-tea"><Sparkles className="h-3 w-3" /> 通过</span>,
          <div key="o" className="flex items-center gap-1">
            <button className="h-8 w-8 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground" title="详情"><Eye className="h-3.5 w-3.5" /></button>
            <button className="h-8 w-8 rounded-lg hover:bg-[#e6f7f1] text-accent-tea" title="通过"><CheckCircle2 className="h-4 w-4" /></button>
            <button className="h-8 w-8 rounded-lg hover:bg-cat-decor-soft text-cat-decor" title="驳回"><XCircle className="h-4 w-4" /></button>
          </div>,
        ])}
      />
    </AssociationShell>
  );
}
