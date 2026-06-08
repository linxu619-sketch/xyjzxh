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
// 邀请时可选的角色（owner 是企业账号本人，不可被邀请/更改）
export const ENT_INVITE_ROLES: EntStaffRole[] =
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

export function inviteStaff(input: { enterpriseId: string; name: string; phone: string; role: EntStaffRole }): number | null {
  if (!input.enterpriseId || !input.name.trim() || !/^1\d{10}$/.test(input.phone.trim())) return null;
  if (!ENT_INVITE_ROLES.includes(input.role)) return null;
  const db = getDb();
  // 同企业同手机号去重
  if (db.prepare("SELECT 1 FROM enterprise_staff WHERE enterprise_id = ? AND phone = ?").get(input.enterpriseId, input.phone.trim())) return null;
  const info = db.prepare("INSERT INTO enterprise_staff (enterprise_id,name,phone,role,status,created_at) VALUES (?,?,?,?, 'invited', ?)")
    .run(input.enterpriseId, input.name.trim(), input.phone.trim(), input.role, Date.now());
  return Number(info.lastInsertRowid);
}

// 下面三个仅作用于本企业、且非 owner（owner 是账号本人，不可改/锁/删）
export function setStaffStatus(enterpriseId: string, id: number, status: EntStaffStatus): void {
  getDb().prepare("UPDATE enterprise_staff SET status = ? WHERE id = ? AND enterprise_id = ? AND role != 'owner'")
    .run(status, id, enterpriseId);
}
export function setStaffRole(enterpriseId: string, id: number, role: EntStaffRole): void {
  if (!ENT_INVITE_ROLES.includes(role)) return;
  getDb().prepare("UPDATE enterprise_staff SET role = ? WHERE id = ? AND enterprise_id = ? AND role != 'owner'")
    .run(role, id, enterpriseId);
}
export function removeStaff(enterpriseId: string, id: number): void {
  getDb().prepare("DELETE FROM enterprise_staff WHERE id = ? AND enterprise_id = ? AND role != 'owner'")
    .run(id, enterpriseId);
}
