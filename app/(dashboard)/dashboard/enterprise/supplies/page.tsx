import Link from "next/link";
import {
  Wallet, Truck, Crown, ShoppingCart, Sparkles, TrendingDown,
  Eye, FileText, ArrowRight,
} from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { DataTable } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { ENTERPRISE_SUPPLY_ORDERS, CURRENT_TIER } from "@/lib/data/supplies";

export const metadata = { title: "建材采购 · 企业工作台" };

const ORDER_STATUS_TONE = {
  "已下单": "yellow", "已发货": "brand", "已收货": "tea", "已开票": "tea", "退款中": "decor",
} as const;

export default function EnterpriseSupplies() {
  const totalGmv = ENTERPRISE_SUPPLY_ORDERS.reduce((a, o) => a + o.total, 0);
  const totalSaved = ENTERPRISE_SUPPLY_ORDERS.reduce((a, o) => a + o.saved, 0);

  return (
    <EnterpriseShell
      title="建材采购"
      subtitle={`协会超市 · 您当前 ${CURRENT_TIER}（享 -21% 专享价）· 本月已省 ¥${(totalSaved / 1000).toFixed(1)}k`}
      actions={
        <>
          <Link href="/supplies" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
            <ShoppingCart className="h-3.5 w-3.5" /> 去采购
          </Link>
          <Link href="/dashboard/enterprise/supplies/bulk" className="h-9 px-4 rounded-full bg-surface text-[13px] font-medium inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cat-decor" /> 申请集采
          </Link>
        </>
      }
    >
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="rounded-2xl border border-border bg-background p-5">
          <Wallet className="h-4 w-4 text-cat-build" />
          <div className="mt-2 text-[11px] text-muted-foreground tracking-wider uppercase">本月采购</div>
          <div className="mt-1 text-[28px] font-semibold tracking-tight text-cat-build">¥{(totalGmv / 10000).toFixed(1)}万</div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5">
          <TrendingDown className="h-4 w-4 text-accent-tea" />
          <div className="mt-2 text-[11px] text-muted-foreground tracking-wider uppercase">会员省</div>
          <div className="mt-1 text-[28px] font-semibold tracking-tight text-accent-tea">¥{(totalSaved / 10000).toFixed(1)}万</div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5">
          <Truck className="h-4 w-4 text-cat-decor" />
          <div className="mt-2 text-[11px] text-muted-foreground tracking-wider uppercase">在途订单</div>
          <div className="mt-1 text-[28px] font-semibold tracking-tight text-cat-decor">{ENTERPRISE_SUPPLY_ORDERS.filter((o) => o.status === "已下单" || o.status === "已发货").length}</div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5">
          <Crown className="h-4 w-4 text-accent-yellow" />
          <div className="mt-2 text-[11px] text-muted-foreground tracking-wider uppercase">当前会籍</div>
          <div className="mt-1 text-[20px] font-semibold tracking-tight">{CURRENT_TIER}</div>
          <div className="text-[10px] text-accent-yellow mt-0.5">升理事单位再降 7%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* 集采议价 */}
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-foreground to-brand-600 text-white p-6 md:p-7">
          <Sparkles className="h-7 w-7 text-accent-yellow" />
          <h3 className="mt-3 text-[22px] md:text-[26px] font-semibold tracking-tight">协会代您议价</h3>
          <p className="mt-2 text-[12px] text-white/80 max-w-md leading-5">
            单笔 ≥ 50 万 / 季度累计 ≥ 200 万即可申请项目集采，协会与品牌方总部谈判，平均再降 5-8%。
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2 max-w-md">
            <Mini label="您本季累计" value="¥86 万" />
            <Mini label="可申请集采" value="✓ 已达标" hl />
            <Mini label="预计再省" value="5-8%" />
          </div>
          <div className="mt-5 flex gap-2">
            <Link href="/dashboard/enterprise/supplies/bulk" className="h-10 px-5 rounded-full bg-accent-yellow text-foreground text-[12px] font-medium inline-flex items-center gap-1.5">
              发起集采申请 <ArrowRight className="h-3 w-3" />
            </Link>
            <Link href="/ai/biz" className="h-10 px-4 rounded-full border border-white/30 text-[12px] inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-accent-yellow" /> AI 比价
            </Link>
          </div>
        </div>

        {/* 价格档位 */}
        <div className="rounded-2xl border border-border bg-background p-6">
          <div className="text-[12px] text-muted-foreground tracking-wider uppercase mb-3">您的折扣档位</div>
          <ul className="space-y-2.5">
            {[
              { t: "市场价",   pct: "0%",   active: false },
              { t: "普通会员", pct: "-10%", active: false },
              { t: "高级会员", pct: "-21%", active: true },
              { t: "理事单位", pct: "-28%", active: false },
              { t: "项目集采", pct: "-33% ↑", active: false, special: true },
            ].map((p) => (
              <li key={p.t} className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                p.active ? "bg-foreground text-background" :
                p.special ? "bg-cat-decor-soft" : "bg-surface"
              }`}>
                <span className="text-[13px] font-medium">{p.t}</span>
                <span className={`text-[13px] font-semibold ${
                  p.active ? "text-accent-yellow" : p.special ? "text-cat-decor" : "text-muted-foreground"
                }`}>{p.pct}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 历史订单 */}
      <div className="flex items-end justify-between mb-3 mt-8">
        <div>
          <h2 className="text-[18px] font-semibold tracking-tight">采购历史</h2>
          <div className="text-[12px] text-muted-foreground mt-0.5">{ENTERPRISE_SUPPLY_ORDERS.length} 单 · 总额 ¥{(totalGmv / 10000).toFixed(1)}万</div>
        </div>
        <button className="text-[12px] text-brand">导出</button>
      </div>

      <DataTable dropActionCol
        head={["单号", "下单时间", "商品", "数量", "金额", "省下", "状态", "操作"]}
        rows={ENTERPRISE_SUPPLY_ORDERS.map((o) => [
          <code key="i" className="text-[12px] font-mono">{o.id}</code>,
          <span key="d" className="text-muted-foreground">{o.placedAt}</span>,
          <span key="s" className="text-[12px] max-w-[260px] truncate inline-block">{o.productSummary}</span>,
          <span key="q" className="text-muted-foreground">{o.items} 种 · {o.qty}</span>,
          <span key="a" className="font-semibold">¥{o.total.toLocaleString()}</span>,
          <span key="sv" className="text-accent-tea font-medium">¥{o.saved.toLocaleString()}</span>,
          <Badge key="st" tone={ORDER_STATUS_TONE[o.status]}>{o.status}</Badge>,
          <Link key="op" href="#" className="inline-flex items-center gap-1 text-brand font-medium text-[12px]">
            <Eye className="h-3 w-3" /> 详情
          </Link>,
        ])}
      />

      <div className="mt-8 rounded-3xl border border-border bg-background p-7 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h3 className="text-[18px] font-semibold tracking-tight">把建材成本归到项目</h3>
          <p className="mt-2 text-[12px] text-muted-foreground leading-6 max-w-lg">
            每一笔采购可关联到具体订单（如 ORD-2026-0512），自动同步到「项目工作台 → 文档库 → 材料台账」，方便业主验材、协会监理留痕、调解时举证。
          </p>
        </div>
        <div className="rounded-2xl bg-surface p-5 text-center">
          <FileText className="h-5 w-5 mx-auto text-cat-build" />
          <div className="mt-2 text-[20px] font-semibold">94%</div>
          <div className="text-[11px] text-muted-foreground">本月采购单<br />关联到项目</div>
        </div>
      </div>
    </EnterpriseShell>
  );
}

function Mini({ label, value, hl }: { label: string; value: string; hl?: boolean }) {
  return (
    <div className={`rounded-xl p-2.5 ${hl ? "bg-accent-yellow text-foreground" : "bg-white/10"}`}>
      <div className={`text-[10px] ${hl ? "text-foreground/60" : "text-white/60"}`}>{label}</div>
      <div className={`text-[14px] font-semibold mt-0.5 ${hl ? "" : "text-accent-yellow"}`}>{value}</div>
    </div>
  );
}
