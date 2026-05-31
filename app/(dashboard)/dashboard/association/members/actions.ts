"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { setApplicationStatus } from "@/lib/data/applications";

export async function reviewApplicationAction(fd: FormData) {
  const s = await getSession();
  if (!s || (s.role !== "association" && s.role !== "system_admin")) {
    throw new Error("无权限：仅协会工作人员可审核");
  }
  const id = Number(fd.get("id") || 0);
  const act = String(fd.get("act") || "");
  if (id) setApplicationStatus(id, act === "approve" ? "approved" : "rejected");
  revalidatePath("/dashboard/association/members");
}
