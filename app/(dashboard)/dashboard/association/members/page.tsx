import Link from "next/link";
import { Search, Filter, CheckCircle2, XCircle, Eye, ShieldCheck } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { FilterBar, DataTable } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { ENTERPRISES } from "@/lib/data/enterprises";

export const metadata = { title: "会员审核 · 协会工作台" };

const TYPE_LABEL = { build: "建筑", decor: "装修", design: "设计" } as const;
const TYPE_TONE = { build: "build", decor: "decor", design: "design" } as const;

const PENDING_NEW = [
  { name: "信阳同信建工", category: "build", district: "浉河区", submitted: "2026-05-29", staff: "100-200 人", reviewer: "—", status: "材料齐全" },
  { name: "明禾装饰工程",   category: "decor", district: "羊山新区", submitted: "2026-05-28", staff: "30-50 人",  reviewer: "—", status: "等待资质核验" },
  { name: "鹿鸣空间设计",   category: "design",district: "平桥区",  submitted: "2026-05-27", staff: "10-30 人",  reviewer: "陈秘书", status: "现场核查中" },
  { name: "光山天华建工",   category: "build", district: "光山县",   submitted: "2026-05-26", staff: "200+ 人",   reviewer: "—", status: "等待复审" },
  { name: "壹页设计",       category: "design",district: "浉河区",   submitted: "2026-05-25", staff: "10 人以内", reviewer: "—", status: "材料补充中" },
  { name: "茶乡装饰",       category: "decor", district: "息县",     submitted: "2026-05-25", staff: "30-50 人",  reviewer: "—", status: "等待初审" },
  { name: "罗山建发集团",   category: "build", district: "罗山县",   submitted: "2026-05-24", staff: "100-200 人",reviewer: "陈秘书", status: "现场核查通过" },
] as const;

export default function MembersAdmin() {
  const pending = PENDING_NEW;
  const passed = ENTERPRISES;

  return (
    <AssociationShell
      title="会员审核"
      subtitle={`本月新增 ${pending.length} 家待审 · 已通过 ${passed.length} 家在册`}
      actions={
        <Link href="#" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" /> 批量核验
        </Link>
      }
    >
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { l: "待审核", v: pending.length, c: "text-cat-decor" },
          { l: "本月新增", v: 23, c: "text-cat-build" },
          { l: "已通过", v: passed.length, c: "text-accent-tea" },
          { l: "驳回率", v: "4.2%", c: "text-cat-design" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-background p-5">
            <div className="text-[11px] text-muted-foreground tracking-wider uppercase">{s.l}</div>
            <div className={`mt-1 text-[28px] font-semibold tracking-tight ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 mb-3">
        {[
          { k: "pending", l: `待审 (${pending.length})`, active: true },
          { k: "approved", l: `已通过 (${passed.length})` },
          { k: "rejected", l: "已驳回 (3)" },
          { k: "all", l: "全部" },
        ].map((t) => (
          <button key={t.k} className={`h-9 px-4 rounded-full text-[13px] font-medium ${t.active ? "bg-foreground text-background" : "bg-background border border-border text-muted-foreground hover:text-foreground"}`}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Filter */}
      <FilterBar className="mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <input placeholder="搜索企业名 / 提交人 / 区域" className="flex-1 bg-transparent outline-none text-[13px] py-1" />
        </div>
        <select className="h-9 rounded-full bg-surface text-[12px] px-3 border border-transparent">
          <option>类型：全部</option><option>建筑</option><option>装修</option><option>设计</option>
        </select>
        <select className="h-9 rounded-full bg-surface text-[12px] px-3 border border-transparent">
          <option>区域：全部</option><option>浉河区</option><option>平桥区</option><option>羊山新区</option><option>光山县</option><option>息县</option><option>罗山县</option>
        </select>
        <button className="h-9 px-3 rounded-full bg-surface text-[12px] inline-flex items-center gap-1.5">
          <Filter className="h-3 w-3" /> 高级
        </button>
      </FilterBar>

      <DataTable
        head={["企业名称", "类型", "区域", "规模", "提交时间", "审核人", "状态", "操作"]}
        rows={pending.map((p) => [
          <span key="n" className="font-medium">{p.name}</span>,
          <Badge key="c" tone={TYPE_TONE[p.category as keyof typeof TYPE_TONE]}>{TYPE_LABEL[p.category as keyof typeof TYPE_LABEL]}</Badge>,
          p.district,
          <span key="s" className="text-muted-foreground">{p.staff}</span>,
          <span key="d" className="text-muted-foreground">{p.submitted}</span>,
          <span key="r" className="text-muted-foreground">{p.reviewer}</span>,
          <Badge key="st" tone={p.status.includes("通过") ? "tea" : p.status.includes("核验") ? "yellow" : "decor"}>{p.status}</Badge>,
          <div key="o" className="flex items-center gap-1.5">
            <button className="h-8 w-8 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground" title="详情"><Eye className="h-3.5 w-3.5" /></button>
            <button className="h-8 w-8 rounded-lg hover:bg-[#e6f7f1] text-accent-tea" title="通过"><CheckCircle2 className="h-4 w-4" /></button>
            <button className="h-8 w-8 rounded-lg hover:bg-cat-decor-soft text-cat-decor" title="驳回"><XCircle className="h-4 w-4" /></button>
          </div>,
        ])}
      />
    </AssociationShell>
  );
}
