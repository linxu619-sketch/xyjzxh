import { Wallet, TrendingUp, ShieldCheck, Sparkles } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { FINANCE_PRODUCTS, INSURANCE_PRODUCTS } from "@/lib/data/finance";
import { listInsuranceOrders } from "@/lib/data/insurance-orders";

export const metadata = { title: "金融保险合作 · 协会工作台" };

function fmt(ts: number) {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getMonth() + 1}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function FinanceAdmin() {
  const orders = listInsuranceOrders(50);
  return (
    <AssociationShell
      title="金融 / 保险 合作"
      subtitle={`金融机构 12 家 · 保险公司 5 家 · 本月撮合 184 单 · 出单率 73%`}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { l: "本月金融意向", v: 184, c: "text-cat-design", icon: Wallet },
          { l: "撮合放款", v: "2.8 亿", c: "text-cat-build", icon: TrendingUp },
          { l: "保险出单", v: 1284, c: "text-cat-decor", icon: ShieldCheck },
          { l: "保费收入(月)", v: "92 万", c: "text-accent-tea", icon: Wallet },
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

      <section className="mb-10">
        <h2 className="text-[18px] font-semibold mb-3 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-cat-design" /> 合作金融机构 / 产品
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FINANCE_PRODUCTS.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-background p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">{p.name}</div>
                <Badge tone="brand">{p.type}</Badge>
              </div>
              <div className="text-[12px] text-muted-foreground">{p.bank} · {p.rateLabel} · {p.amountLabel}</div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="rounded-lg bg-surface py-2">本月意向<div className="text-[14px] font-semibold text-foreground mt-0.5">{40 - p.id.charCodeAt(1) % 12}</div></div>
                <div className="rounded-lg bg-surface py-2">已放款<div className="text-[14px] font-semibold text-foreground mt-0.5">{18 - p.id.charCodeAt(1) % 8}</div></div>
                <div className="rounded-lg bg-surface py-2">出单率<div className="text-[14px] font-semibold text-accent-tea mt-0.5">{60 + p.id.charCodeAt(1) % 30}%</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[18px] font-semibold mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-cat-decor" /> 合作保险公司 / 险种
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INSURANCE_PRODUCTS.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-background p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">{p.name}</div>
                <Badge tone="decor">{p.type}</Badge>
              </div>
              <div className="text-[12px] text-muted-foreground">{p.insurer} · {p.priceLabel} · {p.coverLabel}</div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="rounded-lg bg-surface py-2">本月出单<div className="text-[14px] font-semibold text-foreground mt-0.5">{180 - p.id.charCodeAt(1) % 60}</div></div>
                <div className="rounded-lg bg-surface py-2">理赔中<div className="text-[14px] font-semibold text-cat-decor mt-0.5">{6 - p.id.charCodeAt(1) % 3}</div></div>
                <div className="rounded-lg bg-surface py-2">满意度<div className="text-[14px] font-semibold text-accent-tea mt-0.5">4.{6 + p.id.charCodeAt(1) % 3}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* 在线投保申请（实时） */}
      <div className="mt-6 rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="text-[14px] font-semibold">在线投保申请（实时）</div>
          <Badge tone={orders.length ? "decor" : "tea"}>{orders.length} 条</Badge>
        </div>
        {orders.length === 0 ? (
          <div className="px-5 py-8 text-center text-[13px] text-muted-foreground">暂无在线投保申请。用户在 /insurance 提交后会出现在这里。</div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map((o) => (
              <div key={o.id} className="px-5 py-3.5 flex items-center gap-3 text-[13px]">
                <span className="text-muted-foreground tabular-nums shrink-0">{fmt(o.createdAt)}</span>
                <span className="font-medium shrink-0">{o.product}</span>
                <span className="text-muted-foreground truncate flex-1">{o.applicant} · {o.phone}{o.note ? ` · ${o.note}` : ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AssociationShell>
  );
}
