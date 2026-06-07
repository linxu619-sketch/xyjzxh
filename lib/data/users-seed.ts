import "server-only";

/* ============================================================
   协会工作人员 —— 数据以 data/app.db 的 association_staff 表为准。
   ------------------------------------------------------------
   本文件【不再内置任何账号或密码】：
   - 全新空库的初始化：用系统超级管理员（写死源码的林旭，见 system-admin.ts）
     登录后台，在「用户管理 → 开通员工」里逐个创建协会员工并设置密码。
   - 改密码 / 查状态：直连 association_staff 表，勿用源码推断。
   SEED_STAFF 保留为空数组，仅作类型与回退占位（DB 不可用时返回空）。
   ============================================================ */

export type SeedStaff = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  staffRole:
    | "super_admin" | "president" | "vice_president" | "secretary"
    | "exec_secretary" | "office_director" | "party_secretary"
    | "reviewer" | "finance" | "content" | "support" | "mediator";
  roles?: string[];  // 多角色（不填则默认 [staffRole]）
  passwordHash: string;
  status: "active" | "locked";
};

// 故意为空：不在源码里内置任何员工账号 / 密码。
export const SEED_STAFF: SeedStaff[] = [];

export function findStaffByPhone(phone: string): SeedStaff | undefined {
  return SEED_STAFF.find((s) => s.phone === phone && s.status === "active");
}
