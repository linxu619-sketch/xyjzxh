"use server";

import { revalidatePath } from "next/cache";
import {
  writeRuntimeSettings,
  type RuntimeSettings,
} from "@/lib/runtime-config";
import { getSession } from "@/lib/auth/session";

export type SaveResult =
  | { ok: null }
  | { ok: true; savedAt: number; aiProvider?: string }
  | { ok: false; error: string };

export async function saveSettingsAction(
  _prev: SaveResult,
  fd: FormData,
): Promise<SaveResult> {
  const session = await getSession();
  if (!session || (session.role !== "association" && session.role !== "system_admin")) {
    return { ok: false, error: "无权限：仅协会工作人员可保存设置" };
  }

  try {
    const patch: RuntimeSettings = {
      ai: {
        provider: pickEnum(fd, "ai.provider", ["auto", "deepseek"]),
        deepseekModel: pickString(fd, "ai.deepseekModel"),
        deepseekBaseUrl: pickString(fd, "ai.deepseekBaseUrl"),
      },
      platform: {
        name:      pickString(fd, "platform.name"),
        shortName: pickString(fd, "platform.shortName"),
        domain:    pickString(fd, "platform.domain"),
        tel:       pickString(fd, "platform.tel"),
        address:   pickString(fd, "platform.address"),
        slogan:    pickString(fd, "platform.slogan"),
        subSlogan: pickString(fd, "platform.subSlogan"),
        icp:       pickString(fd, "platform.icp"),
      },
      security: {
        minPasswordLen:   pickInt(fd, "security.minPasswordLen"),
        require2faAdmin:  pickBool(fd, "security.require2faAdmin"),
        require2faStaff:  pickBool(fd, "security.require2faStaff"),
        sessionTtlDays:   pickInt(fd, "security.sessionTtlDays"),
        ipWhitelist:      pickString(fd, "security.ipWhitelist"),
      },
      esign: {
        provider: pickEnum(fd, "esign.provider", ["native", "e_qianbao", "demo"]),
      },
      e_qianbao: {
        appId:       pickString(fd, "e_qianbao.appId"),
        baseUrl:     pickString(fd, "e_qianbao.baseUrl"),
        callbackUrl: pickString(fd, "e_qianbao.callbackUrl"),
      },
      regulator: {
        enabled:            pickBool(fd, "regulator.enabled"),
        provincialEndpoint: pickString(fd, "regulator.provincialEndpoint"),
        cityEndpoint:       pickString(fd, "regulator.cityEndpoint"),
      },
    };

    // 仅在用户重新填写时覆盖 key
    const dsKey = String(fd.get("ai.deepseekApiKey") || "").trim();
    if (dsKey) patch.ai = { ...patch.ai, deepseekApiKey: dsKey };
    const eqKey = String(fd.get("e_qianbao.appKey") || "").trim();
    if (eqKey) patch.e_qianbao = { ...patch.e_qianbao, appKey: eqKey };
    const provKey = String(fd.get("regulator.provincialApiKey") || "").trim();
    if (provKey) patch.regulator = { ...patch.regulator, provincialApiKey: provKey };
    const cityKey = String(fd.get("regulator.cityApiKey") || "").trim();
    if (cityKey) patch.regulator = { ...patch.regulator, cityApiKey: cityKey };

    await writeRuntimeSettings(patch);
    revalidatePath("/dashboard/association/settings");
    revalidatePath("/members");

    return {
      ok: true,
      savedAt: Date.now(),
      aiProvider: patch.ai?.provider,
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function testRegulatorAction(
  target: "provincial" | "city",
): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  const session = await getSession();
  if (!session || (session.role !== "association" && session.role !== "system_admin")) {
    return { ok: false, error: "无权限" };
  }
  const { pingRegulator } = await import("@/lib/integrations/regulator");
  return pingRegulator(target);
}

export async function testEqianbaoAction(): Promise<{
  ok: boolean;
  error?: string;
  configured?: boolean;
}> {
  const session = await getSession();
  if (!session || (session.role !== "association" && session.role !== "system_admin")) {
    return { ok: false, error: "无权限" };
  }
  const { readRuntimeSettings } = await import("@/lib/runtime-config");
  const cfg = await readRuntimeSettings();
  const eq = cfg.e_qianbao;
  if (!eq?.appId || !eq.appKey) {
    return { ok: false, configured: false, error: "未配置 appId / appKey" };
  }
  try {
    const res = await fetch(eq.baseUrl || "https://smlopenapi.esign.cn", {
      method: "HEAD",
    });
    return { ok: res.status < 500, configured: true };
  } catch (e) {
    return { ok: false, configured: true, error: String(e) };
  }
}

function pickString(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  if (v === null) return undefined;
  return String(v);
}

function pickEnum<T extends string>(fd: FormData, key: string, allowed: readonly T[]): T | undefined {
  const v = fd.get(key);
  if (v === null) return undefined;
  const s = String(v) as T;
  return allowed.includes(s) ? s : undefined;
}

function pickInt(fd: FormData, key: string): number | undefined {
  const v = fd.get(key);
  if (v === null) return undefined;
  const n = Number(String(v));
  return Number.isFinite(n) ? n : undefined;
}

function pickBool(fd: FormData, key: string): boolean {
  // 复选框未勾选时 FormData 里没这个 key，所以默认 false
  return fd.get(key) === "on";
}
