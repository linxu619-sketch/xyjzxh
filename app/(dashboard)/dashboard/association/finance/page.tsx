import { Wallet, Landmark, Umbrella, CheckCircle2, XCircle, Banknote } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { Badge } from "@/components/ui/badge";
import { listFinanceProducts, listAllFinanceApps, type FinAppStatus } from "@/lib/data/finance-source";
import { listInsuranceOrders } from "@/lib/data/insurance-orders";
import { reviewFinanceAppAction } from "./actions";

export const metadata = { title: "金融保险 · 协会工作台" };

const FIN_LABEL: Record<FinAppStatus, string> = { pending: "待审核", approved: "已批准", rejected: "已驳回", disbursed: "已放款/出函" };
const FIN_TONE: Record<FinAppStatus, "yellow" | "brand" | "decor" | "tea"> = { pending: "yellow", approved: "brand", rejected: "decor", disbursed: "tea" };
const INS_LABEL: Record<string, string> = { pending: "待处理", contacted: "处理中", done: "已承保" };

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function FinanceAdmin({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f } = await searchParams;
  const products = listFinanceProducts();
  const allApps = listAllFinanceApps();
  const insurance = listInsuranceOrders();
  const FILTERABLE: FinAppStatus[] = ["pending", "approved", "rejected", "disbursed"];
  const active = f && FILTERABLE.includes(f as FinAppStatus) ? (f as FinAppStatus) : undefined;
  const apps = active ? allApps.filter((a) => a.status === active) : allApps;
  const base = "/dashboard/association/finance";
  const href = (st: FinAppStatus) => (active === st ? base : `${base}?f=${st}`);
  const pending = allApps.filter((a) => a.status === "pending").length;

  return (
    <AssociationShell title="金融保险合作" subtitle={`合作产品 ${products.length} · 金融申请 ${allApps.length} · 待审 ${pending}`}>
      <StatFilters
        items={[
          { key: "pending", label: "待审金融", value: pending, color: "text-accent-yellow", href: href("pending"), active: active === "pending" },
          { key: "disbursed", label: "已放款/出函", value: allApps.filter((a) => a.status === "disbursed").length, color: "text-accent-tea", href: href("disbursed"), active: active === "disbursed" },
          { key: "ins", label: "保险投保单", value: insurance.length, color: "text-cat-decor" },
          { key: "all", label: "全部金融申请", value: allApps.length, color: "text-cat-build", href: base, active: !active },
        ]}
      />

      {/* 金融申请审批 */}
      <div className="rounded-2xl border border-border bg-background overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold inline-flex items-center gap-1.5"><Landmark className="h-4 w-4" /> 企业金融申请</div>
        {apps.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">{active ? "没有该状态的申请。" : "暂无金融申请。企业在「金融保险」申请后会出现在这里。"}</div>
        ) : (
          <ul className="divide-y divide-border">
            {apps.map((a) => (
              <li key={a.id} className="px-5 py-3.5 flex items-center gap-3 text-[13px] flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{a.productName} · {a.amount}</div>
                  <div className="text-[11px] text-muted-foreground">{a.enterpriseName} · {fmt(a.createdAt)}</div>
                </div>
                <Badge tone={FIN_TONE[a.status]} className="shrink-0">{FIN_LABEL[a.status]}</Badge>
                <div className="flex items-center gap-1.5 shrink-0">
                  {a.status === "pending" && (
                    <>
                      <form action={reviewFinanceAppAction}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="approved" /><button className="h-8 px-3 rounded-full bg-accent-tea text-white text-[12px] inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> 批准</button></form>
                      <form action={reviewFinanceAppAction}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="rejected" /><button className="h-8 px-3 rounded-full border border-cat-decor/40 text-cat-decor text-[12px] inline-flex items-center gap-1"><XCircle className="h-3 w-3" /> 驳回</button></form>
                    </>
                  )}
                  {a.status === "approved" && (
                    <form action={reviewFinanceAppAction}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="disbursed" /><button className="h-8 px-3 rounded-full bg-foreground text-background text-[12px] inline-flex items-center gap-1"><Banknote className="h-3 w-3" /> 标记放款</button></form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 保险投保单（真实） */}
      <div className="rounded-2xl border border-border bg-background overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold inline-flex items-center gap-1.5"><Umbrella className="h-4 w-4" /> 保险投保单</div>
        {insurance.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">暂无投保单。</div>
        ) : (
          <ul className="divide-y divide-border">
            {insurance.slice(0, 12).map((o) => (
              <li key={o.id} className="px-5 py-3 flex items-center gap-3 text-[13px]">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{o.product}</div>
                  <div className="text-[11px] text-muted-foreground">{o.applicant} · {o.phone} · {fmt(o.createdAt)}</div>
                </div>
                <Badge tone={o.status === "done" ? "tea" : "yellow"} className="shrink-0">{INS_LABEL[o.status] ?? o.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 合作金融产品 */}
      <h2 className="text-[16px] font-semibold mb-3 inline-flex items-center gap-1.5"><Wallet className="h-4 w-4" /> 合作金融产品</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {products.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-2"><span className="text-[14px] font-semibold flex-1">{p.name}</span><Badge tone="brand">{p.type}</Badge></div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{p.provider} · {p.rateLabel} · {p.amountLabel}</div>
          </div>
        ))}
      </div>
    </AssociationShell>
  );
}
