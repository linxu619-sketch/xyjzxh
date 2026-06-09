import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   协会留言 / 意见反馈（联系我们页「给协会留个言」）
   公开提交（无需登录）→ 协会后台「留言反馈」查看与处理
   ============================================================ */

export type FeedbackStatus = "new" | "handled";
export type Feedback = {
  id: number; name: string; phone: string; email: string; content: string;
  status: FeedbackStatus; createdAt: number;
};

type Row = {
  id: number; name: string | null; phone: string | null; email: string | null;
  content: string | null; status: string | null; created_at: number | null;
};
function toF(r: Row): Feedback {
  return {
    id: r.id, name: r.name ?? "", phone: r.phone ?? "", email: r.email ?? "",
    content: r.content ?? "", status: (r.status as FeedbackStatus) ?? "new", createdAt: r.created_at ?? 0,
  };
}

// 公开提交：截断超长输入，防滥用
export function createFeedback(input: { name?: string; phone?: string; email?: string; content: string }): Feedback {
  const cut = (s: string | undefined, n: number) => (s ?? "").trim().slice(0, n);
  const content = cut(input.content, 2000);
  if (!content) throw new Error("留言内容不能为空");
  const info = getDb().prepare(
    "INSERT INTO feedback (name,phone,email,content,status,created_at) VALUES (?,?,?,?, 'new', ?)",
  ).run(cut(input.name, 40), cut(input.phone, 20), cut(input.email, 80), content, Date.now());
  return getFeedback(Number(info.lastInsertRowid))!;
}

export function listFeedback(): Feedback[] {
  return (getDb().prepare("SELECT * FROM feedback ORDER BY created_at DESC").all() as Row[]).map(toF);
}
export function getFeedback(id: number): Feedback | undefined {
  const r = getDb().prepare("SELECT * FROM feedback WHERE id=?").get(id) as Row | undefined;
  return r ? toF(r) : undefined;
}
export function setFeedbackStatus(id: number, status: FeedbackStatus) {
  getDb().prepare("UPDATE feedback SET status=? WHERE id=?").run(status, id);
}
export function countNewFeedback(): number {
  return (getDb().prepare("SELECT COUNT(*) AS c FROM feedback WHERE status='new'").get() as { c: number }).c;
}
