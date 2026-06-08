"use server";

import { revalidatePath } from "next/cache";
import { requireStaffPermission } from "@/lib/auth/guard";
import { scanProtocolRisks, type RiskFinding } from "@/lib/ai/risk-scan";

export async function saveDraftAction(
  templateId: string,
  content: string,
  highlights: string[],
): Promise<{ ok: boolean; msg: string }> {
  try { await requireStaffPermission("agreements"); } catch { return { ok: false, msg: "无权限" }; }

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
  try { await requireStaffPermission("agreements"); } catch { return []; }
  return scanProtocolRisks(content);
}
