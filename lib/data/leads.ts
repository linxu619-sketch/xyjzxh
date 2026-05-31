import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   客户线索（子站留资 → 写入 SQLite，归属对应企业）
   ============================================================ */

export type LeadStatus = "new" | "contacting" | "surveying" | "signed" | "lost";

export type Lead = {
  id: number;
  enterpriseId: string;
  name: string;
  phone: string;
  type: string;
  style: string;
  area: string;
  budget: string;
  address: string;
  note: string;
  source: string;
  status: LeadStatus;
  createdAt: number;
};

type Row = {
  id: number;
  enterprise_id: string | null;
  name: string | null;
  phone: string | null;
  type: string | null;
  style: string | null;
  area: string | null;
  budget: string | null;
  address: string | null;
  note: string | null;
  source: string | null;
  status: string;
  created_at: number | null;
};

function rowTo(r: Row): Lead {
  return {
    id: r.id,
    enterpriseId: r.enterprise_id ?? "",
    name: r.name ?? "",
    phone: r.phone ?? "",
    type: r.type ?? "",
    style: r.style ?? "",
    area: r.area ?? "",
    budget: r.budget ?? "",
    address: r.address ?? "",
    note: r.note ?? "",
    source: r.source ?? "",
    status: (r.status as LeadStatus) ?? "new",
    createdAt: r.created_at ?? 0,
  };
}

export function createLead(input: {
  enterpriseId: string;
  name: string;
  phone: string;
  type?: string;
  style?: string;
  area?: string;
  budget?: string;
  address?: string;
  note?: string;
  source?: string;
}): number {
  const info = getDb()
    .prepare(
      `INSERT INTO leads (enterprise_id,name,phone,type,style,area,budget,address,note,source,status,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?, 'new', ?)`,
    )
    .run(
      input.enterpriseId,
      input.name,
      input.phone,
      input.type ?? "",
      input.style ?? "",
      input.area ?? "",
      input.budget ?? "",
      input.address ?? "",
      input.note ?? "",
      input.source ?? "子站表单",
      Date.now(),
    );
  return Number(info.lastInsertRowid);
}

export function listLeadsByEnterprise(enterpriseId: string): Lead[] {
  const rows = getDb()
    .prepare("SELECT * FROM leads WHERE enterprise_id = ? ORDER BY created_at DESC")
    .all(enterpriseId) as Row[];
  return rows.map(rowTo);
}

export function getLead(id: number): Lead | undefined {
  const row = getDb().prepare("SELECT * FROM leads WHERE id = ?").get(id) as Row | undefined;
  return row ? rowTo(row) : undefined;
}

export function setLeadStatus(id: number, status: LeadStatus) {
  getDb().prepare("UPDATE leads SET status = ? WHERE id = ?").run(status, id);
}
