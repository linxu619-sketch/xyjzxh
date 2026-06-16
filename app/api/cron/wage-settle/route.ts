import { timingSafeEqual } from "node:crypto";
import { runWeeklyWageSettle } from "@/lib/data/wage-payouts";

/* ============================================================
   周结工资定时结算（供 OS 级 cron / 计划任务调用，建议每周一次）
   ------------------------------------------------------------
   扫描「周结·已托管」零工的在岗工人,按确认出勤从托管池自动结算工资。
   日结=确认即结、完工结=完工即结,均不依赖本接口；本接口只兜周结。
   密钥保护：Authorization: Bearer <CRON_SECRET> 或 ?key=<CRON_SECRET>
   ============================================================ */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a), bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  try { return timingSafeEqual(ab, bb); } catch { return false; }
}
function authorized(req: Request, secret: string): boolean {
  const auth = req.headers.get("authorization") || "";
  const fromHeader = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const fromQuery = new URL(req.url).searchParams.get("key") || "";
  const provided = fromHeader || fromQuery;
  return provided.length > 0 && safeEqual(provided, secret);
}

async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ ok: false, error: "CRON_SECRET 未配置，拒绝执行" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  if (!authorized(req, secret)) return Response.json({ ok: false, error: "未授权" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const res = runWeeklyWageSettle();
  return Response.json({ ok: true, ...res }, { headers: { "Cache-Control": "no-store" } });
}

export const GET = handle;
export const POST = handle;
