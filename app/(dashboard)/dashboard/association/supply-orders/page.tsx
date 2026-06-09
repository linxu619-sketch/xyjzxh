import Link from "next/link";
import { ShoppingCart, ChevronRight, ShieldCheck } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { Badge } from "@/components/ui/badge";
import { listAllSupplyOrders, reconcileAll, type OrderStatus } from "@/lib/data/supplies-source";
import { paymentsSummary } from "@/lib/data/payments-source";

export const metadata = { title: "建材订单 · 对账监管 · 协会工作台" };

const ORDER_LABEL: Record<OrderStatus, string> = { pending: "待确认", confirmed: "已确认", shipped: "已发货", done: "已完成" };
const ORDER_TONE: Record<OrderStatus, "yellow" | "brand" | "build" | "tea"> = { pending: "yellow", confirmed: "brand", shipped: "build", done: "tea" };
const SELLER_LABEL: Record<string, string> = { association: "协会自营", enterprise: "企业会员", practitioner: "个人会员" };

export default async function SupplyOrdersAdmin() {
  const orders = listAllSupplyOrders();
  const rec = reconcileAll();
  const pay = paymentsSummary(); // 平台收银台成交：佣金收入
  const pending = orders.filter((o) => o.status === "pending").length;
  const settled = orders.filter((o) => o.settleStatus === "paid").length;

  return (
    <AssociationShell title="建材订单 · 对账监管" subtitle={`采购单 ${orders.length} · 待确认 ${pending} · 已结清 ${settled}`}>
      {/* 平台职责说明：订单＝监管/对账，非审批 */}
      <div className="mb-4 rounded-2xl border border-border bg-surface/50 px-4 py-2.5 text-[12px] text-muted-foreground leading-5">
        <b className="text-foreground">订单＝平台监管 / 对账</b>：交易在会员买家 ↔ 卖家之间，平台只负责对账、佣金、争议介入，<b>不审核、不代为发货</b>（履约由卖家在其工作台推进）。
      </div>

      <StatFilters
        items={[
          { key: "all", label: "采购单", value: orders.length, color: "text-cat-decor" },
          { key: "pending", label: "待确认", value: pending, color: "text-accent-yellow" },
          { key: "settled", label: "已结清", value: settled, color: "text-accent-tea" },
          { key: "overdue", label: "逾期未结", value: rec.overdueCount, color: "text-cat-decor" },
        ]}
      />

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold inline-flex items-center gap-1.5"><ShoppingCart className="h-4 w-4" /> 采购单 · 对账</div>

        {orders.length > 0 && (
          <div className="px-5 py-2.5 border-b border-border bg-surface/50 flex items-center gap-x-5 gap-y-1 flex-wrap text-[12px]">
            <span className="text-muted-foreground inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> 平台对账：</span>
            <span>累计 <b className="tabular-nums">¥{rec.totalAmount.toLocaleString()}</b></span>
            <span className="text-accent-tea">已结 ¥{rec.paid.toLocaleString()}</span>
            <span className="text-cat-decor">未结 ¥{rec.unpaid.toLocaleString()}</span>
            {rec.overdueCount > 0 && <span className="text-cat-decor font-medium">逾期 {rec.overdueCount} 单 · ¥{rec.overdue.toLocaleString()}</span>}
            <span className="text-cat-build font-medium">平台佣金 ¥{pay.commission.toLocaleString()}{pay.paidCount > 0 ? `（${pay.paidCount} 笔收银台成交）` : ""}</span>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">暂无采购单。会员在建材商城下单后会出现在这里。</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1.8fr_1.2fr_0.9fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
              <span>商品 / 数量</span><span>买家 → 卖家</span><span>金额 / 结算</span><span className="text-right">履约</span>
            </div>
            <ul className="divide-y divide-border">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/dashboard/association/supply-orders/${o.id}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[1.8fr_1.2fr_0.9fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                    <span className="min-w-0">
                      <span className="font-medium truncate block">{o.productName} <span className="text-muted-foreground font-normal">× {o.qty}{o.unit}</span></span>
                      <span className="md:hidden text-[11px] text-muted-foreground truncate block">{o.buyerName || o.enterpriseName} · ¥{o.total.toLocaleString()} · {o.settleStatus === "paid" ? "已结清" : "未结"}</span>
                    </span>
                    <span className="hidden md:block text-muted-foreground truncate">{o.buyerName || o.enterpriseName} → {SELLER_LABEL[o.sellerType] ?? o.sellerType}·{o.sellerName}</span>
                    <span className="hidden md:block">
                      <b className="text-cat-decor tabular-nums">¥{o.total.toLocaleString()}</b>
                      <Badge tone={o.settleStatus === "paid" ? "tea" : "yellow"} className="ml-1.5 !px-1.5 !py-0">{o.settleStatus === "paid" ? "已结" : "未结"}</Badge>
                    </span>
                    <span className="inline-flex items-center gap-2 justify-end shrink-0">
                      <Badge tone={ORDER_TONE[o.status]}>{ORDER_LABEL[o.status]}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="px-5 py-3 text-[12px] text-muted-foreground border-t border-border">点击任一行查看对账与争议处置；履约与收款由卖家在其工作台推进，平台不参与收付款。</div>
      </div>
    </AssociationShell>
  );
}
