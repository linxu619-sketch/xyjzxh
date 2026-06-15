"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, type Session } from "@/lib/auth/session";
import { effectiveEnterpriseId } from "@/lib/dashboard/preview";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { getReport, setReportAssignee } from "@/lib/data/reports";
import { addReportActivity } from "@/lib/data/report-activities";
import { getStaff } from "@/lib/data/enterprise-staff";
import { entScopesOwnData, entStaffId } from "@/lib/auth/ent-access";

// 报备归属本企业校验（报备无 enterprise_id，按企业名匹配）
async function assertReportOwned(s: Session, reportEnterprise: string): Promise<string> {
  const eid = effectiveEnterpriseId(s) ?? "";
  const ent = eid ? await getEnterpriseBySlugOrId(eid) : undefined;
  const names = new Set([ent?.name, ent?.hero.brand].filter(Boolean).map((n) => (n as string).trim()));
  if (!names.has((reportEnterprise || "").trim())) throw new Error("无权操作该报备（不属于本企业）");
  return eid;
}

// 分派报备给团队成员（staffId=0 取消分派）。报备无 enterprise_id，按企业名校验归属。
export async function setReportAssigneeAction(fd: FormData) {
  const s = await getSession();
  if (!s || s.role !== "enterprise") throw new Error("无权限：仅企业账号可分派报备");
  if (entScopesOwnData(s)) throw new Error("无权限：成员不可改派报备");

  const id = Number(fd.get("id") || 0);
  const staffId = Number(fd.get("staffId") || 0);
  if (!id) return;

  const report = getReport(id);
  if (!report) throw new Error("报备不存在");

  const eid = await assertReportOwned(s, report.enterprise);

  if (staffId > 0) {
    const st = getStaff(staffId);
    if (!st || st.enterpriseId !== eid) throw new Error("成员不属于本企业");
  }

  setReportAssignee(id, staffId);
  revalidatePath("/dashboard/enterprise/projects");
  revalidatePath("/dashboard/enterprise/team");
  redirect(`/dashboard/enterprise/projects/${id}`);
}

// 新增报备跟进备注（老板 / 被分派的成员均可记）
export async function addReportNoteAction(fd: FormData) {
  const s = await getSession();
  if (!s || s.role !== "enterprise") throw new Error("无权限：仅企业账号可记录跟进");

  const id = Number(fd.get("id") || 0);
  const note = String(fd.get("note") || "").trim();
  if (!id) return;

  const report = getReport(id);
  if (!report) throw new Error("报备不存在");
  await assertReportOwned(s, report.enterprise);
  if (entScopesOwnData(s) && report.assigneeStaffId !== entStaffId(s)) throw new Error("无权操作该报备（未分派给你）");

  if (note) {
    addReportActivity({ reportId: id, authorName: s.name || "负责人", authorRole: s.staffRole || "owner", kind: "note", note });
  }
  revalidatePath(`/dashboard/enterprise/projects/${id}`);
  redirect(`/dashboard/enterprise/projects/${id}`);
}
