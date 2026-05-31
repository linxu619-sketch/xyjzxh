import { NextRequest } from "next/server";
import { getAi } from "@/lib/ai/prompts";
import { streamChat, type Msg } from "@/lib/ai/chat";
import { buildKnowledgeBlock } from "@/lib/ai/knowledge";
import { retrieveKnowledge } from "@/lib/ai/knowledge-source";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { key, messages } = (await req.json()) as { key: string; messages: Msg[] };
  const ai = getAi(key);
  if (!ai) return new Response("Unknown AI employee", { status: 404 });

  // RAG：按最新一条用户问题检索该员工的知识库，拼进 system 提示词
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const hits = retrieveKnowledge(key, lastUser, 3);
  const system = ai.system + buildKnowledgeBlock(hits);

  const { provider, stream } = await streamChat({
    ai: { name: ai.name, role: ai.role, system },
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
