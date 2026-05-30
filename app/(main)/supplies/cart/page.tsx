import Link from "next/link";
import {
  ArrowLeft, Minus, Plus, Trash2, ShieldCheck, Truck, Crown,
  ArrowRight, Sparkles, ListChecks,
} from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS, CURRENT_TIER, tierBadgeColor, tierLabel } from "@/lib/data/supplies";
import { cn } from "@/lib/cn";

export const metadata = { title: "采购车 · 协会建材超市" };

const THUMB: Record<string, string> = {
  build: "bg-cat-build", decor: "bg-cat-decor", design: "bg-cat-design",
  tea: "bg-accent-tea", yellow: "bg-accent-yellow", brand: "bg-brand",
};

// demo 购物车
const CART_ITEMS = [
  { id: "SP-T001", qty: 168 },
  { id: "SP-F003", qty: 168 },
  { id: "SP-B004", qty: 1   },
  { id: "SP-W007", qty: 6   },
];

export default function CartPage() {
  const items = CART_ITEMS.map((i) => {
    const p = PRODUCTS.find((x) => x.id === i.id)!;
    const price = p.prices[CURRENT_TIER];
    const market = p.marketPrice;
    return { ...i, p, price, market, subtotal: price * i.qty, saved: (market - price) * i.qty };
  });
  const subtotal = items.reduce((a, i) => a + i.subtotal, 0);
  const totalSaved = items.reduce((a, i) => a + i.saved, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <Container className="py-8 md:py-12 max-w-6xl">
      <Link href="/supplies" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-5">
        <ArrowLeft className="h-3.5 w-3.5" /> 继续采购
      </Link>

      <div className="flex items-end justify-between mb-6 flex-col md:flex-row md:items-end gap-3">
        <div>
          <h1 className="text-[32px] md:text-[40px] font-semibold tracking-tight">采购车</h1>
          <div className="mt-1 text-[12px] text-muted-foreground">{items.length} 件 · 会员省 ¥{totalSaved.toLocaleString()}</div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-1.5 text-[12px]">
          <Crown className="h-3.5 w-3.5 text-accent-yellow" /> {CURRENT_TIER}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左：商品列表 */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((i) => (
            <div key={i.id} className="rounded-3xl border border-border bg-background p-4 flex items-start gap-4">
              <Link href={`/supplies/${i.p.id}`} className={cn("h-24 w-24 rounded-2xl shrink-0", THUMB[i.p.thumbColor])} />
              <div className="flex-1 min-w-0">
                <Link href={`/supplies/${i.p.id}`} className="text-[14px] font-medium line-clamp-2 hover:text-brand">{i.p.name}</Link>
                <div className="text-[11px] text-muted-foreground mt-0.5">{i.p.spec} · {i.p.supplierName}</div>
                <Badge tone={tierBadgeColor(CURRENT_TIER)} className="mt-2 !text-[9px] !py-0">{tierLabel(CURRENT_TIER)}</Badge>

                <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <div className="text-[18px] font-semibold text-cat-decor">¥{i.price.toLocaleString()}<span className="text-[11px] text-muted-foreground font-normal">/{i.p.unit}</span></div>
                    <div className="text-[10px] text-muted-foreground line-through">市场价 ¥{i.market.toLocaleString()}</div>
                  </div>

                  <div className="inline-flex items-center gap-1 rounded-full border border-border">
                    <button type="button" className="h-8 w-8 inline-flex items-center justify-center hover:bg-surface rounded-l-full"><Minus className="h-3 w-3" /></button>
                    <input defaultValue={String(i.qty)} className="h-8 w-14 text-center bg-transparent outline-none text-[13px]" />
                    <button type="button" className="h-8 w-8 inline-flex items-center justify-center hover:bg-surface rounded-r-full"><Plus className="h-3 w-3" /></button>
                    <span className="text-[10px] text-muted-foreground px-2">{i.p.unit}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">小计 · 已省 <span className="text-accent-tea font-medium">¥{i.saved.toLocaleString()}</span></span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[14px]">¥{i.subtotal.toLocaleString()}</span>
                    <button className="text-muted-foreground hover:text-cat-decor"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-2xl bg-foreground text-background p-5 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-accent-yellow shrink-0 mt-0.5" />
            <div className="flex-1 text-[12px] leading-5">
              <b>AI 小经提醒：</b> 你的订单已达集采门槛 50 万。点「申请集采议价」让协会代你跟厂家再谈一轮，预计再省 5-8%。
            </div>
            <Link href="/dashboard/enterprise/supplies" className="text-[11px] text-accent-yellow whitespace-nowrap inline-flex items-center gap-0.5">
              立即申请 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* 右：结算 */}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-background p-6 sticky top-6">
            <div className="text-[12px] text-muted-foreground tracking-wider uppercase mb-4">结算明细</div>
            <ul className="space-y-2 text-[13px]">
              <Row k="商品金额" v={`¥${subtotal.toLocaleString()}`} />
              <Row k="会员立减" v={<span className="text-accent-tea">-¥{totalSaved.toLocaleString()}</span>} />
              <Row k="运费" v={shipping === 0 ? <span className="text-accent-tea">本地仓免运</span> : `¥${shipping}`} />
              <Row k="协会服务费" v={<span className="text-accent-tea">¥0 · 免</span>} />
            </ul>
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-[13px] text-muted-foreground">应付合计</span>
              <span className="text-[28px] font-semibold tracking-tight text-cat-decor">¥{total.toLocaleString()}</span>
            </div>

            {/* 选项 */}
            <div className="mt-5 space-y-2.5 text-[12px]">
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-brand" />使用协会监管账户托管</label>
              <label className="flex items-center gap-2"><input type="checkbox" className="accent-brand" />申请 30 天账期（仅高级 / 理事）</label>
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-brand" />关联订单：<code className="font-mono">ORD-2026-0512</code></label>
            </div>

            <button className="mt-5 w-full h-12 rounded-full bg-foreground text-background text-[14px] font-medium inline-flex items-center justify-center gap-1.5">
              提交采购单 <ArrowRight className="h-4 w-4" />
            </button>
            <div className="mt-3 text-[10px] text-muted-foreground text-center inline-flex items-center justify-center gap-1 w-full">
              <ShieldCheck className="h-3 w-3 text-accent-tea" /> 7 天无理由退换 · 协会兜底赔付
            </div>
          </div>

          <div className="rounded-3xl bg-surface p-5">
            <ListChecks className="h-5 w-5 text-cat-build" />
            <div className="mt-2 text-[13px] font-semibold">下单后</div>
            <ol className="mt-2 space-y-1.5 text-[11px] text-muted-foreground">
              <li>1. 协会平台冻结对应金额（监管）</li>
              <li>2. 供应商接单 → 24h 内出仓</li>
              <li>3. 到货签收 → 平台释放款项</li>
              <li>4. 自动开票 → 同步企业财务</li>
            </ol>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4 text-[12px] inline-flex items-start gap-2 text-muted-foreground">
            <Truck className="h-4 w-4 mt-0.5 text-cat-build" />
            预计 6 月 12 日下午到 ORD-2026-0512 项目地（浉河区 · 金茂悦府 1602）
          </div>
        </aside>
      </div>

      {/* 移动端 sticky 底部结算条 */}
      <div className="lg:hidden fixed bottom-14 inset-x-0 z-30 px-3 pointer-events-none">
        <div className="pointer-events-auto mx-auto max-w-md rounded-full bg-foreground text-background shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] flex items-center gap-2 p-1.5 pl-4">
          <div className="flex-1 min-w-0">
            <div className="text-[9px] text-background/60 tracking-wider uppercase">{items.length} 件 · 省 ¥{(totalSaved / 1000).toFixed(1)}k</div>
            <div className="text-[16px] font-semibold text-accent-yellow tabular-nums leading-tight">
              ¥{total.toLocaleString()}
            </div>
          </div>
          <button className="h-11 px-5 rounded-full bg-cat-decor text-white text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform shrink-0">
            提交采购单 <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Container>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </li>
  );
}
