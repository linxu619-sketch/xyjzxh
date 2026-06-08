import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Truck, Coins } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getSupplyOrder, isOverdue, SUPPLY_TERM_DAYS, type OrderStatus } from "@/lib/data/supplies-source";
import { advanceOrderAction } from "../../actions";
import { startPaymentAction } from "@/app/(dashboard)/dashboard/pay/actions";
import { PAY_METHODS } from "@/lib/payments";
import { PrintBar, Letterhead, DocTable, SealFooter } from "@/components/print/print-doc";
import { getPlatformInfo } from "@/lib/runtime-config";

export const metadata = { title: "采购单处置 · 建材集采" };

const ORDER_LABEL: Record<OrderStatus, string> = { pending: "待确认", confirmed: "已确认", shipped: "已发货", done: "已完成" };
const ORDER_TONE: Record<OrderStatus, "yellow" | "brand" | "build" | "tea"> = { pending: "yellow", confirmed: "brand", shipped: "build", done: "tea" };
const NEXT: Record<OrderStatus, OrderStatus | null> = { pending: "confirmed", confirmed: "shipped", shipped: "done", done: null };
const NEXT_LABEL: Record<string, string> = { confirmed: "确认接单", shipped: "发货", done: "完成" };
const SELLER_LABEL: Record<string, string> = { association: "协会自营", enterprise: "企业会员", practitioner: "个人会员" };

function fmt(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }
function fmtDay(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; }
function fmtCN(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()} 年 ${p(d.getMonth() + 1)} 月 ${p(d.getDate())} 日`; }

export default async function SupplyOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const o = id ? getSupplyOrder(id) : undefined;
  if (!o) notFound();
  const org = await getPlatformInfo();

  const nx = NEXT[o!.status];
  const selfHref = `/dashboard/association/supplies/order/${o!.id}`;
  const overdue = isOverdue(o!);
  const docNo = `XYJZ-CG-${String(o!.id).padStart(4, "0")}`;
  const settleText = o!.settleStatus === "paid" ? "已结清" : overdue ? `逾期未结（账期至 ${fmtDay(o!.dueAt)}）` : `未结清 · 账期至 ${fmtDay(o!.dueAt)}（月结 ${SUPPLY_TERM_DAYS} 天）`;

  return (
    <AssociationShell title="采购单处置" subtitle={`${o!.buyerName || o!.enterpriseName} · ${o!.productName}`}>
      <div className="no-print">
        <Link href="/dashboard/association/supplies?tab=orders" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回采购单列表</Link>
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <Badge tone={ORDER_TONE[o!.status]}>{ORDER_LABEL[o!.status]}</Badge>
          {nx ? (
            <form action={advanceOrderAction}>
              <input type="hidden" name="id" value={o!.id} /><input type="hidden" name="status" value={nx} /><input type="hidden" name="redirect" value={selfHref} />
              <button className="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Truck className="h-4 w-4" /> 推进到「{NEXT_LABEL[nx]}」</button>
            </form>
          ) : <span className="text-[12px] text-muted-foreground">订单已完成。</span>}
        </div>

        {o!.settleStatus !== "paid" ? (
          <div className="mb-4 rounded-2xl border border-border bg-background p-4 max-w-xl">
            <div className="text-[13px] font-semibold mb-1 inline-flex items-center gap-1.5"><Coins className="h-4 w-4 text-cat-build" /> 发起收款 · 收银台</div>
            <p className="text-[12px] text-muted-foreground mb-3">应收 <b className="text-foreground">¥{o!.total.toLocaleString()}</b> · 选择渠道生成收银台（佣金按商品比例自动拆分）。</p>
            <div className="flex flex-wrap gap-2">
              {PAY_METHODS.map((m) => (
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

        <PrintBar hint="下方为 A4 建材集采采购单 / 结算单，可直接打印或「另存为 PDF」对账存档。" />
      </div>

      <div className="print-area">
        <div className="a4-sheet">
          <Letterhead title="建材集采采购单 / 结算单" docNo={docNo} date={fmtCN(o!.createdAt)} org={org} />
          <DocTable
            rows={[
              { k: "采购单号", v: docNo },
              { k: "买方", v: o!.buyerName || o!.enterpriseName },
              { k: "卖方", v: `${SELLER_LABEL[o!.sellerType] ?? o!.sellerType} · ${o!.sellerName}` },
              { k: "商品名称", v: o!.productName },
              { k: "单价 / 数量", v: `¥${o!.unitPrice} / ${o!.unit} × ${o!.qty}${o!.unit}` },
              { k: "金额合计", v: <b className="text-[15px]">¥{o!.total.toLocaleString()}</b> },
              { k: "履约状态", v: ORDER_LABEL[o!.status] },
              { k: "结算状态", v: settleText },
              { k: "下单时间", v: fmt(o!.createdAt) },
            ]}
          />
          <div className="mt-6 grid grid-cols-2 gap-x-10 text-[13px]">
            <div>应付金额：<b>¥{o!.total.toLocaleString()}</b></div>
            <div>{o!.settleStatus === "paid" ? "已收 / 付讫" : `账期至：${fmtDay(o!.dueAt)}`}</div>
          </div>
          <SealFooter lines={[{ label: "买方（签字 / 盖章）" }, { label: "卖方（签字 / 盖章）" }, { label: "经办人（签字）" }, { label: "协会集采（盖章）" }]} />
        </div>
      </div>
    </AssociationShell>
  );
}
