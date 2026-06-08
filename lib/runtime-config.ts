import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { SITE } from "@/lib/site";
import { ROLE_KEYS, STAFF_ROLES, ALL_PERMISSIONS, type Permission } from "@/lib/auth/roles";

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
  /** 资金交易 / 支付：收款账户 + 渠道开关 + 渠道密钥（密钥仅服务端使用，勿外泄） */
  payment?: {
    corpAccountName?: string; corpAccountNo?: string; corpBankName?: string;
    personalAccountName?: string; personalAccountNo?: string; personalBankName?: string;
    enableAlipay?: boolean; enableWechat?: boolean; enableBankCorp?: boolean; enableBankPersonal?: boolean;
    alipayAppId?: string; alipayPrivateKey?: string;
    wechatMchId?: string; wechatApiKey?: string;
  };
  /** 角色权限覆盖（系统设置「角色权限表」编辑后写入；某角色缺省时用 STAFF_ROLES 内置） */
  rolePermissions?: Record<string, string[]>;
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

/**
 * 有效平台信息 = 系统设置(runtime-settings) 覆盖 > 内置 SITE 默认。
 * 供页头、页脚、打印公文抬头等统一取用，确保系统设置改了即时生效。
 */
export async function getPlatformInfo() {
  const p = (await readRuntimeSettings()).platform ?? {};
  return {
    name: p.name || SITE.name,
    shortName: p.shortName || SITE.shortName,
    domain: p.domain || SITE.domain,
    tel: p.tel || SITE.tel,
    email: p.email || SITE.email,
    address: p.address || SITE.address,
    slogan: p.slogan || SITE.slogan,
    subSlogan: p.subSlogan || SITE.subSlogan,
    icp: p.icp || "",
  };
}

/** 支付配置：收款账户 + 渠道开关（供收银台/渠道读取）。 */
export async function getPaymentConfig() {
  const p = (await readRuntimeSettings()).payment ?? {};
  return {
    corpAccountName: p.corpAccountName ?? "", corpAccountNo: p.corpAccountNo ?? "", corpBankName: p.corpBankName ?? "",
    personalAccountName: p.personalAccountName ?? "", personalAccountNo: p.personalAccountNo ?? "", personalBankName: p.personalBankName ?? "",
    enableAlipay: p.enableAlipay ?? true, enableWechat: p.enableWechat ?? true,
    enableBankCorp: p.enableBankCorp ?? true, enableBankPersonal: p.enableBankPersonal ?? true,
  };
}

/**
 * 有效角色权限 = 系统设置覆盖(rolePermissions) > STAFF_ROLES 内置。
 * super_admin 恒为全部权限，不受覆盖影响。供「角色权限表」展示与后台导航/拦截统一取用。
 */
export async function getEffectiveRolePermissions(): Promise<Record<string, Permission[]>> {
  const override = (await readRuntimeSettings()).rolePermissions ?? {};
  const out: Record<string, Permission[]> = {};
  for (const key of ROLE_KEYS) {
    if (key === "super_admin") { out[key] = [...ALL_PERMISSIONS]; continue; }
    const ov = override[key];
    out[key] = ov
      ? ov.filter((p): p is Permission => (ALL_PERMISSIONS as string[]).includes(p))
      : STAFF_ROLES[key].permissions;
  }
  return out;
}

/** 一组角色的有效权限并集（含系统设置覆盖） */
export async function getEffectivePermissionsForRoles(roles: string[]): Promise<Set<Permission>> {
  const eff = await getEffectiveRolePermissions();
  const set = new Set<Permission>();
  for (const r of roles) for (const p of eff[r] ?? []) set.add(p);
  return set;
}

// 工具：脱敏展示 sk-xxx
export function maskSecret(key?: string): string {
  if (!key) return "";
  if (key.length <= 10) return "•".repeat(key.length);
  return key.slice(0, 3) + "•".repeat(Math.max(4, key.length - 7)) + key.slice(-4);
}
