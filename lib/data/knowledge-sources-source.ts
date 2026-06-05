import "server-only";
import { getDb } from "@/lib/db/sqlite";
import { DEFAULT_KNOWLEDGE_SOURCES, type KnowledgeSource, type SourceKind } from "@/lib/data/knowledge-sources";

/* 知识库抓取来源数据源：本地 SQLite（失败回退静态默认）。 */

type Row = { id: string; name: string | null; url: string | null; kind: string | null; category: string | null; enabled: number | null; last_run_at: number | null };

function rowTo(r: Row): KnowledgeSource {
  return {
    id: r.id, name: r.name ?? "", url: r.url ?? "", kind: (r.kind as SourceKind) ?? "html",
    category: r.category ?? "地方政策", enabled: !!r.enabled, lastRunAt: r.last_run_at ?? undefined,
  };
}

const FALLBACK: KnowledgeSource[] = DEFAULT_KNOWLEDGE_SOURCES.map((s) => ({ ...s }));

export function listSources(enabledOnly = false): KnowledgeSource[] {
  try {
    const rows = getDb().prepare("SELECT * FROM knowledge_sources ORDER BY created_at ASC").all() as Row[];
    const all = rows.length ? rows.map(rowTo) : FALLBACK;
    return enabledOnly ? all.filter((s) => s.enabled) : all;
  } catch {
    return enabledOnly ? FALLBACK.filter((s) => s.enabled) : FALLBACK;
  }
}

export function getSource(id: string): KnowledgeSource | undefined {
  try {
    const r = getDb().prepare("SELECT * FROM knowledge_sources WHERE id=?").get(id) as Row | undefined;
    return r ? rowTo(r) : FALLBACK.find((s) => s.id === id);
  } catch { return FALLBACK.find((s) => s.id === id); }
}

export function addSource(input: { name: string; url: string; kind: SourceKind; category: string }): string {
  const id = `SRC-${Date.now().toString(36)}`;
  getDb().prepare("INSERT INTO knowledge_sources (id,name,url,kind,category,enabled,last_run_at,created_at) VALUES (?,?,?,?,?,1,NULL,?)")
    .run(id, input.name, input.url, input.kind, input.category, Date.now());
  return id;
}

export function setSourceEnabled(id: string, enabled: boolean): void {
  getDb().prepare("UPDATE knowledge_sources SET enabled=? WHERE id=?").run(enabled ? 1 : 0, id);
}

export function deleteSource(id: string): void {
  getDb().prepare("DELETE FROM knowledge_sources WHERE id=?").run(id);
}

export function touchSourceRun(id: string): void {
  getDb().prepare("UPDATE knowledge_sources SET last_run_at=? WHERE id=?").run(Date.now(), id);
}
