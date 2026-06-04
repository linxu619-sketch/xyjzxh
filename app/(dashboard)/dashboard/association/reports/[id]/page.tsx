import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getReport } from "@/lib/data/reports";
import { reviewReportAction } from "../actions";
import { PrintBar, Letterhead, DocTable, SealFooter } from "@/components/print/print-doc";

export const metadata = { title: "工装报备处置 · 协会工作台" };

export default async function ReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = getReport(Number(id));

  if (!r) {
    return (
      <AssociationShell title="工装报备处置">
        <Link href="/dashboard/association/reports" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> 返回列表</Link>
        <div className="mt-6 rounded-2xl border border-border bg-background p-10 text-center text-[14px] text-muted-foreground">未找到该报备。</div>
      </AssociationShell>
    );
  }

  const p = r.payload as Record<string, string>;
  const SHOWN = ["planStart", "planEnd", "address", "summary", "safetyOfficer"];
  const EXTRA_LABEL: Record<string, string> = { contractAmount: "合同金额", workers: "工人数", contact: "现场联系人" };
  const extras = Object.entries(p).filter(([k, v]) => !SHOWN.includes(k) && String(v).trim());
  const statusTone = r.status === "approved" ? "tea" : r.status === "rejected" ? "decor" : "yellow";
  const statusLabel = r.status === "approved" ? "已通过" : r.status === "rejected" ? "已驳回" : "待审核";

  return (
    <AssociationShell title="工装报备处置" subtitle={`${r.code} · ${r.project}`}>
      <div className="no-print">
        <Link href="/dashboard/association/reports" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回列表</Link>
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <Badge tone={statusTone}>{statusLabel}</Badge>
          {r.status === "pending" ? (
            <>
              <form action={reviewReportAction}>
                <input type="hidden" name="id" value={r.id} /><input type="hidden" name="act" value="approve" />
                <button className="h-10 px-5 rounded-full bg-accent-tea text-white text-[13px] font-medium inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> 通过</button>
              </form>
              <form action={reviewReportAction}>
                <input type="hidden" name="id" value={r.id} /><input type="hidden" name="act" value="reject" />
                <button className="h-10 px-5 rounded-full border border-cat-decor/40 text-cat-decor text-[13px] font-medium inline-flex items-center gap-1.5"><XCircle className="h-4 w-4" /> 驳回</button>
              </form>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground"><ShieldCheck className="h-4 w-4 text-accent-tea" /> 该报备已{statusLabel}。</span>
          )}
        </div>
        <PrintBar hint="下方为 A4 工装报备受理回执，可直接打印或「另存为 PDF」存档。" />
      </div>

      <div className="print-area">
        <div className="a4-sheet">
          <Letterhead title="工装报备受理回执" docNo={r.code} date={fmtDay(r.createdAt)} />
          <DocTable
            rows={[
              { k: "报备编号", v: r.code },
              { k: "项目名称", v: r.project },
              { k: "项目类型", v: r.type || "—" },
              { k: "施工企业", v: r.enterprise },
              { k: "面积 / 价款", v: `${r.area || "—"} ㎡ · ${r.budget || "—"} 万` },
              { k: "项目负责人", v: `${r.manager || "—"} · ${r.phone || "—"}` },
              { k: "计划工期", v: `${p.planStart || "—"} → ${p.planEnd || "—"}` },
              { k: "项目地址", v: p.address || "—" },
              { k: "项目摘要", v: <span className="whitespace-pre-wrap">{p.summary || "—"}</span> },
              { k: "安全员", v: p.safetyOfficer || "—" },
              ...extras.map(([k, v]) => ({ k: EXTRA_LABEL[k] ?? k, v: String(v) })),
              { k: "受理状态", v: statusLabel },
              { k: "受理时间", v: fmtTime(r.createdAt) },
            ]}
          />
          <div className="mt-6">
            <div className="text-[13px] font-medium mb-2">审查意见</div>
            <div className="border border-[#ccc] min-h-[90px] p-3 text-[13px] leading-7 text-muted-foreground">
              {r.status === "approved" ? "（材料齐全，符合工装报备要求，准予备案。）" : r.status === "rejected" ? "（材料不齐 / 不符合要求，已退回补正。）" : ""}
            </div>
          </div>
          <SealFooter lines={[{ label: "经办人（签字）" }, { label: "审核人（签字）" }, { label: "申报企业（盖章）" }, { label: "协会（盖章）" }]} />
        </div>
      </div>
    </AssociationShell>
  );
}

function fmtTime(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function fmtDay(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()} 年 ${p(d.getMonth() + 1)} 月 ${p(d.getDate())} 日`;
}
