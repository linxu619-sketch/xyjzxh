import { Search, PhoneCall, MessageSquare, Filter } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { FilterBar, DataTable } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "客户线索 · 企业工作台" };

type Lead = {
  id: string; name: string; area: string; budget: string;
  source: "AI 装修顾问" | "协会主站推荐" | "子站表单" | "AI 估价" | "口碑评价";
  intent: "高" | "中" | "低"; status: "新线索" | "沟通中" | "量房中" | "已签单" | "已流失";
  reachedAt: string; owner: string;
};

const LEADS: Lead[] = [
  { id: "L001", name: "刘女士", area: "120㎡ · 浉河区",   budget: "30 万",  source: "AI 装修顾问", intent: "高", status: "量房中",  reachedAt: "今天 09:24", owner: "张设计师" },
  { id: "L002", name: "陈先生", area: "168㎡ · 羊山新区", budget: "45 万",  source: "协会主站推荐", intent: "高", status: "沟通中",  reachedAt: "今天 11:08", owner: "李顾问" },
  { id: "L003", name: "王女士", area: "98㎡ · 平桥区",    budget: "20 万",  source: "子站表单",     intent: "中", status: "新线索",  reachedAt: "今天 14:32", owner: "—" },
  { id: "L004", name: "孙总",   area: "1200㎡ 工装",       budget: "180 万", source: "AI 估价",      intent: "高", status: "量房中",  reachedAt: "昨天 16:08", owner: "王经理" },
  { id: "L005", name: "周女士", area: "85㎡",              budget: "16 万",  source: "口碑评价",     intent: "中", status: "已签单",  reachedAt: "5 月 28 日", owner: "李顾问" },
  { id: "L006", name: "赵先生", area: "140㎡",             budget: "28 万",  source: "AI 装修顾问", intent: "低", status: "已流失",  reachedAt: "5 月 26 日", owner: "张设计师" },
];

const INTENT: Record<Lead["intent"], "decor" | "yellow" | "neutral"> = { 高: "decor", 中: "yellow", 低: "neutral" };
const STATUS: Record<Lead["status"], "build" | "brand" | "tea" | "neutral"> = {
  新线索: "build", 沟通中: "brand", 量房中: "brand", 已签单: "tea", 已流失: "neutral",
};

export default function LeadsPage() {
  return (
    <EnterpriseShell
      title="客户线索"
      subtitle={`本月新增 184 条 · 待跟进 ${LEADS.filter((l) => l.owner === "—").length} 条 · 平均响应 28 分钟`}
      actions={<button className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium">导出 CSV</button>}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { l: "本月新增", v: 184, c: "text-cat-decor" },
          { l: "已签单", v: 32, c: "text-accent-tea" },
          { l: "签单率", v: "17.4%", c: "text-cat-build" },
          { l: "AI 来源占比", v: "62%", c: "text-cat-design" },
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
          <option>来源：全部</option><option>AI 装修顾问</option><option>协会主站推荐</option><option>子站表单</option><option>AI 估价</option><option>口碑评价</option>
        </select>
        <select className="h-9 rounded-full bg-surface text-[12px] px-3 border border-transparent">
          <option>意向：全部</option><option>高</option><option>中</option><option>低</option>
        </select>
        <button className="h-9 px-3 rounded-full bg-surface text-[12px] inline-flex items-center gap-1.5"><Filter className="h-3 w-3" /> 高级</button>
      </FilterBar>

      <DataTable dropActionCol
        head={["客户", "诉求", "预算", "意向", "来源", "状态", "负责人", "首触时间", "操作"]}
        rows={LEADS.map((l) => [
          <div key="n" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-cat-decor-soft text-cat-decor inline-flex items-center justify-center text-[11px] font-semibold">{l.name.slice(0, 1)}</span>
            <span className="font-medium">{l.name}</span>
          </div>,
          <span key="a" className="text-muted-foreground">{l.area}</span>,
          <span key="b" className="font-medium">{l.budget}</span>,
          <Badge key="i" tone={INTENT[l.intent]}>{l.intent}</Badge>,
          <span key="s" className="text-[11px] text-muted-foreground">{l.source}</span>,
          <Badge key="st" tone={STATUS[l.status]}>{l.status}</Badge>,
          <span key="o" className="text-muted-foreground">{l.owner}</span>,
          <span key="r" className="text-[11px] text-muted-foreground">{l.reachedAt}</span>,
          <div key="op" className="flex items-center gap-1">
            <button className="h-8 w-8 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground" title="拨号"><PhoneCall className="h-3.5 w-3.5" /></button>
            <button className="h-8 w-8 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground" title="微信"><MessageSquare className="h-3.5 w-3.5" /></button>
          </div>,
        ])}
      />
    </EnterpriseShell>
  );
}
