import { Search, PhoneCall, Filter } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { FilterBar, DataTable } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { listLeadsByEnterprise, type LeadStatus } from "@/lib/data/leads";

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

export default async function LeadsPage() {
  const session = await getSession();
  const leads = session?.enterpriseId ? listLeadsByEnterprise(session.enterpriseId) : [];

  const total = leads.length;
  const signed = leads.filter((l) => l.status === "signed").length;
  const pending = leads.filter((l) => l.status === "new").length;
  const rate = total ? `${((signed / total) * 100).toFixed(1)}%` : "—";

  return (
    <EnterpriseShell
      title="客户线索"
      subtitle={`累计 ${total} 条 · 待跟进 ${pending} 条 · 已签单 ${signed} 条`}
      actions={<button className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium">导出 CSV</button>}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { l: "累计线索", v: total, c: "text-cat-decor" },
          { l: "待跟进", v: pending, c: "text-cat-build" },
          { l: "已签单", v: signed, c: "text-accent-tea" },
          { l: "签单率", v: rate, c: "text-cat-design" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-background p-5">
            <div className="text-[11px] text-muted-foreground tracking-wider uppercase">{s.l}</div>
            <div className={`mt-1 text-[28px] font-semibold tracking-tight ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

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

      <DataTable dropActionCol
        empty="还没有客户线索。子站「提交需求」表单提交后会实时出现在这里。"
        head={["客户", "诉求", "面积 / 预算", "来源", "状态", "联系电话", "提交时间", "操作"]}
        rows={leads.map((l) => [
          <div key="n" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-cat-decor-soft text-cat-decor inline-flex items-center justify-center text-[11px] font-semibold">{l.name.slice(0, 1)}</span>
            <span className="font-medium">{l.name}</span>
          </div>,
          <span key="t" className="text-muted-foreground">{l.type || "—"}{l.address ? ` · ${l.address}` : ""}</span>,
          <span key="b" className="font-medium">{l.area || "—"}㎡ · {l.budget || "—"}万</span>,
          <span key="s" className="text-[11px] text-muted-foreground">{l.source}</span>,
          <Badge key="st" tone={STATUS_TONE[l.status]}>{STATUS_LABEL[l.status]}</Badge>,
          <a key="p" href={`tel:${l.phone}`} className="text-brand inline-flex items-center gap-1 text-[12px]"><PhoneCall className="h-3 w-3" /> {l.phone}</a>,
          <span key="r" className="text-[11px] text-muted-foreground">{fmt(l.createdAt)}</span>,
          null,
        ])}
      />
    </EnterpriseShell>
  );
}
