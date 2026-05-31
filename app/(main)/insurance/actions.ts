"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createInsuranceOrder } from "@/lib/data/insurance-orders";
import { getSession } from "@/lib/auth/session";

export async function submitInsuranceAction(fd: FormData) {
  const product = String(fd.get("product") || "").trim();
  const applicant = String(fd.get("applicant") || "").trim() || "未填写";
  const phone = String(fd.get("phone") || "").trim();
  const note = String(fd.get("note") || "").trim();
  if (product && phone) {
    const s = await getSession();
    createInsuranceOrder({ product, applicant, phone, note, uid: s?.uid });
    revalidatePath("/dashboard/association/finance");
    revalidatePath("/dashboard/customer/insurance");
  }
  redirect("/insurance?ordered=1");
}
