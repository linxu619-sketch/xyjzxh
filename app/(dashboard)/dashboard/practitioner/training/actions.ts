"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isPractitionerPreview } from "@/lib/dashboard/preview";
import { getTraining, enroll, hasEnrolled } from "@/lib/data/training";

export async function enrollTrainingAction(fd: FormData) {
  const s = await getSession();
  if (isPractitionerPreview(s)) redirect("/dashboard/practitioner/training?pv=1"); // 协会预览态：只读，不写库
  if (!s || s.role !== "practitioner") throw new Error("无权限：仅从业者可报名");
  const id = Number(fd.get("trainingId") || 0);
  const t = getTraining(id);
  if (!t || t.status !== "open") redirect("/dashboard/practitioner/training?terr=1");
  if (hasEnrolled(id, s.phone)) redirect("/dashboard/practitioner/training?tdup=1");
  enroll({ trainingId: id, phone: s.phone, name: s.name });
  revalidatePath("/dashboard/practitioner/training");
  revalidatePath(`/dashboard/association/training/${id}`);
  redirect("/dashboard/practitioner/training?tok=1");
}
