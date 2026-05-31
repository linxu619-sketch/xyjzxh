"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { setMediationStatus, type MediationStatus } from "@/lib/data/mediations";

const MAP: Record<string, MediationStatus> = {
  accept: "accepted",
  reject: "rejected",
  close: "closed",
};

export async function reviewMediationAction(fd: FormData) {
  const s = await getSession();
  if (!s || (s.role !== "association" && s.role !== "system_admin")) {
    throw new Error("无权限：仅协会工作人员可处理");
  }
  const id = Number(fd.get("id") || 0);
  const next = MAP[String(fd.get("act") || "")];
  if (id && next) setMediationStatus(id, next);
  revalidatePath("/dashboard/association/mediations");
  redirect("/dashboard/association/mediations");
}
