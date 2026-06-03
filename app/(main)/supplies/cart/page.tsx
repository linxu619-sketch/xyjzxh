import Link from "next/link";
import { ShoppingCart, Trash2, ShieldCheck, ArrowRight, Package, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { resolveSeller } from "@/lib/dashboard/seller";
import { listCart, type CartLine } from "@/lib/data/supplies-source";
import { updateCartQtyAction, removeCartAction, checkoutCartAction } from "./actions";
import { cn } from "@/lib/cn";

export const metadata = { title: "采购车 · 协会建材超市" };

const SELLER_LABEL: Record<string, string> = { association: "协会自营", enterprise: "企业会员", practitioner: "个人会员" };
const THUMB: Record<string, string> = { build: "bg-cat-build", decor: "bg-cat-decor", design: "bg-cat-design", tea: "bg-accent-tea", yellow: "bg-accent-yellow", brand: "bg-brand" };
function colorFor(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return ["build", "decor", "design", "tea", "yellow", "brand"][h % 6]; }

export default async function SupplyCart({ searchParams }: { searchParams: Promise<{ added?: string; empty?: string }> }) {
  const { added, empty } = await searchParams;
  const buyer = await resolveSeller();

  if (!buyer) {
    return (
      <Container className="py-10 md:py-16 max-w-3xl">
        <h1 className="text-[22px] md:text-[28px] font-semibold tracking-tight inline-flex items-center gap-2"><ShoppingCart className="h-6 w-6" /> 采购车</h1>
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-[13px] text-muted-foreground">
          建材商城为协会会员互助批发，请用<Link href="/login?role=association&next=/supplies/cart" className="text-brand">企业 / 个人会员账号登录</Link>后使用采购车。
        </div>
      </Container>
    );
  }

  const lines = listCart(buyer.type, buyer.id);
  const total = lines.reduce((a, l) => a + l.lineTotal, 0);
  // 按卖家分组（结算后会按卖家分别路由履约）
  const groups = new Map<string, { name: string; type: string; lines: CartLine[] }>();
  for (const l of lines) {
    const key = `${l.product.sellerType}|${l.product.sellerId}`;
    if (!groups.has(key)) groups.set(key, { name: l.product.sellerName, type: l.product.sellerType, lines: [] });
    groups.get(key)!.lines.push(l);
  }

  return (
    <Container className="py-6 md:py-10 max-w-3xl">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-[22px] md:text-[28px] font-semibold tracking-tight inline-flex items-center gap-2"><ShoppingCart className="h-6 w-6" /> 采购车</h1>
        <Link href="/supplies" className="text-[13px] text-brand">继续选购 →</Link>
      </div>

      {added && <div className="mb-4 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-3.5 text-[13px] inline-flex items-center gap-2 w-full"><CheckCircle2 className="h-4 w-4 shrink-0" />已加入采购车。</div>}
      {empty && <div className="mb-4 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-3.5 text-[13px]">采购车是空的，去商城选购吧。</div>}

      {lines.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-[13px] text-muted-foreground">
          <Package className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
          采购车还是空的。去 <Link href="/supplies" className="text-brand">建材商城</Link> 把好货加进来。
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {[...groups.values()].map((g) => {
              const sub = g.lines.reduce((a, l) => a + l.lineTotal, 0);
              return (
                <div key={g.name} className="rounded-2xl border border-border bg-background overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border flex items-center gap-1.5 text-[12px]">
                    <ShieldCheck className="h-3.5 w-3.5 text-accent-tea" />
                    <span className="font-medium">{g.name}</span>
                    <span className="text-muted-foreground">· {SELLER_LABEL[g.type] ?? "会员"}</span>
                    <span className="ml-auto text-muted-foreground">小计 <b className="text-cat-decor">¥{sub.toLocaleString()}</b></span>
                  </div>
                  <ul className="divide-y divide-border">
                    {g.lines.map((l) => (
                      <li key={l.cartId} className="p-3.5 flex gap-3">
                        <Link href={`/supplies/${l.product.id}`} className={cn("h-16 w-16 rounded-xl overflow-hidden shrink-0 relative", THUMB[colorFor(l.product.brand || l.product.name)])}>
                          {l.product.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={l.product.imageUrl} alt={l.product.name} className="absolute inset-0 w-full h-full object-cover" />
                          )}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/supplies/${l.product.id}`} className="text-[14px] font-medium line-clamp-1 hover:text-brand">{l.product.name}</Link>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{l.product.brand} · ¥{l.unitPrice}/{l.product.unit}{l.unitPrice < l.product.memberPrice && <span className="text-accent-tea ml-1">阶梯价</span>}</div>
                          <div className="mt-2 flex items-center gap-2">
                            <form action={updateCartQtyAction} className="inline-flex items-center gap-1">
                              <input type="hidden" name="cartId" value={l.cartId} />
                              <input name="qty" type="number" min={1} defaultValue={l.qty} className="w-16 h-8 rounded-lg border border-border bg-background px-2 text-[13px] outline-none focus:border-foreground/30" />
                              <span className="text-[11px] text-muted-foreground">{l.product.unit}</span>
                              <button className="h-8 px-2.5 rounded-lg border border-border text-[12px] hover:bg-surface">更新</button>
                            </form>
                            <span className="ml-auto text-[14px] font-semibold text-cat-decor tabular-nums">¥{l.lineTotal.toLocaleString()}</span>
                            <form action={removeCartAction}>
                              <input type="hidden" name="cartId" value={l.cartId} />
                              <button className="h-8 w-8 rounded-lg hover:bg-cat-decor-soft text-muted-foreground hover:text-cat-decor inline-flex items-center justify-center" title="移除"><Trash2 className="h-3.5 w-3.5" /></button>
                            </form>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* 结算条 */}
          <div className="mt-5 rounded-2xl border border-border bg-background p-4 flex items-center justify-between gap-4 flex-wrap sticky bottom-2">
            <div className="text-[13px] text-muted-foreground">
              共 <b className="text-foreground">{lines.length}</b> 种商品 · 合计 <b className="text-cat-decor text-[18px]">¥{total.toLocaleString()}</b>
              {groups.size > 1 && <span className="ml-2">（{groups.size} 个卖家，将分别生成采购单）</span>}
            </div>
            <form action={checkoutCartAction}>
              <button className="h-11 px-6 rounded-full bg-foreground text-background text-[14px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform">
                提交采购单 <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </Container>
  );
}
