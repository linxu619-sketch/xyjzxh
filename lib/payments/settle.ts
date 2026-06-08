import "server-only";
import { getPaymentByOutTradeNo, markPaymentPaid, type Payment } from "@/lib/data/payments-source";
import { markOrderPaid } from "@/lib/data/supplies-source";

/**
 * 支付成功落地（渠道回调验签通过 / 人工确认到账时调用）：
 * 标记支付单为已支付，并结算其对应的业务单。幂等：已支付则直接返回。
 * 新增 biz_type 时在此扩展结算分支即可（回调与人工确认共用）。
 */
export function settlePayment(pay: Payment, channelRef?: string): boolean {
  if (!pay) return false;
  if (pay.status === "paid") return true; // 幂等
  markPaymentPaid(pay.id, channelRef);
  switch (pay.bizType) {
    case "supply_order":
      markOrderPaid(pay.bizId);
      break;
    // case "construction_order": ...
    default:
      break;
  }
  return true;
}

export function settleByOutTradeNo(outTradeNo: string, channelRef?: string): boolean {
  const pay = getPaymentByOutTradeNo(outTradeNo);
  if (!pay) return false;
  return settlePayment(pay, channelRef);
}
