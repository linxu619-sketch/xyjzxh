import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   企业案例（企业自助上传，展示在其协会子站案例区）
   ============================================================ */

export type EnterpriseCase = {
  id: number;
  enterpriseId: string;
  title: string;
  cover: string;
  area: string;
  tag: string;
  createdAt: number;
};

type Row = {
  id: number;
  enterprise_id: string | null;
  title: string | null;
  cover: string | null;
  area: string | null;
  tag: string | null;
  created_at: number | null;
};

function rowTo(r: Row): EnterpriseCase {
  return {
    id: r.id,
    enterpriseId: r.enterprise_id ?? "",
    title: r.title ?? "",
    cover: r.cover ?? "",
    area: r.area ?? "",
    tag: r.tag ?? "",
    createdAt: r.created_at ?? 0,
  };
}

export function listCasesByEnterprise(enterpriseId: string): EnterpriseCase[] {
  const rows = getDb()
    .prepare("SELECT * FROM enterprise_cases WHERE enterprise_id = ? ORDER BY created_at DESC")
    .all(enterpriseId) as Row[];
  return rows.map(rowTo);
}

export function createCase(input: {
  enterpriseId: string;
  title: string;
  cover: string;
  area?: string;
  tag?: string;
}): number {
  const info = getDb()
    .prepare("INSERT INTO enterprise_cases (enterprise_id,title,cover,area,tag,created_at) VALUES (?,?,?,?,?,?)")
    .run(input.enterpriseId, input.title, input.cover, input.area ?? "", input.tag ?? "", Date.now());
  return Number(info.lastInsertRowid);
}

export function getCase(id: number): EnterpriseCase | undefined {
  const row = getDb().prepare("SELECT * FROM enterprise_cases WHERE id = ?").get(id) as Row | undefined;
  return row ? rowTo(row) : undefined;
}

export function deleteCase(id: number) {
  getDb().prepare("DELETE FROM enterprise_cases WHERE id = ?").run(id);
}
