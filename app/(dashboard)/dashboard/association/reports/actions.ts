"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { setReportStatus } from "@/lib/data/reports";
import { operatorName } from "@/lib/dashboard/operator";

export async function reviewReportAction(fd: FormData) {
  const s = await getSession();
  if (!s || (s.role !== "association" && s.role !== "system_admin")) {
    throw new Error("无权限：仅协会工作人员可审批");
  }
  const id = Number(fd.get("id") || 0);
  const act = String(fd.get("act") || "");
  if (id) setReportStatus(id, act === "approve" ? "approved" : "rejected", operatorName(s));
  revalidatePath("/dashboard/association/reports");
  redirect("/dashboard/association/reports");
}
