import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   入会 / 注册申请（真实写入 SQLite）
   ============================================================ */

export type AppType = "enterprise" | "individual" | "customer";
export type AppStatus = "pending" | "approved" | "rejected";
export type IdVerifyStatus = "unverified" | "verified" | "failed";

export type Application = {
  id: number;
  type: AppType;
  applicant: string;
  phone: string;
  payload: Record<string, unknown>;
  status: AppStatus;
  idVerifyStatus: IdVerifyStatus;
  idVerifyBy: string;
  idVerifyAt: number;
  reviewedBy: string;
  reviewedAt: number;
  createdAt: number;
};

type Row = {
  id: number;
  type: string;
  applicant: string | null;
  phone: string | null;
  payload: string | null;
  status: string;
  idverify_status: string | null;
  idverify_by: string | null;
  idverify_at: number | null;
  reviewed_by: string | null;
  reviewed_at: number | null;
  created_at: number | null;
};

function rowTo(r: Row): Application {
  let payload: Record<string, unknown> = {};
  try { payload = r.payload ? JSON.parse(r.payload) : {}; } catch { payload = {}; }
  return {
    id: r.id,
    type: (r.type as AppType) ?? "customer",
    applicant: r.applicant ?? "",
    phone: r.phone ?? "",
    payload,
    status: (r.status as AppStatus) ?? "pending",
    idVerifyStatus: (r.idverify_status as IdVerifyStatus) ?? "unverified",
    idVerifyBy: r.idverify_by ?? "",
    idVerifyAt: r.idverify_at ?? 0,
    reviewedBy: r.reviewed_by ?? "",
    reviewedAt: r.reviewed_at ?? 0,
    createdAt: r.created_at ?? 0,
  };
}

export function createApplication(input: {
  type: AppType;
  applicant: string;
  phone: string;
  payload: Record<string, unknown>;
}): number {
  const info = getDb()
    .prepare("INSERT INTO applications (type, applicant, phone, payload, status, created_at) VALUES (?,?,?,?, 'pending', ?)")
    .run(input.type, input.applicant, input.phone, JSON.stringify(input.payload ?? {}), Date.now());
  return Number(info.lastInsertRowid);
}

export function getApplication(id: number): Application | undefined {
  const row = getDb().prepare("SELECT * FROM applications WHERE id = ?").get(id) as Row | undefined;
  return row ? rowTo(row) : undefined;
}

export function getLatestApplicationByPhone(phone: string): Application | undefined {
  const clean = phone.trim();
  if (!clean) return undefined;
  const row = getDb()
    .prepare("SELECT * FROM applications WHERE phone = ? ORDER BY created_at DESC LIMIT 1")
    .get(clean) as Row | undefined;
  return row ? rowTo(row) : undefined;
}

// 从业者实名证件（注册时上传，存 application payload）：身份证人像/国徽面 + 资格证图 + 核验状态。
// 身份证原件属敏感信息，仅本人 / 协会审核可见，不对用人企业开放。
export type PractitionerIdentity = { realName: string; idFront: string; idBack: string; certImage: string; verified: boolean };
export function getPractitionerIdentity(phone: string): PractitionerIdentity | undefined {
  const app = getLatestApplicationByPhone(phone);
  if (!app || app.type !== "individual") return undefined;
  const p = app.payload as Record<string, string>;
  return {
    realName: app.applicant,
    idFront: p["身份证人像面"] || "",
    idBack: p["身份证国徽面"] || "",
    certImage: p["资格证书"] || "",
    verified: app.idVerifyStatus === "verified",
  };
}

export function listApplications(status?: AppStatus): Application[] {
  const db = getDb();
  const rows = (status
    ? db.prepare("SELECT * FROM applications WHERE status = ? ORDER BY created_at DESC").all(status)
    : db.prepare("SELECT * FROM applications ORDER BY created_at DESC").all()) as Row[];
  return rows.map(rowTo);
}

export function countByStatus(): Record<AppStatus, number> {
  const rows = getDb()
    .prepare("SELECT status, COUNT(*) AS c FROM applications GROUP BY status")
    .all() as { status: string; c: number }[];
  const out: Record<AppStatus, number> = { pending: 0, approved: 0, rejected: 0 };
  for (const r of rows) if (r.status in out) out[r.status as AppStatus] = r.c;
  return out;
}

export function setApplicationStatus(id: number, status: AppStatus, by?: string) {
  if (by) getDb().prepare("UPDATE applications SET status = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?").run(status, by, Date.now(), id);
  else getDb().prepare("UPDATE applications SET status = ? WHERE id = ?").run(status, id);
}

// 实名核验（人工）：记录核验结果、核验人与时间
export function setIdVerify(id: number, status: IdVerifyStatus, by: string) {
  getDb().prepare("UPDATE applications SET idverify_status = ?, idverify_by = ?, idverify_at = ? WHERE id = ?")
    .run(status, by, Date.now(), id);
}

// 按 appId 取申请（用户管理详情页回链实名信息用）
export function getApplicationByAppId(appId: number): Application | undefined {
  const row = getDb().prepare("SELECT * FROM applications WHERE id = ?").get(appId) as Row | undefined;
  return row ? rowTo(row) : undefined;
}
