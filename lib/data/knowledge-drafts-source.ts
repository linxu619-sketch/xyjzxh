import "server-only";
import { getDb } from "@/lib/db/sqlite";
import type { KnowledgeSection } from "@/lib/data/knowledge";

/* 知识库 AI 草稿数据源：本地 SQLite。 */

export type DraftStatus = "pending" | "approved" | "rejected";

export type KnowledgeDraft = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  excerpt: string;
  content: KnowledgeSection[];
  body?: string;
  sourceName: string;
  sourceUrl: string;
  status: DraftStatus;
  reviewedBy?: string;
  reviewedAt?: number;
  articleId?: string;
  createdAt: number;
};

type Row = {
  id: string; title: string | null; category: string | null; tags: string | null; excerpt: string | null;
  content: string | null; body: string | null; source_name: string | null; source_url: string | null; status: string | null;
  reviewed_by: string | null; reviewed_at: number | null; article_id: string | null; created_at: number | null;
};

function rowTo(r: Row): KnowledgeDraft {
  let tags: string[] = []; let content: KnowledgeSection[] = [];
  try { const v = JSON.parse(r.tags ?? "[]"); if (Array.isArray(v)) tags = v.map(String); } catch { /**/ }
  try { const v = JSON.parse(r.content ?? "[]"); if (Array.isArray(v)) content = v as KnowledgeSection[]; } catch { /**/ }
  return {
    id: r.id, title: r.title ?? "", category: r.category ?? "地方政策", tags, excerpt: r.excerpt ?? "", content,
    body: r.body ?? undefined,
    sourceName: r.source_name ?? "", sourceUrl: r.source_url ?? "", status: (r.status as DraftStatus) ?? "pending",
    reviewedBy: r.reviewed_by ?? undefined, reviewedAt: r.reviewed_at ?? undefined, articleId: r.article_id ?? undefined,
    createdAt: r.created_at ?? 0,
  };
}

export function listDrafts(status?: DraftStatus): KnowledgeDraft[] {
  try {
    const sql = status
      ? "SELECT * FROM knowledge_drafts WHERE status=? ORDER BY created_at DESC"
      : "SELECT * FROM knowledge_drafts ORDER BY created_at DESC";
    const rows = (status ? getDb().prepare(sql).all(status) : getDb().prepare(sql).all()) as Row[];
    return rows.map(rowTo);
  } catch { return []; }
}

export function getDraft(id: string): KnowledgeDraft | undefined {
  try {
    const r = getDb().prepare("SELECT * FROM knowledge_drafts WHERE id=?").get(id) as Row | undefined;
    return r ? rowTo(r) : undefined;
  } catch { return undefined; }
}

export function countDrafts(status: DraftStatus): number {
  try {
    const r = getDb().prepare("SELECT COUNT(*) c FROM knowledge_drafts WHERE status=?").get(status) as { c: number };
    return r?.c ?? 0;
  } catch { return 0; }
}

export type DraftInput = {
  title: string; category: string; tags: string[]; excerpt: string; content: KnowledgeSection[];
  body?: string; sourceName: string; sourceUrl: string;
};

export function createDraft(input: DraftInput): string {
  const id = `KD-${Date.now().toString(36)}-${Math.floor(input.title.length % 97)}`;
  getDb().prepare(
    "INSERT INTO knowledge_drafts (id,title,category,tags,excerpt,content,body,source_name,source_url,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,'pending',?)",
  ).run(id, input.title, input.category, JSON.stringify(input.tags), input.excerpt, JSON.stringify(input.content), input.body ?? null, input.sourceName, input.sourceUrl, Date.now());
  return id;
}

export function setDraftStatus(id: string, status: DraftStatus, by: string, articleId?: string): void {
  getDb().prepare("UPDATE knowledge_drafts SET status=?, reviewed_by=?, reviewed_at=?, article_id=? WHERE id=?")
    .run(status, by, Date.now(), articleId ?? null, id);
}

export function deleteDraft(id: string): void {
  getDb().prepare("DELETE FROM knowledge_drafts WHERE id=?").run(id);
}

// 去重：已抓过的原文链接（草稿任何状态 + 已入库文章）
export function seenSourceUrls(): Set<string> {
  const out = new Set<string>();
  try {
    for (const r of getDb().prepare("SELECT source_url FROM knowledge_drafts WHERE source_url IS NOT NULL AND source_url != ''").all() as { source_url: string }[]) out.add(r.source_url);
  } catch { /**/ }
  try {
    for (const r of getDb().prepare("SELECT source_url FROM knowledge_articles WHERE source_url IS NOT NULL AND source_url != ''").all() as { source_url: string }[]) out.add(r.source_url);
  } catch { /**/ }
  return out;
}
