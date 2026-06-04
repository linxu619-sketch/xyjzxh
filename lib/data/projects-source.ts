import "server-only";
import { getDb } from "@/lib/db/sqlite";
import { PROJECTS, type ProjectReport, type ProjectStatus } from "@/lib/data/projects";

/* ============================================================
   消费者门户「工装报备」公开展示项目 —— 本地 SQLite（失败回退静态，保证 UI 不崩）
   静态 PROJECTS 仅作种子源；页面统一读这里。
   ============================================================ */

type Row = {
  id: string; name: string | null; type: string | null; enterprise: string | null; enterprise_id: string | null;
  area: number | null; budget: number | null; district: string | null; start_date: string | null; end_date: string | null;
  status: string | null; progress: number | null; insured: number | null; reported_at: string | null;
};

function rowTo(r: Row): ProjectReport {
  return {
    id: r.id, name: r.name ?? "", type: (r.type as ProjectReport["type"]) ?? "家装",
    enterprise: r.enterprise ?? "", enterpriseId: r.enterprise_id ?? "",
    area: r.area ?? 0, budget: r.budget ?? 0, district: r.district ?? "",
    startDate: r.start_date ?? "", endDate: r.end_date ?? "",
    status: (r.status as ProjectStatus) ?? "submitted", progress: r.progress ?? 0,
    insured: !!r.insured, reportedAt: r.reported_at ?? "",
  };
}

export function listShowcaseProjects(): ProjectReport[] {
  try {
    const rows = getDb().prepare("SELECT * FROM showcase_projects ORDER BY reported_at DESC").all() as Row[];
    return rows.length ? rows.map(rowTo) : PROJECTS;
  } catch {
    return PROJECTS;
  }
}

export function getShowcaseProject(id: string): ProjectReport | undefined {
  try {
    const r = getDb().prepare("SELECT * FROM showcase_projects WHERE id = ?").get(id) as Row | undefined;
    return r ? rowTo(r) : PROJECTS.find((p) => p.id === id);
  } catch {
    return PROJECTS.find((p) => p.id === id);
  }
}
