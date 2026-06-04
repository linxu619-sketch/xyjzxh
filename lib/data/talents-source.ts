import "server-only";
import { getDb } from "@/lib/db/sqlite";
import { JOBS, CERTIFICATES, type Job } from "@/lib/data/talents";

/* ============================================================
   人才中心数据源：本地 SQLite（失败回退静态）。静态 JOBS/CERTIFICATES 仅作种子源。
   ============================================================ */

type JRow = {
  id: string; title: string | null; enterprise: string | null; enterprise_id: string | null; category: string | null;
  type: string | null; salary_min: number | null; salary_max: number | null; district: string | null;
  experience: string | null; education: string | null; tags: string | null; hot: number | null; posted_at: string | null;
};

function jobRow(r: JRow): Job {
  let tags: string[] = [];
  try { const v = JSON.parse(r.tags ?? "[]"); if (Array.isArray(v)) tags = v.map(String); } catch { tags = []; }
  return {
    id: r.id, title: r.title ?? "", enterprise: r.enterprise ?? "", enterpriseId: r.enterprise_id ?? "",
    category: (r.category as Job["category"]) ?? "build", type: (r.type as Job["type"]) ?? "全职",
    salaryMin: r.salary_min ?? 0, salaryMax: r.salary_max ?? 0, district: r.district ?? "",
    experience: r.experience ?? "", education: r.education ?? "", tags, hot: !!r.hot, postedAt: r.posted_at ?? "",
  };
}

export function listRecruitmentJobs(): Job[] {
  try {
    const rows = getDb().prepare("SELECT * FROM recruitment_jobs ORDER BY posted_at DESC").all() as JRow[];
    return rows.length ? rows.map(jobRow) : JOBS;
  } catch { return JOBS; }
}

export function getRecruitmentJob(id: string): Job | undefined {
  try {
    const r = getDb().prepare("SELECT * FROM recruitment_jobs WHERE id = ?").get(id) as JRow | undefined;
    return r ? jobRow(r) : JOBS.find((j) => j.id === id);
  } catch { return JOBS.find((j) => j.id === id); }
}

export type Certificate = { code: string; name: string; holder: string; enterprise: string; issued: string };
export function listCertificates(): Certificate[] {
  try {
    const rows = getDb().prepare("SELECT code,name,holder,enterprise,issued FROM member_certificates ORDER BY created_at DESC").all() as Certificate[];
    return rows.length ? rows : CERTIFICATES;
  } catch { return CERTIFICATES; }
}
