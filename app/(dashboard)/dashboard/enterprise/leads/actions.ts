"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, type Session } from "@/lib/auth/session";
import { getLead, setLeadStatus, setLeadAssignee, type LeadStatus } from "@/lib/data/leads";
import { addLeadActivity } from "@/lib/data/lead-activities";
import { getStaff } from "@/lib/data/enterprise-staff";
import { entScopesOwnData, entStaffId } from "@/lib/auth/ent-access";

const VALID: LeadStatus[] = ["new", "contacting", "surveying", "signed", "lost"];
const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "新线索", contacting: "沟通中", surveying: "量房中", signed: "已签单", lost: "已流失",
};

// 跟进记录的「记录人」：成员=本人姓名+角色；老板账号=负责人
function authorOf(s: Session): { name: string; role: string } {
  return { name: s.name || "负责人", role: s.staffRole || "owner" };
}

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
  // 状态变更自动留痕到跟进时间线
  const a = authorOf(s);
  addLeadActivity({ leadId: id, authorName: a.name, authorRole: a.role, kind: "status", note: `将状态更新为「${STATUS_LABEL[status]}」` });
  revalidatePath("/dashboard/enterprise/leads");
  revalidatePath("/dashboard/enterprise");
  redirect(`/dashboard/enterprise/leads/${id}`);
}

// 新增跟进备注（老板 / 被分派的成员均可记）
export async function addLeadNoteAction(fd: FormData) {
  const s = await getSession();
  if (!s || s.role !== "enterprise") throw new Error("无权限：仅企业账号可记录跟进");

  const id = Number(fd.get("id") || 0);
  const note = String(fd.get("note") || "").trim();
  if (!id) return;

  const lead = getLead(id);
  if (!lead) throw new Error("线索不存在");
  if (lead.enterpriseId !== s.enterpriseId) throw new Error("无权操作该线索（不属于本企业）");
  if (entScopesOwnData(s) && lead.assigneeStaffId !== entStaffId(s)) throw new Error("无权操作该线索（未分派给你）");

  if (note) {
    const a = authorOf(s);
    addLeadActivity({ leadId: id, authorName: a.name, authorRole: a.role, kind: "note", note });
  }
  revalidatePath(`/dashboard/enterprise/leads/${id}`);
  redirect(`/dashboard/enterprise/leads/${id}${note ? "" : "?noteerr=1"}`);
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
