"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { createTraining, getTraining, setTrainingStatus, type TrainingStatus } from "@/lib/data/training";

async function requireAssoc() {
  const s = await getSession();
  if (!s || (s.role !== "association" && s.role !== "system_admin")) throw new Error("无权限：仅协会工作人员可发布培训");
}

function refresh() {
  revalidatePath("/dashboard/association/training");
  revalidatePath("/dashboard/practitioner/training");
  revalidatePath("/xh");
}

export async function createTrainingAction(fd: FormData) {
  await requireAssoc();
  const title = String(fd.get("title") || "").trim();
  const category = String(fd.get("category") || "技能提升").trim();
  if (!title) redirect("/dashboard/association/training?terr=1");
  createTraining({
    title, category,
    instructor: String(fd.get("instructor") || "协会").trim(),
    location: String(fd.get("location") || "").trim(),
    schedule: String(fd.get("schedule") || "").trim(),
    capacity: Number(fd.get("capacity") || 0) || 0,
    fee: String(fd.get("fee") || "免费").trim() || "免费",
    detail: String(fd.get("detail") || "").trim(),
  });
  refresh();
  redirect("/dashboard/association/training?tok=1");
}

export async function setTrainingStatusAction(fd: FormData) {
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  const status = String(fd.get("status") || "") as TrainingStatus;
  if (getTraining(id) && (status === "open" || status === "closed")) setTrainingStatus(id, status);
  refresh();
  redirect(`/dashboard/association/training/${id}`);
}
