"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffPermission } from "@/lib/auth/guard";
import { createKnowledge, updateKnowledge, deleteKnowledge, setKnowledgeHot, getKnowledgeArticle, type KnowledgeInput } from "@/lib/data/knowledge-source";
import { getDraft, listDrafts, setDraftStatus, deleteDraft } from "@/lib/data/knowledge-drafts-source";
import { addSource, setSourceEnabled, deleteSource } from "@/lib/data/knowledge-sources-source";
import { runKnowledgeFetch, backfillArticleBodies } from "@/lib/ai/knowledge-fetch";
import type { KnowledgeSection } from "@/lib/data/knowledge";
import type { SourceKind } from "@/lib/data/knowledge-sources";

async function requireAssoc() {
  return requireStaffPermission("knowledge");
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
    body: String(fd.get("body") || "").trim() || undefined,
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

/* ============================================================
   AI 自动抓取 + 草稿箱审核入库
   ============================================================ */

export async function runKnowledgeFetchAction() {
  await requireAssoc();
  const summary = await runKnowledgeFetch();
  revalidatePath("/dashboard/association/knowledge/drafts");
  revalidatePath("/dashboard/association/knowledge");
  redirect(`/dashboard/association/knowledge/drafts?fetched=${summary.totalNew}&ai=${summary.usedAI ? 1 : 0}`);
}

// 一次性回填：给旧的「有原文链接但无正文」文章补抓全文（单次限量，可重复点）
export async function backfillBodiesAction() {
  await requireAssoc();
  const r = await backfillArticleBodies(12);
  revalidatePath("/dashboard/association/knowledge");
  revalidatePath("/knowledge");
  redirect(`/dashboard/association/knowledge?bf=${r.filled}_${r.failed}_${r.scanned}`);
}

// 草稿「通过并入库」：用（可人工编辑后的）表单字段创建正式文章，并标记草稿已通过
export async function approveDraftAction(fd: FormData) {
  const s = await requireAssoc();
  const draftId = String(fd.get("draftId") || "").trim();
  const d = draftId ? getDraft(draftId) : undefined;
  if (!d) redirect("/dashboard/association/knowledge/drafts");
  if (d!.status !== "pending") redirect(`/dashboard/association/knowledge/drafts/${draftId}`);
  const input = readInput(fd);
  if (!input.title) redirect(`/dashboard/association/knowledge/drafts/${draftId}?kerr=1`);
  input.sourceUrl = d!.sourceUrl || undefined;
  input.sourceName = d!.sourceName || undefined;
  const articleId = createKnowledge(input);
  setDraftStatus(draftId, "approved", s.name || "协会", articleId);
  revalidatePath("/dashboard/association/knowledge");
  revalidatePath("/dashboard/association/knowledge/drafts");
  revalidatePath("/knowledge");
  redirect(`/dashboard/association/knowledge/${articleId}?saved=1`);
}

// 批量：把当前所有待审草稿一次性按原样入库（不逐条编辑）
export async function approveAllDraftsAction() {
  const s = await requireAssoc();
  const by = s.name || "协会";
  const pending = listDrafts("pending");
  let n = 0;
  for (const d of pending) {
    const articleId = createKnowledge({
      title: d.title, category: d.category, tags: d.tags, date: todayStr(),
      hot: false, excerpt: d.excerpt, content: d.content, body: d.body || undefined,
      sourceUrl: d.sourceUrl || undefined, sourceName: d.sourceName || undefined,
    });
    setDraftStatus(d.id, "approved", by, articleId);
    n++;
  }
  revalidatePath("/dashboard/association/knowledge");
  revalidatePath("/dashboard/association/knowledge/drafts");
  revalidatePath("/knowledge");
  redirect(`/dashboard/association/knowledge/drafts?approved=${n}`);
}

export async function rejectDraftAction(fd: FormData) {
  const s = await requireAssoc();
  const draftId = String(fd.get("draftId") || "").trim();
  if (draftId && getDraft(draftId)) setDraftStatus(draftId, "rejected", s.name || "协会");
  revalidatePath("/dashboard/association/knowledge/drafts");
  redirect(`/dashboard/association/knowledge/drafts/${draftId}`);
}

export async function deleteDraftAction(fd: FormData) {
  await requireAssoc();
  const draftId = String(fd.get("draftId") || "").trim();
  if (draftId) deleteDraft(draftId);
  revalidatePath("/dashboard/association/knowledge/drafts");
  redirect("/dashboard/association/knowledge/drafts");
}

/* ---------- 抓取来源管理 ---------- */

export async function addSourceAction(fd: FormData) {
  await requireAssoc();
  const name = String(fd.get("name") || "").trim();
  const url = String(fd.get("url") || "").trim();
  const kind = (["sample", "rss", "html"].includes(String(fd.get("kind"))) ? String(fd.get("kind")) : "html") as SourceKind;
  const category = String(fd.get("category") || "地方政策").trim();
  if (name && url) addSource({ name, url, kind, category });
  revalidatePath("/dashboard/association/knowledge/sources");
  redirect("/dashboard/association/knowledge/sources");
}

export async function toggleSourceAction(fd: FormData) {
  await requireAssoc();
  const id = String(fd.get("id") || "").trim();
  const enabled = String(fd.get("enabled") || "") === "1";
  if (id) setSourceEnabled(id, enabled);
  revalidatePath("/dashboard/association/knowledge/sources");
  redirect(`/dashboard/association/knowledge/sources/${id}`);
}

export async function deleteSourceAction(fd: FormData) {
  await requireAssoc();
  const id = String(fd.get("id") || "").trim();
  if (id) deleteSource(id);
  revalidatePath("/dashboard/association/knowledge/sources");
  redirect("/dashboard/association/knowledge/sources");
}
