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
  theme: string | null;         // 子站主题色
};

const THEME_KEYS = ["build", "decor", "design", "tea", "brand"] as const;
type ThemeKey = (typeof THEME_KEYS)[number];
function resolveColor(theme: string | null, category: string): ThemeKey {
  if (theme && (THEME_KEYS as readonly string[]).includes(theme)) return theme as ThemeKey;
  return (["build", "decor", "design"].includes(category) ? category : "build") as ThemeKey;
}

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
    color: resolveColor(r.theme, r.category),
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

// 审核通过：把企业入会申请写入 enterprises 表（成为正式会员，出现在 /members）
const ENT_TYPE_TO_CAT: Record<string, "build" | "decor" | "design"> = {
  "建筑施工": "build",
  "装饰装修": "decor",
  "设计公司": "design",
};

export function createEnterpriseFromApplication(app: {
  id: number;
  applicant: string;
  phone: string;
  payload: Record<string, unknown>;
}): void {
  const db = getDb();
  const id = `app-${app.id}`;
  if (db.prepare("SELECT 1 FROM enterprises WHERE id = ?").get(id)) return; // 防重复

  const p = app.payload as Record<string, string>;
  const category = ENT_TYPE_TO_CAT[p.entType ?? ""] ?? "build";
  const base = (p.subdomain || `member-${app.id}`).toLowerCase().replace(/[^a-z0-9-]/g, "") || `member-${app.id}`;
  const slug = db.prepare("SELECT 1 FROM enterprises WHERE slug = ?").get(base) ? `${base}-${app.id}` : base;

  db.prepare(
    `INSERT INTO enterprises
      (id,slug,name,category,district,founded,staff_size,qualification,tags,short,hero,contact,rating,reviews,cases,verified,featured,status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'active')`,
  ).run(
    id, slug, app.applicant, category, p.region ?? "", null, "—",
    JSON.stringify([]), JSON.stringify([]), "协会新入会会员企业",
    JSON.stringify({ brand: app.applicant, tagline: "" }),
    JSON.stringify({ tel: app.phone ?? "", addr: p.region ?? "" }),
    0, 0, 0, 1, 0,
  );
}

// 企业自助编辑子站资料 → 写回 enterprises 表（子站随即生效）
export function updateEnterpriseProfile(id: string, f: {
  name: string; brand: string; tagline: string; short: string; tel: string; addr: string; tags: string[]; theme?: string;
}): boolean {
  const db = getDb();
  if (!db.prepare("SELECT 1 FROM enterprises WHERE id = ?").get(id)) return false;
  const theme = f.theme && (THEME_KEYS as readonly string[]).includes(f.theme) ? f.theme : null;
  db.prepare(
    "UPDATE enterprises SET name = ?, short = ?, hero = ?, contact = ?, tags = ?, theme = ? WHERE id = ?",
  ).run(
    f.name,
    f.short,
    JSON.stringify({ brand: f.brand, tagline: f.tagline }),
    JSON.stringify({ tel: f.tel, addr: f.addr }),
    JSON.stringify(f.tags),
    theme,
    id,
  );
  return true;
}

export async function getEnterpriseBySlugOrId(key: string): Promise<Enterprise | undefined> {
  try {
    const row = getDb()
      .prepare("SELECT * FROM enterprises WHERE slug = ? OR id = ? LIMIT 1")
      .get(key, key) as Row | undefined;
    lastSource = "sqlite";
    if (row) return rowToEnterprise(row);
  } catch {
    lastSource = "mock";
  }
  // DB 无此企业（如 mock 的 e001~e012）→ 回退 mock
  return ENTERPRISES.find((e) => e.slug === key || e.id === key);
}

// 按联系电话匹配正式会员企业（用于企业登录绑定到本企业工作台）
export function findEnterpriseByContactPhone(phone: string): { id: string; name: string } | undefined {
  const clean = phone.trim();
  if (!clean) return undefined;
  try {
    const rows = getDb()
      .prepare("SELECT id, name, contact FROM enterprises WHERE status = 'active'")
      .all() as { id: string; name: string; contact: string | null }[];
    for (const r of rows) {
      const tel = (parseJson<{ tel?: string }>(r.contact, {}).tel ?? "").trim();
      if (tel === clean) return { id: r.id, name: r.name };
    }
  } catch { /* DB 不可用，忽略 */ }
  return undefined;
}
