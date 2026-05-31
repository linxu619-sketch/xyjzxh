"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  addKnowledge,
  updateKnowledge,
  deleteKnowledge,
  setKnowledgeEnabled,
} from "@/lib/ai/knowledge-source";

const PATH = "/dashboard/association/ai/knowledge";

async function ensure() {
  const s = await getSession();
  if (!s || (s.role !== "association" && s.role !== "system_admin")) {
    throw new Error("无权限：仅协会工作人员可维护知识库");
  }
}

function parseKeywords(s: string): string[] {
  return s.split(/[,，、\s]+/).map((x) => x.trim()).filter(Boolean);
}

function back(emp: string): never {
  revalidatePath(PATH);
  redirect(`${PATH}?emp=${encodeURIComponent(emp)}`);
}

export async function addKnowledgeAction(fd: FormData) {
  await ensure();
  const emp = String(fd.get("emp") || "");
  const title = String(fd.get("title") || "").trim();
  const content = String(fd.get("content") || "").trim();
  if (emp && title && content) {
    addKnowledge({
      employeeKey: emp,
      title,
      content,
      keywords: parseKeywords(String(fd.get("keywords") || "")),
      source: String(fd.get("source") || "").trim() || undefined,
    });
  }
  back(emp);
}

export async function updateKnowledgeAction(fd: FormData) {
  await ensure();
  const emp = String(fd.get("emp") || "");
  const id = String(fd.get("id") || "");
  if (id) {
    updateKnowledge(id, {
      title: String(fd.get("title") || "").trim(),
      content: String(fd.get("content") || "").trim(),
      keywords: parseKeywords(String(fd.get("keywords") || "")),
      source: String(fd.get("source") || "").trim() || undefined,
    });
  }
  back(emp);
}

export async function deleteKnowledgeAction(fd: FormData) {
  await ensure();
  const emp = String(fd.get("emp") || "");
  const id = String(fd.get("id") || "");
  if (id) deleteKnowledge(id);
  back(emp);
}

export async function toggleKnowledgeAction(fd: FormData) {
  await ensure();
  const emp = String(fd.get("emp") || "");
  const id = String(fd.get("id") || "");
  if (id) setKnowledgeEnabled(id, String(fd.get("enabled") || "") === "1");
  back(emp);
}

/* ---------------- AI 提炼草稿（人审入库）---------------- */

export type DraftState =
  | { ok: null }
  | { ok: true; title: string; keywords: string; content: string }
  | { ok: false; error: string };

async function readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const dec = new TextDecoder();
  let s = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    s += dec.decode(value, { stream: true });
  }
  return s;
}

export async function draftKnowledgeAction(_prev: DraftState, fd: FormData): Promise<DraftState> {
  await ensure();
  const emp = String(fd.get("emp") || "");
  const topic = String(fd.get("topic") || "").trim();
  if (!topic) return { ok: false, error: "请先输入或选择一个问题/话题" };

  const { AI_PROMPTS } = await import("@/lib/ai/prompts");
  const { streamChat } = await import("@/lib/ai/chat");
  const p = (AI_PROMPTS as Record<string, { name?: string; role?: string }>)[emp];
  const who = p ? `${p.name ?? ""}（${p.role ?? ""}）` : "该 AI 员工";

  const system =
    `你是协会 AI 知识库的编辑助手。根据给定的「问题或话题」，为 AI 员工「${who}」起草一条知识库词条。\n` +
    `严格只输出一个 JSON 对象，不要任何解释、前后缀或代码块标记：\n` +
    `{"title":"简短标题","keywords":["关键词1","关键词2","关键词3"],"content":"准确、简洁、可执行的知识内容"}\n` +
    `要求：用简体中文；content 2-4 句；keywords 取用户可能用到的检索词；不要编造协会未公开的具体数字/电话/人名，信息不足时给通用稳妥说明。`;

  try {
    const { stream } = await streamChat({
      ai: { name: who, role: "知识编辑", system },
      messages: [{ role: "user", content: topic }],
    });
    const raw = await readStream(stream);
    const noThink = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    const m = noThink.match(/\{[\s\S]*\}/);
    if (!m) return { ok: false, error: "AI 未返回有效草稿，请重试或手动填写" };
    const obj = JSON.parse(m[0]) as { title?: string; keywords?: string[]; content?: string };
    return {
      ok: true,
      title: (obj.title ?? "").trim(),
      keywords: Array.isArray(obj.keywords) ? obj.keywords.join(", ") : "",
      content: (obj.content ?? "").trim(),
    };
  } catch (e) {
    return { ok: false, error: `提炼失败：${String(e).slice(0, 120)}` };
  }
}
