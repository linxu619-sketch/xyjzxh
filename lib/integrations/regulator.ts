import "server-only";
import { createHmac } from "node:crypto";
import { readRuntimeSettings } from "@/lib/runtime-config";

/* ============================================================
   监管平台对接框架（省厅 + 市局）
   ------------------------------------------------------------
   信阳市 → 河南省建设行业监管平台 单向推送
   - 工装报备同步（项目登记、施工备案、验收）
   - 企业资质实时核验（双向）
   - 调解结案数据 上报

   使用：
     await pushReport({ payload, target: 'provincial' })
   ============================================================ */

export type RegulatorTarget = "provincial" | "city";

type RegulatorConfig = {
  endpoint: string;
  apiKey: string;
  enabled: boolean;
};

async function getConfig(target: RegulatorTarget): Promise<RegulatorConfig | null> {
  const cfg = await readRuntimeSettings();
  const r = cfg.regulator;
  if (!r || !r.enabled) return null;
  const endpoint = target === "provincial" ? r.provincialEndpoint : r.cityEndpoint;
  const apiKey = target === "provincial" ? r.provincialApiKey : r.cityApiKey;
  if (!endpoint || !apiKey) return null;
  return { endpoint, apiKey, enabled: true };
}

/* ============================================================
   工装报备 → 监管字段映射
   ============================================================ */
export type ReportPayload = {
  reportId: string;       // 协会平台报备号
  projectName: string;
  projectType: "家装" | "工装" | "公装" | "市政";
  area: number;
  contractAmount: number;
  startDate: string;
  endDate: string;
  district: string;
  address: string;
  enterprise: {
    creditCode: string;   // 统一社会信用代码
    name: string;
    qualifications: string[];
  };
  responsibles: {
    role: "owner" | "project_manager" | "safety_officer" | "supervisor";
    name: string;
    certificateNo?: string;
  }[];
  insurance: {
    type: string;
    policyNo: string;
    amount: number;
  }[];
};

function mapToProvincial(p: ReportPayload) {
  // 河南省建设行业监管平台格式（示例 · 实际以省厅接口文档为准）
  return {
    bbbh: p.reportId,
    xmmc: p.projectName,
    xmlx: p.projectType,
    jzmj: p.area,
    htje: p.contractAmount,
    kgrq: p.startDate,
    jgrq: p.endDate,
    xzqh: p.district,
    xmdz: p.address,
    qy: {
      tyshxydm: p.enterprise.creditCode,
      qymc: p.enterprise.name,
      zz: p.enterprise.qualifications,
    },
    zrr: p.responsibles.map((r) => ({
      jsmc: roleToProvincialCode(r.role),
      xm: r.name,
      zsbh: r.certificateNo ?? "",
    })),
    bx: p.insurance,
  };
}

function roleToProvincialCode(role: string): string {
  switch (role) {
    case "owner": return "QYFR";
    case "project_manager": return "XMJL";
    case "safety_officer": return "AQY";
    case "supervisor": return "JLY";
    default: return "QT";
  }
}

/* ============================================================
   签名 · 防篡改
   ============================================================ */
function sign(body: string, key: string): { ts: string; sig: string } {
  const ts = String(Date.now());
  const h = createHmac("sha256", key);
  h.update(ts + body);
  return { ts, sig: h.digest("hex") };
}

/* ============================================================
   推送主函数 — 失败自动重试 + 入队
   ============================================================ */
export async function pushReport(opts: {
  payload: ReportPayload;
  target: RegulatorTarget;
  retries?: number;
}): Promise<{
  ok: boolean;
  receiptNo?: string;
  attempts: number;
  error?: string;
}> {
  const { payload, target } = opts;
  const cfg = await getConfig(target);
  if (!cfg) return { ok: false, attempts: 0, error: `${target} 未启用 / 未配置` };

  const body = JSON.stringify(target === "provincial" ? mapToProvincial(payload) : payload);
  const { ts, sig } = sign(body, cfg.apiKey);

  const maxRetry = opts.retries ?? 3;
  let lastError = "";

  for (let i = 1; i <= maxRetry; i++) {
    try {
      const res = await fetch(cfg.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Sign-Timestamp": ts,
          "X-Sign-Signature": sig,
          "X-Source": "XYJZXH-Platform",
        },
        body,
      });
      if (!res.ok) {
        lastError = `HTTP ${res.status} ${await res.text().catch(() => "")}`;
        continue;
      }
      const json = (await res.json().catch(() => ({}))) as { receiptNo?: string };
      return { ok: true, receiptNo: json.receiptNo, attempts: i };
    } catch (e) {
      lastError = String(e);
    }
    // 指数退避
    await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i - 1)));
  }

  // 失败 → 入持久化重试队列（生产应写到 DB）
  await enqueueRetry({ payload, target, lastError, attempts: maxRetry });
  return { ok: false, attempts: maxRetry, error: lastError };
}

/* ============================================================
   失败队列（生产用 Supabase regulator_retry_queue 表）
   ============================================================ */
const RETRY_QUEUE: Array<{
  payload: ReportPayload;
  target: RegulatorTarget;
  lastError: string;
  attempts: number;
  enqueuedAt: string;
}> = [];

async function enqueueRetry(item: Omit<typeof RETRY_QUEUE[0], "enqueuedAt">) {
  RETRY_QUEUE.push({ ...item, enqueuedAt: new Date().toISOString() });
  console.warn("[regulator] 入队等待重试:", item.payload.reportId, item.lastError);
}

export function getRetryQueue() {
  return RETRY_QUEUE;
}

/* ============================================================
   连接测试 — 设置页面用
   ============================================================ */
export async function pingRegulator(target: RegulatorTarget): Promise<{
  ok: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const cfg = await getConfig(target);
  if (!cfg) return { ok: false, error: "未配置或未启用" };
  const t0 = Date.now();
  try {
    const res = await fetch(cfg.endpoint, {
      method: "OPTIONS",
      headers: { "X-Source": "XYJZXH-Platform" },
    });
    return { ok: res.ok, latencyMs: Date.now() - t0 };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
