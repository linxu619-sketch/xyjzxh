import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   招聘：企业发岗(jobs) + 从业者投递(job_applications)
   ============================================================ */

export type JobStatus = "open" | "closed";
export type AppStatus = "pending" | "accepted" | "rejected";

export type JobType = "gig" | "hire";

export type Job = {
  id: number;
  enterpriseId: string;
  enterpriseName: string;
  type: JobType;           // gig=发活(日薪) | hire=招聘(月薪)
  title: string;
  kind: string;
  district: string;
  edu: string;             // 学历要求（招聘用，""=不限）
  insurance: string;       // 零工工伤保障 company=企业承保 / self=工人自理 / ""=未设
  benefits: string[];      // 招聘福利（五险一金/包住…）
  daily: number;           // 薪资下限（gig=日薪 / hire=月薪）
  dailyMax: number | null;  // 日薪上限（null=同下限，单值）
  openings: number;
  duration: string;
  urgent: boolean;
  detail: string;
  minAge: number | null;   // 年龄要求下限（null=不限）
  maxAge: number | null;   // 年龄要求上限（null=不限）
  minYears: number;        // 最低从业年限（0=不限）
  genderReq: string;       // 性别要求 男/女（""=不限）
  needCert: boolean;       // 是否需持证上岗
  status: JobStatus;
  createdAt: number;
};

export type JobApplication = {
  id: number;
  jobId: number;
  enterpriseId: string;
  practitionerPhone: string;
  name: string;
  phone: string;
  note: string;
  status: AppStatus;
  createdAt: number;
};

type JobRow = {
  id: number; enterprise_id: string | null; enterprise_name: string | null; type: string | null; title: string | null;
  kind: string | null; district: string | null; edu: string | null; insurance: string | null; benefits: string | null; daily: number | null; daily_max: number | null; openings: number | null;
  duration: string | null; urgent: number | null; detail: string | null;
  min_age: number | null; max_age: number | null; min_years: number | null;
  gender_req: string | null; need_cert: number | null;
  status: string; created_at: number | null;
};
type AppRow = {
  id: number; job_id: number; enterprise_id: string | null; practitioner_phone: string | null;
  name: string | null; phone: string | null; note: string | null; status: string; created_at: number | null;
};

function parseBenefits(raw: string | null): string[] {
  if (!raw) return [];
  try { const v = JSON.parse(raw); return Array.isArray(v) ? v.map(String).filter(Boolean) : []; } catch { return []; }
}

function toJob(r: JobRow): Job {
  return {
    id: r.id, enterpriseId: r.enterprise_id ?? "", enterpriseName: r.enterprise_name ?? "", type: (r.type as JobType) ?? "gig", title: r.title ?? "",
    kind: r.kind ?? "", district: r.district ?? "", edu: r.edu ?? "", insurance: r.insurance ?? "", benefits: parseBenefits(r.benefits), daily: r.daily ?? 0, dailyMax: r.daily_max ?? null, openings: r.openings ?? 1,
    duration: r.duration ?? "", urgent: !!r.urgent, detail: r.detail ?? "",
    minAge: r.min_age ?? null, maxAge: r.max_age ?? null, minYears: r.min_years ?? 0,
    genderReq: r.gender_req ?? "", needCert: !!r.need_cert,
    status: (r.status as JobStatus) ?? "open",
    createdAt: r.created_at ?? 0,
  };
}
function toApp(r: AppRow): JobApplication {
  return {
    id: r.id, jobId: r.job_id, enterpriseId: r.enterprise_id ?? "", practitionerPhone: r.practitioner_phone ?? "",
    name: r.name ?? "", phone: r.phone ?? "", note: r.note ?? "", status: (r.status as AppStatus) ?? "pending",
    createdAt: r.created_at ?? 0,
  };
}

/* ---------------- 岗位 ---------------- */

// 发活/零工（日薪）—— 默认 listOpenJobs 即零工，保持既有调用语义
export function listOpenJobs(): Job[] {
  const rows = getDb().prepare("SELECT * FROM jobs WHERE status = 'open' AND type = 'gig' ORDER BY urgent DESC, created_at DESC").all() as JobRow[];
  return rows.map(toJob);
}

