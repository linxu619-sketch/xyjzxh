"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { createClaim } from "@/lib/data/insurance-claims";

export async function submitClaimAction(fd: FormData) {
  const s = await getSession();
  if (!s || s.role !== "customer") redirect("/login?role=customer");
  const policy = String(fd.get("policy") || "").trim();
  const product = String(fd.get("product") || "").trim() || policy;
  const subject = String(fd.get("subject") || "").trim();
  const phone = String(fd.get("phone") || s!.phone || "").trim();
  const detail = String(fd.get("detail") || "").trim();
  if (!subject || !phone) {
    redirect("/dashboard/customer/insurance?cerr=1");
  }
  createClaim({ uid: s!.uid, applicant: s!.name, phone, policy, product, subject, detail });
  revalidatePath("/dashboard/customer/insurance");
  revalidatePath("/dashboard/association/finance");
  redirect("/dashboard/customer/insurance?claimed=1#claims");
}
