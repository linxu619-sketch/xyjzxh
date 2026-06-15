import Link from "next/link";
import { Search, Filter, ChevronRight } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { FilterBar } from "@/components/dashboard/section";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { listLeadsByEnterprise, type LeadStatus } from "@/lib/data/leads";
import { listStaffByEnterprise } from "@/lib/data/enterprise-staff";
import { effectiveEnterpriseId } from "@/lib/dashboard/preview";

const FILTERABLE: LeadStatus[] = ["new", "contacting", "surveying", "signed", "lost"];

export const metadata = { title: "客户线索 · 企业工作台" };

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "新线索", contacting: "沟通中", surveying: "量房中", signed: "已签单", lost: "已流失",
};
const STATUS_TONE: Record<LeadStatus, "build" | "brand" | "tea" | "neutral"> = {
  new: "build", contacting: "brand", surveying: "brand", signed: "tea", lost: "neutral",
};

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f } = await searchParams;
  const session = await getSession();
  const eid = effectiveEnterpriseId(session);
  const all = eid ? listLeadsByEnterprise(eid) : [];
  const staffName = new Map((eid ? listStaffByEnterprise(eid) : []).map((m) => [m.id, m.name]));

  const total = all.length;
  const signed = all.filter((l) => l.status === "signed").length;
  const pending = all.filter((l) => l.status === "new").length;
  const unassigned = all.filter((l) => !l.assigneeStaffId).length;
  const rate = total ? `${((signed / total) * 100).toFixed(1)}%` : "—";

  const active = f && FILTERABLE.includes(f as LeadStatus) ? (f as LeadStatus) : undefined;
  const leads = active ? all.filter((l) => l.status === active) : all;
  const base = "/dashboard/enterprise/leads";
  const href = (st: LeadStatus) => (active === st ? base : `${base}?f=${st}`);

  return (
    <EnterpriseShell
      title="客户线索"
      subtitle={`累计 ${total} 条 · 待跟进 ${pending} 条 · 已签单 ${signed} 条`}
      actions={<a href="/dashboard/enterprise/leads/export" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center">导出 CSV</a>}
    >
      <StatFilters
        items={[
          { key: "all", label: "累计线索", value: total, color: "text-cat-decor", href: base, active: !active },
          { key: "new", label: "待跟进", value: pending, color: "text-cat-build", href: href("new"), active: active === "new" },
          { key: "signed", label: "已签单", value: signed, color: "text-accent-tea", href: href("signed"), active: active === "signed" },
          { key: "rate", label: "签单率", value: rate, color: "text-cat-design" },
        ]}
      />

      <FilterBar className="mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <input placeholder="搜索客户 / 区域 / 来源" className="flex-1 bg-transparent outline-none text-[13px] py-1" />
        </div>
        <select className="h-9 rounded-full bg-surface text-[12px] px-3 border border-transparent">
          <option>来源：全部</option><option>子站表单</option><option>在线咨询</option><option>AI 估价</option><option>口碑评价</option>
        </select>
        <select className="h-9 rounded-full bg-surface text-[12px] px-3 border border-transparent">
          <option>状态：全部</option><option>新线索</option><option>沟通中</option><option>量房中</option><option>已签单</option><option>已流失</option>
        </select>
        <button className="h-9 px-3 rounded-full bg-surface text-[12px] inline-flex items-center gap-1.5"><Filter className="h-3 w-3" /> 高级</button>
      </FilterBar>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2">客户线索 · 点击查看并分派/跟进
            {unassigned > 0 && <span className="text-[11px] font-normal text-accent-yellow border border-accent-yellow/40 rounded-full px-2 py-0.5">{unassigned} 条未分派</span>}
          </span>
          {active && <Link href={base} className="text-[12px] text-brand font-normal shrink-0">清除筛选（{STATUS_LABEL[active]}）✕</Link>}
        </div>
        {leads.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">{active ? `没有「${STATUS_LABEL[active]}」的线索。` : "还没有客户线索。子站「提交需求」表单提交后会实时出现在这里。"}</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1.2fr_1.3fr_1fr_1fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
              <span>客户</span><span>需求</span><span>来源</span><span>负责人</span><span className="text-right">状态</span>
            </div>
            <ul className="divide-y divide-border">
              {leads.map((l) => (
                <li key={l.id}>
                  <Link href={`/dashboard/enterprise/leads/${l.id}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[1.2fr_1.3fr_1fr_1fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                    <span className="min-w-0 inline-flex items-center gap-2">
                      <span className="h-8 w-8 rounded-full bg-cat-decor-soft text-cat-decor inline-flex items-center justify-center text-[12px] font-semibold shrink-0 md:hidden">{l.name.slice(0, 1)}</span>
                      <span className="min-w-0">
                        <span className="font-medium truncate block">{l.name}</span>
                        <span className="md:hidden text-[11px] text-muted-foreground truncate block">{l.type || "—"}{l.area ? ` · ${l.area}㎡` : ""} · {l.source} · {l.phone}</span>
                      </span>
                    </span>
                    <span className="hidden md:block text-muted-foreground truncate">{l.type || "—"}{l.area ? ` · ${l.area}㎡` : ""}{l.budget ? ` · ${l.budget}万` : ""}</span>
                    <span className="hidden md:block text-muted-foreground truncate">{l.source}</span>
                    <span className="hidden md:block truncate">{l.assigneeStaffId && staffName.get(l.assigneeStaffId)
                      ? <span className="text-foreground">{staffName.get(l.assigneeStaffId)}</span>
                      : <span className="text-accent-yellow">未分派</span>}</span>
                    <span className="inline-flex items-center gap-2 justify-end shrink-0">
                      <Badge tone={STATUS_TONE[l.status]}>{STATUS_LABEL[l.status]}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </EnterpriseShell>
  );
}
