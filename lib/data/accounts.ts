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
  createdAt: number;
};

type Row = {
  id: number; phone: string | null; role: string | null; status: string;
  password_hash: string | null; name: string | null; app_id: number | null; member_ref: string | null; created_at: number | null;
};

function rowTo(r: Row): Account {
  return {
    id: r.id, phone: r.phone ?? "", role: (r.role as AccountRole) ?? "customer",
    status: (r.status as AccountStatus) ?? "pending", passwordHash: r.password_hash,
    name: r.name ?? "", appId: r.app_id, memberRef: r.member_ref, createdAt: r.created_at ?? 0,
  };
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