// 招聘岗位（月薪）
export function listOpenHires(): Job[] {
  const rows = getDb().prepare("SELECT * FROM jobs WHERE status = 'open' AND type = 'hire' ORDER BY urgent DESC, created_at DESC").all() as JobRow[];
  return rows.map(toJob);
}

// 某企业某类型的发布（type 省略=全部）
export function listJobsByEnterprise(eid: string, type?: JobType): Job[] {
  const rows = type
    ? getDb().prepare("SELECT * FROM jobs WHERE enterprise_id = ? AND type = ? ORDER BY created_at DESC").all(eid, type) as JobRow[]
    : getDb().prepare("SELECT * FROM jobs WHERE enterprise_id = ? ORDER BY created_at DESC").all(eid) as JobRow[];
  return rows.map(toJob);
}

export function getJob(id: number): Job | undefined {
  const row = getDb().prepare("SELECT * FROM jobs WHERE id = ?").get(id) as JobRow | undefined;
  return row ? toJob(row) : undefined;
}

export function createJob(input: {
  enterpriseId: string; enterpriseName: string; title: string; kind: string; type?: JobType; edu?: string;
  insurance?: string; benefits?: string[];
  district?: string; daily?: number; dailyMax?: number | null; openings?: number; duration?: string; urgent?: boolean; detail?: string;
  minAge?: number | null; maxAge?: number | null; minYears?: number; genderReq?: string; needCert?: boolean;
}): number {
  const info = getDb().prepare(
    `INSERT INTO jobs (enterprise_id,enterprise_name,type,title,kind,district,edu,insurance,benefits,daily,daily_max,openings,duration,urgent,detail,min_age,max_age,min_years,gender_req,need_cert,status,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'open', ?)`,
  ).run(
    input.enterpriseId, input.enterpriseName, input.type ?? "gig", input.title, input.kind,
    input.district ?? "", input.edu ?? "", input.insurance ?? "", JSON.stringify(input.benefits ?? []),
    input.daily ?? 0, input.dailyMax ?? null, input.openings ?? 1, input.duration ?? "",
    input.urgent ? 1 : 0, input.detail ?? "",
    input.minAge ?? null, input.maxAge ?? null, input.minYears ?? 0,
    input.genderReq ?? "", input.needCert ? 1 : 0,
    Date.now(),
  );
  return Number(info.lastInsertRowid);
}

export function setJobStatus(id: number, status: JobStatus) {
  getDb().prepare("UPDATE jobs SET status = ? WHERE id = ?").run(status, id);
}

/* ---------------- 投递 ---------------- */

export function listApplicationsByJob(jobId: number): JobApplication[] {
  const rows = getDb().prepare("SELECT * FROM job_applications WHERE job_id = ? ORDER BY created_at DESC").all(jobId) as AppRow[];
  return rows.map(toApp);
}

export function listApplicationsByPractitioner(phone: string): JobApplication[] {
  const rows = getDb().prepare("SELECT * FROM job_applications WHERE practitioner_phone = ? ORDER BY created_at DESC").all(phone) as AppRow[];
  return rows.map(toApp);
}

export function countApplicants(jobId: number): number {
  return (getDb().prepare("SELECT COUNT(*) AS c FROM job_applications WHERE job_id = ?").get(jobId) as { c: number }).c;
}

export function hasApplied(jobId: number, phone: string): boolean {
  if (!phone) return false;
  return !!getDb().prepare("SELECT 1 FROM job_applications WHERE job_id = ? AND practitioner_phone = ?").get(jobId, phone);
}

export function getApplication(id: number): JobApplication | undefined {
  const row = getDb().prepare("SELECT * FROM job_applications WHERE id = ?").get(id) as AppRow | undefined;
  return row ? toApp(row) : undefined;
}

export function applyToJob(input: { jobId: number; enterpriseId: string; phone: string; name: string; note?: string }): number {
  const info = getDb().prepare(
    "INSERT INTO job_applications (job_id,enterprise_id,practitioner_phone,name,phone,note,status,created_at) VALUES (?,?,?,?,?,?, 'pending', ?)",
  ).run(input.jobId, input.enterpriseId, input.phone, input.name, input.phone, input.note ?? "", Date.now());
  return Number(info.lastInsertRowid);
}

export function setApplicationStatus(id: number, status: AppStatus) {
  getDb().prepare("UPDATE job_applications SET status = ? WHERE id = ?").run(status, id);
}
