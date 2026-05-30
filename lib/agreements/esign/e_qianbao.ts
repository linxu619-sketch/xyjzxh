import "server-only";
import { createHmac } from "node:crypto";
import { readRuntimeSettings } from "@/lib/runtime-config";

/* ============================================================
   e签宝（e-Qianbao）开放平台 API client
   ------------------------------------------------------------
   官方文档：https://open.esign.cn/doc
   接入步骤：
   1. e签宝企业账号 → 应用管理 → 创建应用
   2. 拿到 appId + appKey
   3. 系统设置 → 对外集成 → e签宝 填入两个值
   4. 创建协会"统一签署主体"账号（个人/企业模式）
   ============================================================ */

type EqianbaoConfig = {
  appId: string;
  appKey: string;
  baseUrl: string;
  callbackUrl?: string;
};

async function getConfig(): Promise<EqianbaoConfig | null> {
  const cfg = await readRuntimeSettings();
  const eq = (cfg as Record<string, unknown>).e_qianbao as Partial<EqianbaoConfig> | undefined;
  const appId = eq?.appId || process.env.EQIANBAO_APP_ID || "";
  const appKey = eq?.appKey || process.env.EQIANBAO_APP_KEY || "";
  if (!appId || !appKey) return null;
  return {
    appId,
    appKey,
    baseUrl: eq?.baseUrl || process.env.EQIANBAO_BASE_URL || "https://smlopenapi.esign.cn",
    callbackUrl: eq?.callbackUrl || process.env.EQIANBAO_CALLBACK_URL,
  };
}

/* ============================================================
   签名 / 时间戳 工具
   e签宝 v3 用 HMAC-SHA256 + Bearer token
   ============================================================ */
function signRequest(method: string, path: string, body: string, appKey: string, timestamp: number, nonce: string) {
  const contentMd5 = body ? hmacSha256("md5", body, appKey) : "";
  const stringToSign = [
    method.toUpperCase(),
    "*/*",
    contentMd5,
    "application/json; charset=utf-8",
    "",
    `X-Tsign-Open-Ca-Timestamp:${timestamp}`,
    `X-Tsign-Open-Ca-Nonce:${nonce}`,
    path,
  ].join("\n");
  return hmacSha256("hex", stringToSign, appKey);
}

function hmacSha256(format: "hex" | "md5", payload: string, secret: string) {
  const h = createHmac("sha256", secret);
  h.update(payload);
  return h.digest("hex");
}

async function call<T = unknown>(
  cfg: EqianbaoConfig,
  method: "GET" | "POST",
  path: string,
  body: Record<string, unknown> | null,
): Promise<{ ok: true; data: T } | { ok: false; error: string; code?: string }> {
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).slice(2, 12);
  const bodyStr = body ? JSON.stringify(body) : "";
  const signature = signRequest(method, path, bodyStr, cfg.appKey, timestamp, nonce);

  try {
    const res = await fetch(`${cfg.baseUrl}${path}`, {
      method,
      headers: {
        "Accept": "*/*",
        "Content-Type": "application/json; charset=utf-8",
        "X-Tsign-Open-App-Id": cfg.appId,
        "X-Tsign-Open-Ca-Timestamp": String(timestamp),
        "X-Tsign-Open-Ca-Nonce": nonce,
        "X-Tsign-Open-Ca-Signature": signature,
      },
      body: bodyStr || undefined,
    });
    const json = (await res.json().catch(() => ({}))) as { code?: number; message?: string; data?: T };
    if (json.code !== 0) {
      return { ok: false, error: json.message ?? "未知错误", code: String(json.code) };
    }
    return { ok: true, data: json.data as T };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/* ============================================================
   1. 创建/获取个人签署主体
   ============================================================ */
export async function ensurePersonalAccount(opts: {
  realName: string;
  idCard: string;       // 客户端先脱敏 hash 后存库，此处仅当次调用，不入库
  mobile: string;
}): Promise<{ ok: boolean; accountId?: string; error?: string }> {
  const cfg = await getConfig();
  if (!cfg) return { ok: false, error: "e签宝未配置" };

  const r = await call<{ accountId: string }>(cfg, "POST", "/v3/persons/identities", {
    psnAccount: { mobile: opts.mobile, idCardInfo: { idCardNo: opts.idCard }, name: opts.realName },
  });
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true, accountId: r.data.accountId };
}

