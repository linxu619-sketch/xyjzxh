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

type Row = {
  id: number; name: string | null; kind: string | null; years: number | null;
  rating: number | null; jobs: number | null; city: string | null; insured: number | null;
};

export function listPractitioners(): PractitionerCard[] {
  try {
    const rows = getDb()
      .prepare("SELECT * FROM practitioners ORDER BY created_at DESC")
      .all() as Row[];
    return rows.map((r) => ({
      id: `p-${r.id}`,
      name: r.name ?? "",
      kind: r.kind ?? "个人会员",
      years: r.years ?? 0,
      rating: Number(r.rating ?? 5),
      jobs: r.jobs ?? 0,
      city: r.city ?? "信阳",
      insured: !!r.insured,
    }));
  } catch {
    return [];
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
