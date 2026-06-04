import "server-only";
import type { Session } from "@/lib/auth/session";

/* 办理人显示名（用于单据落款 / 流程留痕）。
   超管(平台运维)办理时不暴露其个人身份，记为「协会秘书处」。 */
export function operatorName(s: Session | null): string {
  if (!s) return "协会工作人员";
  if (s.role === "system_admin") return "协会秘书处";
  return s.name || s.staffRole || "协会工作人员";
}
