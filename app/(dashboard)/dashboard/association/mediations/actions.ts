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
  const next = MAP[String(fd.get("act") || "")];
  if (id && next) setMediationStatus(id, next, operatorName(s));
  revalidatePath("/dashboard/association/mediations");
  redirect("/dashboard/association/mediations");
}
