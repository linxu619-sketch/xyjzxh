import "server-only";
import { getDb } from "@/lib/db/sqlite";
import { getJob, getApplication } from "@/lib/data/jobs";
import { countConfirmedDays, todayStr } from "@/lib/data/attendance";

/* ============================================================
   工资自动结算（E3）
   ------------------------------------------------------------
   依据：企业「确认出勤」天数 × 岗位日薪(标定)。
   资金：从该岗位的托管池(escrow_amount)扣减；结余完工后退企业。
   触发：日结→确认即结 / 完工结→完工即结 / 周结→cron+完工兜底 + 企业「立即结算」兜底。
   本期框架先行：记台账 + 扣托管池，状态 settled（真实到账/挂账待领见 E4）。
   ============================================================ */

export type PayoutKind = "wage" | "refund";
export type PayoutStatusW = "settled" | "paid" | "holding";

export type WagePayout = {
  id: number; applicationId: number; jobId: number; phone: string; workerName: string;
  kind: PayoutKind; periodLabel: string; days: number; daily: number; amount: number;
  status: PayoutStatusW; createdAt: number;
};
type Row = {
  id: number; application_id: number | null; job_id: number | null; practitioner_phone: string | null; worker_name: string | null;
  kind: string | null; period_label: string | null; days: number | null; daily: number | null; amount: number | null; status: string | null; created_at: number | null;
};
function rowTo(r: Row): WagePayout {
  return {
    id: r.id, applicationId: r.application_id ?? 0, jobId: r.job_id ?? 0, phone: r.practitioner_phone ?? "", workerName: r.worker_name ?? "",
    kind: (r.kind as PayoutKind) ?? "wage", periodLabel: r.period_label ?? "", days: r.days ?? 0, daily: r.daily ?? 0, amount: r.amount ?? 0,
    status: (r.status as PayoutStatusW) ?? "settled", createdAt: r.created_at ?? 0,
  };
}

function insert(p: { applicationId: number; jobId: number; phone: string; workerName: string; kind: PayoutKind; periodLabel: string; days: number; daily: number; amount: number; status: PayoutStatusW }): number {
  const info = getDb().prepare(
    "INSERT INTO wage_payouts (application_id,job_id,practitioner_phone,worker_name,kind,period_label,days,daily,amount,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
  ).run(p.applicationId, p.jobId, p.phone, p.workerName, p.kind, p.periodLabel, p.days, p.daily, p.amount, p.status, Date.now());
  return Number(info.lastInsertRowid);
}

export function listPayoutsByJob(jobId: number): WagePayout[] {
  return (getDb().prepare("SELECT * FROM wage_payouts WHERE job_id = ? ORDER BY created_at DESC").all(jobId) as Row[]).map(rowTo);
}
export function listPayoutsByApplication(appId: number): WagePayout[] {
  return (getDb().prepare("SELECT * FROM wage_payouts WHERE application_id = ? ORDER BY created_at DESC").all(appId) as Row[]).map(rowTo);
}
export function listWagePayoutsByPhone(phone: string): WagePayout[] {
  return (getDb().prepare("SELECT * FROM wage_payouts WHERE practitioner_phone = ? AND kind = 'wage' ORDER BY created_at DESC").all((phone || "").trim()) as Row[]).map(rowTo);
}

function sum(sql: string, ...args: unknown[]): number {
  return (getDb().prepare(sql).get(...args) as { s: number | null }).s ?? 0;
}
// 某岗位已从托管池划出的总额（工资 + 退款）
export function escrowDrawnByJob(jobId: number): number {
  return sum("SELECT COALESCE(SUM(amount),0) AS s FROM wage_payouts WHERE job_id = ?", jobId);
}
// 某工人已结工资额 / 已结天数
export function settledAmountByApplication(appId: number): number {
  return sum("SELECT COALESCE(SUM(amount),0) AS s FROM wage_payouts WHERE application_id = ? AND kind = 'wage'", appId);
}
export function settledDaysByApplication(appId: number): number {
  return sum("SELECT COALESCE(SUM(days),0) AS s FROM wage_payouts WHERE application_id = ? AND kind = 'wage'", appId);
}

// 托管池余额 = 应托管 - 已划出
export function escrowBalance(jobId: number): number {
  const job = getJob(jobId);
  if (!job) return 0;
  return Math.max(0, (job.escrowAmount || 0) - escrowDrawnByJob(jobId));
}

const SETTLE_PERIOD: Record<string, string> = { daily: "日结", weekly: "周结", on_complete: "完工结" };

/**
 * 自动结算一个工人的「确认出勤未结」天数：从托管池按日薪划付，记台账。
 * 幂等：只结未结天数；托管余额不足时按余额封顶（多余天数留待补缴后再结）。
 * 返回本次结算金额（0=无可结）。
 */
export function settleApplication(appId: number): number {
  const app = getApplication(appId);
  if (!app) return 0;
  const job = getJob(app.jobId);
  if (!job || job.escrowStatus !== "funded") return 0; // 未托管不结
  const daily = job.daily || 0;
  if (daily <= 0) return 0;
  const confirmed = countConfirmedDays(appId);
  const already = settledDaysByApplication(appId);
  const unpaidDays = confirmed - already;
  if (unpaidDays <= 0) return 0;
  // 托管余额封顶（防超额；正常 escrow 按上限预留必然够付）
  const balance = escrowBalance(app.jobId);
  if (balance <= 0) return 0;
  const wantDays = unpaidDays;
  let payDays = wantDays;
  let amount = payDays * daily;
  if (amount > balance) { payDays = Math.floor(balance / daily); amount = payDays * daily; }
  if (payDays <= 0 || amount <= 0) return 0;
  insert({
    applicationId: appId, jobId: app.jobId, phone: app.phone, workerName: app.name,
    kind: "wage", periodLabel: `${SETTLE_PERIOD[job.settleMode] ?? "结算"} · ${todayStr()}`,
    days: payDays, daily, amount, status: "settled",
  });
  return amount;
}

// 周结定时扫描：所有「周结·已托管」零工的在岗/完工工人,结算其确认未结出勤（cron 调用）
export function runWeeklyWageSettle(): { settled: number; amount: number } {
  const db = getDb();
  const jobs = db.prepare("SELECT id FROM jobs WHERE type='gig' AND settle_mode='weekly' AND escrow_status='funded'").all() as { id: number }[];
  let settled = 0, amount = 0;
  for (const j of jobs) {
    const apps = db.prepare("SELECT id FROM job_applications WHERE job_id = ? AND status IN ('working','done')").all(j.id) as { id: number }[];
    for (const a of apps) { const amt = settleApplication(a.id); if (amt > 0) { settled++; amount += amt; } }
  }
  return { settled, amount };
}

// 结余退企业：岗位托管池剩余 → 记一笔 refund，并把岗位 escrow 标记 refunded
export function refundJobEscrow(jobId: number, enterpriseName: string): number {
  const job = getJob(jobId);
  if (!job || job.escrowStatus !== "funded") return 0;
  const balance = escrowBalance(jobId);
  if (balance > 0) {
    insert({ applicationId: 0, jobId, phone: "", workerName: enterpriseName, kind: "refund", periodLabel: "结余退回", days: 0, daily: 0, amount: balance, status: "settled" });
  }
  getDb().prepare("UPDATE jobs SET escrow_status = 'refunded' WHERE id = ? AND escrow_status = 'funded'").run(jobId);
  return balance;
}
