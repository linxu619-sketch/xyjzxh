"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getApplication, setApplicationStatus, setIdVerify, type IdVerifyStatus } from "@/lib/data/applications";
import { operatorName } from "@/lib/dashboard/operator";
import { createEnterpriseFromApplication } from "@/lib/data/enterprises-source";
import { createPractitionerFromApplication, getPractitionerRefByAppId } from "@/lib/data/practitioners-source";
import { activateAccountByAppId, rejectAccountByAppId } from "@/lib/data/accounts";

export async function reviewApplicationAction(fd: FormData) {
  const s = await getSession();
  if (!s || (s.role !== "association" && s.role !== "system_admin")) {
    throw new Error("无权限：仅协会工作人员可审核");
  }
  const id = Number(fd.get("id") || 0);
  const act = String(fd.get("act") || "");
  if (!id) return;

  const app = getApplication(id);
  setApplicationStatus(id, act === "approve" ? "approved" : "rejected", operatorName(s));

  // 企业申请通过 → 自动成为正式会员，出现在 /members；账号激活并绑定
  if (act === "approve" && app?.type === "enterprise") {
    createEnterpriseFromApplication(app);
    activateAccountByAppId(id, `app-${id}`);
    revalidatePath("/members");
  }
  // 个人会员申请通过 → 进入从业者名录，出现在 /practitioners；账号激活并绑定
  if (act === "approve" && app?.type === "individual") {
    createPractitionerFromApplication(app);
    const ref = getPractitionerRefByAppId(id);
    if (ref) activateAccountByAppId(id, ref);
    revalidatePath("/practitioners");
  }
  // 驳回 → 账号置为 rejected（保留，可补料重提）
  if (act === "reject" && app) {
    rejectAccountByAppId(id);
  }

  revalidatePath("/dashboard/association/members");
  redirect("/dashboard/association/members");
}

// 实名核验（人工）：审核员对申请的实名信息标记核验通过 / 不通过，留痕核验人与时间
export async function verifyIdentityAction(fd: FormData) {
  const s = await getSession();
  if (!s || (s.role !== "association" && s.role !== "system_admin")) {
    throw new Error("无权限：仅协会工作人员可核验实名");
  }
  const id = Number(fd.get("id") || 0);
  const status = String(fd.get("status") || "") as IdVerifyStatus;
  if (id && ["unverified", "verified", "failed"].includes(status)) {
    setIdVerify(id, status, s.name || s.staffRole || "协会工作人员");
  }
  const to = `/dashboard/association/members/${id}`;
  revalidatePath(to);
  redirect(to);
}
