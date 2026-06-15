"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { createJob, getJob, setJobStatus, getApplication, setApplicationStatus, countHired, type AppStatus, type JobStatus } from "@/lib/data/jobs";

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
  createJob({
    enterpriseId: s.enterpriseId!,
    enterpriseName: ent?.hero.brand ?? ent?.name ?? "本企业",
    title,
    kind,
    district: String(fd.get("district") || "").trim(),
    daily: Number(fd.get("daily") || 0) || 0,
    dailyMax: posInt("dailyMax"),
    openings: Number(fd.get("openings") || 1) || 1,
    duration: String(fd.get("duration") || "").trim(),
    startDate: String(fd.get("startDate") || "").trim(),
    settleMode: (() => { const m = String(fd.get("settleMode") || ""); return m === "daily" || m === "weekly" || m === "on_complete" ? m : "on_complete"; })(),
    urgent: fd.get("urgent") === "on",
    detail: String(fd.get("detail") || "").trim(),
    insurance: fd.get("insurance") === "self" ? "self" : "company",
    minAge: posInt("minAge"),
    maxAge: posInt("maxAge"),
    minYears: posInt("minYears") ?? 0,
    genderReq: (() => { const g = String(fd.get("genderReq") || "").trim(); return g === "男" || g === "女" ? g : ""; })(),
    needCert: fd.get("needCert") === "on",
  });
  revalidatePath("/dashboard/enterprise/jobs");
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
  revalidatePath("/dashboard/enterprise/jobs");
  revalidatePath(`/dashboard/enterprise/jobs/${id}`);
  redirect(`/dashboard/enterprise/jobs/${id}`);
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
  revalidatePath(back);
  redirect(`${back}?aok=${status}`);
}
