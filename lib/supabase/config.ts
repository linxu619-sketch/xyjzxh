import "server-only";
import { readRuntimeSettings } from "@/lib/runtime-config";

/* ============================================================
   Supabase 配置读取（合并：env 与 runtime-settings.json）
   ============================================================ */

export type SupabaseConfig = {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
};

export async function readSupabaseConfig(): Promise<SupabaseConfig | null> {
  const runtime = (await readRuntimeSettings()) as Record<string, unknown>;
  const sb = (runtime.supabase ?? {}) as Partial<SupabaseConfig>;

  const url =
    (typeof sb.url === "string" && sb.url) ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "";

  const anonKey =
    (typeof sb.anonKey === "string" && sb.anonKey) ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  const serviceRoleKey =
    (typeof sb.serviceRoleKey === "string" && sb.serviceRoleKey) ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    undefined;

  if (!url || !anonKey) return null;
  return { url, anonKey, serviceRoleKey };
}

export async function isSupabaseConfigured(): Promise<boolean> {
  return (await readSupabaseConfig()) !== null;
}

export function maskKey(k?: string): string {
  if (!k) return "";
  if (k.length <= 10) return "•".repeat(k.length);
  return k.slice(0, 6) + "•".repeat(Math.max(4, k.length - 12)) + k.slice(-6);
}
