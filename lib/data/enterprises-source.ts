import "server-only";
import { ENTERPRISES, type Enterprise } from "./enterprises";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   企业数据源：本地 SQLite（失败回退 mock，保证 UI 不崩）
   ============================================================ */

type Row = {
  id: string;
  slug: string;
  name: string;
  category: string;
  district: string | null;
  founded: number | null;
  staff_size: string | null;
  qualification: string | null; // JSON
  tags: string | null;          // JSON
  short: string | null;
  hero: string | null;          // JSON
  contact: string | null;       // JSON
  rating: number | null;
  reviews: number | null;
  cases: number | null;
  verified: number | null;      // 0/1
  featured: number | null;      // 0/1
};

function parseJson<T>(s: string | null, fallback: T): T {
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

function rowToEnterprise(r: Row): Enterprise {
  const hero = parseJson<{ brand?: string; tagline?: string }>(r.hero, {});
  const contact = parseJson<{ tel?: string; addr?: string }>(r.contact, {});
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category as Enterprise["category"],
    district: r.district ?? "",
    rating: Number(r.rating ?? 0),
    reviews: r.reviews ?? 0,
    cases: r.cases ?? 0,
    founded: r.founded ?? 0,
    staff: r.staff_size ?? "—",
    qualification: parseJson<string[]>(r.qualification, []),
    tags: parseJson<string[]>(r.tags, []),
    short: r.short ?? "",
    hero: { brand: hero.brand ?? r.name, tagline: hero.tagline ?? "" },
    contact: { tel: contact.tel ?? "", addr: contact.addr ?? "" },
    verified: !!r.verified,
    featured: !!r.featured,
    color: r.category as "build" | "decor" | "design",
  };
}

let lastSource: "sqlite" | "mock" = "mock";

export function lastDataSource() {
  return lastSource;
}

export async function getEnterprises(): Promise<Enterprise[]> {
  try {
    const rows = getDb()
      .prepare("SELECT * FROM enterprises WHERE status = 'active'")
      .all() as Row[];
    lastSource = "sqlite";
    return rows.map(rowToEnterprise);
  } catch {
    lastSource = "mock";
    return ENTERPRISES;
  }
}

export async function getEnterpriseBySlugOrId(key: string): Promise<Enterprise | undefined> {
  try {
    const row = getDb()
      .prepare("SELECT * FROM enterprises WHERE slug = ? OR id = ? LIMIT 1")
      .get(key, key) as Row | undefined;
    lastSource = "sqlite";
    return row ? rowToEnterprise(row) : undefined;
  } catch {
    lastSource = "mock";
    return ENTERPRISES.find((e) => e.slug === key || e.id === key);
  }
}
