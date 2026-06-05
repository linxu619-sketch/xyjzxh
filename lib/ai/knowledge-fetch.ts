import "server-only";
import { activeProvider } from "@/lib/ai/chat";
import { streamDeepseek } from "@/lib/ai/providers/deepseek";
import { streamAnthropic } from "@/lib/ai/providers/anthropic";
import { listSources, touchSourceRun } from "@/lib/data/knowledge-sources-source";
import { createDraft, seenSourceUrls } from "@/lib/data/knowledge-drafts-source";
import { SAMPLE_CANDIDATES, type KnowledgeSource } from "@/lib/data/knowledge-sources";
import type { KnowledgeSection } from "@/lib/data/knowledge";

/* ============================================================
   AI 知识库自动抓取 + 起草（草稿箱待审）
   ------------------------------------------------------------
   流程：遍历启用来源 → 抓候选 → 按原文链接去重 → AI 起草成草稿
   AI 不可用（demo / 调用失败）时走启发式兜底，保证离线也能跑通。
   全程不直接发布，仅写入 knowledge_drafts（pending）。
   ============================================================ */

const CATEGORIES = ["国标规范", "地方政策", "技术资料", "典型案例", "合同范本"] as const;
const MAX_NEW_PER_RUN = 6;       // 单次抓取最多起草几条草稿（控制 AI 调用成本）
const MAX_CANDIDATES_PER_SRC = 8;
const FETCH_TIMEOUT_MS = 9000;

type Candidate = { title: string; url: string; snippet: string };

export type SourceResult = { id: string; name: string; found: number; drafted: number; error?: string };
export type FetchSummary = { totalNew: number; usedAI: boolean; sources: SourceResult[] };

export async function runKnowledgeFetch(): Promise<FetchSummary> {
  const sources = listSources(true);
  const seen = seenSourceUrls();
  const provider = await activeProvider();
  const usedAI = provider === "deepseek" || provider === "anthropic";
  const results: SourceResult[] = [];
  let totalNew = 0;

  for (const src of sources) {
    if (totalNew >= MAX_NEW_PER_RUN) {
      results.push({ id: src.id, name: src.name, found: 0, drafted: 0, error: "已达单次起草上限，跳过" });
      continue;
    }
    const res: SourceResult = { id: src.id, name: src.name, found: 0, drafted: 0 };
    try {
      const candidates = (await fetchCandidates(src)).slice(0, MAX_CANDIDATES_PER_SRC);
      res.found = candidates.length;
      for (const c of candidates) {
        if (totalNew >= MAX_NEW_PER_RUN) break;
        if (!c.url || seen.has(c.url)) continue;       // 去重
        seen.add(c.url);
        const draft = await draftFromCandidate(c, src, provider);
        if (!draft) continue;
        createDraft({ ...draft, sourceName: src.name, sourceUrl: c.url });
        res.drafted++; totalNew++;
      }
      touchSourceRun(src.id);
    } catch (e) {
      res.error = e instanceof Error ? e.message : "抓取失败";
    }
    results.push(res);
  }

  return { totalNew, usedAI, sources: results };
}

/* ---------- 抓候选 ---------- */

async function fetchCandidates(src: KnowledgeSource): Promise<Candidate[]> {
  if (src.kind === "sample") return SAMPLE_CANDIDATES.map((c) => ({ ...c }));
  const html = await fetchText(src.url);
  return src.kind === "rss" ? parseRss(html) : parseHtmlAnchors(html, src.url);
}

async function fetchText(url: string): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; XYJZXH-KnowledgeBot/1.0)" },
    });
    if (!res.ok) throw new Error(`来源返回 ${res.status}`);
    return await res.text();
  } finally { clearTimeout(t); }
}

function decodeEntities(s: string): string {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").trim();
}

function parseRss(xml: string): Candidate[] {
  const out: Candidate[] = [];
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];
  for (const it of items) {
    const title = decodeEntities((it.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").replace(/<!\[CDATA\[|\]\]>/g, ""));
    let link = (it.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] ?? "").trim();
    if (!link) link = (it.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1] ?? "").trim();
    const desc = decodeEntities((it.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] ?? it.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i)?.[1] ?? "").replace(/<!\[CDATA\[|\]\]>|<[^>]+>/g, ""));
    if (title && link) out.push({ title, url: link, snippet: desc.slice(0, 300) });
  }
  return out;
}

