import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   新闻 / 公告（协会后台发布 → 门户与 /news 展示）
   ============================================================ */

export type NewsStatus = "published" | "draft";

export type News = {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  color: string;
  hot: boolean;
  views: number;
  status: NewsStatus;
  createdAt: number;
};

type Row = {
  id: number; category: string | null; title: string | null; excerpt: string | null; content: string | null;
  author: string | null; color: string | null; hot: number | null; views: number | null; status: string; created_at: number | null;
};

function rowTo(r: Row): News {
  return {
    id: r.id, category: r.category ?? "协会公告", title: r.title ?? "", excerpt: r.excerpt ?? "",
    content: r.content ?? "", author: r.author ?? "协会秘书处", color: r.color ?? "build",
    hot: !!r.hot, views: r.views ?? 0, status: (r.status as NewsStatus) ?? "published", createdAt: r.created_at ?? 0,
  };
}

export function listNews(status?: NewsStatus): News[] {
  const db = getDb();
  const rows = (status
    ? db.prepare("SELECT * FROM news WHERE status = ? ORDER BY created_at DESC").all(status)
    : db.prepare("SELECT * FROM news ORDER BY created_at DESC").all()) as Row[];
  return rows.map(rowTo);
}

export function listPublished(category?: string): News[] {
  const db = getDb();
  const rows = (category && category !== "全部"
    ? db.prepare("SELECT * FROM news WHERE status='published' AND category = ? ORDER BY created_at DESC").all(category)
    : db.prepare("SELECT * FROM news WHERE status='published' ORDER BY created_at DESC").all()) as Row[];
  return rows.map(rowTo);
}

export function getNews(id: number): News | undefined {
  const row = getDb().prepare("SELECT * FROM news WHERE id = ?").get(id) as Row | undefined;
  return row ? rowTo(row) : undefined;
}

const CAT_COLOR: Record<string, string> = {
  "党建": "party", "理论学习": "party", "协会公告": "build", "政策解读": "decor", "行业新闻": "design", "会员动态": "tea", "活动通知": "brand",
};

export function createNews(input: {
  category: string; title: string; excerpt: string; content: string; author?: string; hot?: boolean; status?: NewsStatus;
}): number {
  const info = getDb().prepare(
    "INSERT INTO news (category,title,excerpt,content,author,color,hot,views,status,created_at) VALUES (?,?,?,?,?,?,?,0,?,?)",
  ).run(
    input.category, input.title, input.excerpt, input.content, input.author ?? "协会秘书处",
    CAT_COLOR[input.category] ?? "build", input.hot ? 1 : 0, input.status ?? "published", Date.now(),
  );
  return Number(info.lastInsertRowid);
}

export function setNewsStatus(id: number, status: NewsStatus) {
  getDb().prepare("UPDATE news SET status = ? WHERE id = ?").run(status, id);
}

export function deleteNews(id: number) {
  getDb().prepare("DELETE FROM news WHERE id = ?").run(id);
}

export function incrementViews(id: number) {
  try { getDb().prepare("UPDATE news SET views = views + 1 WHERE id = ?").run(id); } catch { /* ignore */ }
}
