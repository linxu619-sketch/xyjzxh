import { Coins, Wallet } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { Badge } from "@/components/ui/badge";
import { listAllPayments, paymentsSummary } from "@/lib/data/payments-source";
import type { PayMethod, PayStatus } from "@/lib/payments";

export const metadata = { title: "平台资金 · 收银对账 · 协会工作台" };

const METHOD_LABEL: Record<PayMethod, string> = { alipay: "支付宝", wechat: "微信", bank_corp: "对公转账", bank_personal: "对私转账" };
const STATUS_LABEL: Record<PayStatus, string> = { pending: "待付", paid: "已到账", failed: "失败", refunded: "已退款", closed: "已关闭" };
const STATUS_TONE: Record<PayStatus, "yellow" | "tea" | "decor" | "neutral"> = { pending: "yellow", paid: "tea", failed: "decor", refunded: "neutral", closed: "neutral" };
const BIZ_LABEL: Record<string, string> = { supply_order: "建材采购", construction_order: "施工订单" };

function fmt(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }

export default async function PlatformPayments() {
  const payments = listAllPayments();
  const sum = paymentsSummary();

  return (
    <AssociationShell title="平台资金 · 收银对账" subtitle={`已到账 ${sum.paidCount} 笔 · 待付 ${sum.pendingCount} 笔`}>
      <div className="mb-4 rounded-2xl border border-border bg-surface/50 px-4 py-2.5 text-[12px] text-muted-foreground leading-5">
        平台收银台成交的资金总览：成交额、<b className="text-foreground">平台佣金收入</b>、卖家应结，按渠道（支付宝 / 微信 / 银行对公对私）汇总。佣金按各商品 0–2% 比例自动拆分。
      </div>

      <StatFilters
        items={[
          { key: "gmv", label: "成交额(已到账)", value: `¥${sum.gmv.toLocaleString()}`, color: "text-cat-decor" },
          { key: "commission", label: "平台佣金收入", value: `¥${sum.commission.toLocaleString()}`, color: "text-cat-build" },
          { key: "paid", label: "已到账", value: sum.paidCount, color: "text-accent-tea" },
          { key: "pending", label: "待付", value: sum.pendingCount, color: "text-accent-yellow" },
        ]}
      />

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold inline-flex items-center gap-1.5"><Coins className="h-4 w-4 text-cat-build" /> 支付单 · 收银流水</div>
        {payments.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">暂无收银台成交。会员通过平台收银台付款后会出现在这里（账期月结的订单不走收银台、不在此列）。</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1.6fr_1fr_0.9fr_0.9fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
              <span>订单号 / 商品</span><span>付款方 → 收款方</span><span>金额</span><span>佣金 / 应结</span><span className="text-right">状态</span>
            </div>
            <ul className="divide-y divide-border">
              {payments.map((p) => (
                <li key={p.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[1.6fr_1fr_0.9fr_0.9fr_auto] gap-3 items-center px-5 py-3.5 text-[13px]">
                  <span className="min-w-0">
                    <span className="font-medium truncate block">{p.subject || BIZ_LABEL[p.bizType] || p.bizType}</span>
                    <span className="text-[11px] text-muted-foreground truncate block">{p.outTradeNo} · {METHOD_LABEL[p.method] ?? p.method} · {fmt(p.createdAt)}</span>
                  </span>
                  <span className="hidden md:block text-muted-foreground truncate">{p.payerName || "—"} → {p.payeeName || "—"}</span>
                  <span className="hidden md:block font-semibold text-cat-decor tabular-nums">¥{p.amount.toLocaleString()}</span>
                  <span className="hidden md:block text-[12px]"><span className="text-cat-build">佣 ¥{p.commission.toLocaleString()}</span> <span className="text-muted-foreground">/ 结 ¥{p.payeeAmount.toLocaleString()}</span></span>
                  <span className="text-right"><Badge tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Badge></span>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="px-5 py-3 text-[12px] text-muted-foreground border-t border-border inline-flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> 仅统计走平台收银台的成交；佣金为平台实际收入。</div>
      </div>
    </AssociationShell>
  );
}
