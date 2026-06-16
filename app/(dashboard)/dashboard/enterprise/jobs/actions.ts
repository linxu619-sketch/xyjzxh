"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { createJob, getJob, setJobStatus, getApplication, setApplicationStatus, countHired, computeEscrow, setJobEscrow, type AppStatus, type JobStatus } from "@/lib/data/jobs";
import { createPayment } from "@/lib/data/payments-source";
import { confirmAttendance, rejectAttendance, enterpriseAddDay, getAttendance } from "@/lib/data/attendance";
import { settleApplication, refundJobEscrow } from "@/lib/data/wage-payouts";

// 派工闭环：投递状态前向流转白名单（录用→到岗→完工；完工=终态；不合适/取消/中止→rejected）
const ALLOWED_APP_FLOW: Record<AppStatus, AppStatus[]> = {
  pending: ["accepted", "rejected"],   // 待处理 → 录用 / 不合适
  rejected: ["pending"],               // 未通过 → 重新考虑
  accepted: ["working", "rejected"],   // 已录用 → 标记到岗 / 取消录用
  working: ["done", "rejected"],       // 施工中 → 标记完工 / 中止
  done: [],                            // 已完工：终态，不可再变
};

async function requireEnterprise() {
  const s = await getSession();
  if (!s || s.role !== "enterprise" || !s.enterpriseId) throw new Error("无权限：仅企业账号可管理招聘");
  return s;
}

