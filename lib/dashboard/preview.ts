import "server-only";
import type { Session } from "@/lib/auth/session";

/* ============================================================
   超管/协会预览模式
   ------------------------------------------------------------
   协会工作人员(association)与系统管理员(system_admin)可在「门面预览」中
   以样板身份只读预览企业工作台 / 从业者工作台,用于测试与体验,无需切换账号。
   ============================================================ */

const SAMPLE_ENTERPRISE_ID = "e002";        // 样板企业（名家装饰）
const SAMPLE_PRACTITIONER_PHONE = "13900020001"; // 样板从业者（张师傅）

export function isAssocViewer(s: Session | null): boolean {
  return !!s && (s.role === "system_admin" || s.role === "association");
}

// 企业工作台：本人企业 → 用本人;协会预览 → 用样板企业
export function effectiveEnterpriseId(s: Session | null): string | undefined {
  if (s?.role === "enterprise") return s.enterpriseId;
  if (isAssocViewer(s)) return SAMPLE_ENTERPRISE_ID;
  return undefined;
}
export function isEnterprisePreview(s: Session | null): boolean {
  return s?.role !== "enterprise" && isAssocViewer(s);
}

// 从业者工作台：本人 → 用本人手机号;协会预览 → 用样板从业者
export function effectivePractitionerPhone(s: Session | null): string {
  if (s?.role === "practitioner") return s.phone;
  return SAMPLE_PRACTITIONER_PHONE;
}
export function isPractitionerPreview(s: Session | null): boolean {
  return s?.role !== "practitioner" && isAssocViewer(s);
}
