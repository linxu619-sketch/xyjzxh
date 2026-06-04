import "server-only";
import { getDb } from "@/lib/db/sqlite";
import { PRACTITIONER_JOBS, WORKER_INSURANCE } from "@/lib/data/practitioners";

// 与 /practitioners 列表卡片所需字段对齐
export type PractitionerCard = {
  id: string;
  name: string;
  kind: string;
  years: number;
  rating: number;
  jobs: number;
  city: string;
  insured: boolean;
};

// 完整从业者记录（含手机号，用于登录绑定 / 工作台）
export type Practitioner = PractitionerCard & { phone: string };

type Row = {
  id: number; name: string | null; kind: string | null; years: number | null;
  rating: number | null; jobs: number | null; city: string | null; insured: number | null;
  phone: string | null;
};

function rowTo(r: Row): Practitioner {
  return {
    id: `p-${r.id}`,
    name: r.name ?? "",
    kind: r.kind ?? "个人会员",
    years: r.years ?? 0,
    rating: Number(r.rating ?? 5),
    jobs: r.jobs ?? 0,
    city: r.city ?? "信阳",
    insured: !!r.insured,
    phone: r.phone ?? "",
  };
}

export function listPractitioners(): PractitionerCard[] {
  try {
    const rows = getDb()
      .prepare("SELECT * FROM practitioners ORDER BY created_at DESC")
      .all() as Row[];
    return rows.map(rowTo);
  } catch {
    return [];
  }
}

// 从业者门户「实时找活」零工 feed（读库，失败回退静态）
export type PractitionerJob = { id: string; title: string; enterprise: string; area: string; duration: string; daily: string; openings: number; district: string; urgent: boolean; postedAt: string };
export function listPractitionerJobs(): PractitionerJob[] {
  try {
    const rows = getDb().prepare("SELECT * FROM practitioner_jobs ORDER BY created_at DESC").all() as Array<Record<string, unknown>>;
    if (rows.length) return rows.map((r) => ({ id: String(r.id), title: String(r.title ?? ""), enterprise: String(r.enterprise ?? ""), area: String(r.area ?? ""), duration: String(r.duration ?? ""), daily: String(r.daily ?? ""), openings: Number(r.openings ?? 0), district: String(r.district ?? ""), urgent: !!r.urgent, postedAt: String(r.posted_at ?? "") }));
  } catch { /* fall through */ }
  return PRACTITIONER_JOBS as PractitionerJob[];
}

// 从业者工伤 / 个人保险产品（读库，失败回退静态）
export type WorkerInsuranceItem = { id: string; name: string; insurer: string; priceDaily: number; priceMonthly: number; priceYearly: number; cover: string; badges: string[] };
export function listWorkerInsurance(): WorkerInsuranceItem[] {
  try {
    const rows = getDb().prepare("SELECT * FROM worker_insurance ORDER BY created_at ASC").all() as Array<Record<string, unknown>>;
    if (rows.length) return rows.map((r) => { let badges: string[] = []; try { const v = JSON.parse(String(r.badges ?? "[]")); if (Array.isArray(v)) badges = v.map(String); } catch { /**/ } return { id: String(r.id), name: String(r.name ?? ""), insurer: String(r.insurer ?? ""), priceDaily: Number(r.price_daily ?? 0), priceMonthly: Number(r.price_monthly ?? 0), priceYearly: Number(r.price_yearly ?? 0), cover: String(r.cover ?? ""), badges }; });
  } catch { /* fall through */ }
  return WORKER_INSURANCE as WorkerInsuranceItem[];
}

// 按手机号匹配真实从业者（用于个人会员登录绑定到本人工作台）
export function getPractitionerByPhone(phone: string): Practitioner | undefined {
  const clean = phone.trim();
  if (!clean) return undefined;
  try {
    const row = getDb().prepare("SELECT * FROM practitioners WHERE phone = ? LIMIT 1").get(clean) as Row | undefined;
    return row ? rowTo(row) : undefined;
  } catch {
    return undefined;
  }
}

export function getPractitionerById(id: string): Practitioner | undefined {
  const num = Number(id.replace(/^p-/, ""));
  if (!num) return undefined;
  try {
    const row = getDb().prepare("SELECT * FROM practitioners WHERE id = ?").get(num) as Row | undefined;
    return row ? rowTo(row) : undefined;
  } catch {
    return undefined;
  }
}

// 按入会申请 id 取从业者引用（p-<id>），用于审核通过后绑定账号
export function getPractitionerRefByAppId(appId: number): string | undefined {
  try {
    const row = getDb().prepare("SELECT id FROM practitioners WHERE app_id = ?").get(appId) as { id: number } | undefined;
    return row ? `p-${row.id}` : undefined;
  } catch {
    return undefined;
  }
}

// 个人会员入会申请通过 → 写入从业者名录
export function createPractitionerFromApplication(app: {
  id: number;
  applicant: string;
  phone: string;
  payload: Record<string, unknown>;
}): void {
  const db = getDb();
  if (db.prepare("SELECT 1 FROM practitioners WHERE app_id = ?").get(app.id)) return; // 防重复
  const p = app.payload as Record<string, string>;
  db.prepare(
    "INSERT INTO practitioners (app_id, name, kind, years, rating, jobs, city, insured, phone, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
  ).run(
    app.id, app.applicant, p.profession || "个人会员", Number(p.years) || 0,
    5.0, 0, "信阳", 0, app.phone || "", Date.now(),
  );
}