export async function createJobAction(fd: FormData) {
  const s = await requireEnterprise();
  const title = String(fd.get("title") || "").trim();
  const kind = String(fd.get("kind") || "").trim();
  if (!title || !kind) redirect("/dashboard/enterprise/jobs?jerr=1");
  const ent = await getEnterpriseBySlugOrId(s.enterpriseId!);
  const posInt = (k: string): number | null => {
    const n = Math.floor(Number(fd.get(k)));
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  const daily = Number(fd.get("daily") || 0) || 0;
  const dailyMax = posInt("dailyMax");
  const openings = Number(fd.get("openings") || 1) || 1;
  const expectedDays = Math.max(0, Math.floor(Number(fd.get("expectedDays")) || 0));
  const insurance = fd.get("insurance") === "self" ? "self" : "company";
  const jobId = createJob({
    enterpriseId: s.enterpriseId!,
    enterpriseName: ent?.hero.brand ?? ent?.name ?? "本企业",
    title,
    kind,
    district: String(fd.get("district") || "").trim(),
    daily,
    dailyMax,
    openings,
    duration: String(fd.get("duration") || "").trim(),
    startDate: String(fd.get("startDate") || "").trim(),
    settleMode: (() => { const m = String(fd.get("settleMode") || ""); return m === "daily" || m === "weekly" || m === "on_complete" ? m : "on_complete"; })(),
    expectedDays,
    urgent: fd.get("urgent") === "on",
    detail: String(fd.get("detail") || "").trim(),
    insurance,
    minAge: posInt("minAge"),
    maxAge: posInt("maxAge"),
    minYears: posInt("minYears") ?? 0,
    genderReq: (() => { const g = String(fd.get("genderReq") || "").trim(); return g === "男" || g === "女" ? g : ""; })(),
    needCert: fd.get("needCert") === "on",
  });
  // 发布即托管：算应托管 → 建托管支付单 → 跳收银台付保证金（到账后岗位才放出）
  const escrow = computeEscrow({ daily, dailyMax, openings, expectedDays, insurance });
  revalidatePath("/dashboard/enterprise/jobs");
  if (escrow > 0) {
    const pay = createPayment({
      bizType: "wage_escrow", bizId: jobId, method: "bank_corp", amount: escrow,
      payerName: ent?.name ?? "企业", payeeName: "协会监管账户", subject: `工资保证金托管 · ${title}`,
    });
    setJobEscrow(jobId, escrow, pay.id);
    redirect(`/dashboard/pay/${pay.id}`);
  }
  redirect("/dashboard/enterprise/jobs?jok=1");
}

// 发布招聘岗位（type=hire，月薪）
export async function createRecruitAction(fd: FormData) {
  const s = await requireEnterprise();
  const title = String(fd.get("title") || "").trim();
  const kind = String(fd.get("kind") || "").trim();
  if (!title || !kind) redirect("/dashboard/enterprise/recruit?jerr=1");
  const ent = await getEnterpriseBySlugOrId(s.enterpriseId!);
  const posInt = (k: string): number | null => {
    const n = Math.floor(Number(fd.get(k)));
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  createJob({
    enterpriseId: s.enterpriseId!,
    enterpriseName: ent?.hero.brand ?? ent?.name ?? "本企业",
    type: "hire",
    title,
    kind,
    edu: String(fd.get("edu") || "").trim(),
    district: String(fd.get("district") || "").trim(),
    daily: Number(fd.get("daily") || 0) || 0,          // 月薪下限
    dailyMax: posInt("dailyMax"),                       // 月薪上限
    benefits: fd.getAll("benefits").map(String).filter(Boolean),
    openings: Number(fd.get("openings") || 1) || 1,
    duration: "长期",
    startDate: String(fd.get("startDate") || "").trim(),
    detail: String(fd.get("detail") || "").trim(),
    minAge: posInt("minAge"),
    maxAge: posInt("maxAge"),
    minYears: posInt("minYears") ?? 0,
    genderReq: (() => { const g = String(fd.get("genderReq") || "").trim(); return g === "男" || g === "女" ? g : ""; })(),
    needCert: fd.get("needCert") === "on",
  });
  revalidatePath("/dashboard/enterprise/recruit");
  redirect("/dashboard/enterprise/recruit?jok=1");
}

export async function setJobStatusAction(fd: FormData) {
  const s = await requireEnterprise();
  const id = Number(fd.get("id") || 0);
  const status = String(fd.get("status") || "") as JobStatus;
  const job = getJob(id);
  if (!job || job.enterpriseId !== s.enterpriseId) throw new Error("无权操作该岗位");
  if (status === "open" || status === "closed") setJobStatus(id, status);
  // 结束招聘 → 托管池结余自动退回企业（仅对已托管的零工）
  if (status === "closed" && job.type === "gig" && job.escrowStatus === "funded") {
    refundJobEscrow(id, job.enterpriseName || "企业");
  }
  revalidatePath("/dashboard/enterprise/jobs");
  revalidatePath(`/dashboard/enterprise/jobs/${id}`);
  redirect(`/dashboard/enterprise/jobs/${id}`);
}

// —— 考勤：企业确认出勤 / 标缺勤 / 补登（确认出勤=自动结算依据）——
async function ownedAttendanceJob(s: { enterpriseId?: string }, jobId: number): Promise<boolean> {
  const job = getJob(jobId);
  return !!(job && job.enterpriseId === s.enterpriseId);
}

export async function confirmAttendanceAction(fd: FormData) {
  const s = await requireEnterprise();
  const id = Number(fd.get("id") || 0);
  const att = getAttendance(id);
  if (!att || !(await ownedAttendanceJob(s, att.jobId))) throw new Error("无权操作该考勤");
  confirmAttendance(id, s.name || "企业");
  // 日结：确认出勤即自动结算当日工资（从托管池划付）
  const job = getJob(att.jobId);
  if (job?.settleMode === "daily") settleApplication(att.applicationId);
  const to = `/dashboard/enterprise/jobs/${att.jobId}`;
  revalidatePath(to);
  redirect(to);
}

// 企业「立即结算」：把该工人已确认未结的出勤一次性结算（周结兜底 / 手动）
export async function settleNowAction(fd: FormData) {
  const s = await requireEnterprise();
  const appId = Number(fd.get("applicationId") || 0);
  const app = getApplication(appId);
  if (!app || app.enterpriseId !== s.enterpriseId) throw new Error("无权操作该投递");
  settleApplication(appId);
  const to = `/dashboard/enterprise/jobs/${app.jobId}`;
  revalidatePath(to);
  redirect(to);
}

export async function rejectAttendanceAction(fd: FormData) {
  const s = await requireEnterprise();
  const id = Number(fd.get("id") || 0);
  const att = getAttendance(id);
  if (!att || !(await ownedAttendanceJob(s, att.jobId))) throw new Error("无权操作该考勤");
  rejectAttendance(id);
  const to = `/dashboard/enterprise/jobs/${att.jobId}`;
  revalidatePath(to);
  redirect(to);
}

// 企业补登某天出勤（工人没打卡但实际出勤）
export async function addAttendanceDayAction(fd: FormData) {
  const s = await requireEnterprise();
  const appId = Number(fd.get("applicationId") || 0);
  const date = String(fd.get("date") || "").trim();
  const app = getApplication(appId);
  if (!app || app.enterpriseId !== s.enterpriseId) throw new Error("无权操作该投递");
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    enterpriseAddDay({ applicationId: appId, jobId: app.jobId, phone: app.phone, date, by: s.name || "企业" });
  }
  const to = `/dashboard/enterprise/jobs/${app.jobId}`;
  revalidatePath(to);
  redirect(to);
}

export async function reviewApplicantAction(fd: FormData) {
  const s = await requireEnterprise();
  const id = Number(fd.get("id") || 0);
  const status = String(fd.get("status") || "") as AppStatus;
  const app = getApplication(id);
  if (!app || app.enterpriseId !== s.enterpriseId) throw new Error("无权操作该投递");
  const back = `/dashboard/enterprise/jobs/${app.jobId}`;
  // 前向流转校验：不在白名单（如已完工后再改、录用后直接点不合适越级）一律拦截，保证闭环
  if (!ALLOWED_APP_FLOW[app.status]?.includes(status)) redirect(`${back}?aerr=flow`);
  // 录用占名额：招满则拦截（提醒先结束招聘或取消他人录用）
  if (status === "accepted") {
    const job = getJob(app.jobId);
    if (job && countHired(app.jobId) >= job.openings) redirect(`${back}?aerr=full`);
  }
  setApplicationStatus(id, status);
  // 完工 → 自动结算全部确认出勤（完工结生效；日/周结兜底尾款）
  if (status === "done") settleApplication(id);
  revalidatePath(back);
  redirect(`${back}?aok=${status}`);
}
