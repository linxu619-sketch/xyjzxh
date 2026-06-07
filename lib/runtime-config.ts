import "server-only";
import fs from "node:fs/promises";
import path from "node:path";

/* ============================================================
   运行时设置 — 由系统设置 UI 写入，敏感字段不入仓
   优先级：runtime-settings.json > 环境变量 > 内置默认
   文件：D:\zsxh\.runtime-settings.json（已在 .gitignore）
   ============================================================ */

const FILE = path.join(process.cwd(), ".runtime-settings.json");

export type RuntimeSettings = {
  ai?: {
    provider?: "deepseek" | "anthropic" | "auto";
    deepseekApiKey?: string;
    deepseekModel?: string;
    deepseekBaseUrl?: string;
    anthropicApiKey?: string;
    anthropicModel?: string;
  };
  platform?: {
    name?: string;
    shortName?: string;
    domain?: string;
    tel?: string;
    email?: string;
    address?: string;
    slogan?: string;
    subSlogan?: string;
    icp?: string;
  };
  security?: {
    minPasswordLen?: number;
    require2faAdmin?: boolean;
    require2faStaff?: boolean;
    sessionTtlDays?: number;
    ipWhitelist?: string;
  };
  /** 电子签提供商 — 控制签署落地 */
  esign?: {
    provider?: "native" | "e_qianbao" | "demo";
  };
  /** e签宝开放平台 */
  e_qianbao?: {
    appId?: string;
    appKey?: string;
    baseUrl?: string;
    callbackUrl?: string;
  };
  /** 监管平台对接（省厅 + 市局） */
  regulator?: {
    enabled?: boolean;
    provincialEndpoint?: string;
    provincialApiKey?: string;
    cityEndpoint?: string;
    cityApiKey?: string;
  };
};

let cache: RuntimeSettings | null = null;
let cacheAt = 0;
const TTL_MS = 1500;

export async function readRuntimeSettings(): Promise<RuntimeSettings> {
  const now = Date.now();
  if (cache && now - cacheAt < TTL_MS) return cache;
  try {
    const buf = await fs.readFile(FILE, "utf8");
    cache = JSON.parse(buf) as RuntimeSettings;
  } catch {
    cache = {};
  }
  cacheAt = now;
  return cache;
}

export async function writeRuntimeSettings(patch: RuntimeSettings) {
  const current = await readRuntimeSettings();
  const merged = mergeDeep(current, patch);
  await fs.writeFile(FILE, JSON.stringify(merged, null, 2), "utf8");
  cache = merged;
  cacheAt = Date.now();
  return merged;
}

function isObj(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

function mergeDeep<T>(a: T, b: Partial<T>): T {
  if (!isObj(a) || !isObj(b)) return (b as T) ?? a;
  const out: Record<string, unknown> = { ...a };
  for (const k of Object.keys(b)) {
    const av = (a as Record<string, unknown>)[k];
    const bv = (b as Record<string, unknown>)[k];
    if (isObj(av) && isObj(bv)) out[k] = mergeDeep(av, bv);
    else if (bv !== undefined) out[k] = bv;
  }
  return out as T;
}

// 工具：脱敏展示 sk-xxx
export function maskSecret(key?: string): string {
  if (!key) return "";
  if (key.length <= 10) return "•".repeat(key.length);
  return key.slice(0, 3) + "•".repeat(Math.max(4, key.length - 7)) + key.slice(-4);
}
