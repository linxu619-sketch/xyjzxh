"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createInsuranceOrder } from "@/lib/data/insurance-orders";
import { getSession } from "@/lib/auth/session";

export async function submitInsuranceAction(fd: FormData) {
  // 投保需先登录（进操作就先登录）；未登录跳登录并回跳
  const s = await getSession();
  if (!s) redirect("/login?next=/insurance");
  const product = String(fd.get("product") || "").trim();
  const applicant = String(fd.get("applicant") || "").trim() || s.name || "业主";
  const phone = String(fd.get("phone") || "").trim();
  const note = String(fd.get("note") || "").trim();
  if (product && phone) {
    createInsuranceOrder({ product, applicant, phone, note, uid: s.uid });
    revalidatePath("/dashboard/association/finance");
    revalidatePath("/dashboard/customer/insurance");
  }
  redirect("/insurance?ordered=1");
}
