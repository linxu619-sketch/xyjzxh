import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Truck, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { resolveSeller } from "@/lib/dashboard/seller";
import { getSupplyOrder, isOverdue, SUPPLY_TERM_DAYS, type OrderStatus } from "@/lib/data/supplies-source";
import { advanceSellerOrderAction, markOrderPaidAction } from "@/app/(dashboard)/dashboard/store-actions";

const O_LABEL: Record<OrderStatus, string> = { pending: "待确认", confirmed: "已确认", shipped: "已发货", done: "已完成" };
const O_TONE: Record<OrderStatus, "yellow" | "brand" | "build" | "tea"> = { pending: "yellow", confirmed: "brand", shipped: "build", done: "tea" };
const O_NEXT: Record<OrderStatus, OrderStatus | null> = { pending: "confirmed", confirmed: "shipped", shipped: "done", done: null };
const O_NEXT_LABEL: Record<string, string> = { confirmed: "确认接单", shipped: "发货", done: "完成" };

function fmt(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }
function fmtDay(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; }

// 卖家/买家查看自己的某张采购单 + 履约 / 收款操作
export async function SellerOrderDetail({ id }: { id: number }) {
  const seller = await resolveSeller();
  if (!seller) return <div className="rounded-2xl border border-border bg-background p-10 text-center text-[14px] text-muted-foreground">请用会员账号登录。</div>;
  const o = id ? getSupplyOrder(id) : undefined;
  const isSeller = o && o.sellerType === seller.type && o.sellerId === seller.id;
  const isBuyer = o && o.buyerType === seller.type && o.buyerId === seller.id;
  if (!o || (!isSeller && !isBuyer)) notFound();

  const nx = O_NEXT[o!.status];
  const selfHref = `${seller.base}/order/${o!.id}`;
  const overdue = isOverdue(o!);

  return (
    <>
      <Link href={seller.base} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回我的店铺
      </Link>

      <div className="rounded-2xl border border-border bg-background p-5 md:p-6 max-w-2xl">
        <div className="flex items-start gap-4 pb-5 border-b border-border">
          <span className="h-12 w-12 rounded-2xl bg-surface inline-flex items-center justify-center shrink-0"><ShoppingCart className="h-5 w-5 text-cat-decor" /></span>
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-semibold">{o!.productName} <span className="text-[13px] text-muted-foreground font-normal">× {o!.qty}{o!.unit}</span></div>
            <div className="text-[12px] text-muted-foreground mt-1">{isSeller ? "我是卖家（收到的采购单）" : "我是买家（我的采购单）"} · 下单 {fmt(o!.createdAt)}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[20px] font-semibold text-cat-decor tabular-nums">¥{o!.total.toLocaleString()}</div>
            <Badge tone={O_TONE[o!.status]} className="mt-1">{O_LABEL[o!.status]}</Badge>
          </div>
        </div>

        <dl className="mt-5 space-y-3 text-[13px]">
          <Row k={isSeller ? "买家" : "卖家"} v={isSeller ? o!.buyerName : o!.sellerName} />
          <Row k="单价 / 数量" v={`¥${o!.unitPrice} / ${o!.unit} × ${o!.qty}`} />
          <Row k="结算状态" v={
            o!.settleStatus === "paid"
              ? <Badge tone="tea">已结清</Badge>
              : overdue ? <Badge tone="decor">逾期（账期至 {fmtDay(o!.dueAt)}）</Badge>
              : <Badge tone="yellow">未结 · 账期至 {fmtDay(o!.dueAt)}（月结 {SUPPLY_TERM_DAYS} 天）</Badge>
          } />
        </dl>

        <div className="mt-6 pt-5 border-t border-border">
          {isSeller ? (
            <>
              <div className="text-[12px] text-muted-foreground mb-3 inline-flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> 履约 / 收款</div>
              <div className="flex flex-wrap items-center gap-2">
                {nx && (
                  <form action={advanceSellerOrderAction}>
                    <input type="hidden" name="id" value={o!.id} />
                    <input type="hidden" name="status" value={nx} />
                    <input type="hidden" name="redirect" value={selfHref} />
                    <button className="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Truck className="h-4 w-4" /> {O_NEXT_LABEL[nx]}</button>
                  </form>
                )}
                {o!.settleStatus === "unpaid" && (
                  <form action={markOrderPaidAction}>
                    <input type="hidden" name="id" value={o!.id} />
                    <input type="hidden" name="redirect" value={selfHref} />
                    <button className="h-10 px-5 rounded-full border border-accent-tea/40 text-accent-tea text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-[#e6f7f1]"><Wallet className="h-4 w-4" /> 确认收款</button>
                  </form>
                )}
                {!nx && o!.settleStatus === "paid" && <p className="text-[12px] text-muted-foreground">订单已完成并结清。</p>}
              </div>
            </>
          ) : (
            <p className="text-[12px] text-muted-foreground">买家视角为只读跟踪。状态由卖家推进，结款后此处显示已结清。</p>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <dt className="text-muted-foreground w-24 shrink-0">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
