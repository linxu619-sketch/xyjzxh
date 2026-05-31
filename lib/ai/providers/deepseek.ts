import "server-only";
import { readRuntimeSettings } from "@/lib/runtime-config";

/* ============================================================
   DeepSeek 流式聊天（OpenAI 兼容 · SSE）
   ------------------------------------------------------------
   配置来源优先级：
     1. .runtime-settings.json (系统设置 UI 写入)
     2. 环境变量 DEEPSEEK_API_KEY / DEEPSEEK_MODEL / DEEPSEEK_BASE_URL
   ============================================================ */

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const DEFAULT_BASE = "https://api.deepseek.com";
// V4：flash 性价比优先；如需最高能力可配置 deepseek-v4-pro
const DEFAULT_MODEL = "deepseek-v4-flash";
// 旧别名 deepseek-chat / deepseek-reasoner 将于 2026-07-24 停用，自动迁移到 V4
const LEGACY_MODEL_MAP: Record<string, string> = {
  "deepseek-chat": "deepseek-v4-flash",
  "deepseek-reasoner": "deepseek-v4-flash",
};

export async function streamDeepseek({
  system,
  messages,
  maxTokens = 2048,
}: {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
}): Promise<ReadableStream<Uint8Array>> {
  const cfg = (await readRuntimeSettings()).ai ?? {};
  const apiKey = cfg.deepseekApiKey || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not set");

  const base = cfg.deepseekBaseUrl || process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE;
  const rawModel = cfg.deepseekModel || process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
  const model = LEGACY_MODEL_MAP[rawModel] ?? rawModel;
  // 思考模式：V4 用 thinking 参数控制（不再分模型）。
  // 旧 deepseek-chat 原本是「非思考」，保留其语义；其余（reasoner / v4）默认开启思考。
  const thinkingEnabled = rawModel !== "deepseek-chat";

  const upstream = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: true,
      max_tokens: maxTokens,
      temperature: 0.6,
      thinking: { type: thinkingEnabled ? "enabled" : "disabled" },
      ...(thinkingEnabled ? { reasoning_effort: "high" } : {}),
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    throw new Error(`DeepSeek upstream ${upstream.status}: ${text.slice(0, 200)}`);
  }

  // 将 SSE 解析为纯文本片段流
  return parseSseToText(upstream.body);
}

function parseSseToText(upstream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  // 推理模型(reasoner)会先吐 reasoning_content 再吐 content；
  // 把思考整体包进 <think>…</think>，前端据此渲染可折叠的「思考过程」。
  let thinkOpen = false;
  let closed = false;

  return new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader();
      const safeEnqueue = (s: string) => {
        if (!closed && s) controller.enqueue(encoder.encode(s));
      };
      const safeClose = () => {
        if (!closed) { closed = true; controller.close(); }
      };
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // SSE 事件以 \n\n 分隔
          let idx: number;
          while ((idx = buffer.indexOf("\n\n")) !== -1) {
            const raw = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            const ev = handleEvent(raw);
            if (!ev) continue;
            if (ev.done) {
              if (thinkOpen) { safeEnqueue("</think>"); thinkOpen = false; }
              safeClose();
              return;
            }
            let out = "";
            if (ev.reasoning) {
              if (!thinkOpen) { out += "<think>"; thinkOpen = true; }
              out += ev.reasoning;
            }
            if (ev.content) {
              if (thinkOpen) { out += "</think>"; thinkOpen = false; }
              out += ev.content;
            }
            safeEnqueue(out);
          }
        }
        if (thinkOpen) { safeEnqueue("</think>"); thinkOpen = false; }
      } catch {
        if (thinkOpen) { safeEnqueue("</think>"); thinkOpen = false; }
        safeEnqueue("\n\n[出错] 与 AI 的连接中断了，请点重试。");
      } finally {
        safeClose();
      }
    },
  });
}

type Delta = { done?: boolean; reasoning?: string; content?: string };

function handleEvent(raw: string): Delta | null {
  // 一个事件可能有多行：data: xxx / data: xxx / event: ...
  const lines = raw.split("\n");
  let dataPayload = "";
  for (const ln of lines) {
    if (ln.startsWith("data:")) dataPayload += ln.slice(5).trim() + "\n";
  }
  dataPayload = dataPayload.trim();
  if (!dataPayload) return null;
  if (dataPayload === "[DONE]") return { done: true };

  try {
    const obj = JSON.parse(dataPayload) as {
      choices?: Array<{ delta?: { content?: string; reasoning_content?: string } }>;
    };
    const delta = obj.choices?.[0]?.delta;
    if (!delta) return null;
    return { reasoning: delta.reasoning_content ?? undefined, content: delta.content ?? undefined };
  } catch {
    return null;
  }
}
