"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { effectiveEnterpriseId } from "@/lib/dashboard/preview";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { getReport, setReportAssignee } from "@/lib/data/reports";
import { getStaff } from "@/lib/data/enterprise-staff";

// 分派报备给团队成员（staffId=0 取消分派）。报备无 enterprise_id，按企业名校验归属。
export async function setReportAssigneeAction(fd: FormData) {
  const s = await getSession();
  if (!s || s.role !== "enterprise") throw new Error("无权限：仅企业账号可分派报备");

  const id = Number(fd.get("id") || 0);
  const staffId = Number(fd.get("staffId") || 0);
  if (!id) return;

  const report = getReport(id);
  if (!report) throw new Error("报备不存在");

  const eid = effectiveEnterpriseId(s);
  const ent = eid ? await getEnterpriseBySlugOrId(eid) : undefined;
  const names = new Set([ent?.name, ent?.hero.brand].filter(Boolean).map((n) => (n as string).trim()));
  if (!names.has((report.enterprise || "").trim())) throw new Error("无权操作该报备（不属于本企业）");

  if (staffId > 0) {
    const st = getStaff(staffId);
    if (!st || st.enterpriseId !== eid) throw new Error("成员不属于本企业");
  }

  setReportAssignee(id, staffId);
  revalidatePath("/dashboard/enterprise/projects");
  revalidatePath("/dashboard/enterprise/team");
  redirect("/dashboard/enterprise/projects");
}
