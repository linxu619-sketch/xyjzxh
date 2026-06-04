"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getAccountByPhone, setAccountStatus, setAccountTier, type AccountStatus } from "@/lib/data/accounts";
import { tierLadder } from "@/lib/data/member-tier";
import { getStaff, setStaffStatus, type StaffStatus } from "@/lib/data/staff-source";

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
