"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createMediation } from "@/lib/data/mediations";
import { getSession } from "@/lib/auth/session";

export async function submitMediationAction(fd: FormData) {
  // 申请调解需先登录（进操作就先登录）；未登录跳登录并回跳
  const s = await getSession();
  if (!s) redirect("/login?next=/mediate");
  const applicant = String(fd.get("applicant") || "").trim() || s.name || "业主";
  const phone = String(fd.get("phone") || "").trim();
  const respondent = String(fd.get("respondent") || "").trim();
  const detail = String(fd.get("detail") || "").trim();
  let photos: string[] = [];
  try { const v = JSON.parse(String(fd.get("photos") || "[]")); if (Array.isArray(v)) photos = v.map(String).filter(Boolean).slice(0, 5); } catch { photos = []; }
  if (phone && detail) {
    createMediation({ applicant, phone, respondent, detail, photos, uid: s.uid });
    revalidatePath("/dashboard/association/mediations");
    revalidatePath("/dashboard/customer");
  }
  redirect("/mediate?submitted=1");
}
