"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getApplication, setApplicationStatus } from "@/lib/data/applications";
import { createEnterpriseFromApplication } from "@/lib/data/enterprises-source";
import { createPractitionerFromApplication } from "@/lib/data/practitioners-source";

export async function reviewApplicationAction(fd: FormData) {
  const s = await getSession();
  if (!s || (s.role !== "association" && s.role !== "system_admin")) {
    throw new Error("无权限：仅协会工作人员可审核");
  }
  const id = Number(fd.get("id") || 0);
  const act = String(fd.get("act") || "");
  if (!id) return;

  const app = getApplication(id);
  setApplicationStatus(id, act === "approve" ? "approved" : "rejected");

  // 企业申请通过 → 自动成为正式会员，出现在 /members
  if (act === "approve" && app?.type === "enterprise") {
    createEnterpriseFromApplication(app);
    revalidatePath("/members");
  }
  // 个人会员申请通过 → 进入从业者 / 个人会员名录，出现在 /practitioners
  if (act === "approve" && app?.type === "individual") {
    createPractitionerFromApplication(app);
    revalidatePath("/practitioners");
  }

  revalidatePath("/dashboard/association/members");
  redirect("/dashboard/association/members");
}
