import "server-only";
import { getDb } from "@/lib/db/sqlite";
import type { PayMethod, PayStatus } from "@/lib/payments";

/* ============================================================
   统一支付单（payments）：业务单 → 支付单 → 渠道收款 → 结算/佣金拆分
   ============================================================ */

// 应付卖家结算状态：pending 待结算给卖家 | settled 已打款（仅 status='paid' 的单有意义）
export type PayoutStatus = "pending" | "settled";

export type Payment = {
  id: number; outTradeNo: string; bizType: string; bizId: number; method: PayMethod;
  amount: number; commission: number; payeeAmount: number; status: PayStatus;
  channelRef: string; payerName: string; payeeName: string; subject: string; createdAt: number; paidAt: number;
  payoutStatus: PayoutStatus; payoutAt: number; payoutBy: string; refundedAt: number; refundNote: string;
};

type Row = {
  id: number; out_trade_no: string | null; biz_type: string | null; biz_id: number | null; method: string | null;
  amount: number | null; commission: number | null; payee_amount: number | null; status: string | null;
  channel_ref: string | null; payer_name: string | null; payee_name: string | null; subject: string | null; created_at: number | null; paid_at: number | null;
  payout_status: string | null; payout_at: number | null; payout_by: string | null; refunded_at: number | null; refund_note: string | null;
};
function toP(r: Row): Payment {
  return {
    id: r.id, outTradeNo: r.out_trade_no ?? "", bizType: r.biz_type ?? "", bizId: r.biz_id ?? 0, method: (r.method as PayMethod) ?? "alipay",
    amount: r.amount ?? 0, commission: r.commission ?? 0, payeeAmount: r.payee_amount ?? 0, status: (r.status as PayStatus) ?? "pending",
    channelRef: r.channel_ref ?? "", payerName: r.payer_name ?? "", payeeName: r.payee_name ?? "", subject: r.subject ?? "", createdAt: r.created_at ?? 0, paidAt: r.paid_at ?? 0,
    payoutStatus: (r.payout_status as PayoutStatus) ?? "pending", payoutAt: r.payout_at ?? 0, payoutBy: r.payout_by ?? "", refundedAt: r.refunded_at ?? 0, refundNote: r.refund_note ?? "",
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
// 平台资金总览：全部支付单（最新在前）
export function listAllPayments(): Payment[] {
  return (getDb().prepare("SELECT * FROM payments ORDER BY created_at DESC").all() as Row[]).map(toP);
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

/* ---- 资金「下半场」：应付卖家结算（打款） + 退款 ---- */

// 标记「已向卖家打款」（平台代收全款后，线下转给卖家应结部分；幂等：仅 paid 且未结时生效）。返回是否实际发生。
export function markPayout(id: number, operator: string): boolean {
  const info = getDb()
    .prepare("UPDATE payments SET payout_status='settled', payout_at=?, payout_by=? WHERE id=? AND status='paid' AND payout_status!='settled'")
    .run(Date.now(), operator || "—", id);
  return info.changes > 0;
}

// 退款：仅允许「已到账且尚未结算给卖家」的单退款（已打款给卖家的需先向卖家追回，不在此处理）。返回是否实际发生。
export function refundPayment(id: number, operator: string, note: string): boolean {
  const info = getDb()
    .prepare("UPDATE payments SET status='refunded', refunded_at=?, refund_note=? WHERE id=? AND status='paid' AND payout_status!='settled'")
    .run(Date.now(), (note ? note + " " : "") + `（经办 ${operator || "—"}）`, id);
  return info.changes > 0;
}

// 平台资金概览：成交额/佣金（上半场） + 应付卖家待结/已结、退款（下半场）
export type PaySummary = {
  paidCount: number; gmv: number; commission: number; pendingCount: number; pendingAmount: number;
  payableCount: number; payableAmount: number;     // 应付卖家·待结算
  settledCount: number; settledAmount: number;     // 应付卖家·已打款
  refundedCount: number; refundedAmount: number;   // 已退款
};
export function paymentsSummary(): PaySummary {
  const rows = (getDb().prepare("SELECT status,amount,commission,payee_amount,payout_status FROM payments").all() as { status: string; amount: number; commission: number; payee_amount: number; payout_status: string }[]);
  const s: PaySummary = { paidCount: 0, gmv: 0, commission: 0, pendingCount: 0, pendingAmount: 0, payableCount: 0, payableAmount: 0, settledCount: 0, settledAmount: 0, refundedCount: 0, refundedAmount: 0 };
  for (const r of rows) {
    if (r.status === "paid") {
      s.paidCount++; s.gmv += r.amount; s.commission += r.commission;
      if (r.payout_status === "settled") { s.settledCount++; s.settledAmount += r.payee_amount; }
      else { s.payableCount++; s.payableAmount += r.payee_amount; }
    } else if (r.status === "pending") { s.pendingCount++; s.pendingAmount += r.amount; }
    else if (r.status === "refunded") { s.refundedCount++; s.refundedAmount += r.amount; }
  }
  return s;
}
