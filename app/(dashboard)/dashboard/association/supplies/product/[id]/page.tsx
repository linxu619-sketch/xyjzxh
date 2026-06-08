import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, CheckCircle2, TrendingDown, ShieldCheck, Swords, AlertTriangle, Power, Coins, FileText } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { getProduct, brandActiveHolder, type ReasonType } from "@/lib/data/supplies-source";
import { setProductStatusAction, approveListingAction, rejectListingAction, replaceListingAction, setCommissionAction } from "../../actions";
import { ProductDetailEditor } from "./ProductDetailEditor";

export const metadata = { title: "商品详情 · 建材集采" };

const REASON_LABEL: Record<ReasonType, string> = { agent: "独家代理", self: "自产自销", direct: "厂家直供" };
const SELLER_LABEL: Record<string, string> = { association: "协会自营", enterprise: "企业会员", practitioner: "个人会员" };

export default async function SupplyProductDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ cok?: string; dok?: string }> }) {
  const { id: idStr } = await params;
  const { cok, dok } = await searchParams;
  const id = Number(idStr);
  const p = id ? getProduct(id) : undefined;
  if (!p) notFound();

  const isPending = p!.status === "pending";
  const holder = isPending ? brandActiveHolder(p!.brand, p!.id) : undefined;
  const off = p!.marketPrice > 0 ? Math.round((1 - p!.memberPrice / p!.marketPrice) * 100) : 0;
  const selfHref = `/dashboard/association/supplies/product/${p!.id}`;
  const backHref = isPending ? "/dashboard/association/supplies?tab=review" : "/dashboard/association/supplies";

  return (
    <AssociationShell title="商品详情" subtitle={`${SELLER_LABEL[p!.sellerType]} · ${p!.sellerName}`}>
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回列表
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
            <div className="text-[12px] text-muted-foreground mt-1">{SELLER_LABEL[p!.sellerType]} · {p!.sellerName} · {p!.spec ? p!.spec + " · " : ""}起批 {p!.moq}{p!.unit}</div>
          </div>
          <Badge tone={p!.status === "active" ? "tea" : p!.status === "pending" ? "yellow" : p!.status === "rejected" ? "decor" : "neutral"} className="shrink-0">
            {p!.status === "active" ? "在架" : p!.status === "pending" ? "待审核" : p!.status === "rejected" ? "已驳回" : "已下架"}
          </Badge>
        </div>

        <dl className="mt-5 space-y-3 text-[13px]">
          <Row k="会员批发价" v={<span><b className="text-cat-decor text-[15px]">¥{p!.memberPrice}</b><span className="line-through ml-1.5 text-[11px] text-muted-foreground">¥{p!.marketPrice}</span>/{p!.unit}{off > 0 && <span className="text-accent-tea ml-2 inline-flex items-center gap-0.5"><TrendingDown className="h-3 w-3" />省{off}%</span>}</span>} />
          {p!.priceTiers.length > 0 && <Row k="阶梯量价" v={p!.priceTiers.map((t) => `满${t.minQty}${p!.unit}→¥${t.price}`).join(" · ")} />}
          <Row k="平台佣金" v={<span className="font-semibold text-cat-build">{p!.commissionPct.toFixed(2)}%</span>} />
          <Row k="库存" v={p!.stock > 0 ? `${p!.stock}${p!.unit}` : "现货 / 不限"} />
          {p!.origin && <Row k="产地" v={p!.origin} />}
          {p!.leadTime && <Row k="货期 / 交期" v={p!.leadTime} />}
          {p!.shipping && <Row k="物流 / 运费" v={p!.shipping} />}
          {p!.afterSale && <Row k="售后服务" v={p!.afterSale} />}
          {p!.params.length > 0 && <Row k="规格参数" v={<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">{p!.params.map((pm, i) => <span key={i} className="text-[12px]"><span className="text-muted-foreground">{pm.k}：</span>{pm.v}</span>)}</div>} />}
          {p!.description && <Row k="图文详情" v={<span className="whitespace-pre-wrap text-[12px] leading-5">{p!.description}</span>} />}
          {p!.reasonNote && <Row k="资格说明" v={p!.reasonNote} />}
          {p!.proofUrl && <Row k="资格证明" v={<a href={p!.proofUrl} target="_blank" rel="noreferrer" className="text-brand">查看证明 →</a>} />}
          {p!.status === "rejected" && p!.rejectReason && <Row k="驳回原因" v={<span className="text-cat-decor">{p!.rejectReason}</span>} />}
        </dl>

        {/* 价格擂台对比（待审核且品牌已有在架卖家） */}
        {isPending && holder && (() => {
          const cheaper = p!.memberPrice < holder.memberPrice;
          const delta = holder.memberPrice - p!.memberPrice;
          const pct = holder.memberPrice > 0 ? Math.round((Math.abs(delta) / holder.memberPrice) * 100) : 0;
          return (
            <div className="mt-5 rounded-xl border border-accent-yellow/40 bg-[#fff6d6]/40 p-3">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#a37200] mb-2"><Swords className="h-4 w-4" /> 价格擂台 · 同品牌「{p!.brand}」唯一最低价</div>
              <div className="grid grid-cols-2 gap-2">
                <div className={cn("rounded-lg p-3 border", cheaper ? "border-accent-tea/50 bg-[#e6f7f1]" : "border-border bg-background")}>
                  <div className="text-[10px] text-muted-foreground">挑战者（本次提交）</div>
                  <div className="text-[12px] font-medium truncate">{p!.sellerName}</div>
                  <div className="text-[16px] font-semibold text-cat-decor tabular-nums mt-1">¥{p!.memberPrice}<span className="text-[10px] text-muted-foreground font-normal">/{p!.unit}</span></div>
                </div>
                <div className="rounded-lg p-3 border border-border bg-background">
                  <div className="text-[10px] text-muted-foreground">当前在架</div>
                  <div className="text-[12px] font-medium truncate">{holder.sellerName}</div>
                  <div className="text-[16px] font-semibold tabular-nums mt-1">¥{holder.memberPrice}<span className="text-[10px] text-muted-foreground font-normal">/{holder.unit}</span></div>
                </div>
              </div>
              <div className={cn("mt-2 text-[11px] font-medium inline-flex items-center gap-1", cheaper ? "text-accent-tea" : "text-cat-decor")}>
                {cheaper
                  ? <><TrendingDown className="h-3 w-3" /> 挑战价更低 ¥{delta}（{pct}%）· 可裁定替换在架卖家</>
                  : <><AlertTriangle className="h-3 w-3" /> 未低于在架价（{delta === 0 ? "持平" : `高 ¥${-delta}`}）· 不可替换，请驳回或令其调价</>}
              </div>
            </div>
          );
        })()}

        {/* 操作区 */}
        <div className="mt-6 pt-5 border-t border-border">
          <div className="text-[12px] text-muted-foreground mb-3 inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> 操作</div>
          {isPending ? (
            <div className="flex flex-wrap items-center gap-2">
              {holder ? (
                <form action={replaceListingAction}>
                  <input type="hidden" name="id" value={p!.id} />
                  <button disabled={p!.memberPrice >= holder.memberPrice} className="h-10 px-5 rounded-full bg-accent-tea text-white text-[13px] font-medium inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"><CheckCircle2 className="h-4 w-4" /> 通过并替换（擂台胜出）</button>
                </form>
              ) : (
                <form action={approveListingAction}>
                  <input type="hidden" name="id" value={p!.id} />
                  <button className="h-10 px-5 rounded-full bg-accent-tea text-white text-[13px] font-medium inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> 通过上架</button>
                </form>
              )}
              <form action={rejectListingAction} className="flex items-center gap-2">
                <input type="hidden" name="id" value={p!.id} />
                <input name="reason" placeholder="驳回原因（选填）" className="h-10 px-3 rounded-full border border-border text-[13px] bg-background outline-none focus:border-foreground/30 w-44" />
                <button className="h-10 px-5 rounded-full border border-cat-decor/40 text-cat-decor text-[13px] hover:bg-cat-decor-soft">驳回</button>
              </form>
            </div>
          ) : (p!.status === "active" || p!.status === "off") ? (
            <form action={setProductStatusAction}>
              <input type="hidden" name="id" value={p!.id} />
              <input type="hidden" name="status" value={p!.status === "active" ? "off" : "active"} />
              <input type="hidden" name="redirect" value={selfHref} />
              <button className={cn("h-10 px-5 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5", p!.status === "active" ? "border border-cat-decor/40 text-cat-decor hover:bg-cat-decor-soft" : "bg-foreground text-background")}>
                <Power className="h-4 w-4" /> {p!.status === "active" ? "下架该商品" : "重新上架"}
              </button>
            </form>
          ) : (
            <p className="text-[12px] text-muted-foreground">该商品已驳回，会员可修改后重新提交。</p>
          )}
        </div>
      </div>

      {(cok || dok) && <div className="mt-4 max-w-2xl rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-3 text-[13px]">{cok ? "平台佣金已更新。" : "商品详情已保存。"}</div>}

      {/* 平台佣金设置（0-2%） */}
      <div className="mt-4 rounded-2xl border border-border bg-background p-5 md:p-6 max-w-2xl">
        <div className="text-[14px] font-semibold mb-1 inline-flex items-center gap-1.5"><Coins className="h-4 w-4 text-cat-build" /> 平台佣金</div>
        <p className="text-[12px] text-muted-foreground mb-3">按成交额向平台抽取的佣金比例，范围 0%–2%。当前 <b className="text-foreground">{p!.commissionPct.toFixed(2)}%</b>。</p>
        <form action={setCommissionAction} className="flex items-center gap-2 flex-wrap">
          <input type="hidden" name="id" value={p!.id} />
          <div className="inline-flex items-center gap-1.5">
            <input name="commissionPct" type="number" min="0" max="2" step="0.05" defaultValue={p!.commissionPct} className="h-10 w-24 rounded-xl border border-border bg-background px-3 text-[14px] outline-none focus:border-foreground/30" />
            <span className="text-[13px] text-muted-foreground">%</span>
          </div>
          <button className="h-10 px-5 rounded-full bg-cat-build text-white text-[13px] font-medium">保存佣金</button>
          <span className="text-[11px] text-muted-foreground">示例：成交 ¥{(p!.memberPrice * p!.moq).toLocaleString()} → 平台得 ¥{((p!.memberPrice * p!.moq) * p!.commissionPct / 100).toFixed(2)}</span>
        </form>
      </div>

      {/* 商品详情编辑（1688 式：图文/参数/产地/货期/物流/售后/库存） */}
      <div className="mt-4 rounded-2xl border border-border bg-background p-5 md:p-6 max-w-2xl">
        <div className="text-[14px] font-semibold mb-1 inline-flex items-center gap-1.5"><FileText className="h-4 w-4 text-cat-design" /> 商品详情（买家详情页展示）</div>
        <p className="text-[12px] text-muted-foreground mb-4">完善图文详情与规格参数，买家更易下单；卖家上架时也可填写，平台可在此补充/修订。</p>
        <ProductDetailEditor id={p!.id} description={p!.description} params={p!.params} origin={p!.origin} leadTime={p!.leadTime} shipping={p!.shipping} afterSale={p!.afterSale} stock={p!.stock} />
      </div>
    </AssociationShell>
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
