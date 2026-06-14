import "server-only";
import { getDb } from "@/lib/db/sqlite";
import { KNOWLEDGE, type KnowledgeItem, type KnowledgeSection } from "@/lib/data/knowledge";

/* 知识库数据源：本地 SQLite（失败回退静态）。静态 KNOWLEDGE 仅作种子源。 */

type Row = { id: string; title: string | null; category: string | null; tags: string | null; date: string | null; size: string | null; hot: number | null; excerpt: string | null; body: string | null; content: string | null; file_url: string | null; file_name: string | null; source_url: string | null; source_name: string | null };

function rowTo(r: Row): KnowledgeItem {
  let tags: string[] = []; let content: KnowledgeSection[] = [];
  try { const v = JSON.parse(r.tags ?? "[]"); if (Array.isArray(v)) tags = v.map(String); } catch { /**/ }
  try { const v = JSON.parse(r.content ?? "[]"); if (Array.isArray(v)) content = v as KnowledgeSection[]; } catch { /**/ }
  return {
    id: r.id, title: r.title ?? "", category: (r.category as KnowledgeItem["category"]) ?? "技术资料",
    tags, date: r.date ?? "", size: r.size ?? undefined, hot: !!r.hot, excerpt: r.excerpt ?? "",
    body: r.body ?? undefined, content,
    fileUrl: r.file_url ?? undefined, fileName: r.file_name ?? undefined,
    sourceUrl: r.source_url ?? undefined, sourceName: r.source_name ?? undefined,
  };
}

export function listKnowledge(): KnowledgeItem[] {
  try {
    const rows = getDb().prepare("SELECT * FROM knowledge_articles ORDER BY date DESC, created_at DESC").all() as Row[];
    return rows.length ? rows.map(rowTo) : KNOWLEDGE;
  } catch { return KNOWLEDGE; }
}

export function getKnowledgeArticle(id: string): KnowledgeItem | undefined {
  try {
    const r = getDb().prepare("SELECT * FROM knowledge_articles WHERE id = ?").get(id) as Row | undefined;
    return r ? rowTo(r) : KNOWLEDGE.find((k) => k.id === id);
  } catch { return KNOWLEDGE.find((k) => k.id === id); }
}

export type KnowledgeInput = {
  title: string; category: string; tags: string[]; date: string; size?: string;
  hot: boolean; excerpt: string; body?: string; content: KnowledgeSection[]; fileUrl?: string; fileName?: string;
  sourceUrl?: string; sourceName?: string;
};

export function createKnowledge(input: KnowledgeInput): string {
  const id = `K-${Date.now().toString(36)}`;
  getDb().prepare(
    "INSERT INTO knowledge_articles (id,title,category,tags,date,size,hot,excerpt,body,content,file_url,file_name,source_url,source_name,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
  ).run(id, input.title, input.category, JSON.stringify(input.tags), input.date, input.size ?? "", input.hot ? 1 : 0, input.excerpt, input.body ?? null, JSON.stringify(input.content), input.fileUrl ?? null, input.fileName ?? null, input.sourceUrl ?? null, input.sourceName ?? null, Date.now());
  return id;
}

export function updateKnowledge(id: string, input: KnowledgeInput): void {
  getDb().prepare(
    "UPDATE knowledge_articles SET title=?,category=?,tags=?,date=?,size=?,hot=?,excerpt=?,body=?,content=?,file_url=?,file_name=? WHERE id=?",
  ).run(input.title, input.category, JSON.stringify(input.tags), input.date, input.size ?? "", input.hot ? 1 : 0, input.excerpt, input.body ?? null, JSON.stringify(input.content), input.fileUrl ?? null, input.fileName ?? null, id);
}

export function setKnowledgeHot(id: string, hot: boolean): void {
  getDb().prepare("UPDATE knowledge_articles SET hot=? WHERE id=?").run(hot ? 1 : 0, id);
}

export function deleteKnowledge(id: string): void {
  getDb().prepare("DELETE FROM knowledge_articles WHERE id=?").run(id);
}

/* 回填用：列出「有原文链接但正文为空」的已入库文章（按抓取顺序，便于分批回填） */
export function listArticlesMissingBody(limit: number): { id: string; sourceUrl: string }[] {
  try {
    const rows = getDb().prepare(
      "SELECT id, source_url FROM knowledge_articles WHERE source_url IS NOT NULL AND source_url != '' AND (body IS NULL OR body = '') ORDER BY created_at DESC LIMIT ?",
    ).all(limit) as { id: string; source_url: string }[];
    return rows.map((r) => ({ id: r.id, sourceUrl: r.source_url }));
  } catch { return []; }
}

export function setArticleBody(id: string, body: string): void {
  try { getDb().prepare("UPDATE knowledge_articles SET body=? WHERE id=?").run(body, id); } catch { /* 表/列不存在则忽略 */ }
}
