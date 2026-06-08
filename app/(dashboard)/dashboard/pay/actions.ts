"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createPayment, getPayment, setPaymentMethod } from "@/lib/data/payments-source";
import { getSupplyOrder, getProduct } from "@/lib/data/supplies-source";
import { isPayMethod } from "@/lib/payments";
import { settlePayment } from "@/lib/payments/settle";

// 收银台切换支付渠道
export async function setPayMethodAction(fd: FormData) {
  const s = await getSession();
  if (!s) redirect("/login");
  const id = Number(fd.get("id") || 0);
  const method = String(fd.get("method") || "");
  if (getPayment(id) && isPayMethod(method)) setPaymentMethod(id, method);
  redirect(`/dashboard/pay/${id}`);
}

// 发起支付：当前支持建材采购单(supply_order)，按商品佣金算平台分成
export async function startPaymentAction(fd: FormData) {
  const s = await getSession();
  if (!s) redirect("/login");
  const bizType = String(fd.get("bizType") || "supply_order");
  const bizId = Number(fd.get("bizId") || 0);
  const method = String(fd.get("method") || "");
  if (!isPayMethod(method)) redirect("/dashboard");

  if (bizType === "supply_order") {
    const o = getSupplyOrder(bizId);
    if (!o) redirect("/dashboard");
    const product = getProduct(o.productId);
    const pay = createPayment({
      bizType, bizId, method, amount: o.total,
      commissionPct: product?.commissionPct ?? 0,
      payerName: o.buyerName, payeeName: o.sellerName, subject: o.productName,
    });
    redirect(`/dashboard/pay/${pay.id}`);
  }
  redirect("/dashboard");
}

// 确认到账（演示：人工确认；真实环境由渠道异步回调触发同样逻辑）→ 结算业务单
export async function confirmPaymentAction(fd: FormData) {
  const s = await getSession();
  if (!s) redirect("/login");
  const id = Number(fd.get("id") || 0);
  const pay = getPayment(id);
  if (!pay) redirect("/dashboard");
  settlePayment(pay, "manual-confirm");
  revalidatePath("/dashboard/association/supply-orders");
  revalidatePath("/dashboard/enterprise/supplies");
  redirect(`/dashboard/pay/${id}?ok=1`);
}
