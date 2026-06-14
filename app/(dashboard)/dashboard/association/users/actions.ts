"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffPermission } from "@/lib/auth/guard";
import { getAccountByPhone, setAccountStatus, setAccountTier, setAccountPassword, deleteAccount, updateAccountProfile, type AccountStatus } from "@/lib/data/accounts";
import { setPractitionerTierByPhone } from "@/lib/data/practitioners-source";
import { tierLadder } from "@/lib/data/member-tier";
import { getStaff, getStaffAuthByPhone, setStaffStatus, setStaffRoles, setStaffPassword, deleteStaff, createStaff, type StaffStatus } from "@/lib/data/staff-source";
import { ROLE_KEYS } from "@/lib/auth/roles";
import { hashPassword } from "@/lib/auth/password";
import { verifyAdminPassword } from "@/lib/auth/reauth";

async function requireAssoc() {
  return requireStaffPermission("users");
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
  const s = await requireStaffPermission("users");
  const id = String(fd.get("id") || "").trim();
  const status = String(fd.get("status") || "") as StaffStatus;
  // 停用（locked）为高危：需「本人管理员密码」二次核验（启用无需）
  if (status === "locked" && !verifyAdminPassword(s, String(fd.get("admin_pwd") || ""))) {
    redirect(`/dashboard/association/users/staff/${id}?err=status`);
  }
  const st = id ? getStaff(id) : undefined;
  if (st && st.staffRole !== "super_admin" && (status === "active" || status === "locked")) {
    setStaffStatus(id, status);
  }
  const to = `/dashboard/association/users/staff/${id}`;
  revalidatePath(to);
  redirect(to);
}

export async function setAccountStatusAction(fd: FormData) {
  const s = await requireStaffPermission("users");
  const phone = String(fd.get("phone") || "").trim();
  const status = String(fd.get("status") || "") as AccountStatus;
  // 停用为高危：需「本人管理员密码」二次核验（启用 / 恢复无需）
  if (status === "rejected" && !verifyAdminPassword(s, String(fd.get("admin_pwd") || ""))) {
    redirect(`/dashboard/association/users/${encodeURIComponent(phone)}?err=status`);
  }
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
  await requireStaffPermission("users");
  const phone = String(fd.get("phone") || "").trim();
  const tier = String(fd.get("tier") || "").trim();
  const acc = phone ? getAccountByPhone(phone) : undefined;
  if (acc && (acc.role === "enterprise" || acc.role === "individual")) {
    const track = acc.role === "enterprise" ? "enterprise" : "practitioner";
    if (tierLadder(track).some((m) => m.tier === tier)) {
      setAccountTier(phone, tier);
      // 个人会员：同步从业者名录展示等级，让公开名录 / 从业者「我的」与评定一致
      if (acc.role === "individual") {
        setPractitionerTierByPhone(phone, tier);
        revalidatePath("/practitioners");
        revalidatePath("/dashboard/practitioner");
        revalidatePath("/dashboard/practitioner/profile");
      }
    }
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
  const s = await requireAssoc();
  const phone = String(fd.get("phone") || "").trim();
  const pwd = String(fd.get("password") || "");
  // 重置他人密码＝可接管账号，高危：需本人管理员密码核验
  if (!verifyAdminPassword(s, String(fd.get("admin_pwd") || ""))) {
    redirect(`/dashboard/association/users/${encodeURIComponent(phone)}?err=reset`);
  }
  if (phone && pwd.length >= 6 && getAccountByPhone(phone)) setAccountPassword(phone, hashPassword(pwd));
  backToAccount(phone);
}

export async function deleteAccountAction(fd: FormData) {
  const s = await requireAssoc();
  const phone = String(fd.get("phone") || "").trim();
  const pwd = String(fd.get("admin_pwd") || "");
  // 高危：必须通过「本人管理员密码」二次核验，否则带错误回退、绝不删除
  if (!verifyAdminPassword(s, pwd)) {
    redirect(`/dashboard/association/users/${encodeURIComponent(phone)}?err=del`);
  }
  const role = getAccountByPhone(phone)?.role;
  if (phone) deleteAccount(phone);
  const to = `/dashboard/association/users${role ? `?tab=${role}` : ""}`;
  revalidatePath("/dashboard/association/users");
  redirect(to);
}

// 新增协会工作人员（超管 / 有 users 权限的职员）
export async function createStaffAction(fd: FormData) {
  await requireAssoc();
  const name = String(fd.get("name") || "").trim();
  const phone = String(fd.get("phone") || "").trim();
  const email = String(fd.get("email") || "").trim();
  const pwd = String(fd.get("password") || "");
  const roles = fd.getAll("role").map(String).filter((r) => ROLE_KEYS.includes(r) && r !== "super_admin");

  const err = (m: string): never => redirect(`/dashboard/association/users/staff/new?err=${encodeURIComponent(m)}`);
  if (!name) err("请填写姓名");
  if (!/^1\d{10}$/.test(phone)) err("请输入正确的 11 位手机号");
  if (pwd.length < 6) err("登录密码至少 6 位");
  if (!roles.length) err("请至少选择一个角色");
  if (getStaffAuthByPhone(phone)) err("该手机号已是协会工作人员");

  const id = createStaff({ name, phone, email: email || undefined, roles, passwordHash: hashPassword(pwd) });
  revalidatePath("/dashboard/association/users");
  const to = `/dashboard/association/users/staff/${id}?saved=created`;
  revalidatePath(to);
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
  // 保存角色后回到用户管理列表（员工 tab），而不是停留在详情页
  revalidatePath(`/dashboard/association/users/staff/${id}`);
  revalidatePath("/dashboard/association/users");
  redirect("/dashboard/association/users?tab=staff");
}

export async function setStaffPasswordAction(fd: FormData) {
  const s = await requireAssoc();
  const id = String(fd.get("id") || "").trim();
  const pwd = String(fd.get("password") || "");
  // 重置工作人员密码＝可接管其账号，高危：需本人管理员密码核验
  if (!verifyAdminPassword(s, String(fd.get("admin_pwd") || ""))) {
    redirect(`/dashboard/association/users/staff/${id}?err=reset`);
  }
  if (id && pwd.length >= 6 && getStaff(id)) setStaffPassword(id, hashPassword(pwd));
  const to = `/dashboard/association/users/staff/${id}?saved=pwd`;
  revalidatePath(to); redirect(to);
}

export async function deleteStaffAction(fd: FormData) {
  const s = await requireAssoc();
  const id = String(fd.get("id") || "").trim();
  const pwd = String(fd.get("admin_pwd") || "");
  // 高危：必须通过「本人管理员密码」二次核验，否则带错误回退、绝不删除
  if (!verifyAdminPassword(s, pwd)) {
    redirect(`/dashboard/association/users/staff/${id}?err=del`);
  }
  const st = id ? getStaff(id) : undefined;
  if (st && !st.roles.includes("super_admin")) deleteStaff(id);
  revalidatePath("/dashboard/association/users");
  redirect("/dashboard/association/users?tab=staff");
}