/* ============================================================
   2. 创建签署流程（基于协议 PDF 模板）
   ============================================================ */
export async function createSignFlow(opts: {
  templateId: string;
  templateTitle: string;
  signerAccountId: string;
  pdfFileId: string;       // 预先上传到 e签宝的 PDF fileId
}): Promise<{ ok: boolean; flowId?: string; error?: string }> {
  const cfg = await getConfig();
  if (!cfg) return { ok: false, error: "e签宝未配置" };

  const r = await call<{ signFlowId: string }>(cfg, "POST", "/v3/sign-flow/create-by-file", {
    docs: [{ fileId: opts.pdfFileId, fileName: opts.templateTitle }],
    signFlowConfig: {
      signFlowTitle: opts.templateTitle,
      autoStart: false,
      notifyUrl: cfg.callbackUrl,
    },
    signers: [
      {
        signerType: 0,      // 0 = 个人
        psnSignerInfo: { psnAccount: opts.signerAccountId },
        signFields: [
          {
            fileId: opts.pdfFileId,
            normalSignFieldConfig: {
              freeMode: true,
              autoSign: false,
              positionPage: "1",  // 简化：签在首页
              positionX: 100,
              positionY: 100,
              width: 120,
              height: 60,
            },
          },
        ],
      },
    ],
  });
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true, flowId: r.data.signFlowId };
}

/* ============================================================
   3. 触发短信签署
   ============================================================ */
export async function triggerSign(flowId: string): Promise<{ ok: boolean; signUrl?: string; error?: string }> {
  const cfg = await getConfig();
  if (!cfg) return { ok: false, error: "e签宝未配置" };

  const r = await call<{ shortUrl: string }>(cfg, "POST", `/v3/sign-flow/${flowId}/start`, {});
  if (!r.ok) return { ok: false, error: r.error };

  // 拉短链供前端发短信
  const url = await call<{ url: string }>(cfg, "POST", `/v3/sign-flow/${flowId}/sign-url`, {
    operator: { psnAccount: "" }, // 由调用方填充
    redirectUrl: cfg.callbackUrl,
  });
  return { ok: true, signUrl: url.ok ? url.data.url : r.data.shortUrl };
}

/* ============================================================
   4. 查询签署状态
   ============================================================ */
export async function querySignFlow(flowId: string): Promise<{
  ok: boolean;
  status?: "INIT" | "SIGNING" | "COMPLETE" | "FINISH" | "REJECT" | "EXPIRED" | "REVOKE";
  pdfUrl?: string;
  error?: string;
}> {
  const cfg = await getConfig();
  if (!cfg) return { ok: false, error: "e签宝未配置" };

  const r = await call<{ signFlowStatus: number; signFlowDescription: string; files: Array<{ downloadUrl: string }> }>(
    cfg, "GET", `/v3/sign-flow/${flowId}/detail`, null,
  );
  if (!r.ok) return { ok: false, error: r.error };

  const map: Record<number, "INIT" | "SIGNING" | "COMPLETE" | "FINISH" | "REJECT" | "EXPIRED" | "REVOKE"> = {
    0: "INIT", 1: "SIGNING", 2: "COMPLETE", 3: "FINISH", 5: "REJECT", 7: "EXPIRED", 8: "REVOKE",
  };
  return {
    ok: true,
    status: map[r.data.signFlowStatus] ?? "INIT",
    pdfUrl: r.data.files?.[0]?.downloadUrl,
  };
}

/* ============================================================
   5. 验签回调 — webhook 安全校验
   ============================================================ */
export async function verifyCallback(headers: Record<string, string>, rawBody: string): Promise<boolean> {
  const cfg = await getConfig();
  if (!cfg) return false;
  const sig = headers["x-tsign-open-signature"];
  if (!sig) return false;
  const expected = hmacSha256("hex", rawBody, cfg.appKey);
  return sig === expected;
}
