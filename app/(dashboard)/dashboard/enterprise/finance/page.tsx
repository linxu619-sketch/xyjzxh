import { Wallet, Umbrella, CheckCircle2, Landmark } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { listFinanceProducts, listFinanceAppsByEnterprise, type FinAppStatus } from "@/lib/data/finance-source";
import { listInsuranceByUid } from "@/lib/data/insurance-orders";
import { applyFinanceAction, applyEnterpriseInsuranceAction } from "./actions";
import { effectiveEnterpriseId } from "@/lib/dashboard/preview";

export const metadata = { title: "金融保险 · 企业工作台" };

const FIN_LABEL: Record<FinAppStatus, string> = { pending: "审核中", approved: "已批准", rejected: "已驳回", disbursed: "已放款/出函" };
const FIN_TONE: Record<FinAppStatus, "yellow" | "brand" | "decor" | "tea"> = { pending: "yellow", approved: "brand", rejected: "decor", disbursed: "tea" };
const INS_LABEL: Record<string, string> = { pending: "待处理", contacted: "处理中", done: "已承保" };

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function FinancePage({ searchParams }: { searchParams: Promise<{ fok?: string; ferr?: string; iok?: string }> }) {
  const { fok, ferr, iok } = await searchParams;
  const session = await getSession();
  const products = listFinanceProducts();
  const eid = effectiveEnterpriseId(session);
  const apps = eid ? listFinanceAppsByEnterprise(eid) : [];
  const insurance = eid ? listInsuranceByUid(eid) : [];

  return (
    <EnterpriseShell title="金融保险" subtitle={`协会合作金融产品 ${products.length} 款 · 我的申请 ${apps.length}`}>
      {fok && <Banner ok>金融申请已提交！协会与合作机构将尽快联系你。</Banner>}
      {iok && <Banner ok>投保申请已提交！协会将协助办理。</Banner>}
      {ferr && <Banner err>申请失败：请填写申请额度。</Banner>}

      {/* 金融产品目录 */}
      <h2 className="text-[16px] font-semibold mb-3 inline-flex items-center gap-1.5"><Landmark className="h-4 w-4 text-brand" /> 协会合作金融产品</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {products.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold flex-1">{p.name}</span>
              <Badge tone="brand">{p.type}</Badge>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{p.provider}</div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="rounded-lg bg-surface p-2"><div className="text-muted-foreground">利率/费率</div><div className="font-semibold text-cat-decor mt-0.5">{p.rateLabel}</div></div>
              <div className="rounded-lg bg-surface p-2"><div className="text-muted-foreground">额度</div><div className="font-semibold mt-0.5">{p.amountLabel}</div></div>
              <div className="rounded-lg bg-surface p-2"><div className="text-muted-foreground">期限</div><div className="font-semibold mt-0.5">{p.termLabel}</div></div>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">适合：{p.forWhom}</div>
            <form action={applyFinanceAction} className="mt-3 flex items-center gap-2">
              <input type="hidden" name="productId" value={p.id} />
              <input name="amount" placeholder="申请额度，如 200 万" className="flex-1 h-10 rounded-xl border border-border bg-background px-3 text-[14px] outline-none focus:border-foreground/30" />
              <button className="h-10 px-4 rounded-full bg-foreground text-background text-[12px] font-medium inline-flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> 申请</button>
            </form>
          </div>
        ))}
      </div>

      {/* 我的金融申请 */}
      <h2 className="text-[16px] font-semibold mb-3">我的金融申请</h2>
      <div className="rounded-2xl border border-border bg-background overflow-hidden mb-8">
        {apps.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px] text-muted-foreground">还没有金融申请。在上方产品中申请后会出现在这里。</div>
        ) : (
          <ul className="divide-y divide-border">
            {apps.map((a) => (
              <li key={a.id} className="px-5 py-3.5 flex items-center gap-3 text-[13px]">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{a.productName} · {a.amount}</div>
                  <div className="text-[11px] text-muted-foreground">{fmt(a.createdAt)}</div>
                </div>
                <Badge tone={FIN_TONE[a.status]} className="shrink-0">{FIN_LABEL[a.status]}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 保险 */}
      <h2 className="text-[16px] font-semibold mb-3 inline-flex items-center gap-1.5"><Umbrella className="h-4 w-4 text-cat-decor" /> 工程 / 团体保险</h2>
      <div className="rounded-2xl border border-border bg-background p-5">
        <div className="flex flex-wrap gap-2 mb-4">
          {["工程履约保证保险", "建筑工人团体意外险", "家装质保险（企业版）"].map((prod) => (
            <form key={prod} action={applyEnterpriseInsuranceAction}>
              <input type="hidden" name="product" value={prod} />
              <button className="h-9 px-3.5 rounded-full border border-border text-[12px] hover:bg-surface inline-flex items-center gap-1.5"><Umbrella className="h-3.5 w-3.5 text-cat-decor" /> 投保 {prod}</button>
            </form>
          ))}
        </div>
        {insurance.length === 0 ? (
          <div className="text-[12px] text-muted-foreground">还没有投保记录。点上方按钮申请投保，协会会协助办理。</div>
        ) : (
          <ul className="divide-y divide-border">
            {insurance.map((o) => (
              <li key={o.id} className="py-2.5 flex items-center gap-3 text-[13px]">
                <CheckCircle2 className="h-4 w-4 text-accent-tea shrink-0" />
                <span className="flex-1 truncate">{o.product}</span>
                <span className="text-[11px] text-muted-foreground">{fmt(o.createdAt)}</span>
                <Badge tone={o.status === "done" ? "tea" : "yellow"}>{INS_LABEL[o.status] ?? o.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </EnterpriseShell>
  );
}

function Banner({ children, ok, err }: { children: React.ReactNode; ok?: boolean; err?: boolean }) {
  const cls = ok ? "border-accent-tea/30 bg-[#e6f7f1] text-accent-tea" : err ? "border-cat-decor/30 bg-cat-decor-soft text-cat-decor" : "border-border bg-surface text-foreground";
  return <div className={`mb-5 rounded-2xl border p-4 text-[13px] ${cls}`}>{children}</div>;
}
