"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createInsuranceOrder } from "@/lib/data/insurance-orders";

export async function submitInsuranceAction(fd: FormData) {
  const product = String(fd.get("product") || "").trim();
  const applicant = String(fd.get("applicant") || "").trim() || "未填写";
  const phone = String(fd.get("phone") || "").trim();
  const note = String(fd.get("note") || "").trim();
  if (product && phone) {
    createInsuranceOrder({ product, applicant, phone, note });
    revalidatePath("/dashboard/association/finance");
  }
  redirect("/insurance?ordered=1");
}
