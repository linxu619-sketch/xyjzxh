import "server-only";
import type { EntStaffRole } from "@/lib/data/enterprise-staff";
import type { Session } from "./session";

/* ============================================================
   企业工作台「团队成员」权限（L2 RBAC）
   ------------------------------------------------------------
   团队成员用受限企业会话登录：role="enterprise" + staffRole（销售/项目经理…）。
   老板账号无 staffRole = 全权；admin 成员 = 全权；其余角色按下表收权：
   - 只进自己该进的页（导航显隐 + EnterpriseShell 集中拦截越权 URL）
   - 线索/报备只看分派给自己的（entScopesOwnData）
   ============================================================ */

export const ENT_ROLE_LABEL: Record<EntStaffRole, string> = {
  owner: "负责人", admin: "管理员", sales: "销售顾问", site_manager: "项目经理",
  designer: "设计师", finance: "财务", viewer: "查看者",
};

const INDEX = "/dashboard/enterprise";

// 受限角色可访问的页面（href 前缀）。owner/admin 不在表内 = 全权。
const ALLOWED: Record<string, string[]> = {
  sales:        ["/dashboard/enterprise/leads", "/dashboard/enterprise/association"],
  site_manager: ["/dashboard/enterprise/projects", "/dashboard/enterprise/orders", "/dashboard/enterprise/association"],
  designer:     ["/dashboard/enterprise/projects", "/dashboard/enterprise/association"],
  finance:      ["/dashboard/enterprise/finance", "/dashboard/enterprise/association"],
  viewer:       ["/dashboard/enterprise/association"],
};

// 团队成员登录（受限会话：有 staffRole）
export function isEntStaff(s: Session | null): boolean {
  return !!s && s.role === "enterprise" && !!s.staffRole;
}
// 全权：老板账号（无 staffRole）/ owner / admin 成员
export function isEntFull(s: Session | null): boolean {
  return !!s && s.role === "enterprise" && (!s.staffRole || s.staffRole === "owner" || s.staffRole === "admin");
}
// 受限成员（仅看分派给自己的线索/报备）
export function entScopesOwnData(s: Session | null): boolean {
  return isEntStaff(s) && !isEntFull(s);
}
// 当前成员的 enterprise_staff.id（uid=`entstaff-<id>`）
export function entStaffId(s: Session | null): number {
  if (!isEntStaff(s)) return 0;
  const m = /^entstaff-(\d+)$/.exec(s!.uid);
  return m ? Number(m[1]) : 0;
}
// staffRole 能否访问某路径（总览人人可进；全权全可）
export function canAccessEnt(staffRole: string | undefined, pathname: string): boolean {
  if (!staffRole || staffRole === "owner" || staffRole === "admin") return true;
  if (pathname === INDEX) return true;
  const allowed = ALLOWED[staffRole] ?? [];
  return allowed.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
