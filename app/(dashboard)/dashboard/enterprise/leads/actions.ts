"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getLead, setLeadStatus, setLeadAssignee, type LeadStatus } from "@/lib/data/leads";
import { getStaff } from "@/lib/data/enterprise-staff";
import { entScopesOwnData, entStaffId } from "@/lib/auth/ent-access";

const VALID: LeadStatus[] = ["new", "contacting", "surveying", "signed", "lost"];

export async function updateLeadStatusAction(fd: FormData) {
  const s = await getSession();
  if (!s || s.role !== "enterprise") throw new Error("无权限：仅企业账号可操作线索");

  const id = Number(fd.get("id") || 0);
  const status = String(fd.get("status") || "") as LeadStatus;
  if (!id || !VALID.includes(status)) return;

  const lead = getLead(id);
  if (!lead) throw new Error("线索不存在");
  if (lead.enterpriseId !== s.enterpriseId) throw new Error("无权操作该线索（不属于本企业）");
  // 受限成员只能动分派给自己的线索
  if (entScopesOwnData(s) && lead.assigneeStaffId !== entStaffId(s)) throw new Error("无权操作该线索（未分派给你）");

  setLeadStatus(id, status);
  revalidatePath("/dashboard/enterprise/leads");
  revalidatePath("/dashboard/enterprise");
  redirect(`/dashboard/enterprise/leads/${id}`);
}

// 分派线索给团队成员（staffId=0 取消分派）。校验线索与成员都属本企业。
export async function setLeadAssigneeAction(fd: FormData) {
  const s = await getSession();
  if (!s || s.role !== "enterprise") throw new Error("无权限：仅企业账号可分派线索");
  if (entScopesOwnData(s)) throw new Error("无权限：成员不可改派线索");

  const id = Number(fd.get("id") || 0);
  const staffId = Number(fd.get("staffId") || 0);
  if (!id) return;

  const lead = getLead(id);
  if (!lead) throw new Error("线索不存在");
  if (lead.enterpriseId !== s.enterpriseId) throw new Error("无权操作该线索（不属于本企业）");
  // staffId>0 时必须是本企业成员，避免越权分派
  if (staffId > 0) {
    const st = getStaff(staffId);
    if (!st || st.enterpriseId !== s.enterpriseId) throw new Error("成员不属于本企业");
  }

  setLeadAssignee(id, staffId);
  revalidatePath("/dashboard/enterprise/leads");
  revalidatePath("/dashboard/enterprise/team");
  revalidatePath(`/dashboard/enterprise/leads/${id}`);
  redirect(`/dashboard/enterprise/leads/${id}`);
}
