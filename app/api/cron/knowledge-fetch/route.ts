import { timingSafeEqual } from "node:crypto";
import { runKnowledgeFetch } from "@/lib/ai/knowledge-fetch";

/* ============================================================
   每日定时抓取知识库更新（供 OS 级 cron / Windows 计划任务调用）
   ------------------------------------------------------------
   不依赖登录会话，用密钥保护：
     Authorization: Bearer <CRON_SECRET>   或   ?key=<CRON_SECRET>
   密钥来源：环境变量 CRON_SECRET（未配置则拒绝执行，避免接口被滥用）。
   行为与后台「立即抓取更新」一致：抓取 → AI 起草 → 进草稿箱待人工审核。
   ============================================================ */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120; // 抓取 + 多次 AI 起草，给足时间

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
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
  if (!secret) {
    return Response.json({ ok: false, error: "CRON_SECRET 未配置，拒绝执行" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  if (!authorized(req, secret)) {
    return Response.json({ ok: false, error: "未授权" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const summary = await runKnowledgeFetch();
    return Response.json(
      { ok: true, at: new Date().toISOString(), ...summary },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "抓取失败" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export const GET = handle;
export const POST = handle;
