import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Coins } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getSupplyOrder, type OrderStatus } from "@/lib/data/supplies-source";
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

  return (
    <AssociationShell title="采购单 · 对账监管" subtitle={`${o!.buyerName || o!.enterpriseName} · ${o!.productName}`}>
      <div className="no-print">
        <Link href="/dashboard/association/supply-orders" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回订单对账列表</Link>
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <Badge tone={ORDER_TONE[o!.status]}>履约：{ORDER_LABEL[o!.status]}</Badge>
          <Badge tone={o!.settleStatus === "paid" ? "tea" : "decor"}>结算：{o!.settleStatus === "paid" ? "已结清" : "未结清"}</Badge>
        </div>

        {/* 平台仅对账监管，不参与收付款 */}
        <div className="mb-4 rounded-2xl border border-border bg-surface/50 p-3 text-[13px] max-w-xl">
          <div className="inline-flex items-center gap-1.5"><Coins className="h-4 w-4 text-cat-build" /> 成交额 <b className="text-foreground">¥{o!.total.toLocaleString()}</b> · 结算 {o!.settleStatus === "paid" ? "已结清" : "未结清（账期月结）"}</div>
          <p className="text-[12px] text-muted-foreground mt-1 leading-5">平台仅对账与监管，<b>不参与收付款</b>；收款由卖家在其工作台发起（收银台 / 月结确认），平台佣金按比例自动汇入「平台资金」。如生纠纷可在调解模块介入。</p>
        </div>

        <PrintBar hint="下方为 A4「建材集采购销单」，可直接打印或「另存为 PDF」存档。" />
      </div>

      <div className="print-area">
        <SupplyOrderContract order={o!} org={org} />
      </div>
    </AssociationShell>
  );
}
