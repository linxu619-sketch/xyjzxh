"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createMediation } from "@/lib/data/mediations";

export async function submitMediationAction(fd: FormData) {
  const applicant = String(fd.get("applicant") || "").trim() || "匿名";
  const phone = String(fd.get("phone") || "").trim();
  const respondent = String(fd.get("respondent") || "").trim();
  const detail = String(fd.get("detail") || "").trim();
  if (phone && detail) {
    createMediation({ applicant, phone, respondent, detail });
    revalidatePath("/dashboard/association/mediations");
  }
  redirect("/mediate?submitted=1");
}
