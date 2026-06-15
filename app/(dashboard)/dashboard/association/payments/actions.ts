"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffPermission } from "@/lib/auth/guard";
import { verifyAdminPassword } from "@/lib/auth/reauth";
import { operatorName } from "@/lib/dashboard/operator";
import { getPayment, markPayout, refundPayment } from "@/lib/data/payments-source";

const BASE = "/dashboard/association/payments";

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
