import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   企业团队成员（企业自助维护，展示在其协会子站团队区）
   ============================================================ */

export type TeamMember = {
  id: number;
  enterpriseId: string;
  name: string;
  role: string;
  exp: string;
  createdAt: number;
};

type Row = {
  id: number;
  enterprise_id: string | null;
  name: string | null;
  role: string | null;
  exp: string | null;
  created_at: number | null;
};

function rowTo(r: Row): TeamMember {
  return {
    id: r.id,
    enterpriseId: r.enterprise_id ?? "",
    name: r.name ?? "",
    role: r.role ?? "",
    exp: r.exp ?? "",
    createdAt: r.created_at ?? 0,
  };
}

export function listTeamByEnterprise(enterpriseId: string): TeamMember[] {
  const rows = getDb()
    .prepare("SELECT * FROM enterprise_team WHERE enterprise_id = ? ORDER BY created_at ASC")
    .all(enterpriseId) as Row[];
  return rows.map(rowTo);
}

export function createMember(input: { enterpriseId: string; name: string; role: string; exp?: string }): number {
  const info = getDb()
    .prepare("INSERT INTO enterprise_team (enterprise_id,name,role,exp,created_at) VALUES (?,?,?,?,?)")
    .run(input.enterpriseId, input.name, input.role, input.exp ?? "", Date.now());
  return Number(info.lastInsertRowid);
}

export function getMember(id: number): TeamMember | undefined {
  const row = getDb().prepare("SELECT * FROM enterprise_team WHERE id = ?").get(id) as Row | undefined;
  return row ? rowTo(row) : undefined;
}

export function deleteMember(id: number) {
  getDb().prepare("DELETE FROM enterprise_team WHERE id = ?").run(id);
}
