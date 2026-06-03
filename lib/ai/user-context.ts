import "server-only";
import type { Session } from "@/lib/auth/session";
import { listLeadsForCustomer } from "@/lib/data/leads";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { getMemberTier } from "@/lib/data/member-tier";
import { getPractitionerByPhone } from "@/lib/data/practitioners-source";

/**
 * AI 三期·用户级记忆（账号级，跨会话持久）。
 * 由登录账号的已存数据派生一段「用户档案」注入 system，让 AI 记得用户是谁、其项目/偏好。
 * 纯读已有数据，不产生额外 LLM 调用；未登录返回空串。
 */
export async function buildUserContext(session: Session | null): Promise<string> {
  if (!session) return "";
  const lines: string[] = [];
  try {
    if (session.role === "customer") {
      lines.push(`身份：业主${session.name ? `（${session.name}）` : ""}`);
      const leads = listLeadsForCustomer(session.uid, session.phone).slice(0, 3);
      if (leads.length) {
        const l = leads[0];
        const parts = [l.type, l.area ? `${l.area}㎡` : "", l.budget ? `预算 ${l.budget} 万` : ""].filter(Boolean);
        if (parts.length) lines.push(`装修偏好（来自其需求记录）：${parts.join(" · ")}`);
        if (leads.length > 1) lines.push(`累计提交需求 ${leads.length} 条`);
      }
    } else if (session.role === "enterprise" && session.enterpriseId) {
      const e = await getEnterpriseBySlugOrId(session.enterpriseId);
      const tier = getMemberTier("enterprise", session.enterpriseId);
      lines.push(`身份：企业会员（${e?.name ?? session.name}）· ${tier}`);
      if (e?.district) lines.push(`主营区域：${e.district}`);
      if (e?.category) lines.push(`主营类别：${e.category}`);
    } else if (session.role === "practitioner") {
      const p = getPractitionerByPhone(session.phone);
      lines.push(`身份：个人会员（${p?.name ?? session.name}）`);
      if (p?.kind) lines.push(`工种：${p.kind}${p.years ? ` · 从业 ${p.years} 年` : ""}`);
      if (p?.city) lines.push(`所在地：${p.city}`);
    } else if (session.role === "association" || session.role === "system_admin") {
      lines.push(`身份：协会工作人员（${session.name}）`);
    }
  } catch {
    return "";
  }
  if (!lines.length) return "";
  return (
    `\n\n【当前用户档案 · 账号级记忆（仅本人会话可见，用于个性化回答，请自然结合，不要逐条复述）】\n` +
    lines.map((l) => `- ${l}`).join("\n")
  );
}
