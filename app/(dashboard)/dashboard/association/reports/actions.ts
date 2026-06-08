"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffPermission } from "@/lib/auth/guard";
import { setReportStatus } from "@/lib/data/reports";
import { operatorName } from "@/lib/dashboard/operator";

export async function reviewReportAction(fd: FormData) {
  const s = await requireStaffPermission("reports");
  const id = Number(fd.get("id") || 0);
  const act = String(fd.get("act") || "");
  if (id) setReportStatus(id, act === "approve" ? "approved" : "rejected", operatorName(s));
  revalidatePath("/dashboard/association/reports");
  redirect("/dashboard/association/reports");
}
