"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getAccountByPhone, setAccountStatus, setAccountTier, setAccountPassword, deleteAccount, updateAccountProfile, type AccountStatus } from "@/lib/data/accounts";
import { tierLadder } from "@/lib/data/member-tier";
import { getStaff, setStaffStatus, setStaffRoles, setStaffPassword, deleteStaff, type StaffStatus } from "@/lib/data/staff-source";
import { ROLE_KEYS } from "@/lib/auth/roles";
import { hashPassword } from "@/lib/auth/password";

async function requireAssoc() {
  const s = await getSession();
  if (!s || (s.role !== "association" && s.role !== "system_admin")) throw new Error("无权限：仅协会工作人员可管理账号");
  return s;
}
function backToAccount(phone: string): never {
  const to = `/dashboard/association/users/${encodeURIComponent(phone)}`;
  revalidatePath(to); redirect(to);
}
function backToStaff(id: string): never {
  const to = `/dashboard/association/users/staff/${id}`;
  revalidatePath(to); redirect(to);
}

// 协会工作人员 启用/停用（超级管理员账号不可停用）
export async function setStaffStatusAction(fd: FormData) {
  const s = await getSession();
  if (!s || (s.role !== "association" && s.role !== "system_admin")) throw new Error("无权限：仅协会工作人员可管理员工账号");
  const id = String(fd.get("id") || "").trim();
  const status = String(fd.get("status") || "") as StaffStatus;
  const st = id ? getStaff(id) : undefined;
  if (st && st.staffRole !== "super_admin" && (status === "active" || status === "locked")) {
    setStaffStatus(id, status);
  }
  const to = `/dashboard/association/users/staff/${id}`;
  revalidatePath(to);
  redirect(to);
}

export async function setAccountStatusAction(fd: FormData) {
  const s = await getSession();
  if (!s || (s.role !== "association" && s.role !== "system_admin")) throw new Error("无权限：仅协会工作人员可管理账号");
  const phone = String(fd.get("phone") || "").trim();
  const status = String(fd.get("status") || "") as AccountStatus;
  if (phone && getAccountByPhone(phone) && ["active", "rejected", "pending"].includes(status)) {
    setAccountStatus(phone, status);
  }
  revalidatePath("/dashboard/association/users");
  const to = String(fd.get("redirect") || "");
  if (to.startsWith("/dashboard/association/users")) {
    revalidatePath(to);
    redirect(to);
  }
  redirect(`/dashboard/association/users${fd.get("tab") ? `?tab=${fd.get("tab")}` : ""}`);
}

// 协会调整会员等级（企业=治理梯队 / 个人=专业梯队，两套互不相干，按角色校验）
export async function setMemberTierAction(fd: FormData) {
  const s = await getSession();
  if (!s || (s.role !== "association" && s.role !== "system_admin")) throw new Error("无权限：仅协会工作人员可调整会员等级");
  const phone = String(fd.get("phone") || "").trim();
  const tier = String(fd.get("tier") || "").trim();
  const acc = phone ? getAccountByPhone(phone) : undefined;
  if (acc && (acc.role === "enterprise" || acc.role === "individual")) {
    const track = acc.role === "enterprise" ? "enterprise" : "practitioner";
    if (tierLadder(track).some((m) => m.tier === tier)) setAccountTier(phone, tier);
  }
  const to = `/dashboard/association/users/${encodeURIComponent(phone)}`;
  revalidatePath(to);
  redirect(to);
}

/* ---------------- 账号资料 / 密码 / 删除（企业·个人·业主）---------------- */
export async function updateAccountProfileAction(fd: FormData) {
  await requireAssoc();
  const phone = String(fd.get("phone") || "").trim();
  const name = String(fd.get("name") || "").trim();
  if (phone && name && getAccountByPhone(phone)) updateAccountProfile(phone, name);
  backToAccount(phone);
}

export async function setAccountPasswordAction(fd: FormData) {
  await requireAssoc();
  const phone = String(fd.get("phone") || "").trim();
  const pwd = String(fd.get("password") || "");
  if (phone && pwd.length >= 6 && getAccountByPhone(phone)) setAccountPassword(phone, hashPassword(pwd));
  backToAccount(phone);
}

export async function deleteAccountAction(fd: FormData) {
  await requireAssoc();
  const phone = String(fd.get("phone") || "").trim();
  const role = getAccountByPhone(phone)?.role;
  if (phone) deleteAccount(phone);
  const to = `/dashboard/association/users${role ? `?tab=${role}` : ""}`;
  revalidatePath("/dashboard/association/users");
  redirect(to);
}

/* ---------------- 协会工作人员 角色 / 密码 / 删除 ---------------- */
export async function setStaffRolesAction(fd: FormData) {
  await requireAssoc();
  const id = String(fd.get("id") || "").trim();
  const st = id ? getStaff(id) : undefined;
  // 超级管理员角色不可更改
  if (st && !st.roles.includes("super_admin")) {
    const roles = fd.getAll("role").map(String).filter((r) => ROLE_KEYS.includes(r) && r !== "super_admin");
    if (roles.length) setStaffRoles(id, roles);
  }
  backToStaff(id);
}

export async function setStaffPasswordAction(fd: FormData) {
  await requireAssoc();
  const id = String(fd.get("id") || "").trim();
  const pwd = String(fd.get("password") || "");
  if (id && pwd.length >= 6 && getStaff(id)) setStaffPassword(id, hashPassword(pwd));
  backToStaff(id);
}

export async function deleteStaffAction(fd: FormData) {
  await requireAssoc();
  const id = String(fd.get("id") || "").trim();
  const st = id ? getStaff(id) : undefined;
  if (st && !st.roles.includes("super_admin")) deleteStaff(id);
  revalidatePath("/dashboard/association/users");
  redirect("/dashboard/association/users?tab=staff");
}
