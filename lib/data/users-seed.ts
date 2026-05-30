import "server-only";

/* ============================================================
   协会工作人员 mock 数据（替代真正数据库 association_staff 表）
   ------------------------------------------------------------
   接入 Supabase 后，本文件可删除；用 db/seed.sql 把这里的
   记录写入 association_staff 即可。密码均为 scrypt 哈希。
   ============================================================ */

export type SeedStaff = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  staffRole:
    | "super_admin" | "secretary" | "reviewer"
    | "finance" | "content" | "support";
  passwordHash: string;
  status: "active" | "locked";
};

export const SEED_STAFF: SeedStaff[] = [
  {
    id: "as-001",
    name: "何平俊",
    phone: "13507610059",
    staffRole: "super_admin",
    // scrypt of "610059"
    passwordHash:
      "scrypt$ae75965c57b123e58c1323210f3c4ee4$758562605edb30d3e3e39e208bdbd525d35222aeaeb9775ff76701146e60d19f61a5fba6f048d9351558f3a84eca9292ae5a58a8d987c1a3a3cb173da3c1d813",
    status: "active",
  },
];

export function findStaffByPhone(phone: string): SeedStaff | undefined {
  return SEED_STAFF.find((s) => s.phone === phone && s.status === "active");
}
