import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession, type Session } from "./session";
import { getEffectivePermissionsForRoles } from "@/lib/runtime-config";
import { getStaff } from "@/lib/data/staff-source";
import type { Permission } from "./roles";

/**
 * 要求已登录才能访问当前页 —— 未登录则跳登录页并带 ?next= 回跳。
 * 供「会员服务/资料」浏览页（知识库全文、报备、建材、人才/从业者等）
 * 与「办事/提交」页（报备、评价、调解、投保、下单）统一使用。
 * 当前路径来自 middleware 注入的 x-pathname。
 */
export async function requireLogin(): Promise<Session> {
  const session = await getSession();
  if (session) return session;
  const path = (await headers()).get("x-pathname") || "/";
  redirect(`/login?next=${encodeURIComponent(path)}`);
}

/**
 * 协会工作台 server action 越权防护（纵深防御）：
 * 不仅校验"是协会员工"，还校验该员工是否具备所需细粒度权限。
 * 防止有限权限的员工直接 POST 调用其无权的 action（绕过页面级 RBAC）。
 * 系统超管(system_admin)与拥有全部权限的角色恒通过。
 */
export async function requireStaffPermission(perm: Permission): Promise<Session> {
  const s = await getSession();
  if (!s || (s.role !== "association" && s.role !== "system_admin")) {
    throw new Error("无权限：仅协会工作人员可操作");
  }
  if (s.role === "system_admin") return s; // 系统超管：全权
  const staff = getStaff(s.uid);
  const roles = staff?.roles?.length ? staff.roles : (s.staffRole ? [s.staffRole] : []);
  const perms = await getEffectivePermissionsForRoles(roles);
  if (!perms.has(perm)) throw new Error("无权限：缺少所需操作权限");
  return s;
}
