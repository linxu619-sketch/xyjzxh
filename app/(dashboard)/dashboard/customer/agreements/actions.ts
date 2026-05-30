"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { getTemplate } from "@/lib/data/agreements";
import { NOTIFICATIONS, type Notification } from "@/lib/data/notifications";

export type RevokeResult =
  | { ok: null }
  | { ok: true; revokedAt: string; affects: string[]; notificationId: string }
  | { ok: false; error: string };

/**
 * 撤回协议授权 (PIPL §15)
 * Demo 实现：写一条撤回事件即可 · 生产应：
 *   1. 检查是否为可撤回（必签的"服务协议"撤回 = 注销账号）
 *   2. 在 agreement_signatures 把 status 置 'revoked'
 *   3. 触发依赖业务的"7 日内删除"任务
 *   4. 站内信通知用户影响范围
 *   5. 写审计日志
 */
export async function revokeAgreementAction(
  _prev: RevokeResult,
  formData: FormData,
): Promise<RevokeResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "请先登录" };

  const templateId = String(formData.get("templateId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  const tpl = getTemplate(templateId);
  if (!tpl) return { ok: false, error: "未找到该协议" };
  if (!reason) return { ok: false, error: "请填写撤回原因（监管要求）" };

  const affects = buildAffectsList(tpl.code);

  // Demo：写到内存（实际接入 Supabase 时写 agreement_signatures.status = revoked）
  await new Promise((r) => setTimeout(r, 600));

  // 发站内信给协会工作人员（监管自动告警）
  const notif: Notification = {
    id: `N-${Date.now().toString(36).toUpperCase()}`,
    recipientType: "association_staff",
    recipientId: "as-001",
    category: "agreement_revoked",
    title: `${session.name} 已撤回 ${tpl.title}`,
    body: `撤回原因：${reason}。受影响业务：${affects.join("；")}`,
    link: "/dashboard/association/agreements",
    createdAt: "刚刚",
  };
  NOTIFICATIONS.unshift(notif);

  revalidatePath("/dashboard/customer/agreements");
  revalidatePath("/dashboard/practitioner/agreements");
  revalidatePath("/dashboard/association");
  return {
    ok: true,
    revokedAt: new Date().toISOString(),
    affects,
    notificationId: notif.id,
  };
}

/**
 * 依据协议 code 计算撤回后受影响的业务
 */
function buildAffectsList(code: string): string[] {
  const map: Record<string, string[]> = {
    "CUST-AI-CONSENT": ["AI 助手将立即停止使用 · 改为仅展示静态知识"],
    "CUST-REALNAME-CONSENT": [
      "进行中的家装质保险将无法理赔",
      "进行中的调解申请暂停",
    ],
    "CUST-PRIVACY": [
      "账号将在 7 日内注销",
      "所有项目档案 90 天后删除",
    ],
    "PRAC-REALNAME-CONSENT": [
      "工伤险将无法理赔",
      "信用画像将被清空",
      "招聘投递将停用",
    ],
    "PRAC-WORK-INJURY-INSURE": ["工伤险保单立即解除 · 已交保费按比例退还"],
    "PRAC-INCOME-EXPORT": ["收入证明无法生成"],
    "ENT-DPA": [
      "需重新签 DPA · 否则账号封禁",
      "无法继续访问业主敏感信息",
    ],
    "ENT-REPORT-SHARE": ["所有工装报备暂停同步至省厅"],
  };
  return map[code] ?? ["将无法享受该协议对应的服务"];
}
