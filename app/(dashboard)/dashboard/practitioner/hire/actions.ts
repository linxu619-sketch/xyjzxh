"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isPractitionerPreview } from "@/lib/dashboard/preview";
import { getJob, applyToJob, hasApplied } from "@/lib/data/jobs";

// 从业者投递招聘岗位（与零工报名同一张投递表，按 jobId 绑定）
export async function applyHireAction(fd: FormData) {
  const s = await getSession();
  if (isPractitionerPreview(s)) redirect("/dashboard/practitioner/hire?pv=1"); // 预览只读
  if (!s || s.role !== "practitioner") throw new Error("无权限：仅从业者可投递");
  const jobId = Number(fd.get("jobId") || 0);
  const job = getJob(jobId);
  if (!job || job.status !== "open") redirect("/dashboard/practitioner/hire?aerr=1");
  if (hasApplied(jobId, s.phone)) redirect("/dashboard/practitioner/hire?adup=1");

  applyToJob({
    jobId,
    enterpriseId: job.enterpriseId,
    phone: s.phone,
    name: s.name,
    note: String(fd.get("note") || "").trim(),
  });
  revalidatePath("/dashboard/practitioner/hire");
  revalidatePath(`/dashboard/enterprise/jobs/${jobId}`);
  redirect("/dashboard/practitioner/hire?aok=1");
}
