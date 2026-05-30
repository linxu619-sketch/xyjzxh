import "server-only";
import { streamDeepseek } from "./providers/deepseek";
import { streamAnthropic } from "./providers/anthropic";
import { streamDemo } from "./providers/demo";
import { readRuntimeSettings } from "@/lib/runtime-config";

export type Msg = { role: "user" | "assistant"; content: string };

export type Provider = "deepseek" | "anthropic" | "demo";

export async function activeProvider(): Promise<Provider> {
  const cfg = (await readRuntimeSettings()).ai ?? {};

  // 1. UI 系统设置里强制指定（auto 表示让代码自动选）
  if (cfg.provider === "deepseek" || cfg.provider === "anthropic") return cfg.provider;

  // 2. 环境变量强制指定
  const forced = process.env.AI_PROVIDER as Provider | undefined;
  if (forced === "deepseek" || forced === "anthropic" || forced === "demo") return forced;

  // 3. 自动：哪个有 key 用哪个
  if (cfg.deepseekApiKey || process.env.DEEPSEEK_API_KEY) return "deepseek";
  if (cfg.anthropicApiKey || process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "demo";
}

export async function streamChat({
  ai,
  messages,
}: {
  ai: { name: string; role: string; system: string };
  messages: Msg[];
}): Promise<{ provider: Provider; stream: ReadableStream<Uint8Array> }> {
  const provider = await activeProvider();
  try {
    if (provider === "deepseek") {
      return { provider, stream: await streamDeepseek({ system: ai.system, messages }) };
    }
    if (provider === "anthropic") {
      return { provider, stream: await streamAnthropic({ system: ai.system, messages }) };
    }
  } catch (err) {
    // upstream 出错也降级到 demo，避免前端 500
    const fallback = `（${provider} 接入异常，已临时降级演示）\n\n${String(err)}`;
    return { provider: "demo", stream: streamDemo(fallback) };
  }

  const last = messages.at(-1)?.content?.slice(0, 30) ?? "";
  const demo =
    `（演示模式）你好，我是${ai.name}·${ai.role}。\n\n` +
    `当前未配置 DEEPSEEK_API_KEY / ANTHROPIC_API_KEY，所以无法真正回答你刚才说的"${last}…"。\n\n` +
    `配置方法（任选其一）：\n` +
    `  1) 推荐 — 在 .env.local 写：\n` +
    `     DEEPSEEK_API_KEY=sk-...\n` +
    `     # 可选： DEEPSEEK_MODEL=deepseek-chat | deepseek-reasoner\n\n` +
    `  2) 或者 Claude：\n` +
    `     ANTHROPIC_API_KEY=sk-ant-...\n\n` +
    `保存后 dev 自动热加载，无需重启。`;
  return { provider: "demo", stream: streamDemo(demo) };
}
