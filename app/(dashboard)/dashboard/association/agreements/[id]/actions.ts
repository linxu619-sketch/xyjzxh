"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { ACTION_META, type WorkflowAction } from "@/lib/agreements/workflow";

export async function performWorkflowAction(fd: FormData): Promise<{ ok: boolean; msg: string }> {
  const session = await getSession();
  if (!session || (session.role !== "association" && session.role !== "system_admin")) {
    return { ok: false, msg: "无权限" };
  }

  const templateId = String(fd.get("templateId") ?? "");
  const action = String(fd.get("action") ?? "") as WorkflowAction;
  const reason = String(fd.get("reason") ?? "").trim();

  if (!templateId || !action) return { ok: false, msg: "参数缺失" };

  const meta = ACTION_META[action];
  if (!meta) return { ok: false, msg: "未知动作" };

  if (meta.requiresReason && !reason) {
    return { ok: false, msg: "请填写理由（监管要求）" };
  }

  // 演示：直接成功；正式接 Supabase 时：
  //   1. UPDATE agreement_templates SET status = meta.nextStatus
  //   2. INSERT workflow_events (templateId, fromStatus, toStatus, actor, reason)
  //   3. 如果 nextStatus = published：
  //      - 找出所有已签上一版的用户
  //      - 如果 requires_resign_on_change = true，INSERT agreement_pending
  //      - 发站内信通知
  await new Promise((r) => setTimeout(r, 700));

  revalidatePath(`/dashboard/association/agreements/${templateId}`);
  revalidatePath("/dashboard/association/agreements");

  let msg = `已${meta.label} · 协议状态更新为「${meta.nextStatus}」`;
  if (action === "publish") {
    msg += ` · 已自动向 1,824 名旧版用户发送重签通知`;
  }
  return { ok: true, msg };
}
