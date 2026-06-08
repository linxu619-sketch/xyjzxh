import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Truck, Wallet, Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { resolveSeller } from "@/lib/dashboard/seller";
import { getSupplyOrder, type OrderStatus } from "@/lib/data/supplies-source";
import { listPaymentsByBiz } from "@/lib/data/payments-source";
import { advanceSellerOrderAction, markOrderPaidAction } from "@/app/(dashboard)/dashboard/store-actions";
import { startPaymentAction } from "@/app/(dashboard)/dashboard/pay/actions";
import { enabledPayMethods } from "@/lib/payments";
import { PrintBar } from "@/components/print/print-doc";
import { SupplyOrderContract } from "@/components/print/supply-contract";

const O_LABEL: Record<OrderStatus, string> = { pending: "待确认", confirmed: "已确认", shipped: "已发货", done: "已完成" };
const O_TONE: Record<OrderStatus, "yellow" | "brand" | "build" | "tea"> = { pending: "yellow", confirmed: "brand", shipped: "build", done: "tea" };
const O_NEXT: Record<OrderStatus, OrderStatus | null> = { pending: "confirmed", confirmed: "shipped", shipped: "done", done: null };
const O_NEXT_LABEL: Record<string, string> = { confirmed: "确认接单", shipped: "发货", done: "完成" };

// 卖家/买家查看自己的某张采购单 + 履约 / 收款操作 + A4 购销单打印
export async function SellerOrderDetail({ id }: { id: number }) {
  const seller = await resolveSeller();
  if (!seller) return <div className="rounded-2xl border border-border bg-background p-10 text-center text-[14px] text-muted-foreground">请用会员账号登录。</div>;
  const o = id ? getSupplyOrder(id) : undefined;
  const isSeller = o && o.sellerType === seller.type && o.sellerId === seller.id;
  const isBuyer = o && o.buyerType === seller.type && o.buyerId === seller.id;
  if (!o || (!isSeller && !isBuyer)) notFound();

  const nx = O_NEXT[o!.status];
  const selfHref = `${seller.base}/order/${o!.id}`;
  // 该单若走平台收银台已付，取佣金/应结明细（让卖家透明知道平台抽成）
  const paidPay = isSeller ? listPaymentsByBiz("supply_order", o!.id).find((p) => p.status === "paid") : undefined;
  // 卖家可发起收银台收款（买家在线付，平台按佣金拆分）
  const payMethods = isSeller && o!.settleStatus === "unpaid" ? await enabledPayMethods() : [];

  return (
    <>
      <div className="no-print">
        <Link href={seller.base} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回我的店铺</Link>
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <Badge tone={O_TONE[o!.status]}>{O_LABEL[o!.status]}</Badge>
          <span className="text-[12px] text-muted-foreground">{isSeller ? "我是卖家（收到的采购单）" : "我是买家（我的采购单）"}</span>
          {isSeller && nx && (
            <form action={advanceSellerOrderAction}>
              <input type="hidden" name="id" value={o!.id} /><input type="hidden" name="status" value={nx} /><input type="hidden" name="redirect" value={selfHref} />
              <button className="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Truck className="h-4 w-4" /> {O_NEXT_LABEL[nx]}</button>
            </form>
          )}
          {isSeller && o!.settleStatus === "unpaid" && (
            <form action={markOrderPaidAction}>
              <input type="hidden" name="id" value={o!.id} /><input type="hidden" name="redirect" value={selfHref} />
              <button className="h-10 px-5 rounded-full border border-accent-tea/40 text-accent-tea text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-[#e6f7f1]"><Wallet className="h-4 w-4" /> 确认收款</button>
            </form>
          )}
          {!isSeller && <span className="text-[12px] text-muted-foreground">· 买家视角为只读跟踪</span>}
        </div>
        {isSeller && o!.settleStatus === "unpaid" && payMethods.length > 0 && (
          <div className="mb-4 rounded-2xl border border-border bg-background p-4 max-w-xl">
            <div className="text-[13px] font-semibold mb-1 inline-flex items-center gap-1.5"><Coins className="h-4 w-4 text-cat-build" /> 发起收款 · 收银台</div>
            <p className="text-[12px] text-muted-foreground mb-3">应收 <b className="text-foreground">¥{o!.total.toLocaleString()}</b> · 选渠道生成收银台供买家在线付款（平台按商品佣金比例自动拆分，你到账即应结）。或直接「确认收款」走线下月结。</p>
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
        )}
        {isSeller && (
          <div className="mb-4 rounded-2xl border border-border bg-surface/50 p-3 text-[12px] text-muted-foreground leading-5 max-w-xl">
            履约（确认 / 发货 / 完成）与收款由你处理；平台负责对账、佣金与争议介入。
            {paidPay && <span className="block mt-1 text-foreground">本单已通过平台收银台收款 ¥{paidPay.amount.toLocaleString()}：平台佣金 <b className="text-cat-build">¥{paidPay.commission.toLocaleString()}</b>，你应结 <b className="text-accent-tea">¥{paidPay.payeeAmount.toLocaleString()}</b>。</span>}
          </div>
        )}
        <PrintBar hint="下方为 A4「建材集采购销单」，可直接打印或「另存为 PDF」对账存档。" />
      </div>

      <div className="print-area">
        <SupplyOrderContract order={o!} />
      </div>
    </>
  );
}
