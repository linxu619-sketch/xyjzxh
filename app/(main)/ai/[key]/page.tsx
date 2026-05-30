import { notFound } from "next/navigation";
import { AI_PROMPTS } from "@/lib/ai/prompts";
import { AI_EMPLOYEES } from "@/lib/site";
import { ChatWindow } from "./ChatWindow";

// Static export — 编译期不能预设 searchParams，所以这里只产出 key
export function generateStaticParams() {
  return AI_EMPLOYEES.map((e) => ({ key: e.key }));
}

// 不同 AI 接首页/相邻页表单字段时，自动拼成第一句话
function buildOpener(key: string, sp: Record<string, string | string[] | undefined>): string | null {
  const get = (k: string) => {
    const v = sp[k];
    return typeof v === "string" ? v.trim() : "";
  };

  if (key === "decor") {
    const area = get("area"), budget = get("budget"), style = get("style");
    if (area || budget || style) {
      const parts = [
        area && `${area}㎡`,
        budget && `预算 ${budget} 万`,
        style && `偏好 ${style}`,
      ].filter(Boolean);
      return `我想装修：${parts.join(" · ")}。请帮我粗算一下，并推荐 2-3 家协会企业。`;
    }
  }
  if (key === "advisor") {
    const t = get("topic");
    if (t) return `我想了解协会的「${t}」，请详细说明并给出下一步。`;
  }
  if (key === "report") {
    const project = get("project");
    if (project) return `我想报备项目「${project}」，请帮我列清材料 + 流程。`;
  }
  if (key === "ins") {
    const cover = get("cover");
    if (cover) return `我想给「${cover}」投保，帮我推荐合适险种。`;
  }
  // 通用：q 字段直接当问题
  const q = get("q") || get("message");
  return q || null;
}

export default async function AiChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { key } = await params;
  const ai = AI_PROMPTS[key as keyof typeof AI_PROMPTS];
  const meta = AI_EMPLOYEES.find((x) => x.key === key);
  if (!ai || !meta) notFound();

  const sp = await searchParams;
  const initialUserMessage = buildOpener(key, sp);

  return (
    <ChatWindow
      aiKey={key}
      ai={ai}
      color={meta.color}
      emoji={meta.emoji}
      initialUserMessage={initialUserMessage}
    />
  );
}
