import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   企业工作台「团队管理」—— 成员账号 / 角色 / 状态（本地 SQLite）
   区别于 enterprise_team（子站对外展示的团队风采）。
   ============================================================ */

export type EntStaffRole =
  | "owner" | "admin" | "sales" | "site_manager" | "designer" | "finance" | "viewer";
export type EntStaffStatus = "active" | "locked" | "invited";

export const ENT_STAFF_ROLES: EntStaffRole[] =
  ["owner", "admin", "sales", "site_manager", "designer", "finance", "viewer"];
// 可分配给成员的角色（owner 是企业账号本人，不可分配/更改）
export const ENT_ASSIGNABLE_ROLES: EntStaffRole[] =
  ["admin", "sales", "site_manager", "designer", "finance", "viewer"];

export type EnterpriseStaff = {
  id: number;
  enterpriseId: string;
  name: string;
  phone: string;
  role: EntStaffRole;
  status: EntStaffStatus;
  createdAt: number;
};

type Row = {
  id: number; enterprise_id: string | null; name: string | null; phone: string | null;
  role: string | null; status: string | null; created_at: number | null;
};
function rowTo(r: Row): EnterpriseStaff {
  return {
    id: r.id, enterpriseId: r.enterprise_id ?? "", name: r.name ?? "", phone: r.phone ?? "",
    role: (r.role as EntStaffRole) ?? "viewer", status: (r.status as EntStaffStatus) ?? "active",
    createdAt: r.created_at ?? 0,
  };
}

/** 首访自动建一条 owner（企业账号本人）；之后保持幂等。返回是否新建。 */
export function ensureOwner(enterpriseId: string, owner: { name: string; phone: string }): void {
  if (!enterpriseId) return;
  const db = getDb();
  const has = db.prepare("SELECT 1 FROM enterprise_staff WHERE enterprise_id = ? LIMIT 1").get(enterpriseId);
  if (has) return;
  db.prepare("INSERT INTO enterprise_staff (enterprise_id,name,phone,role,status,created_at) VALUES (?,?,?, 'owner','active', ?)")
    .run(enterpriseId, owner.name || "负责人", owner.phone || "", Date.now());
}

export function listStaffByEnterprise(enterpriseId: string): EnterpriseStaff[] {
  if (!enterpriseId) return [];
  // owner 永远排最前，其余按加入时间
  const rows = getDb()
    .prepare("SELECT * FROM enterprise_staff WHERE enterprise_id = ? ORDER BY (role='owner') DESC, created_at ASC")
    .all(enterpriseId) as Row[];
  return rows.map(rowTo);
}

export function getStaff(id: number): EnterpriseStaff | undefined {
  const r = getDb().prepare("SELECT * FROM enterprise_staff WHERE id = ?").get(id) as Row | undefined;
  return r ? rowTo(r) : undefined;
}

/** 成员独立登录用：按手机号找「在职、非 owner」的团队成员（owner 走企业账号登录）。 */
export function getActiveStaffByPhone(phone: string): EnterpriseStaff | undefined {
  const p = (phone || "").trim();
  if (!p) return undefined;
  const r = getDb()
    .prepare("SELECT * FROM enterprise_staff WHERE phone = ? AND status = 'active' AND role != 'owner' ORDER BY created_at ASC LIMIT 1")
    .get(p) as Row | undefined;
  return r ? rowTo(r) : undefined;
}

/** 直接添加自己公司的团队成员（即在职，无需对方激活）。手机号选填，仅作通讯录与去重。 */
export function addStaff(input: { enterpriseId: string; name: string; phone: string; role: EntStaffRole }): { ok: boolean; error?: "name" | "phone" | "dup" } {
  const name = input.name.trim();
  const phone = input.phone.trim();
  if (!input.enterpriseId || !name) return { ok: false, error: "name" };
  if (phone && !/^1\d{10}$/.test(phone)) return { ok: false, error: "phone" };
  const role = ENT_ASSIGNABLE_ROLES.includes(input.role) ? input.role : "viewer";
  const db = getDb();
  // 填了手机号才做同企业去重（避免同号重复录入）
  if (phone && db.prepare("SELECT 1 FROM enterprise_staff WHERE enterprise_id = ? AND phone = ?").get(input.enterpriseId, phone)) return { ok: false, error: "dup" };
  db.prepare("INSERT INTO enterprise_staff (enterprise_id,name,phone,role,status,created_at) VALUES (?,?,?,?, 'active', ?)")
    .run(input.enterpriseId, name, phone, role, Date.now());
  return { ok: true };
}

// 下面三个仅作用于本企业、且非 owner（owner 是账号本人，不可改/锁/删）
export function setStaffStatus(enterpriseId: string, id: number, status: EntStaffStatus): void {
  getDb().prepare("UPDATE enterprise_staff SET status = ? WHERE id = ? AND enterprise_id = ? AND role != 'owner'")
    .run(status, id, enterpriseId);
}
export function setStaffRole(enterpriseId: string, id: number, role: EntStaffRole): void {
  if (!ENT_ASSIGNABLE_ROLES.includes(role)) return;
  getDb().prepare("UPDATE enterprise_staff SET role = ? WHERE id = ? AND enterprise_id = ? AND role != 'owner'")
    .run(role, id, enterpriseId);
}
export function removeStaff(enterpriseId: string, id: number): void {
  getDb().prepare("DELETE FROM enterprise_staff WHERE id = ? AND enterprise_id = ? AND role != 'owner'")
    .run(id, enterpriseId);
}
