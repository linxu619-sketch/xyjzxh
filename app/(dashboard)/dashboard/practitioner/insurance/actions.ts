"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { createInsuranceOrder } from "@/lib/data/insurance-orders";

// 从业者申请投保工伤险 → 写入 insurance_orders（绑定本人，协会金融端可见）
export async function applyInsuranceAction(fd: FormData) {
  const s = await getSession();
  if (!s || s.role !== "practitioner") throw new Error("无权限：仅从业者可投保");
  const product = String(fd.get("product") || "建筑工人团意险").trim();
  createInsuranceOrder({
    uid: s.uid,
    product,
    applicant: s.name,
    phone: s.phone,
    note: String(fd.get("note") || "从业者工伤险投保申请").trim(),
  });
  revalidatePath("/dashboard/practitioner/insurance");
  revalidatePath("/dashboard/association/finance");
  redirect("/dashboard/practitioner/insurance?ok=1");
}
