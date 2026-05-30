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
const DEFAULT_MODEL = "deepseek-chat";

export async function streamDeepseek({
  system,
  messages,
  maxTokens = 1024,
}: {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
}): Promise<ReadableStream<Uint8Array>> {
  const cfg = (await readRuntimeSettings()).ai ?? {};
  const apiKey = cfg.deepseekApiKey || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not set");

  const base = cfg.deepseekBaseUrl || process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE;
  const model = cfg.deepseekModel || process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;

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

  return new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader();
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
            const text = handleEvent(raw);
            if (text === "__DONE__") {
              controller.close();
              return;
            }
            if (text) controller.enqueue(encoder.encode(text));
          }
        }
      } catch (err) {
        controller.enqueue(encoder.encode(`\n\n[DeepSeek 流式错误] ${String(err)}`));
      } finally {
        controller.close();
      }
    },
  });
}

function handleEvent(raw: string): string | "__DONE__" | null {
  // 一个事件可能有多行：data: xxx / data: xxx / event: ...
  const lines = raw.split("\n");
  let dataPayload = "";
  for (const ln of lines) {
    if (ln.startsWith("data:")) dataPayload += ln.slice(5).trim() + "\n";
  }
  dataPayload = dataPayload.trim();
  if (!dataPayload) return null;
  if (dataPayload === "[DONE]") return "__DONE__";

  try {
    const obj = JSON.parse(dataPayload) as {
      choices?: Array<{ delta?: { content?: string; reasoning_content?: string } }>;
    };
    const delta = obj.choices?.[0]?.delta;
    // R1 推理模型在结束前可能输出 reasoning_content，再输出 content；这里都传给前端
    const piece =
      (delta?.reasoning_content ? `🧠 ${delta.reasoning_content}` : "") +
      (delta?.content ?? "");
    return piece || null;
  } catch {
    return null;
  }
}
