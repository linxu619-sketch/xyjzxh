import { readFileSync } from "node:fs";
import path from "node:path";
import { getDb } from "@/lib/db/sqlite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let version = "unknown";
try {
  version = JSON.parse(readFileSync(path.join(process.cwd(), "package.json"), "utf8")).version ?? "unknown";
} catch { /* ignore */ }

export async function GET() {
  let db = "ok";
  try {
    getDb().prepare("SELECT 1 AS ok").get();
  } catch {
    db = "down";
  }
  const ok = db === "ok";
  return Response.json(
    { status: ok ? "ok" : "degraded", version, db, time: new Date().toISOString() },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
