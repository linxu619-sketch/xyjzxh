"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffPermission } from "@/lib/auth/guard";
import { setMediationStatus, type MediationStatus } from "@/lib/data/mediations";
import { operatorName } from "@/lib/dashboard/operator";

const MAP: Record<string, MediationStatus> = {
  accept: "accepted",
  reject: "rejected",
  close: "closed",
};

export async function reviewMediationAction(fd: FormData) {
  const s = await requireStaffPermission("mediation");
  const id = Number(fd.get("id") || 0);
  const act = String(fd.get("act") || "");
  const next = MAP[act];
  if (id && next) setMediationStatus(id, next, operatorName(s));
  revalidatePath("/dashboard/association/mediations");
  revalidatePath(`/dashboard/association/mediations/${id}`);
  // 留在详情页并带反馈，不再把经办人甩回列表
  redirect(id ? `/dashboard/association/mediations/${id}?done=${act}` : "/dashboard/association/mediations");
}
