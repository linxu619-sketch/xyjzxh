"use server";

import { requireStaffPermission } from "@/lib/auth/guard";
import { listSignatures, listAgreementTemplates } from "@/lib/data/agreements-source";

/**
 * 合规审计 CSV 导出
 * 监管 / 司法机关要求出示时使用
 */
export async function exportAuditAction(): Promise<string | null> {
  try { await requireStaffPermission("agreements"); } catch { return null; }

  const headers = [
    "存证编号", "协议编号", "协议标题", "版本",
    "签署人类型", "签署人姓名", "签署人手机",
    "签署时间", "签署 IP", "设备 UA",
    "阅读时长(秒)", "滚动完成度(%)", "确认重点条款数",
    "电子签提供方", "回单号",
    "内容哈希", "状态",
  ];

  const templates = listAgreementTemplates();
  const rows = listSignatures().map((s) => {
    const tpl = templates.find((t) => t.id === s.templateId);
    return [
      s.id,
      s.templateCode,
      tpl?.title ?? "",
      `v${s.templateVersion}`,
      s.signerType,
      s.signerRealName,
      s.signerPhone,
      s.signedAt,
      s.signingIp,
      s.signingUa.replace(/[",\n]/g, " "),
      String(s.readSeconds),
      String(s.scrollCompletionPct),
      String(s.highlightsAcknowledged.length),
      s.esignProvider,
      s.esignSerialNo ?? "",
      s.contentHash,
      s.status,
    ].map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",");
  });

  return [headers.map((h) => `"${h}"`).join(","), ...rows].join("\n");
}