function parseHtmlAnchors(html: string, baseUrl: string): Candidate[] {
  const out: Candidate[] = [];
  const seen = new Set<string>();
  const re = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    const text = decodeEntities(m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
    if (text.length < 8 || text.length > 60) continue;                 // 过滤导航/短链
    if (!/(通知|公告|政策|意见|办法|规定|标准|规范|方案|细则|解读|文件)/.test(text)) continue; // 像政策标题的才要
    const url = absolutize(href, baseUrl);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push({ title: text, url, snippet: "" });
  }
  return out;
}

function absolutize(href: string, base: string): string | null {
  try { return new URL(href, base).toString(); } catch { return null; }
}

/* ---------- 起草（AI 优先，失败兜底） ---------- */

type DraftCore = { title: string; category: string; tags: string[]; excerpt: string; content: KnowledgeSection[] };

async function draftFromCandidate(c: Candidate, src: KnowledgeSource, provider: string): Promise<DraftCore | null> {
  if (!c.title) return null;
  if (provider === "deepseek" || provider === "anthropic") {
    try {
      const ai = await aiDraft(c, src, provider);
      if (ai) return ai;
    } catch { /* 落到兜底 */ }
  }
  return heuristicDraft(c, src);
}

const DRAFT_SYSTEM = `你是建筑装饰装修行业协会的知识库编辑。根据给定的「标题」和「摘要片段」，整理成一条知识库待审草稿。
分类只能从这五个里选一个：国标规范、地方政策、技术资料、典型案例、合同范本。
**严格输出 JSON**，不要任何多余说明：
{
  "category": "五类之一",
  "excerpt": "一句话摘要，不超过40字",
  "points": ["要点1", "要点2", "要点3"],
  "tags": ["标签1", "标签2"]
}
要点 3-5 条，依据给定信息客观整理，不要编造数据或链接；信息不足时只就标题主题给出概括性要点，并在末点提示"需人工核对原文"。`;

async function aiDraft(c: Candidate, src: KnowledgeSource, provider: string): Promise<DraftCore | null> {
  const user = `来源：${src.name}\n默认归类：${src.category}\n标题：${c.title}\n摘要片段：${c.snippet || "（无）"}`;
  const stream = provider === "deepseek"
    ? await streamDeepseek({ system: DRAFT_SYSTEM, messages: [{ role: "user", content: user }], maxTokens: 900 })
    : await streamAnthropic({ system: DRAFT_SYSTEM, messages: [{ role: "user", content: user }], maxTokens: 900 });
  const reader = stream.getReader(); const dec = new TextDecoder(); let buf = "";
  while (true) { const { value, done } = await reader.read(); if (done) break; buf += dec.decode(value, { stream: true }); }
  return parseDraftJson(buf, c, src);
}

function parseDraftJson(raw: string, c: Candidate, src: KnowledgeSource): DraftCore | null {
  let j = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  const fence = j.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) j = fence[1].trim();
  const a = j.indexOf("{"); const b = j.lastIndexOf("}");
  if (a >= 0 && b > a) j = j.slice(a, b + 1);
  try {
    const o = JSON.parse(j) as { category?: string; excerpt?: string; points?: unknown; tags?: unknown };
    const category = (CATEGORIES as readonly string[]).includes(String(o.category)) ? String(o.category) : src.category;
    const points = Array.isArray(o.points) ? o.points.map((p) => String(p).trim()).filter(Boolean).slice(0, 6) : [];
    const tags = Array.isArray(o.tags) ? o.tags.map((p) => String(p).trim()).filter(Boolean).slice(0, 6) : [];
    if (!points.length) return null;
    return {
      title: c.title, category,
      excerpt: String(o.excerpt ?? "").trim().slice(0, 60) || c.title,
      content: [{ h: "内容要点", points }], tags,
    };
  } catch { return null; }
}

// 无 AI 时：用标题 + 摘要拆句生成草稿（人工再润色）
function heuristicDraft(c: Candidate, src: KnowledgeSource): DraftCore {
  const sentences = (c.snippet || c.title)
    .split(/[。；;\n]+/).map((s) => s.trim()).filter((s) => s.length >= 4).slice(0, 5);
  const points = sentences.length ? sentences : [c.title];
  points.push("自动抓取草稿，需人工核对原文后入库");
  const tags = Array.from(new Set(
    (c.title.match(/(通知|公告|政策|意见|办法|规定|标准|规范|方案|细则|解读|装修|绿色|验收|安全|节能)/g) ?? []),
  )).slice(0, 4);
  return {
    title: c.title, category: src.category,
    excerpt: (c.snippet || c.title).slice(0, 50),
    content: [{ h: "内容要点", points }],
    tags: tags.length ? tags : [src.category],
  };
}
