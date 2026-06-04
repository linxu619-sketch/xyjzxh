import "server-only";
import { getDb } from "@/lib/db/sqlite";
import { KNOWLEDGE, type KnowledgeItem, type KnowledgeSection } from "@/lib/data/knowledge";

/* 知识库数据源：本地 SQLite（失败回退静态）。静态 KNOWLEDGE 仅作种子源。 */

type Row = { id: string; title: string | null; category: string | null; tags: string | null; date: string | null; size: string | null; hot: number | null; excerpt: string | null; content: string | null };

function rowTo(r: Row): KnowledgeItem {
  let tags: string[] = []; let content: KnowledgeSection[] = [];
  try { const v = JSON.parse(r.tags ?? "[]"); if (Array.isArray(v)) tags = v.map(String); } catch { /**/ }
  try { const v = JSON.parse(r.content ?? "[]"); if (Array.isArray(v)) content = v as KnowledgeSection[]; } catch { /**/ }
  return {
    id: r.id, title: r.title ?? "", category: (r.category as KnowledgeItem["category"]) ?? "技术资料",
    tags, date: r.date ?? "", size: r.size ?? undefined, hot: !!r.hot, excerpt: r.excerpt ?? "", content,
  };
}

export function listKnowledge(): KnowledgeItem[] {
  try {
    const rows = getDb().prepare("SELECT * FROM knowledge_articles ORDER BY date DESC").all() as Row[];
    return rows.length ? rows.map(rowTo) : KNOWLEDGE;
  } catch { return KNOWLEDGE; }
}

export function getKnowledgeArticle(id: string): KnowledgeItem | undefined {
  try {
    const r = getDb().prepare("SELECT * FROM knowledge_articles WHERE id = ?").get(id) as Row | undefined;
    return r ? rowTo(r) : KNOWLEDGE.find((k) => k.id === id);
  } catch { return KNOWLEDGE.find((k) => k.id === id); }
}
