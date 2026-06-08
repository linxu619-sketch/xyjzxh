import { getSession } from "@/lib/auth/session";
import { effectiveEnterpriseId } from "@/lib/dashboard/preview";
import { listLeadsByEnterprise, type LeadStatus } from "@/lib/data/leads";

export const dynamic = "force-dynamic";

const STATUS: Record<LeadStatus, string> = {
  new: "新线索", contacting: "跟进中", surveying: "量房中", signed: "已签单", lost: "已流失",
};

function cell(v: string): string {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function fmt(ms: number): string {
  if (!ms) return "";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// 企业「客户线索」导出 CSV（本企业线索；UTF-8 BOM 保证 Excel 正确显示中文）
export async function GET() {
  const session = await getSession();
  if (!session) return new Response("未登录", { status: 401 });
  const eid = effectiveEnterpriseId(session);
  if (!eid) return new Response("无企业身份", { status: 403 });

  const leads = listLeadsByEnterprise(eid);
  const header = ["提交时间", "客户", "电话", "意向类型", "风格", "面积", "预算", "地址", "来源", "状态", "备注"];
  const lines = [header.join(",")];
  for (const l of leads) {
    lines.push([
      fmt(l.createdAt), l.name, l.phone, l.type, l.style, l.area, l.budget, l.address, l.source,
      STATUS[l.status] ?? l.status, l.note,
    ].map(cell).join(","));
  }
  const csv = "﻿" + lines.join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${eid}.csv"`,
    },
  });
}
