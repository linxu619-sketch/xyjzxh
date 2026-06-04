import Link from "next/link";
import { ChevronRight, ShieldCheck, CheckCircle2, AlertCircle, Hammer } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { listOrdersByEnterprise, type OrderStage } from "@/lib/data/orders-source";
import { NewOrder } from "./NewOrder";
import { effectiveEnterpriseId } from "@/lib/dashboard/preview";

export const metadata = { title: "施工订单 · 企业工作台" };

const STAGE_LABEL: Record<OrderStage, string> = { signed: "已签约", planning: "排期中", "in-progress": "施工中", accepted: "已竣工" };
const STAGE_TONE: Record<OrderStage, "brand" | "design" | "decor" | "tea"> = { signed: "brand", planning: "design", "in-progress": "decor", accepted: "tea" };
const FILTERABLE: OrderStage[] = ["signed", "planning", "in-progress", "accepted"];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ f?: string; ook?: string; oerr?: string }> }) {
  const { f, ook, oerr } = await searchParams;
  const session = await getSession();
  const all = effectiveEnterpriseId(session) ? listOrdersByEnterprise(effectiveEnterpriseId(session)!) : [];
  const active = f && FILTERABLE.includes(f as OrderStage) ? (f as OrderStage) : undefined;
  const list = active ? all.filter((o) => o.stage === active) : all;
  const inProgress = all.filter((o) => o.stage === "in-progress").length;
  const done = all.filter((o) => o.stage === "accepted").length;
  const gmv = all.reduce((a, o) => a + o.amount, 0);
  const base = "/dashboard/enterprise/orders";
  const href = (st: OrderStage) => (active === st ? base : `${base}?f=${st}`);

  return (
    <EnterpriseShell title="施工订单" subtitle={`进行中 ${inProgress} · 累计合同额 ¥${(gmv / 10000).toFixed(1)} 万`} actions={<NewOrder />}>
      {ook && <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>订单已创建！</b>可点进详情更新阶段与进度。</div></div>}
      {oerr && <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 flex items-center gap-3"><AlertCircle className="h-5 w-5 shrink-0" /><div className="text-[13px]">创建失败：请填写客户与项目范围。</div></div>}

      <StatFilters
        items={[
          { key: "in-progress", label: "施工中", value: inProgress, color: "text-cat-decor", href: href("in-progress"), active: active === "in-progress" },
          { key: "planning", label: "排期中", value: all.filter((o) => o.stage === "planning").length, color: "text-cat-design", href: href("planning"), active: active === "planning" },
          { key: "accepted", label: "已竣工", value: done, color: "text-accent-tea", href: href("accepted"), active: active === "accepted" },
          { key: "all", label: "全部订单", value: all.length, color: "text-cat-build", href: base, active: !active },
        ]}
      />

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold flex items-center justify-between">
          <span>施工订单 · 点击查看与更新进度</span>
          {active && <Link href={base} className="text-[12px] text-brand font-normal">清除筛选 ✕</Link>}
        </div>
        {list.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">{active ? "没有该阶段的订单。" : "还没有施工订单。点右上「新建订单」创建第一个。"}</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[110px_1.8fr_1fr_0.9fr_0.7fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
              <span>订单号</span><span>项目</span><span>客户</span><span>合同额</span><span>进度</span><span className="text-right">阶段</span>
            </div>
            <ul className="divide-y divide-border">
              {list.map((o) => (
                <li key={o.id}>
                  <Link href={`/dashboard/enterprise/orders/${o.id}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[110px_1.8fr_1fr_0.9fr_0.7fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                    <span className="hidden md:block font-mono text-[11px] text-muted-foreground truncate">{o.code}</span>
                    <span className="min-w-0 inline-flex items-center gap-2">
                      <span className="h-8 w-8 rounded-lg bg-cat-decor-soft text-cat-decor inline-flex items-center justify-center shrink-0 md:hidden"><Hammer className="h-4 w-4" /></span>
                      <span className="min-w-0">
                        <span className="font-medium truncate block">{o.scope}</span>
                        <span className="md:hidden text-[11px] text-muted-foreground truncate block">{o.code} · {o.customerName} · ¥{(o.amount / 10000).toFixed(1)}万 · {o.progress}%</span>
                      </span>
                    </span>
                    <span className="hidden md:block text-muted-foreground truncate">{o.customerName}</span>
                    <span className="hidden md:block text-muted-foreground tabular-nums">¥{(o.amount / 10000).toFixed(1)}万</span>
                    <span className="hidden md:block text-muted-foreground tabular-nums">{o.progress}%</span>
                    <span className="inline-flex items-center gap-2 justify-end shrink-0">
                      <Badge tone={STAGE_TONE[o.stage]}>{STAGE_LABEL[o.stage]}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="mt-4 text-[12px] text-muted-foreground inline-flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> 已签约订单可关联工装报备、协会监理与监管账户（明细功能逐步开放）。
      </div>
    </EnterpriseShell>
  );
}
