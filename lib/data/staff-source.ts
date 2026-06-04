import "server-only";
import { getDb } from "@/lib/db/sqlite";
import { SEED_STAFF } from "@/lib/data/users-seed";

/* 协会工作人员数据源：本地 SQLite（失败回退种子）。
   平台超管 SYSTEM_ADMIN（林旭）不在此表——它写死源码、仅源码可改。 */

export type StaffStatus = "active" | "locked";
export type Staff = {
  id: string; name: string; phone: string; email: string;
  staffRole: string; roles: string[]; status: StaffStatus; createdAt: number;
};
type Row = { id: string; name: string | null; phone: string | null; email: string | null; staff_role: string | null; roles: string | null; password_hash: string | null; status: string; created_at: number | null };

function parseRoles(s: string | null, fallback: string): string[] {
  if (s) { try { const v = JSON.parse(s); if (Array.isArray(v) && v.length) return v.map(String); } catch { /**/ } }
  return [fallback];
}
function rowTo(r: Row): Staff {
  const primary = r.staff_role ?? "support";
  return { id: r.id, name: r.name ?? "", phone: r.phone ?? "", email: r.email ?? "", staffRole: primary, roles: parseRoles(r.roles, primary), status: (r.status as StaffStatus) ?? "active", createdAt: r.created_at ?? 0 };
}

export function listStaff(): Staff[] {
  try {
    const rows = getDb().prepare("SELECT * FROM association_staff ORDER BY created_at ASC").all() as Row[];
    if (rows.length) return rows.map(rowTo);
  } catch { /* fall through */ }
  return SEED_STAFF.map((s, i) => ({ id: s.id, name: s.name, phone: s.phone, email: s.email ?? "", staffRole: s.staffRole, roles: s.roles ?? [s.staffRole], status: s.status, createdAt: Date.now() - i * 86400000 }));
}

export function getStaff(id: string): Staff | undefined {
  try {
    const r = getDb().prepare("SELECT * FROM association_staff WHERE id = ?").get(id) as Row | undefined;
    if (r) return rowTo(r);
  } catch { /* fall through */ }
  const s = SEED_STAFF.find((x) => x.id === id);
  return s ? { id: s.id, name: s.name, phone: s.phone, email: s.email ?? "", staffRole: s.staffRole, roles: s.roles ?? [s.staffRole], status: s.status, createdAt: 0 } : undefined;
}

// 登录用：含密码哈希
export function getStaffAuthByPhone(phone: string): { id: string; name: string; phone: string; staffRole: string; passwordHash: string; status: StaffStatus } | undefined {
  const clean = phone.trim();
  if (!clean) return undefined;
  try {
    const r = getDb().prepare("SELECT * FROM association_staff WHERE phone = ? LIMIT 1").get(clean) as Row | undefined;
    if (r) return { id: r.id, name: r.name ?? "", phone: r.phone ?? "", staffRole: r.staff_role ?? "support", passwordHash: r.password_hash ?? "", status: (r.status as StaffStatus) ?? "active" };
  } catch { /* fall through */ }
  const s = SEED_STAFF.find((x) => x.phone === clean);
  return s ? { id: s.id, name: s.name, phone: s.phone, staffRole: s.staffRole, passwordHash: s.passwordHash, status: s.status } : undefined;
}

export function setStaffStatus(id: string, status: StaffStatus): void {
  getDb().prepare("UPDATE association_staff SET status = ? WHERE id = ?").run(status, id);
}

export function setStaffRoles(id: string, roles: string[]): void {
  const primary = roles[0] ?? "support";
  getDb().prepare("UPDATE association_staff SET roles = ?, staff_role = ? WHERE id = ?").run(JSON.stringify(roles), primary, id);
}

export function setStaffPassword(id: string, passwordHash: string): void {
  getDb().prepare("UPDATE association_staff SET password_hash = ? WHERE id = ?").run(passwordHash, id);
}

export function deleteStaff(id: string): void {
  getDb().prepare("DELETE FROM association_staff WHERE id = ?").run(id);
}

export function createStaff(input: { name: string; phone: string; email?: string; roles: string[]; passwordHash: string }): string {
  const id = `as-${Date.now().toString(36)}`;
  getDb().prepare("INSERT INTO association_staff (id,name,phone,email,staff_role,roles,password_hash,status,created_at) VALUES (?,?,?,?,?,?,?, 'active', ?)")
    .run(id, input.name, input.phone.trim(), input.email ?? null, input.roles[0] ?? "support", JSON.stringify(input.roles), input.passwordHash, Date.now());
  return id;
}

export function countStaff(): number {
  try { return (getDb().prepare("SELECT COUNT(*) c FROM association_staff").get() as { c: number }).c; } catch { return SEED_STAFF.length; }
}
