import Link from "next/link";
import { Search, Plus, ArrowUpRight, ShieldCheck, AlertCircle } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { FilterBar, DataTable } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { ORDERS_LIST, STAGE_META } from "@/lib/data/orders";

export const metadata = { title: "施工订单 · 企业工作台" };

export default function OrdersPage() {
  const inProgress = ORDERS_LIST.filter((o) => o.stage === "in-progress").length;
  const pendingAction = ORDERS_LIST.reduce(
    (a, o) => a + o.pendingCounts.acceptance + o.pendingCounts.change + o.pendingCounts.payment,
    0,
  );
  const totalAmount = ORDERS_LIST.filter((o) => o.signedAt).reduce((a, o) => a + o.amount, 0);
  const received = ORDERS_LIST.filter((o) => o.signedAt).reduce((a, o) => a + (o.amount * o.receivedPct) / 100, 0);

  return (
    <EnterpriseShell
      title="施工订单 · 全流程"
      subtitle={`覆盖 咨询 → 报价 → 签约 → 排期 → 施工 → 验收 → 收款 → 维保 · 在施 ${inProgress} 项`}
      actions={
        <Link href="/dashboard/enterprise/leads" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> 从线索创建
        </Link>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { l: "在施订单", v: inProgress, c: "text-cat-decor" },
          { l: "已签合同", v: `¥${(totalAmount / 10000).toFixed(0)}万`, c: "text-cat-build" },
          { l: "已收款", v: `¥${(received / 10000).toFixed(0)}万`, c: "text-accent-tea" },
          { l: "待处理项", v: pendingAction, c: "text-cat-design" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-background p-5">
            <div className="text-[11px] text-muted-foreground tracking-wider uppercase">{s.l}</div>
            <div className={`mt-1 text-[28px] font-semibold tracking-tight ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
        {[
          { k: "all", l: `全部 (${ORDERS_LIST.length})`, active: true },
          { k: "inquiry", l: `咨询 (${ORDERS_LIST.filter((o) => o.stage === "inquiry").length})` },
          { k: "quoted", l: `已报价 (${ORDERS_LIST.filter((o) => o.stage === "quoted").length})` },
          { k: "signed", l: `已签约 (${ORDERS_LIST.filter((o) => o.stage === "signed").length})` },
          { k: "in-progress", l: `施工中 (${ORDERS_LIST.filter((o) => o.stage === "in-progress").length})` },
          { k: "accepted", l: `已竣工 (${ORDERS_LIST.filter((o) => o.stage === "accepted").length})` },
        ].map((t) => (
          <button key={t.k} className={`shrink-0 h-9 px-4 rounded-full text-[13px] font-medium ${t.active ? "bg-foreground text-background" : "bg-background border border-border text-muted-foreground hover:text-foreground"}`}>
            {t.l}
          </button>
        ))}
      </div>

      <FilterBar className="mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <input placeholder="搜索订单号 / 客户 / 项目地址" className="flex-1 bg-transparent outline-none text-[13px] py-1" />
        </div>
        <select className="h-9 rounded-full bg-surface text-[12px] px-3 border border-transparent">
          <option>区域：全部</option><option>浉河区</option><option>羊山新区</option><option>平桥区</option>
        </select>
      </FilterBar>

      <DataTable dropActionCol
        head={["订单号", "客户", "范围", "金额", "阶段", "进度", "回款", "待办", "操作"]}
        rows={ORDERS_LIST.map((o) => {
          const totalPending = o.pendingCounts.acceptance + o.pendingCounts.change + o.pendingCounts.payment;
          return [
            <code key="i" className="text-[12px] font-mono">{o.id}</code>,
            <div key="c">
              <div className="font-medium">{o.customerName}</div>
              <div className="text-[11px] text-muted-foreground">{o.customerPhone}</div>
            </div>,
            <span key="s" className="text-[12px] text-muted-foreground max-w-[220px] truncate inline-block">{o.scope}</span>,
            <span key="a" className="font-semibold">¥{(o.amount / 10000).toFixed(1)}万</span>,
            <Badge key="st" tone={STAGE_META[o.stage].tone as "brand"}>{STAGE_META[o.stage].label}</Badge>,
            <div key="p" className="min-w-[100px]">
              <div className="h-1.5 rounded-full bg-surface w-24"><div className="h-full rounded-full bg-cat-decor" style={{ width: `${o.progress}%` }} /></div>
              <div className="text-[11px] text-muted-foreground mt-1">{o.progress}%</div>
            </div>,
            <div key="r" className="text-[12px]">
              <span className="font-medium text-accent-tea">{o.receivedPct}%</span>
              <span className="text-muted-foreground"> · ¥{((o.amount * o.receivedPct) / 100 / 10000).toFixed(1)}万</span>
            </div>,
            totalPending > 0 ? (
              <span key="td" className="inline-flex items-center gap-1 rounded-full bg-cat-decor-soft text-cat-decor px-2 py-0.5 text-[11px] font-medium">
                <AlertCircle className="h-3 w-3" /> {totalPending}
              </span>
            ) : (
              <span key="td" className="inline-flex items-center gap-1 text-[11px] text-accent-tea"><ShieldCheck className="h-3 w-3" /> 无</span>
            ),
            <Link key="op" href={`/dashboard/enterprise/orders/${o.id}`} className="inline-flex items-center gap-1 text-brand font-medium text-[12px]">
              工作台 <ArrowUpRight className="h-3 w-3" />
            </Link>,
          ];
        })}
      />

      <div className="mt-6 rounded-2xl border border-border bg-foreground text-background p-5 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-accent-yellow mt-0.5 shrink-0" />
        <div className="text-[12px] leading-5">
          <b>项目工作台覆盖：</b> 客户与责任人 · 合同 · 进度计划 · 实时跟踪 · 分步验收 · 收款 · 变更记录 · 文档库；
          <b>业主端</b> 同步可见，关键节点需要业主电子签确认。
        </div>
      </div>
    </EnterpriseShell>
  );
}
