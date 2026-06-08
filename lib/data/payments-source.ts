import "server-only";
import { getDb } from "@/lib/db/sqlite";
import type { PayMethod, PayStatus } from "@/lib/payments";

/* ============================================================
   统一支付单（payments）：业务单 → 支付单 → 渠道收款 → 结算/佣金拆分
   ============================================================ */

export type Payment = {
  id: number; outTradeNo: string; bizType: string; bizId: number; method: PayMethod;
  amount: number; commission: number; payeeAmount: number; status: PayStatus;
  channelRef: string; payerName: string; payeeName: string; subject: string; createdAt: number; paidAt: number;
};

type Row = {
  id: number; out_trade_no: string | null; biz_type: string | null; biz_id: number | null; method: string | null;
  amount: number | null; commission: number | null; payee_amount: number | null; status: string | null;
  channel_ref: string | null; payer_name: string | null; payee_name: string | null; subject: string | null; created_at: number | null; paid_at: number | null;
};
function toP(r: Row): Payment {
  return {
    id: r.id, outTradeNo: r.out_trade_no ?? "", bizType: r.biz_type ?? "", bizId: r.biz_id ?? 0, method: (r.method as PayMethod) ?? "alipay",
    amount: r.amount ?? 0, commission: r.commission ?? 0, payeeAmount: r.payee_amount ?? 0, status: (r.status as PayStatus) ?? "pending",
    channelRef: r.channel_ref ?? "", payerName: r.payer_name ?? "", payeeName: r.payee_name ?? "", subject: r.subject ?? "", createdAt: r.created_at ?? 0, paidAt: r.paid_at ?? 0,
  };
}

export function createPayment(input: {
  bizType: string; bizId: number; method: PayMethod; amount: number; commissionPct?: number;
  payerName?: string; payeeName?: string; subject?: string;
}): Payment {
  const db = getDb();
  const seq = (db.prepare("SELECT COUNT(*) AS c FROM payments").get() as { c: number }).c + 1;
  const now = Date.now();
  const outTradeNo = `PAY${now}${String(seq).padStart(4, "0")}`;
  const amount = Math.max(0, Math.round(input.amount));
  const commission = Math.round((amount * Math.min(2, Math.max(0, input.commissionPct ?? 0))) / 100);
  const payeeAmount = amount - commission;
  const info = db.prepare(
    `INSERT INTO payments (out_trade_no,biz_type,biz_id,method,amount,commission,payee_amount,status,payer_name,payee_name,subject,created_at)
     VALUES (?,?,?,?,?,?,?, 'pending', ?,?,?, ?)`,
  ).run(outTradeNo, input.bizType, input.bizId, input.method, amount, commission, payeeAmount, input.payerName ?? "", input.payeeName ?? "", input.subject ?? "", now);
  return getPayment(Number(info.lastInsertRowid))!;
}

export function getPayment(id: number): Payment | undefined {
  const r = getDb().prepare("SELECT * FROM payments WHERE id=?").get(id) as Row | undefined;
  return r ? toP(r) : undefined;
}
export function getPaymentByOutTradeNo(no: string): Payment | undefined {
  const r = getDb().prepare("SELECT * FROM payments WHERE out_trade_no=?").get(no) as Row | undefined;
  return r ? toP(r) : undefined;
}
export function listPaymentsByBiz(bizType: string, bizId: number): Payment[] {
  return (getDb().prepare("SELECT * FROM payments WHERE biz_type=? AND biz_id=? ORDER BY created_at DESC").all(bizType, bizId) as Row[]).map(toP);
}
// 标记到账（渠道回调 / 人工确认）
export function markPaymentPaid(id: number, channelRef?: string) {
  getDb().prepare("UPDATE payments SET status='paid', channel_ref=?, paid_at=? WHERE id=? AND status!='paid'").run(channelRef ?? "manual", Date.now(), id);
}
export function setPaymentStatus(id: number, status: PayStatus) {
  getDb().prepare("UPDATE payments SET status=? WHERE id=?").run(status, id);
}
// 收银台切换支付渠道（仅未支付时）
export function setPaymentMethod(id: number, method: PayMethod) {
  getDb().prepare("UPDATE payments SET method=? WHERE id=? AND status='pending'").run(method, id);
}
// 平台资金概览（佣金/成交额）
export type PaySummary = { paidCount: number; gmv: number; commission: number; pendingCount: number };
export function paymentsSummary(): PaySummary {
  const rows = (getDb().prepare("SELECT status,amount,commission FROM payments").all() as { status: string; amount: number; commission: number }[]);
  let paidCount = 0, gmv = 0, commission = 0, pendingCount = 0;
  for (const r of rows) {
    if (r.status === "paid") { paidCount++; gmv += r.amount; commission += r.commission; }
    else if (r.status === "pending") pendingCount++;
  }
  return { paidCount, gmv, commission, pendingCount };
}
