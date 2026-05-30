import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { readRuntimeSettings } from "@/lib/runtime-config";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function streamAnthropic({
  system,
  messages,
  maxTokens = 1024,
}: {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
}): Promise<ReadableStream<Uint8Array>> {
  const cfg = (await readRuntimeSettings()).ai ?? {};
  const apiKey = cfg.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const client = new Anthropic({ apiKey });
  const model = cfg.anthropicModel || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

  const stream = await client.messages.stream({
    model,
    max_tokens: maxTokens,
    system: [
      {
        type: "text",
        text: system,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const ev of stream) {
          if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(ev.delta.text));
          }
        }
      } catch (err) {
        controller.enqueue(encoder.encode(`\n\n[Claude 流式错误] ${String(err)}`));
      } finally {
        controller.close();
      }
    },
  });
}
