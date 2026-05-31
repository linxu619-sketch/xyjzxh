import "server-only";
import { getDb } from "@/lib/db/sqlite";

export type Review = {
  id: number;
  user: string;
  enterprise: string;
  project: string;
  rating: number;
  content: string;
  category: string;
  createdAt: number;
};

type Row = {
  id: number; user: string | null; enterprise: string | null; project: string | null;
  rating: number | null; content: string | null; category: string | null; created_at: number | null;
};

function rowTo(r: Row): Review {
  return {
    id: r.id, user: r.user ?? "匿名业主", enterprise: r.enterprise ?? "", project: r.project ?? "",
    rating: r.rating ?? 5, content: r.content ?? "", category: r.category ?? "decor", createdAt: r.created_at ?? 0,
  };
}

export function createReview(input: {
  user: string; enterprise: string; project: string; rating: number; content: string; category: string;
}): number {
  const info = getDb()
    .prepare("INSERT INTO reviews (user, enterprise, project, rating, content, category, created_at) VALUES (?,?,?,?,?,?,?)")
    .run(input.user, input.enterprise, input.project, input.rating, input.content, input.category, Date.now());
  return Number(info.lastInsertRowid);
}

export function listReviews(limit = 20): Review[] {
  const rows = getDb()
    .prepare("SELECT * FROM reviews ORDER BY created_at DESC LIMIT ?")
    .all(limit) as Row[];
  return rows.map(rowTo);
}
