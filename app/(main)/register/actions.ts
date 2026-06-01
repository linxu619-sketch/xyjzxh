"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createApplication, type AppType } from "@/lib/data/applications";
import { upsertAccount, type AccountRole } from "@/lib/data/accounts";

export async function submitApplicationAction(input: { role: string; payload: Record<string, string> }) {
  const role = input.role || "customer";
  const type: AppType = role === "enterprise" ? "enterprise" : role === "practitioner" ? "individual" : "customer";
  const payload = input.payload || {};

  const applicant = payload.entName || payload.realName || payload.nickname || "未填写";
  const phone = payload.contactPhone || payload.phone || "";

  const appId = createApplication({ type, applicant, phone, payload });

  // 合一模型：入会即建账号。业主(customer)直接 active；bp(企业/个人)先 pending，审核通过激活。
  if (phone) {
    const acctRole: AccountRole = type === "enterprise" ? "enterprise" : type === "individual" ? "individual" : "customer";
    upsertAccount({
      phone,
      role: acctRole,
      status: type === "customer" ? "active" : "pending",
      name: applicant,
      appId: type === "customer" ? null : appId,
    });
  }

  revalidatePath("/dashboard/association/members");
  redirect(`/register?role=${role}&submitted=1`);
}
