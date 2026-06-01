import "server-only";
import { getDb } from "@/lib/db/sqlite";

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
