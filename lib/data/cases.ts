import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   企业案例（企业自助上传，展示在其协会子站案例区）
   ============================================================ */

export type EnterpriseCase = {
  id: number;
  enterpriseId: string;
  title: string;
  cover: string;
  area: string;
  tag: string;
  detail: string;
  images: string[];   // 图集(1-10)，首图即 cover
  createdAt: number;
};

type Row = {
  id: number;
  enterprise_id: string | null;
  title: string | null;
  cover: string | null;
  area: string | null;
  tag: string | null;
  detail: string | null;
  images: string | null;
  created_at: number | null;
};

function parseImgs(s: string | null, cover: string): string[] {
  if (s && s.trim().startsWith("[")) {
    try {
      const arr = JSON.parse(s) as unknown[];
      if (Array.isArray(arr)) {
        const list = arr.filter((x): x is string => typeof x === "string" && !!x).slice(0, 10);
        if (list.length) return list;
      }
    } catch { /* ignore */ }
  }
  return cover ? [cover] : [];
}

function rowTo(r: Row): EnterpriseCase {
  const cover = r.cover ?? "";
  const images = parseImgs(r.images, cover);
  return {
    id: r.id,
    enterpriseId: r.enterprise_id ?? "",
    title: r.title ?? "",
    cover: cover || images[0] || "",
    area: r.area ?? "",
    tag: r.tag ?? "",
    detail: r.detail ?? "",
    images,
    createdAt: r.created_at ?? 0,
  };
}

export function listCasesByEnterprise(enterpriseId: string): EnterpriseCase[] {
  const rows = getDb()
    .prepare("SELECT * FROM enterprise_cases WHERE enterprise_id = ? ORDER BY created_at DESC")
    .all(enterpriseId) as Row[];
  return rows.map(rowTo);
}

// 跨企业案例画廊（消费者灵感流用）：带企业名称与子站 slug，便于「看中直接约这家」
export type GalleryCase = EnterpriseCase & { enterpriseName: string; enterpriseSlug: string };

export function listGalleryCases(opts?: { tag?: string; limit?: number }): GalleryCase[] {
  const limit = opts?.limit ?? 60;
  const base =
    "SELECT c.*, e.name AS e_name, e.slug AS e_slug FROM enterprise_cases c " +
    "LEFT JOIN enterprises e ON e.id = c.enterprise_id ";
  const sql = (opts?.tag ? base + "WHERE c.tag = ? " : base) + "ORDER BY c.created_at DESC LIMIT ?";
  const stmt = getDb().prepare(sql);
  const rows = (opts?.tag ? stmt.all(opts.tag, limit) : stmt.all(limit)) as (Row & { e_name: string | null; e_slug: string | null })[];
  return rows.map((r) => ({ ...rowTo(r), enterpriseName: r.e_name ?? "", enterpriseSlug: r.e_slug ?? "" }));
}

export function listCaseTags(): { tag: string; count: number }[] {
  const rows = getDb()
    .prepare("SELECT tag, COUNT(*) c FROM enterprise_cases WHERE tag IS NOT NULL AND tag != '' GROUP BY tag ORDER BY c DESC")
    .all() as { tag: string; c: number }[];
  return rows.map((r) => ({ tag: r.tag, count: r.c }));
}

export function countCases(): number {
  return (getDb().prepare("SELECT COUNT(*) c FROM enterprise_cases").get() as { c: number }).c;
}

export function createCase(input: {
  enterpriseId: string;
  title: string;
  cover: string;
  area?: string;
  tag?: string;
  detail?: string;
  images?: string[];
}): number {
  const imgs = (input.images ?? []).filter(Boolean).slice(0, 10);
  const cover = input.cover || imgs[0] || "";
  const info = getDb()
    .prepare("INSERT INTO enterprise_cases (enterprise_id,title,cover,area,tag,detail,images,created_at) VALUES (?,?,?,?,?,?,?,?)")
    .run(input.enterpriseId, input.title, cover, input.area ?? "", input.tag ?? "", input.detail ?? "", imgs.length ? JSON.stringify(imgs) : "", Date.now());
  return Number(info.lastInsertRowid);
}

export function getCase(id: number): EnterpriseCase | undefined {
  const row = getDb().prepare("SELECT * FROM enterprise_cases WHERE id = ?").get(id) as Row | undefined;
  return row ? rowTo(row) : undefined;
}

export function deleteCase(id: number) {
  getDb().prepare("DELETE FROM enterprise_cases WHERE id = ?").run(id);
}
