import Link from "next/link";
import { Coins, Wallet, HandCoins, CheckCircle2, Undo2, ArrowRight, AlertTriangle } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { Badge } from "@/components/ui/badge";
import { GuardedActionModal } from "@/components/dashboard/guarded-action-modal";
import { listAllPayments, paymentsSummary, type Payment } from "@/lib/data/payments-source";
import type { PayMethod, PayStatus } from "@/lib/payments";
import { markPayoutAction, refundPaymentAction, confirmReceiptAction } from "./actions";

export const metadata = { title: "平台资金 · 收银 / 结算 · 协会工作台" };

const METHOD_LABEL: Record<PayMethod, string> = { alipay: "支付宝", wechat: "微信", bank_corp: "对公转账", bank_personal: "对私转账" };
const STATUS_LABEL: Record<PayStatus, string> = { pending: "待付", paid: "已到账", failed: "失败", refunded: "已退款", closed: "已关闭" };
const STATUS_TONE: Record<PayStatus, "yellow" | "tea" | "decor" | "neutral"> = { pending: "yellow", paid: "tea", failed: "decor", refunded: "neutral", closed: "neutral" };
const BIZ_LABEL: Record<string, string> = { supply_order: "建材采购", construction_order: "施工订单" };

// 资金台筛选：把支付单生命周期切成 5 段
const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待收款" },
  { key: "payable", label: "待结算给卖家" },
  { key: "settled", label: "已结给卖家" },
  { key: "refunded", label: "已退款" },
];

function matchFilter(p: Payment, f: string): boolean {
  switch (f) {
    case "pending": return p.status === "pending";
    case "payable": return p.status === "paid" && p.payoutStatus !== "settled";
    case "settled": return p.status === "paid" && p.payoutStatus === "settled";
    case "refunded": return p.status === "refunded";
    default: return true;
  }
}

function fmt(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }

