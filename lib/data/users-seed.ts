import "server-only";

/* ============================================================
   协会工作人员「初始化引导」种子
   ------------------------------------------------------------
   仅在 association_staff 表为空（全新部署）时灌入，用于第一位
   协会管理员（会长）能登录后台、再去「用户管理」开通其余员工。
   一旦库里已有真实员工，本种子不再生效（见 sqlite.ts seed 守卫）。

   ⚠️ 真实部署的员工数据以 data/app.db 的 association_staff 表为准，
   不要用本文件推断真实账号/密码；改密码/查状态直连该表。
   ⚠️ 生产请尽快改掉下面的初始密码。
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

export const SEED_STAFF: SeedStaff[] = [
  {
    id: "as-001",
    name: "何平俊",
    phone: "13507610059",
    staffRole: "president",  // 协会会长（平台超管是写死源码的林旭，不在此表）
    roles: ["president"],
    // 初始密码 = 手机号后 6 位「610059」（scrypt 哈希）；生产请尽快改掉
    passwordHash:
      "scrypt$ae75965c57b123e58c1323210f3c4ee4$758562605edb30d3e3e39e208bdbd525d35222aeaeb9775ff76701146e60d19f61a5fba6f048d9351558f3a84eca9292ae5a58a8d987c1a3a3cb173da3c1d813",
    status: "active",
  },
];

export function findStaffByPhone(phone: string): SeedStaff | undefined {
  return SEED_STAFF.find((s) => s.phone === phone && s.status === "active");
}
