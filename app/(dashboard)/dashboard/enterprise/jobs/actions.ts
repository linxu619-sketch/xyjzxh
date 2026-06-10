"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { createJob, getJob, setJobStatus, getApplication, setApplicationStatus, type AppStatus, type JobStatus } from "@/lib/data/jobs";

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
  if (status === "accepted" || status === "rejected" || status === "pending") setApplicationStatus(id, status);
  revalidatePath(`/dashboard/enterprise/jobs/${app.jobId}`);
  redirect(`/dashboard/enterprise/jobs/${app.jobId}`);
}
