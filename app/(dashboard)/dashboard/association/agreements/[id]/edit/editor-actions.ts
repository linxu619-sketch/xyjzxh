"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { scanProtocolRisks, type RiskFinding } from "@/lib/ai/risk-scan";

export async function saveDraftAction(
  templateId: string,
  content: string,
  highlights: string[],
): Promise<{ ok: boolean; msg: string }> {
  const session = await getSession();
  if (!session || (session.role !== "association" && session.role !== "system_admin")) {
    return { ok: false, msg: "无权限" };
  }

  if (!content.trim()) return { ok: false, msg: "正文不能为空" };
  if (highlights.some((h) => !h.trim())) return { ok: false, msg: "重点条款不能有空项" };
  if (highlights.length === 0) return { ok: false, msg: "请至少设置 1 条重点条款" };

  // Demo：直接成功（接 Supabase 时 UPDATE agreement_templates）
  await new Promise((r) => setTimeout(r, 500));

  revalidatePath(`/dashboard/association/agreements/${templateId}`);
  return {
    ok: true,
    msg: `已保存 · ${content.length} 字符 · ${highlights.length} 条重点条款 · 草稿态`,
  };
}

export async function scanRisksClientAction(content: string): Promise<RiskFinding[]> {
  const session = await getSession();
  if (!session) return [];
  return scanProtocolRisks(content);
}
