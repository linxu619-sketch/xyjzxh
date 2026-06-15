import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   线索跟进记录（CRM 时间线）
   ------------------------------------------------------------
   成员/老板在线索上记跟进备注；状态变更（开始跟进/已签单…）自动留痕。
   谁能看/写由线索访问权限控制（详情页与 action 已校验归属与分派）。
   ============================================================ */

export type LeadActivity = {
  id: number;
  leadId: number;
  authorName: string;
  authorRole: string;          // owner | admin | sales | ...
  kind: "note" | "status";
  note: string;
  createdAt: number;
};

type Row = {
  id: number; lead_id: number | null; author_name: string | null; author_role: string | null;
  kind: string | null; note: string | null; created_at: number | null;
};
function rowTo(r: Row): LeadActivity {
  return {
    id: r.id, leadId: r.lead_id ?? 0, authorName: r.author_name ?? "", authorRole: r.author_role ?? "",
    kind: (r.kind as LeadActivity["kind"]) ?? "note", note: r.note ?? "", createdAt: r.created_at ?? 0,
  };
}

export function addLeadActivity(input: { leadId: number; authorName: string; authorRole: string; kind?: "note" | "status"; note: string }): number | null {
  const note = input.note.trim();
  if (!input.leadId || !note) return null;
  const info = getDb()
    .prepare("INSERT INTO lead_activities (lead_id,author_name,author_role,kind,note,created_at) VALUES (?,?,?,?,?,?)")
    .run(input.leadId, input.authorName || "—", input.authorRole || "owner", input.kind ?? "note", note, Date.now());
  return Number(info.lastInsertRowid);
}

export function listLeadActivities(leadId: number): LeadActivity[] {
  if (!leadId) return [];
  const rows = getDb()
    .prepare("SELECT * FROM lead_activities WHERE lead_id = ? ORDER BY created_at DESC")
    .all(leadId) as Row[];
  return rows.map(rowTo);
}
