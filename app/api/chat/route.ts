import { NextRequest } from "next/server";
import { getAi } from "@/lib/ai/prompts";
import { streamChat, type Msg } from "@/lib/ai/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { key, messages } = (await req.json()) as { key: string; messages: Msg[] };
  const ai = getAi(key);
  if (!ai) return new Response("Unknown AI employee", { status: 404 });

  const { provider, stream } = await streamChat({
    ai: { name: ai.name, role: ai.role, system: ai.system },
    messages,
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-AI-Provider": provider,
      "Cache-Control": "no-store",
    },
  });
}
