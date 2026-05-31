import "server-only";
import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db/sqlite";
import { KNOWLEDGE, rankEntries, type KnowledgeEntry } from "./knowledge";

/* ============================================================
   AI 员工知识库 · 数据源（SQLite，失败回退内置种子）
   - 聊天检索：retrieveKnowledge
   - 协会后台维护：list / add / update / delete / setEnabled
   ============================================================ */

type Row = {
  id: string;
  employee_key: string;
  title: string | null;
  keywords: string | null; // JSON
  content: string | null;
  source: string | null;
  enabled: number; // 0/1
  created_at: number | null;
};

export type KnowledgeRecord = KnowledgeEntry & { employeeKey: string; enabled: boolean };

function rowToEntry(r: Row): KnowledgeEntry {
  let keywords: string[] = [];
  try { keywords = r.keywords ? (JSON.parse(r.keywords) as string[]) : []; } catch { keywords = []; }
  return {
    id: r.id,
    title: r.title ?? "",
    keywords,
    content: r.content ?? "",
    source: r.source ?? undefined,
  };
}

function rowToRecord(r: Row): KnowledgeRecord {
  return { ...rowToEntry(r), employeeKey: r.employee_key, enabled: !!r.enabled };
}

// 聊天用：检索某员工启用的知识，按相关度取前 k
export function retrieveKnowledge(key: string, query: string, k = 3): KnowledgeEntry[] {
  try {
    const rows = getDb()
      .prepare("SELECT * FROM ai_knowledge WHERE employee_key = ? AND enabled = 1")
      .all(key) as Row[];
    return rankEntries(rows.map(rowToEntry), query, k);
  } catch {
    return rankEntries(KNOWLEDGE[key as keyof typeof KNOWLEDGE] ?? [], query, k);
  }
}

// 后台用：列出某员工全部词条（含停用）
export function listKnowledge(employeeKey: string): KnowledgeRecord[] {
  const rows = getDb()
    .prepare("SELECT * FROM ai_knowledge WHERE employee_key = ? ORDER BY created_at DESC")
    .all(employeeKey) as Row[];
  return rows.map(rowToRecord);
}

export function addKnowledge(input: {
  employeeKey: string;
  title: string;
  content: string;
  keywords: string[];
  source?: string;
}): string {
  const id = randomUUID();
  getDb()
    .prepare(
      `INSERT INTO ai_knowledge (id,employee_key,title,keywords,content,source,enabled,created_at)
       VALUES (?,?,?,?,?,?,1,?)`,
    )
    .run(
      id,
      input.employeeKey,
      input.title,
      JSON.stringify(input.keywords ?? []),
      input.content,
      input.source ?? null,
      Date.now(),
    );
  return id;
}

export function updateKnowledge(id: string, input: {
  title: string;
  content: string;
  keywords: string[];
  source?: string;
}) {
  getDb()
    .prepare("UPDATE ai_knowledge SET title=?, keywords=?, content=?, source=? WHERE id=?")
    .run(input.title, JSON.stringify(input.keywords ?? []), input.content, input.source ?? null, id);
}

export function deleteKnowledge(id: string) {
  getDb().prepare("DELETE FROM ai_knowledge WHERE id=?").run(id);
}

export function setKnowledgeEnabled(id: string, enabled: boolean) {
  getDb().prepare("UPDATE ai_knowledge SET enabled=? WHERE id=?").run(enabled ? 1 : 0, id);
}

/* ---------------- 用户提问日志（用于"从工作中学习"）---------------- */

// 记录一条用户提问（best-effort，失败不影响聊天）
export function logQuestion(employeeKey: string, question: string) {
  const q = question.trim();
  if (!q) return;
  try {
    getDb()
      .prepare("INSERT INTO ai_questions (employee_key, question, created_at) VALUES (?,?,?)")
      .run(employeeKey, q.slice(0, 500), Date.now());
  } catch {
    /* 忽略日志失败 */
  }
}

// 后台用：某员工近期去重提问
export function recentQuestions(employeeKey: string, limit = 15): string[] {
  try {
    const rows = getDb()
      .prepare(
        `SELECT question, MAX(created_at) AS t FROM ai_questions
         WHERE employee_key = ?
         GROUP BY question ORDER BY t DESC LIMIT ?`,
      )
      .all(employeeKey, limit) as { question: string }[];
    return rows.map((r) => r.question);
  } catch {
    return [];
  }
}
