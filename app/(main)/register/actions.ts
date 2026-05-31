"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createApplication, type AppType } from "@/lib/data/applications";

export async function submitApplicationAction(input: { role: string; payload: Record<string, string> }) {
  const role = input.role || "customer";
  const type: AppType = role === "enterprise" ? "enterprise" : role === "practitioner" ? "individual" : "customer";
  const payload = input.payload || {};

  const applicant = payload.entName || payload.realName || payload.nickname || "未填写";
  const phone = payload.contactPhone || payload.phone || "";

  createApplication({ type, applicant, phone, payload });
  revalidatePath("/dashboard/association/members");
  redirect(`/register?role=${role}&submitted=1`);
}
