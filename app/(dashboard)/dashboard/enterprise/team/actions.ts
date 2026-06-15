"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { effectiveEnterpriseId } from "@/lib/dashboard/preview";
import { isEntFull } from "@/lib/auth/ent-access";
import {
  addStaff, setStaffStatus, setStaffRole, removeStaff,
  type EntStaffRole, type EntStaffStatus,
} from "@/lib/data/enterprise-staff";

const BACK = "/dashboard/enterprise/team";

// 仅「企业账号本人 / 管理员成员」可管理团队（受限成员、协会只读预览不可变更）
async function requireEnterprise(): Promise<string> {
  const s = await getSession();
  if (!s || s.role !== "enterprise") throw new Error("无权限：仅企业账号可管理团队");
  if (!isEntFull(s)) throw new Error("无权限：仅负责人 / 管理员可管理团队");
  const eid = effectiveEnterpriseId(s);
  if (!eid) throw new Error("无企业身份");
  return eid;
}

export async function addStaffAction(fd: FormData) {
  const eid = await requireEnterprise();
  const r = addStaff({
    enterpriseId: eid,
    name: String(fd.get("name") || ""),
    phone: String(fd.get("phone") || ""),
    role: String(fd.get("role") || "viewer") as EntStaffRole,
  });
  revalidatePath(BACK);
  redirect(r.ok ? `${BACK}?added=1` : `${BACK}?err=${r.error}`);
}

export async function setStaffStatusAction(fd: FormData) {
  const eid = await requireEnterprise();
  const id = Number(fd.get("id") || 0);
  const status = String(fd.get("status") || "") as EntStaffStatus;
  if (id && ["active", "locked", "invited"].includes(status)) setStaffStatus(eid, id, status);
  revalidatePath(BACK);
  redirect(BACK);
}

export async function setStaffRoleAction(fd: FormData) {
  const eid = await requireEnterprise();
  const id = Number(fd.get("id") || 0);
  const role = String(fd.get("role") || "") as EntStaffRole;
  if (id) setStaffRole(eid, id, role);
  revalidatePath(BACK);
  redirect(BACK);
}

export async function removeStaffAction(fd: FormData) {
  const eid = await requireEnterprise();
  const id = Number(fd.get("id") || 0);
  if (id) removeStaff(eid, id);
  revalidatePath(BACK);
  redirect(BACK);
}
