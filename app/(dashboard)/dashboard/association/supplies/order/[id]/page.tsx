import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Truck } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getSupplyOrder, isOverdue, SUPPLY_TERM_DAYS, type OrderStatus } from "@/lib/data/supplies-source";
import { advanceOrderAction } from "../../actions";

export const metadata = { title: "采购单详情 · 建材集采" };

const ORDER_LABEL: Record<OrderStatus, string> = { pending: "待确认", confirmed: "已确认", shipped: "已发货", done: "已完成" };
const ORDER_TONE: Record<OrderStatus, "yellow" | "brand" | "build" | "tea"> = { pending: "yellow", confirmed: "brand", shipped: "build", done: "tea" };
const NEXT: Record<OrderStatus, OrderStatus | null> = { pending: "confirmed", confirmed: "shipped", shipped: "done", done: null };
const NEXT_LABEL: Record<string, string> = { confirmed: "确认接单", shipped: "发货", done: "完成" };
const SELLER_LABEL: Record<string, string> = { association: "协会自营", enterprise: "企业会员", practitioner: "个人会员" };

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function fmtDay(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; }

export default async function SupplyOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const o = id ? getSupplyOrder(id) : undefined;
  if (!o) notFound();

  const nx = NEXT[o!.status];
  const selfHref = `/dashboard/association/supplies/order/${o!.id}`;
  const overdue = isOverdue(o!);

  return (
    <AssociationShell title="采购单详情" subtitle={`${o!.buyerName || o!.enterpriseName} · ${o!.productName}`}>
      <Link href="/dashboard/association/supplies?tab=orders" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回采购单列表
      </Link>

      <div className="rounded-2xl border border-border bg-background p-5 md:p-6 max-w-2xl">
        <div className="flex items-start gap-4 pb-5 border-b border-border">
          <span className="h-12 w-12 rounded-2xl bg-surface inline-flex items-center justify-center shrink-0"><ShoppingCart className="h-5 w-5 text-cat-decor" /></span>
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-semibold">{o!.productName} <span className="text-[13px] text-muted-foreground font-normal">× {o!.qty}{o!.unit}</span></div>
            <div className="text-[12px] text-muted-foreground mt-1">下单 {fmt(o!.createdAt)}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[20px] font-semibold text-cat-decor tabular-nums">¥{o!.total.toLocaleString()}</div>
            <Badge tone={ORDER_TONE[o!.status]} className="mt-1">{ORDER_LABEL[o!.status]}</Badge>
          </div>
        </div>

        <dl className="mt-5 space-y-3 text-[13px]">
          <Row k="买家" v={`${o!.buyerName || o!.enterpriseName}`} />
          <Row k="卖家" v={`${SELLER_LABEL[o!.sellerType] ?? o!.sellerType} · ${o!.sellerName}`} />
          <Row k="单价 / 数量" v={`¥${o!.unitPrice} / ${o!.unit} × ${o!.qty}`} />
          <Row k="结算状态" v={
            o!.settleStatus === "paid"
              ? <Badge tone="tea">已结清</Badge>
              : overdue ? <Badge tone="decor">逾期（账期至 {fmtDay(o!.dueAt)}）</Badge>
              : <Badge tone="yellow">未结 · 账期至 {fmtDay(o!.dueAt)}（月结 {SUPPLY_TERM_DAYS} 天）</Badge>
          } />
        </dl>

        <div className="mt-6 pt-5 border-t border-border">
          <div className="text-[12px] text-muted-foreground mb-3 inline-flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> 履约状态流转</div>
          {nx ? (
            <form action={advanceOrderAction}>
              <input type="hidden" name="id" value={o!.id} />
              <input type="hidden" name="status" value={nx} />
              <input type="hidden" name="redirect" value={selfHref} />
              <button className="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Truck className="h-4 w-4" /> 推进到「{NEXT_LABEL[nx]}」</button>
            </form>
          ) : (
            <p className="text-[12px] text-muted-foreground">订单已完成。</p>
          )}
        </div>
      </div>
    </AssociationShell>
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
