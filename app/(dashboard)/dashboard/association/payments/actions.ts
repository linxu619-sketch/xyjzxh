"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffPermission } from "@/lib/auth/guard";
import { verifyAdminPassword } from "@/lib/auth/reauth";
import { operatorName } from "@/lib/dashboard/operator";
import { getPayment, markPayout, refundPayment } from "@/lib/data/payments-source";
import { settlePayment } from "@/lib/payments/settle";

const BASE = "/dashboard/association/payments";

// 确认到账（人工核销）——银行转账等线下渠道：协会核对对公账户收到款后，在后台确认到账→结算业务单。
// 高危资金操作，需管理员本人密码二次核验；可填银行流水号便于对账。
export async function confirmReceiptAction(fd: FormData) {
  const s = await requireStaffPermission("finance");
  const id = Number(fd.get("id") || 0);
  const pwd = String(fd.get("admin_pwd") || "");
  const ref = String(fd.get("ref") || "").trim();
  if (!verifyAdminPassword(s, pwd)) redirect(`${BASE}?err=receipt&id=${id}`);
  const pay = getPayment(id);
  if (pay && pay.status === "pending") settlePayment(pay, ref ? `bank:${ref}` : `manual:${operatorName(s)}`);
  revalidatePath(BASE);
  revalidatePath("/dashboard/association/supply-orders");
  redirect(`${BASE}?ok=receipt`);
}

// 标记「已向卖家打款」——高危资金操作，需管理员本人密码二次核验
export async function markPayoutAction(fd: FormData) {
  const s = await requireStaffPermission("finance");
  const id = Number(fd.get("id") || 0);
  const pwd = String(fd.get("admin_pwd") || "");
  if (!verifyAdminPassword(s, pwd)) redirect(`${BASE}?err=payout&id=${id}`);
  markPayout(id, operatorName(s));
  revalidatePath(BASE);
  redirect(`${BASE}?ok=payout`);
}

// 退款——高危资金操作，需管理员本人密码二次核验；仅「已到账且未结算给卖家」的单可退
export async function refundPaymentAction(fd: FormData) {
  const s = await requireStaffPermission("finance");
  const id = Number(fd.get("id") || 0);
  const pwd = String(fd.get("admin_pwd") || "");
  const note = String(fd.get("note") || "").trim();
  if (!verifyAdminPassword(s, pwd)) redirect(`${BASE}?err=refund&id=${id}`);
  const pay = getPayment(id);
  if (pay) refundPayment(id, operatorName(s), note);
  revalidatePath(BASE);
  redirect(`${BASE}?ok=refund`);
}
