import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Coins } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getSupplyOrder, type OrderStatus } from "@/lib/data/supplies-source";
import { startPaymentAction } from "@/app/(dashboard)/dashboard/pay/actions";
import { enabledPayMethods } from "@/lib/payments";
import { PrintBar } from "@/components/print/print-doc";
import { SupplyOrderContract } from "@/components/print/supply-contract";
import { getPlatformInfo } from "@/lib/runtime-config";

export const metadata = { title: "采购单 · 对账监管 · 建材集采" };

const ORDER_LABEL: Record<OrderStatus, string> = { pending: "待确认", confirmed: "已确认", shipped: "已发货", done: "已完成" };
const ORDER_TONE: Record<OrderStatus, "yellow" | "brand" | "build" | "tea"> = { pending: "yellow", confirmed: "brand", shipped: "build", done: "tea" };

export default async function SupplyOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const o = id ? getSupplyOrder(id) : undefined;
  if (!o) notFound();
  const org = await getPlatformInfo();
  const payMethods = o!.settleStatus !== "paid" ? await enabledPayMethods() : [];

  return (
    <AssociationShell title="采购单 · 对账监管" subtitle={`${o!.buyerName || o!.enterpriseName} · ${o!.productName}`}>
      <div className="no-print">
        <Link href="/dashboard/association/supply-orders" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回订单对账列表</Link>
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <Badge tone={ORDER_TONE[o!.status]}>履约：{ORDER_LABEL[o!.status]}</Badge>
          <span className="text-[12px] text-muted-foreground">履约（确认/发货/完成）由卖家在其工作台推进；平台只负责对账 / 佣金 / 争议介入。</span>
        </div>

        {o!.settleStatus !== "paid" ? (
          <div className="mb-4 rounded-2xl border border-border bg-background p-4 max-w-xl">
            <div className="text-[13px] font-semibold mb-1 inline-flex items-center gap-1.5"><Coins className="h-4 w-4 text-cat-build" /> 发起收款 · 收银台</div>
            <p className="text-[12px] text-muted-foreground mb-3">应收 <b className="text-foreground">¥{o!.total.toLocaleString()}</b> · 选择渠道生成收银台（佣金按商品比例自动拆分）。</p>
            <div className="flex flex-wrap gap-2">
              {payMethods.map((m) => (
                <form key={m.method} action={startPaymentAction}>
                  <input type="hidden" name="bizType" value="supply_order" />
                  <input type="hidden" name="bizId" value={o!.id} />
                  <input type="hidden" name="method" value={m.method} />
                  <button className="h-9 px-3.5 rounded-full border border-border text-[12px] inline-flex items-center gap-1 hover:bg-surface"><span>{m.icon}</span> {m.label}</button>
                </form>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-4 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-3 text-[13px] max-w-xl inline-flex items-center gap-2"><Coins className="h-4 w-4" /> 该采购单已结清。</div>
        )}

        <PrintBar hint="下方为 A4「建材集采购销单」，可直接打印或「另存为 PDF」存档。" />
      </div>

      <div className="print-area">
        <SupplyOrderContract order={o!} org={org} />
      </div>
    </AssociationShell>
  );
}