export default async function PlatformPayments({ searchParams }: { searchParams: Promise<{ s?: string; m?: string; err?: string; id?: string; ok?: string }> }) {
  const { s: sFilter, m: mFilter, err, id: errId, ok } = await searchParams;
  const filter = FILTERS.some((f) => f.key === sFilter) ? sFilter! : "all";
  const method = (["alipay", "wechat", "bank_corp", "bank_personal"] as PayMethod[]).includes(mFilter as PayMethod) ? (mFilter as PayMethod) : undefined;

  const all = listAllPayments();
  const sum = paymentsSummary();
  const payments = all.filter((p) => matchFilter(p, filter) && (!method || p.method === method));

  const qs = (next: { s?: string; m?: string }) => {
    const sp = new URLSearchParams();
    const s2 = next.s ?? filter, m2 = next.m === "" ? undefined : (next.m ?? method);
    if (s2 && s2 !== "all") sp.set("s", s2);
    if (m2) sp.set("m", m2);
    const str = sp.toString();
    return str ? `?${str}` : "/dashboard/association/payments";
  };

  return (
    <AssociationShell title="平台资金 · 收银 / 结算" subtitle={`待结算给卖家 ${sum.payableCount} 笔 · 待收款 ${sum.pendingCount} 笔`}>
      <div className="mb-4 rounded-2xl border border-border bg-surface/50 px-4 py-2.5 text-[12px] text-muted-foreground leading-5">
        平台收银台代收全款 → 自动拆分 <b className="text-foreground">平台佣金</b>（商品 0–2%）与<b className="text-foreground">卖家应结</b>。资金走完整生命周期：<b className="text-foreground">待收款 → 已到账 → 应付卖家结算（线下打款后逐笔标记）→ 已结清</b>；异常单可<b className="text-foreground">退款</b>。打款 / 退款均需管理员密码二次核验。
      </div>

      {ok === "receipt" && <Banner tone="ok" text="已确认到账，该笔转入「待结算给卖家」。" />}
      {ok === "payout" && <Banner tone="ok" text="已标记向卖家打款，该笔转入「已结给卖家」。" />}
      {ok === "refund" && <Banner tone="ok" text="已退款，该笔转入「已退款」并记入台账。" />}

      <StatFilters
        items={[
          { key: "gmv", label: "成交额(已到账)", value: `¥${sum.gmv.toLocaleString()}`, color: "text-cat-decor" },
          { key: "commission", label: "平台佣金收入", value: `¥${sum.commission.toLocaleString()}`, color: "text-cat-build" },
          { key: "payable", label: "应付卖家·待结", value: `¥${sum.payableAmount.toLocaleString()}`, color: "text-accent-yellow", href: qs({ s: "payable" }), active: filter === "payable" },
          { key: "settled", label: "已结给卖家", value: `¥${sum.settledAmount.toLocaleString()}`, color: "text-accent-tea", href: qs({ s: "settled" }), active: filter === "settled" },
        ]}
      />

      {/* 待办：有待结算 / 待收款时高亮提示，点击直达筛选 */}
      {(sum.payableCount > 0 || sum.pendingCount > 0) && (
        <div className="mb-5 rounded-2xl border border-accent-yellow/40 bg-accent-yellow/5 px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground"><AlertTriangle className="h-4 w-4 text-accent-yellow" /> 资金待办</span>
          {sum.payableCount > 0 && (
            <Link href={qs({ s: "payable" })} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              待结算给卖家 <b className="text-foreground">{sum.payableCount}</b> 笔 · <b className="text-accent-yellow">¥{sum.payableAmount.toLocaleString()}</b> <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          {sum.pendingCount > 0 && (
            <Link href={qs({ s: "pending" })} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              待收款 <b className="text-foreground">{sum.pendingCount}</b> 笔 · ¥{sum.pendingAmount.toLocaleString()} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          {sum.refundedCount > 0 && <span className="text-muted-foreground">累计退款 {sum.refundedCount} 笔 · ¥{sum.refundedAmount.toLocaleString()}</span>}
        </div>
      )}

      {/* 筛选条：生命周期分段 + 渠道 */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => (
          <Link key={f.key} href={qs({ s: f.key })} className={`h-8 px-3 rounded-full border text-[12px] inline-flex items-center ${filter === f.key ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:bg-surface"}`}>
            {f.label}
          </Link>
        ))}
        <span className="mx-1 h-4 w-px bg-border" />
        <Link href={qs({ m: "" })} className={`h-8 px-3 rounded-full border text-[12px] inline-flex items-center ${!method ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:bg-surface"}`}>全渠道</Link>
        {(["alipay", "wechat", "bank_corp", "bank_personal"] as PayMethod[]).map((m) => (
          <Link key={m} href={qs({ m })} className={`h-8 px-3 rounded-full border text-[12px] inline-flex items-center ${method === m ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:bg-surface"}`}>{METHOD_LABEL[m]}</Link>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold inline-flex items-center gap-1.5"><Coins className="h-4 w-4 text-cat-build" /> 支付单 · 收银 / 结算流水 <span className="text-[12px] font-normal text-muted-foreground">（{payments.length}）</span></div>
        {payments.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">{filter === "all" && !method ? "暂无收银台成交。会员通过平台收银台付款后会出现在这里（账期月结的订单不走收银台、不在此列）。" : "当前筛选下无记录。"}</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1.5fr_1fr_0.8fr_0.9fr_1fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
              <span>订单号 / 商品</span><span>付款方 → 收款方</span><span>金额</span><span>佣金 / 应结</span><span>结算状态</span><span className="text-right">操作</span>
            </div>
            <ul className="divide-y divide-border">
              {payments.map((p) => {
                const payable = p.status === "paid" && p.payoutStatus !== "settled";
                return (
                  <li key={p.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[1.5fr_1fr_0.8fr_0.9fr_1fr_auto] gap-3 items-center px-5 py-3.5 text-[13px]">
                    <span className="min-w-0">
                      <span className="font-medium truncate block">{p.subject || BIZ_LABEL[p.bizType] || p.bizType}</span>
                      <span className="text-[11px] text-muted-foreground truncate block">{p.outTradeNo} · {METHOD_LABEL[p.method] ?? p.method} · {fmt(p.createdAt)}</span>
                    </span>
                    <span className="hidden md:block text-muted-foreground truncate">{p.payerName || "—"} → {p.payeeName || "—"}</span>
                    <span className="hidden md:block font-semibold text-cat-decor tabular-nums">¥{p.amount.toLocaleString()}</span>
                    <span className="hidden md:block text-[12px]"><span className="text-cat-build">佣 ¥{p.commission.toLocaleString()}</span> <span className="text-muted-foreground">/ 结 ¥{p.payeeAmount.toLocaleString()}</span></span>
                    {/* 结算状态：状态徽章 + 应付卖家进度 */}
                    <span className="hidden md:flex flex-col gap-0.5 text-[11px]">
                      <Badge tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                      {p.status === "paid" && (p.payoutStatus === "settled"
                        ? <span className="text-accent-tea inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> 已打款 {fmt(p.payoutAt)}{p.payoutBy && ` · ${p.payoutBy}`}</span>
                        : <span className="text-accent-yellow">待结算 ¥{p.payeeAmount.toLocaleString()}</span>)}
                      {p.status === "refunded" && <span className="text-muted-foreground">退款 {fmt(p.refundedAt)}</span>}
                    </span>
                    {/* 操作 */}
                    <span className="text-right flex md:flex-col items-end justify-end gap-1.5">
                      {payable && (
                        <>
                          <GuardedActionModal
                            action={markPayoutAction}
                            hidden={{ id: String(p.id) }}
                            trigger={<span className="inline-flex items-center gap-1"><HandCoins className="h-3.5 w-3.5" /> 标记已打款</span>}
                            triggerClassName="h-8 px-3 rounded-full bg-accent-tea text-white text-[12px] font-medium inline-flex items-center hover:opacity-90"
                            title="确认已向卖家打款"
                            description={`平台已代收 ¥${p.amount.toLocaleString()}，扣佣金 ¥${p.commission.toLocaleString()} 后，应结给卖家「${p.payeeName || "—"}」¥${p.payeeAmount.toLocaleString()}。请在确认已线下转账后再标记，以免账实不符。`}
                            confirmLabel="确认已打款"
                            confirmClassName="h-10 px-4 rounded-full bg-accent-tea text-white text-[13px] font-medium hover:opacity-90"
                            errored={err === "payout" && errId === String(p.id)}
                            errorText="管理员密码不正确，未标记打款，请重试。"
                          />
                          <GuardedActionModal
                            action={refundPaymentAction}
                            hidden={{ id: String(p.id) }}
                            trigger={<span className="inline-flex items-center gap-1"><Undo2 className="h-3.5 w-3.5" /> 退款</span>}
                            triggerClassName="h-8 px-3 rounded-full border border-border text-cat-decor text-[12px] font-medium inline-flex items-center hover:bg-surface"
                            title="确认退款"
                            description={`将全额退款 ¥${p.amount.toLocaleString()} 给付款方「${p.payerName || "—"}」。仅限尚未结算给卖家的单；退款后该笔记入台账。（注：关联业务单状态需另行处理。）`}
                            fields={<><label className="block text-[12px] text-muted-foreground mb-1.5">退款原因（可选）</label><textarea name="note" rows={2} placeholder="如：买家取消、重复支付、协商退单…" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-cat-decor/50 resize-none" /></>}
                            confirmLabel="确认退款"
                            confirmClassName="h-10 px-4 rounded-full bg-cat-decor text-white text-[13px] font-medium hover:opacity-90"
                            errored={err === "refund" && errId === String(p.id)}
                            errorText="管理员密码不正确，未退款，请重试。"
                          />
                        </>
                      )}
                      {p.status === "paid" && p.payoutStatus === "settled" && <span className="text-[12px] text-accent-tea inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> 已结清</span>}
                      {p.status === "pending" && (
                        <>
                          <GuardedActionModal
                            action={confirmReceiptAction}
                            hidden={{ id: String(p.id) }}
                            trigger={<span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> 确认到账</span>}
                            triggerClassName="h-8 px-3 rounded-full bg-accent-tea text-white text-[12px] font-medium inline-flex items-center hover:opacity-90"
                            title="确认款项已到账"
                            description={`核对到付款方「${p.payerName || "—"}」通过${METHOD_LABEL[p.method]}支付的 ¥${p.amount.toLocaleString()}（订单号 ${p.outTradeNo}）。${p.method.startsWith("bank") ? "请在对公/对私账户确认收到该笔款项后再确认，以免账实不符。" : ""}确认后将结算业务单，并转入「待结算给卖家」。`}
                            fields={<><label className="block text-[12px] text-muted-foreground mb-1.5">银行流水号 / 到账参考（可选）</label><input name="ref" placeholder="如银行回单流水号，便于对账" className="w-full rounded-xl border border-border bg-background px-3 h-10 text-[13px] outline-none focus:border-accent-tea/50" /></>}
                            confirmLabel="确认已到账"
                            confirmClassName="h-10 px-4 rounded-full bg-accent-tea text-white text-[13px] font-medium hover:opacity-90"
                            errored={err === "receipt" && errId === String(p.id)}
                            errorText="管理员密码不正确，未确认到账，请重试。"
                          />
                          <Link href={`/dashboard/pay/${p.id}`} className="h-8 px-3 rounded-full border border-border text-[12px] inline-flex items-center text-muted-foreground hover:bg-surface">收银台</Link>
                        </>
                      )}
                      {p.status === "refunded" && <span className="text-[12px] text-muted-foreground">已退款</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        <div className="px-5 py-3 text-[12px] text-muted-foreground border-t border-border inline-flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> 仅统计走平台收银台的成交；佣金为平台实际收入，卖家应结由平台代收后线下打款并在此逐笔核销。</div>
      </div>
    </AssociationShell>
  );
}

function Banner({ tone, text }: { tone: "ok"; text: string }) {
  return (
    <div className={`mb-4 rounded-2xl border px-4 py-2.5 text-[13px] inline-flex items-center gap-2 ${tone === "ok" ? "border-accent-tea/40 bg-accent-tea/5 text-foreground" : ""}`}>
      <CheckCircle2 className="h-4 w-4 text-accent-tea" /> {text}
    </div>
  );
}
