"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { createOrder, getOrder, updateOrderProgress, type OrderStage } from "@/lib/data/orders-source";

async function requireEnterprise() {
  const s = await getSession();
  if (!s || s.role !== "enterprise" || !s.enterpriseId) throw new Error("无权限：仅企业账号可管理订单");
  return s;
}

export async function createOrderAction(fd: FormData) {
  const s = await requireEnterprise();
  const customerName = String(fd.get("customerName") || "").trim();
  const scope = String(fd.get("scope") || "").trim();
  if (!customerName || !scope) redirect("/dashboard/enterprise/orders?oerr=1");
  createOrder({
    enterpriseId: s.enterpriseId!,
    customerName,
    customerPhone: String(fd.get("customerPhone") || "").trim(),
    scope,
    type: String(fd.get("type") || "家装"),
    area: String(fd.get("area") || "").trim(),
    district: String(fd.get("district") || "").trim(),
    amount: Number(fd.get("amount") || 0) || 0,
  });
  revalidatePath("/dashboard/enterprise/orders");
  redirect("/dashboard/enterprise/orders?ook=1");
}

export async function updateOrderAction(fd: FormData) {
  const s = await requireEnterprise();
  const id = Number(fd.get("id") || 0);
  const o = getOrder(id);
  if (!o || o.enterpriseId !== s.enterpriseId) throw new Error("无权操作该订单");
  const stage = String(fd.get("stage") || o.stage) as OrderStage;
  const progress = Math.min(100, Math.max(0, Number(fd.get("progress") || o.progress) || 0));
  const receivedPct = Math.min(100, Math.max(0, Number(fd.get("receivedPct") || o.receivedPct) || 0));
  updateOrderProgress(id, { stage, progress, receivedPct });
  revalidatePath(`/dashboard/enterprise/orders/${id}`);
  revalidatePath("/dashboard/enterprise/orders");
  redirect(`/dashboard/enterprise/orders/${id}`);
}
