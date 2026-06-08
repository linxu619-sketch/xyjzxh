import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, QrCode, Landmark, CheckCircle2, ShieldCheck, Coins } from "lucide-react";
import { getPayment } from "@/lib/data/payments-source";
import { getProvider, PAY_METHODS, type PayMethod } from "@/lib/payments";
import { confirmPaymentAction, setPayMethodAction } from "../actions";

export const metadata = { title: "收银台 · 信阳市建筑装饰装修协会" };

const METHOD_LABEL: Record<PayMethod, string> = { alipay: "支付宝", wechat: "微信支付", bank_corp: "银行转账 · 对公", bank_personal: "银行转账 · 对私" };

export default async function PayPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const { id } = await params;
  const { ok } = await searchParams;
  const pay = getPayment(Number(id));
  if (!pay) notFound();
  const provider = getProvider(pay.method);
  const ins = provider ? await provider.initiate({ outTradeNo: pay.outTradeNo, amount: pay.amount, subject: pay.subject, payerName: pay.payerName }) : undefined;
  const paid = pay.status === "paid";

  return (
    <div className="min-h-screen bg-surface py-6 md:py-12 px-4">
      <div className="mx-auto max-w-lg">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回工作台</Link>

        <div className="rounded-3xl border border-border bg-background overflow-hidden">
          <div className="bg-foreground text-background p-5 md:p-6">
            <div className="text-[12px] text-background/70 tracking-wider uppercase">收银台 · 应付金额</div>
            <div className="mt-1 text-[40px] font-semibold tracking-tight tabular-nums">¥{pay.amount.toLocaleString()}</div>
            <div className="mt-1 text-[12px] text-background/70">{pay.subject || "建材采购"} · 订单号 {pay.outTradeNo}</div>
          </div>

          {paid || ok ? (
            <div className="p-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-accent-tea mx-auto" />
              <div className="mt-3 text-[17px] font-semibold">支付成功 · 已到账</div>
              <div className="mt-1 text-[13px] text-muted-foreground">业务单已结算。{pay.commission > 0 && `平台佣金 ¥${pay.commission.toLocaleString()}，卖家应结 ¥${pay.payeeAmount.toLocaleString()}。`}</div>
              <Link href="/dashboard" className="mt-5 inline-flex h-11 px-6 rounded-full bg-foreground text-background text-[14px] font-medium items-center">完成</Link>
            </div>
          ) : (
            <div className="p-5 md:p-6 space-y-5">
              {/* 分成明细 */}
              <div className="rounded-2xl bg-surface p-4 text-[13px] space-y-1.5">
                <div className="flex justify-between"><span className="text-muted-foreground">收款方</span><span className="font-medium">{pay.payeeName || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground inline-flex items-center gap-1"><Coins className="h-3.5 w-3.5" /> 平台佣金</span><span className="font-medium">¥{pay.commission.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">卖家应结</span><span className="font-medium">¥{pay.payeeAmount.toLocaleString()}</span></div>
              </div>

              {/* 渠道指引 */}
              <div>
                <div className="text-[12px] text-muted-foreground mb-2">支付方式：<b className="text-foreground">{METHOD_LABEL[pay.method]}</b></div>
                {ins?.kind === "qrcode" && (
                  <div className="rounded-2xl border border-border p-5 flex flex-col items-center text-center">
                    <div className="h-40 w-40 rounded-xl bg-surface border border-dashed border-border flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                    <div className="mt-3 text-[12px] text-muted-foreground leading-5">{ins.note}</div>
                    <code className="mt-1 text-[10px] text-muted-foreground/70 break-all">{ins.qrContent}</code>
                  </div>
                )}
                {ins?.kind === "bank_transfer" && (
                  <div className="rounded-2xl border border-border p-4 text-[13px] space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 font-medium mb-1"><Landmark className="h-4 w-4 text-cat-build" /> {ins.bank.type === "corporate" ? "对公收款账户" : "对私收款账户"}</div>
                    <div className="flex justify-between"><span className="text-muted-foreground">户名</span><span className="font-medium">{ins.bank.accountName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">账号</span><span className="font-medium tabular-nums">{ins.bank.accountNo}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">开户行</span><span className="font-medium">{ins.bank.bankName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">转账备注</span><span className="font-medium">{ins.memo}</span></div>
                    <div className="mt-2 text-[11px] text-muted-foreground leading-5">{ins.note}</div>
                  </div>
                )}
              </div>

              {/* 切换支付方式 */}
              <div className="flex flex-wrap gap-2">
                {PAY_METHODS.map((m) => (
                  <form key={m.method} action={setPayMethodAction}>
                    <input type="hidden" name="id" value={pay.id} />
                    <input type="hidden" name="method" value={m.method} />
                    <button className={`h-9 px-3 rounded-full border text-[12px] inline-flex items-center gap-1 ${m.method === pay.method ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:bg-surface"}`}>
                      <span>{m.icon}</span> {m.label}
                    </button>
                  </form>
                ))}
              </div>

              {/* 确认到账（演示）：真实环境由渠道回调触发 */}
              <form action={confirmPaymentAction}>
                <input type="hidden" name="id" value={pay.id} />
                <button className="w-full h-12 rounded-full bg-accent-tea text-white text-[15px] font-medium inline-flex items-center justify-center gap-2"><CheckCircle2 className="h-5 w-5" /> 我已支付 · 确认到账</button>
              </form>
              <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> 演示：未接入真实渠道，点击「确认到账」手动结算；接入后由支付回调自动完成。</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
