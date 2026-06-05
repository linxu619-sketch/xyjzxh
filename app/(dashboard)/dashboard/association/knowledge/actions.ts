"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { createKnowledge, updateKnowledge, deleteKnowledge, setKnowledgeHot, getKnowledgeArticle, type KnowledgeInput } from "@/lib/data/knowledge-source";
import type { KnowledgeSection } from "@/lib/data/knowledge";

async function requireAssoc() {
  const s = await getSession();
  if (!s || (s.role !== "association" && s.role !== "system_admin")) throw new Error("无权限：仅协会工作人员可管理知识库");
}

function todayStr(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function parseSections(raw: string): KnowledgeSection[] {
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((s) => ({
        h: String(s?.h || "内容要点").trim() || "内容要点",
        points: Array.isArray(s?.points) ? s.points.map((p: unknown) => String(p).trim()).filter(Boolean) : [],
      }))
      .filter((s) => s.points.length);
  } catch {
    return [];
  }
}

function readInput(fd: FormData, keepDate?: string): KnowledgeInput {
  return {
    title: String(fd.get("title") || "").trim(),
    category: String(fd.get("category") || "技术资料").trim(),
    tags: String(fd.get("tags") || "").split(/[\n,，、]+/).map((x) => x.trim()).filter(Boolean).slice(0, 8),
    date: String(fd.get("date") || "").trim() || keepDate || todayStr(),
    size: String(fd.get("size") || "").trim() || undefined,
    hot: String(fd.get("hot") || "") === "1",
    excerpt: String(fd.get("excerpt") || "").trim(),
    content: parseSections(String(fd.get("content") || "")),
    fileUrl: String(fd.get("fileUrl") || "").trim() || undefined,
    fileName: String(fd.get("fileName") || "").trim() || undefined,
  };
}

export async function createKnowledgeAction(fd: FormData) {
  await requireAssoc();
  const input = readInput(fd);
  if (!input.title) redirect("/dashboard/association/knowledge?kerr=1");
  const id = createKnowledge(input);
  revalidatePath("/dashboard/association/knowledge");
  revalidatePath("/knowledge");
  redirect(`/dashboard/association/knowledge/${id}?saved=1`);
}

export async function updateKnowledgeAction(fd: FormData) {
  await requireAssoc();
  const id = String(fd.get("id") || "").trim();
  const cur = id ? getKnowledgeArticle(id) : undefined;
  if (!cur) redirect("/dashboard/association/knowledge");
  const input = readInput(fd, cur!.date);
  if (input.title) updateKnowledge(id, input);
  revalidatePath("/dashboard/association/knowledge");
  revalidatePath("/knowledge");
  revalidatePath(`/knowledge/${id}`);
  redirect(`/dashboard/association/knowledge/${id}?saved=1`);
}

export async function toggleKnowledgeHotAction(fd: FormData) {
  await requireAssoc();
  const id = String(fd.get("id") || "").trim();
  const hot = String(fd.get("hot") || "") === "1";
  if (id && getKnowledgeArticle(id)) setKnowledgeHot(id, hot);
  revalidatePath("/dashboard/association/knowledge");
  revalidatePath("/knowledge");
  redirect(`/dashboard/association/knowledge/${id}`);
}

export async function deleteKnowledgeAction(fd: FormData) {
  await requireAssoc();
  const id = String(fd.get("id") || "").trim();
  if (id) deleteKnowledge(id);
  revalidatePath("/dashboard/association/knowledge");
  revalidatePath("/knowledge");
  redirect("/dashboard/association/knowledge");
}
