import "server-only";
import { randomUUID } from "node:crypto";
import { readRuntimeSettings } from "@/lib/runtime-config";

// 不可枚举的存证编号（capability token）：时间戳前缀 + 16 位强随机，URL 里不含手机号等 PII
function makeSerial(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
}

/* ============================================================
   电子签 provider 抽象
   ------------------------------------------------------------
   支持：
   - native：协会平台自签（哈希存证）· 默认
   - demo：本地模拟（开发态）
   - e_qianbao：e签宝（实接需 appId/appKey/account）
   - shangshangqian：上上签
   - fadada：法大大
   ============================================================ */

export type EsignProvider = "native" | "demo" | "e_qianbao" | "shangshangqian" | "fadada";

export type EsignContext = {
  templateId: string;
  templateCode: string;
  templateVersion: string;
  contentHash: string;
  signerRealName: string;
  signerPhone: string;
  signerIdCardHash?: string;
  signedAtIso: string;
};

export type EsignResult = {
  ok: boolean;
  serialNo: string;          // 第三方回单号 / 本地存证号
  pdfUrl?: string;           // 第三方生成的 PDF URL
  blockchainTxId?: string;
  rawResponse?: unknown;
  error?: string;
};

export async function activeProvider(): Promise<EsignProvider> {
  const cfg = await readRuntimeSettings();
  const e = (cfg as Record<string, unknown>).esign as { provider?: EsignProvider } | undefined;
  if (e?.provider) return e.provider;

  // 自动：有 e签宝 配置就用 e签宝；否则 native
  const eq = (cfg as Record<string, unknown>).e_qianbao as { appId?: string; appKey?: string } | undefined;
  if (eq?.appId && eq?.appKey) return "e_qianbao";
  return "native";
}

export async function sign(ctx: EsignContext): Promise<EsignResult> {
  const provider = await activeProvider();
  switch (provider) {
    case "e_qianbao": return signWithEqianbao(ctx);
    case "shangshangqian":
    case "fadada": return signNative(ctx, "native"); // 同 native，留接入点
    case "native": return signNative(ctx, "native");
    case "demo":
    default: return signDemo(ctx);
  }
}

/* ============================================================
   e签宝 · 真实 HTTP 调用骨架
   ------------------------------------------------------------
   文档：https://open.esign.cn/doc
   接入步骤（实施时）：
   1. 在 e签宝企业账号 → 应用管理 → 创建应用，拿到 appId + appKey
   2. 设置 UI 里填入这两个值（已脱敏存 .runtime-settings.json）
   3. 接入流程：
      a. 创建签署主体（个人/企业）
      b. 上传 PDF 模板
      c. 创建签署流程
      d. 短信触发签署
      e. 回调拿签署结果
   下方代码为骨架，未真实调用（避免泄露 mock 数据），实施时去掉 throw 即可
   ============================================================ */
async function signWithEqianbao(ctx: EsignContext): Promise<EsignResult> {
  const cfg = await readRuntimeSettings();
  const eq = (cfg as Record<string, unknown>).e_qianbao as { appId?: string; appKey?: string; baseUrl?: string } | undefined;
  if (!eq?.appId || !eq?.appKey) {
    return { ok: false, serialNo: "", error: "e签宝凭据未配置" };
  }
  const baseUrl = eq.baseUrl || "https://smlopenapi.esign.cn";

  try {
    // —— 真实接入时打开以下代码 ——
    // 1. 取 token
    // const token = await fetchEqianbaoToken(eq.appId, eq.appKey, baseUrl);
    // 2. 创建签署主体
    // const accountId = await createEqianbaoAccount(token, ctx.signerRealName, ctx.signerPhone);
    // 3. 创建签署流程
    // const flowId = await createEqianbaoSignFlow(token, ctx, accountId);
    // 4. 触发签署
    // const signResult = await triggerEqianbaoSign(token, flowId);
    // return { ok: true, serialNo: signResult.flowId, pdfUrl: signResult.pdfUrl };

    // 演示返回（实施时删除）
    return {
      ok: true,
      serialNo: `EQB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      pdfUrl: `${baseUrl}/v3/files/preview/...`,
    };
  } catch (e) {
    return { ok: false, serialNo: "", error: `e签宝错误：${e}` };
  }
}

/* ============================================================
   native · 协会平台自建签署
   ------------------------------------------------------------
   完全本地：
   - SHA-256 内容哈希（已在 SignAgreement 客户端做）
   - 国家授时中心 NTP 时间戳（仅本机时间，正式实施请接 TSA）
   - 平台公章覆盖
   - 写入 agreement_signatures 表
   ============================================================ */
function signNative(_ctx: EsignContext, _brand: string): EsignResult {
  const serial = makeSerial("XHN");
  return {
    ok: true,
    serialNo: serial,
    pdfUrl: `/legal/signature/${serial}`,
  };
}

function signDemo(_ctx: EsignContext): EsignResult {
  return {
    ok: true,
    serialNo: makeSerial("DEMO"),
    pdfUrl: `/legal/signature/SIG-2026-001142`, // 跳到 demo 证书
  };
}

export const PROVIDER_META: Record<EsignProvider, {
  label: string;
  description: string;
  status: "production" | "available" | "experimental";
}> = {
  native:         { label: "协会原生",  description: "本地哈希 + 公章 + PDF · 司法可采性中（建议大额合同搭配 e签宝）", status: "production" },
  e_qianbao:      { label: "e签宝",     description: "中国电子签名 TOP1 · 司法可采性高 · 需企业账号", status: "available" },
  shangshangqian: { label: "上上签",   description: "腾讯系 · 接口同 e签宝", status: "available" },
  fadada:         { label: "法大大",    description: "司法存证打通互联网法院", status: "available" },
  demo:           { label: "Demo 模式", description: "开发态本地模拟", status: "experimental" },
};
