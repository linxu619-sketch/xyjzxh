import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readSupabaseConfig } from "./config";

/* ============================================================
   Supabase 服务端客户端
   ------------------------------------------------------------
   两种模式：
   1. service role 客户端 — 服务端 only，绕过 RLS，用于平台后台 / 协会管理
   2. anon 客户端 — 读公开数据，RLS 受限

   未配置 Supabase 时返回 null，调用方应回退 mock 数据。
   ============================================================ */

let _service: SupabaseClient | null = null;
let _anon: SupabaseClient | null = null;
let _cachedConfigKey = "";

/**
 * 服务端管理员客户端（service role）
 * 仅用于 server actions / API routes / RSC 中的"协会侧"读写
 */
export async function getSupabaseAdmin(): Promise<SupabaseClient | null> {
  const cfg = await readSupabaseConfig();
  if (!cfg || !cfg.serviceRoleKey) return null;

  const key = `${cfg.url}|${cfg.serviceRoleKey}`;
  if (_service && key === _cachedConfigKey) return _service;

  _service = createClient(cfg.url, cfg.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  _cachedConfigKey = key;
  return _service;
}

/**
 * 服务端 anon 客户端（受 RLS 保护）
 * 用于读取公开内容
 */
export async function getSupabaseAnon(): Promise<SupabaseClient | null> {
  const cfg = await readSupabaseConfig();
  if (!cfg) return null;

  const key = `${cfg.url}|${cfg.anonKey}`;
  if (_anon && key === _cachedConfigKey) return _anon;

  _anon = createClient(cfg.url, cfg.anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _anon;
}

/**
 * 自检连接（在系统设置点"测试连接"用）
 */
export async function pingSupabase(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  const cfg = await readSupabaseConfig();
  if (!cfg) return { ok: false, error: "未配置 Supabase URL / anon key" };

  const client = createClient(cfg.url, cfg.serviceRoleKey ?? cfg.anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const t0 = Date.now();
  try {
    // 查任何系统表都行；这里查 enterprises 看 schema 是否已部署
    const { error } = await client.from("enterprises").select("id", { count: "exact", head: true }).limit(1);
    const latencyMs = Date.now() - t0;
    if (error) {
      // 表不存在 → schema 还没跑
      if (error.code === "42P01") {
        return { ok: false, error: "已连接，但 enterprises 表不存在，请先在 SQL Editor 跑 db/schema.sql + db/seed.sql", latencyMs };
      }
      return { ok: false, error: `${error.code}: ${error.message}`, latencyMs };
    }
    return { ok: true, latencyMs };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
