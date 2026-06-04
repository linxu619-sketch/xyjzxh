import Link from "next/link";
import { Truck, TrendingDown, CheckCircle2, Package, ChevronRight } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { listProducts, listOrdersByEnterprise, type OrderStatus } from "@/lib/data/supplies-source";
import { effectiveEnterpriseId } from "@/lib/dashboard/preview";

export const metadata = { title: "建材采购 · 企业工作台" };

const ORDER_LABEL: Record<OrderStatus, string> = { pending: "待协会确认", confirmed: "已确认", shipped: "已发货", done: "已完成" };
const ORDER_TONE: Record<OrderStatus, "yellow" | "brand" | "build" | "tea"> = { pending: "yellow", confirmed: "brand", shipped: "build", done: "tea" };

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function SuppliesPage({ searchParams }: { searchParams: Promise<{ sok?: string; serr?: string }> }) {
  const { sok, serr } = await searchParams;
  const session = await getSession();
  const products = listProducts();
  const orders = effectiveEnterpriseId(session) ? listOrdersByEnterprise(effectiveEnterpriseId(session)!) : [];
  const saved = orders.reduce((a, o) => {
    const p = products.find((x) => x.id === o.productId);
    return a + (p ? (p.marketPrice - o.unitPrice) * o.qty : 0);
  }, 0);

  return (
    <EnterpriseShell
      title="建材采购 · 协会集采"
      subtitle={`${products.length} 款集采商品 · 我的采购单 ${orders.length}`}
    >
      {sok && <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>已下单！</b>协会确认后安排发货，可在下方「我的采购单」跟踪。</div></div>}
      {serr && <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 text-[13px]">下单失败：商品已下架。</div>}

      <div className="rounded-2xl bg-foreground text-background p-5 mb-6 flex items-center gap-3 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-tea/30 blur-2xl" />
        <Truck className="relative h-7 w-7 text-accent-yellow shrink-0" />
        <div className="relative flex-1">
          <div className="text-[14px] font-semibold">协会集采 · 会员专享价</div>
          <div className="text-[11px] text-background/70 mt-0.5">统一比价、协会背书；累计为本企业省 <b className="text-accent-yellow">¥{saved.toLocaleString()}</b></div>
        </div>
      </div>

      {/* 商品目录 */}
      <h2 className="text-[16px] font-semibold mb-3">集采商品目录</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {products.map((p) => {
          const off = p.marketPrice > 0 ? Math.round((1 - p.memberPrice / p.marketPrice) * 100) : 0;
          return (
            <Link key={p.id} href={`/supplies/${p.id}`} className="rounded-2xl border border-border bg-background p-4 block hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-start gap-2">
                <span className="h-10 w-10 rounded-xl bg-surface inline-flex items-center justify-center shrink-0"><Package className="h-5 w-5 text-cat-build" /></span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold truncate">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">{p.spec} · {p.supplier}</div>
                </div>
                <Badge tone="decor">{p.category}</Badge>
              </div>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-[20px] font-semibold text-cat-decor tabular-nums">¥{p.memberPrice}</span>
                <span className="text-[11px] text-muted-foreground line-through mb-0.5">市场价 ¥{p.marketPrice}</span>
                <span className="text-[11px] text-muted-foreground mb-0.5">/{p.unit}</span>
                {off > 0 && <span className="ml-auto text-[11px] text-accent-tea font-medium inline-flex items-center gap-0.5 mb-0.5"><TrendingDown className="h-3 w-3" /> 省{off}%</span>}
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-end text-[12px] text-brand font-medium">查看详情并下单 <ChevronRight className="h-3.5 w-3.5" /></div>
            </Link>
          );
        })}
      </div>

      {/* 我的采购单 */}
      <h2 className="text-[16px] font-semibold mb-3">我的采购单</h2>
      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        {orders.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">还没有采购单。在上方商品目录下单后会出现在这里。</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[2fr_1.4fr_0.9fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
              <span>商品</span><span>数量 / 单价 / 时间</span><span>金额</span><span className="text-right">状态</span>
            </div>
            <ul className="divide-y divide-border">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/dashboard/enterprise/store/order/${o.id}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1.4fr_0.9fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                    <span className="min-w-0">
                      <span className="font-medium truncate block">{o.productName}</span>
                      <span className="md:hidden text-[11px] text-muted-foreground truncate block">{o.qty}{o.unit} × ¥{o.unitPrice} · ¥{o.total.toLocaleString()}</span>
                    </span>
                    <span className="hidden md:block text-muted-foreground truncate">{o.qty}{o.unit} × ¥{o.unitPrice} · {fmt(o.createdAt)}</span>
                    <span className="hidden md:block font-semibold text-cat-decor tabular-nums">¥{o.total.toLocaleString()}</span>
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
      </div>
    </EnterpriseShell>
  );
}
