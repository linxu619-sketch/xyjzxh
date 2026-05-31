"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createApplication, type AppType } from "@/lib/data/applications";

export async function submitApplicationAction(fd: FormData) {
  const role = String(fd.get("role") || "customer");
  const type: AppType = role === "enterprise" ? "enterprise" : role === "practitioner" ? "individual" : "customer";

  // 收集全部字段进 payload；并挑出展示用的 名称 / 电话
  const payload: Record<string, string> = {};
  for (const [k, v] of fd.entries()) {
    if (k === "role") continue;
    const val = String(v).trim();
    if (val) payload[k] = val;
  }

  const applicant =
    payload.entName || payload.realName || payload.nickname || "未填写";
  const phone = payload.contactPhone || payload.phone || "";

  createApplication({ type, applicant, phone, payload });
  revalidatePath("/dashboard/association/members");
  redirect(`/register?role=${role}&submitted=1`);
}
