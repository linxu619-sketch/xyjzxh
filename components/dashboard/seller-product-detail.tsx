import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, ShieldCheck, TrendingDown, Swords, Power } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { resolveSeller } from "@/lib/dashboard/seller";
import { getProduct, type ReasonType, type ProductStatus } from "@/lib/data/supplies-source";
import { toggleMyListingAction } from "@/app/(dashboard)/dashboard/store-actions";

const REASON_LABEL: Record<ReasonType, string> = { agent: "独家代理", self: "自产自销", direct: "厂家直供" };
const STATUS: Record<ProductStatus, { label: string; tone: "yellow" | "tea" | "decor" | "neutral" }> = {
  pending: { label: "待审核", tone: "yellow" },
  active: { label: "在架", tone: "tea" },
  rejected: { label: "已驳回", tone: "decor" },
  off: { label: "已下架", tone: "neutral" },
};

// 卖家（企业/个人会员）查看自己上架的某个商品 + 上下架操作
export async function SellerProductDetail({ id }: { id: number }) {
  const seller = await resolveSeller();
  if (!seller) return <div className="rounded-2xl border border-border bg-background p-10 text-center text-[14px] text-muted-foreground">请用会员账号登录。</div>;
  const p = id ? getProduct(id) : undefined;
  const owned = p && p.sellerType === seller.type && p.sellerId === seller.id;
  if (!owned) notFound();

  const st = STATUS[p!.status];
  const off = p!.marketPrice > 0 ? Math.round((1 - p!.memberPrice / p!.marketPrice) * 100) : 0;
  const selfHref = `${seller.base}/product/${p!.id}`;
  const replaced = p!.status === "off" && (p!.rejectReason ?? "").startsWith("价格擂台");

  return (
    <>
      <Link href={seller.base} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回我的店铺
      </Link>

      <div className="rounded-2xl border border-border bg-background p-5 md:p-6 max-w-2xl">
        <div className="flex items-start gap-4 pb-5 border-b border-border">
          <span className="h-12 w-12 rounded-2xl bg-surface inline-flex items-center justify-center shrink-0"><Package className="h-5 w-5 text-cat-build" /></span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[18px] font-semibold">{p!.name}</span>
              {p!.brand && <Badge tone="brand" className="!px-2 !py-0.5">{p!.brand}</Badge>}
              <Badge tone="decor">{p!.category}</Badge>
              <span className="inline-flex items-center gap-0.5 text-[11px] text-accent-tea"><ShieldCheck className="h-3 w-3" />{REASON_LABEL[p!.reasonType]}</span>
            </div>
            <div className="text-[12px] text-muted-foreground mt-1">{p!.spec ? p!.spec + " · " : ""}起批 {p!.moq}{p!.unit}</div>
          </div>
          {replaced
            ? <Badge tone="decor" className="shrink-0 inline-flex items-center gap-1"><Swords className="h-3 w-3" />擂台被替换</Badge>
            : <Badge tone={st.tone} className="shrink-0">{st.label}</Badge>}
        </div>

        <dl className="mt-5 space-y-3 text-[13px]">
          <Row k="会员批发价" v={<span><b className="text-cat-decor text-[15px]">¥{p!.memberPrice}</b><span className="line-through ml-1.5 text-[11px] text-muted-foreground">¥{p!.marketPrice}</span>/{p!.unit}{off > 0 && <span className="text-accent-tea ml-2 inline-flex items-center gap-0.5"><TrendingDown className="h-3 w-3" />省{off}%</span>}</span>} />
          {p!.priceTiers.length > 0 && <Row k="阶梯量价" v={p!.priceTiers.map((t) => `满${t.minQty}${p!.unit}→¥${t.price}`).join(" · ")} />}
          {p!.reasonNote && <Row k="资格说明" v={p!.reasonNote} />}
          {(p!.status === "rejected" || p!.status === "off") && p!.rejectReason && (
            <Row k={replaced ? "擂台" : p!.status === "rejected" ? "驳回原因" : "下架原因"} v={<span className={replaced ? "text-[#a37200]" : "text-cat-decor"}>{p!.rejectReason}</span>} />
          )}
        </dl>

        <div className="mt-6 pt-5 border-t border-border">
          <div className="text-[12px] text-muted-foreground mb-3 inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> 操作</div>
          {p!.status === "pending" ? (
            <p className="text-[12px] text-muted-foreground">协会审核中，通过后自动在架。</p>
          ) : replaced ? (
            <form action={toggleMyListingAction}>
              <input type="hidden" name="id" value={p!.id} />
              <input type="hidden" name="status" value="active" />
              <input type="hidden" name="redirect" value={selfHref} />
              <button className="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Power className="h-4 w-4" /> 以更低价重新上架（夺回擂台）</button>
            </form>
          ) : (p!.status === "active" || p!.status === "off") ? (
            <form action={toggleMyListingAction}>
              <input type="hidden" name="id" value={p!.id} />
              <input type="hidden" name="status" value={p!.status === "active" ? "off" : "active"} />
              <input type="hidden" name="redirect" value={selfHref} />
              <button className={cn("h-10 px-5 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5", p!.status === "active" ? "border border-cat-decor/40 text-cat-decor hover:bg-cat-decor-soft" : "bg-foreground text-background")}>
                <Power className="h-4 w-4" /> {p!.status === "active" ? "下架该商品" : "重新上架"}
              </button>
            </form>
          ) : (
            <p className="text-[12px] text-muted-foreground">已驳回，可修改后重新提交上架。</p>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <dt className="text-muted-foreground w-24 shrink-0">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
