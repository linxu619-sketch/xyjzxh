import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   平台账号（登录身份）—— 与会员资格分层
   - 入会申请时建 pending 账号；审核通过激活为 active 并绑定会员记录
   - 业主(customer)注册即 active
   ============================================================ */

export type AccountRole = "enterprise" | "individual" | "customer";
export type AccountStatus = "pending" | "active" | "rejected";

export type Account = {
  id: number;
  phone: string;
  role: AccountRole;
  status: AccountStatus;
  passwordHash: string | null;
  name: string;
  appId: number | null;
  memberRef: string | null;
  tier: string | null;
  capStore: number | null;       // 会员能力覆盖：NULL=随等级 | 0=禁止开店 | 1=允许
  capStoreQuota: number | null;  // 店铺上架额度覆盖：NULL=随等级 | >=0=自定义
  createdAt: number;
};

type Row = {
  id: number; phone: string | null; role: string | null; status: string;
  password_hash: string | null; name: string | null; app_id: number | null; member_ref: string | null; tier: string | null;
  cap_store: number | null; cap_store_quota: number | null; created_at: number | null;
};

function rowTo(r: Row): Account {
  return {
    id: r.id, phone: r.phone ?? "", role: (r.role as AccountRole) ?? "customer",
    status: (r.status as AccountStatus) ?? "pending", passwordHash: r.password_hash,
    name: r.name ?? "", appId: r.app_id, memberRef: r.member_ref, tier: r.tier ?? null,
    capStore: r.cap_store ?? null, capStoreQuota: r.cap_store_quota ?? null, createdAt: r.created_at ?? 0,
  };
}

// 设置会员能力覆盖（NULL=随等级）。仅协会管理员调用。
export function setMemberCaps(phone: string, caps: { capStore: number | null; capStoreQuota: number | null }): void {
  getDb().prepare("UPDATE accounts SET cap_store = ?, cap_store_quota = ? WHERE phone = ?")
    .run(caps.capStore, caps.capStoreQuota, phone.trim());
}

export function getAccountByPhone(phone: string): Account | undefined {
  const clean = phone.trim();
  if (!clean) return undefined;
  const row = getDb().prepare("SELECT * FROM accounts WHERE phone = ? LIMIT 1").get(clean) as Row | undefined;
  return row ? rowTo(row) : undefined;
}

// 入会/注册时建账号（按手机号 upsert：已存在则更新角色/状态/申请关联，便于补料重提）
export function upsertAccount(input: {
  phone: string; role: AccountRole; status?: AccountStatus;
  passwordHash?: string | null; name?: string; appId?: number | null;
}): void {
  const db = getDb();
  const exist = getAccountByPhone(input.phone);
  const status = input.status ?? "pending";
  if (exist) {
    db.prepare(
      "UPDATE accounts SET role=?, status=?, name=COALESCE(?,name), app_id=COALESCE(?,app_id), password_hash=COALESCE(?,password_hash) WHERE phone=?",
    ).run(input.role, status, input.name ?? null, input.appId ?? null, input.passwordHash ?? null, input.phone.trim());
  } else {
    db.prepare(
      "INSERT INTO accounts (phone,role,status,password_hash,name,app_id,member_ref,created_at) VALUES (?,?,?,?,?,?,NULL,?)",
    ).run(input.phone.trim(), input.role, status, input.passwordHash ?? null, input.name ?? "", input.appId ?? null, Date.now());
  }
}

// 审核通过：激活账号并绑定会员记录
export function activateAccountByAppId(appId: number, memberRef: string): void {
  getDb().prepare("UPDATE accounts SET status='active', member_ref=? WHERE app_id=?").run(memberRef, appId);
}

export function rejectAccountByAppId(appId: number): void {
  getDb().prepare("UPDATE accounts SET status='rejected' WHERE app_id=?").run(appId);
}

export function setAccountStatus(phone: string, status: AccountStatus): void {
  getDb().prepare("UPDATE accounts SET status=? WHERE phone=?").run(status, phone.trim());
}

// 协会调整会员等级（调用方需先按角色校验 tier 合法性）
export function setAccountTier(phone: string, tier: string): void {
  getDb().prepare("UPDATE accounts SET tier=? WHERE phone=?").run(tier, phone.trim());
}

// 超管重置 / 设置登录密码（传入已哈希值）
export function setAccountPassword(phone: string, passwordHash: string): void {
  getDb().prepare("UPDATE accounts SET password_hash=? WHERE phone=?").run(passwordHash, phone.trim());
}

// 超管删除账号
export function deleteAccount(phone: string): void {
  getDb().prepare("DELETE FROM accounts WHERE phone=?").run(phone.trim());
}

// 超管编辑账号资料（姓名等）
export function updateAccountProfile(phone: string, name: string): void {
  getDb().prepare("UPDATE accounts SET name=? WHERE phone=?").run(name, phone.trim());
}

// 换绑手机号（登录身份）：把账号的 phone 从 oldPhone 改为 newPhone
export function updateAccountPhone(oldPhone: string, newPhone: string): void {
  getDb().prepare("UPDATE accounts SET phone=? WHERE phone=?").run(newPhone.trim(), oldPhone.trim());
}

// 超管用户管理：全部账号（可按角色筛）
export function listAccounts(role?: AccountRole): Account[] {
  const rows = role
    ? getDb().prepare("SELECT * FROM accounts WHERE role=? ORDER BY status ASC, created_at DESC").all(role) as Row[]
    : getDb().prepare("SELECT * FROM accounts ORDER BY created_at DESC").all() as Row[];
  return rows.map(rowTo);
}
export function countAccountsByRole(): Record<string, number> {
  const rows = getDb().prepare("SELECT role, COUNT(*) c FROM accounts GROUP BY role").all() as { role: string; c: number }[];
  const m: Record<string, number> = {};
  for (const r of rows) m[r.role] = r.c;
  return m;
}
