import "server-only";
import type { Lead } from "./leads";
import type { ProjectReport } from "./reports";

/* ============================================================
   待办 / 待跟进判定（纯逻辑，无 IO）
   ------------------------------------------------------------
   依据「最后跟进时间」(lead_activities / report_activities) 判定停滞，
   置顶到企业工作台总览，提醒老板/成员该跟进谁。
   ============================================================ */

const DAY = 86_400_000;
export const LEAD_STALE_DAYS = 3;   // 跟进中线索超过 N 天无记录 → 待跟进

export type LeadTodo = {
  lead: Lead;
  reason: string;
  tone: "decor" | "yellow";
  idleDays: number;
  isNew: boolean;
};

// 线索待办：新线索(待首联) + 跟进中但停滞的线索；已签单/已流失不计
export function leadTodos(leads: Lead[], lastAct: Record<number, number>, now: number): LeadTodo[] {
  const todos: LeadTodo[] = [];
  for (const l of leads) {
    if (l.status === "signed" || l.status === "lost") continue;
    const last = lastAct[l.id] || l.createdAt || now;
    const idleDays = Math.max(0, Math.floor((now - last) / DAY));
    if (l.status === "new") {
      todos.push({ lead: l, reason: "新线索 · 待首次联系", tone: "decor", idleDays, isNew: true });
    } else if (idleDays >= LEAD_STALE_DAYS) {
      todos.push({ lead: l, reason: `已 ${idleDays} 天未跟进`, tone: "yellow", idleDays, isNew: false });
    }
  }
  // 新线索优先，其次按停滞天数降序
  return todos.sort((a, b) => {
    if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
    return b.idleDays - a.idleDays;
  });
}

export type ReportTodo = { report: ProjectReport; reason: string };

// 报备待办：被协会驳回的需整改重报（pending 在等协会、approved 已成,均不算企业侧待办）
export function reportTodos(reports: ProjectReport[]): ReportTodo[] {
  return reports
    .filter((r) => r.status === "rejected")
    .map((r) => ({ report: r, reason: "已驳回 · 待整改重报" }));
}
