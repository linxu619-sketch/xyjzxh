"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isPractitionerPreview } from "@/lib/dashboard/preview";
import { getJob, applyToJob, hasApplied } from "@/lib/data/jobs";

// 从业者报名岗位 → 生成投递（绑定本人手机号）
export async function applyJobAction(fd: FormData) {
  const s = await getSession();
  if (isPractitionerPreview(s)) redirect("/dashboard/practitioner/jobs?pv=1"); // 协会预览态：只读，不写库
  if (!s || s.role !== "practitioner") throw new Error("无权限：仅从业者可报名");
  const jobId = Number(fd.get("jobId") || 0);
  const job = getJob(jobId);
  if (!job || job.status !== "open") redirect("/dashboard/practitioner/jobs?aerr=1");
  if (hasApplied(jobId, s.phone)) redirect("/dashboard/practitioner/jobs?adup=1");

  applyToJob({
    jobId,
    enterpriseId: job.enterpriseId,
    phone: s.phone,
    name: s.name,
    note: String(fd.get("note") || "").trim(),
  });
  revalidatePath("/dashboard/practitioner/jobs");
  revalidatePath(`/dashboard/enterprise/jobs/${jobId}`);
  redirect("/dashboard/practitioner/jobs?aok=1");
}
