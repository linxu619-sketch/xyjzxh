"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createMediation } from "@/lib/data/mediations";
import { getSession } from "@/lib/auth/session";

export async function submitMediationAction(fd: FormData) {
  const applicant = String(fd.get("applicant") || "").trim() || "匿名";
  const phone = String(fd.get("phone") || "").trim();
  const respondent = String(fd.get("respondent") || "").trim();
  const detail = String(fd.get("detail") || "").trim();
  let photos: string[] = [];
  try { const v = JSON.parse(String(fd.get("photos") || "[]")); if (Array.isArray(v)) photos = v.map(String).filter(Boolean).slice(0, 5); } catch { photos = []; }
  if (phone && detail) {
    const s = await getSession();
    createMediation({ applicant, phone, respondent, detail, photos, uid: s?.uid });
    revalidatePath("/dashboard/association/mediations");
    revalidatePath("/dashboard/customer");
  }
  redirect("/mediate?submitted=1");
}
