import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getClaim, type ClaimStatus } from "@/lib/data/insurance-claims";
import { reviewClaimAction } from "../../actions";
import { PrintBar, Letterhead, DocTable, SealFooter } from "@/components/print/print-doc";

export const metadata = { title: "理赔处置 · 协会工作台" };

const CLAIM_LABEL: Record<ClaimStatus, string> = { pending: "待受理", reviewing: "定损中", settled: "已赔付", rejected: "已驳回" };
const CLAIM_TONE: Record<ClaimStatus, "yellow" | "brand" | "tea" | "decor"> = { pending: "yellow", reviewing: "brand", settled: "tea", rejected: "decor" };
const CLAIM_NEXT: Record<ClaimStatus, { status: ClaimStatus; label: string } | null> = { pending: { status: "reviewing", label: "受理 · 定损" }, reviewing: { status: "settled", label: "确认赔付" }, settled: null, rejected: null };

function fmt(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }
function fmtDay(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()} 年 ${p(d.getMonth() + 1)} 月 ${p(d.getDate())} 日`; }

export default async function ClaimDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const c = id ? getClaim(id) : undefined;
  if (!c) notFound();
  const nx = CLAIM_NEXT[c!.status];
  const self = `/dashboard/association/finance/claim/${c!.id}`;
  const docNo = `XYJZ-LP-${String(c!.id).padStart(4, "0")}`;

  return (
    <AssociationShell title="理赔处置" subtitle={`${docNo} · ${c!.applicant}`}>
      <div className="no-print">
        <Link href="/dashboard/association/finance#claims" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回金融保险</Link>
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <Badge tone={CLAIM_TONE[c!.status]}>{CLAIM_LABEL[c!.status]}</Badge>
          {nx ? (
            <>
              <form action={reviewClaimAction}><input type="hidden" name="id" value={c!.id} /><input type="hidden" name="status" value={nx.status} /><input type="hidden" name="redirect" value={self} /><button className="h-10 px-5 rounded-full bg-accent-tea text-white text-[13px] font-medium inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> {nx.label}</button></form>
              {c!.status === "pending" && <form action={reviewClaimAction}><input type="hidden" name="id" value={c!.id} /><input type="hidden" name="status" value="rejected" /><input type="hidden" name="redirect" value={self} /><button className="h-10 px-5 rounded-full border border-cat-decor/40 text-cat-decor text-[13px] font-medium inline-flex items-center gap-1.5"><XCircle className="h-4 w-4" /> 驳回</button></form>}
            </>
          ) : <span className="text-[12px] text-muted-foreground">该理赔已终态（{CLAIM_LABEL[c!.status]}）。</span>}
        </div>
        <PrintBar hint="下方为 A4 保险理赔受理 / 定损单，可直接打印或「另存为 PDF」存档。" />
      </div>

      <div className="print-area">
        <div className="a4-sheet">
          <Letterhead title="保险理赔受理 / 定损单" docNo={docNo} date={fmtDay(c!.createdAt)} />
          <DocTable
            rows={[
              { k: "报案人", v: c!.applicant },
              { k: "联系电话", v: c!.phone },
              { k: "保单 / 产品", v: c!.policy || c!.product || "—" },
              { k: "出险事由", v: c!.subject },
              { k: "出险描述", v: <span className="whitespace-pre-wrap">{c!.detail || "—"}</span> },
              { k: "受理状态", v: CLAIM_LABEL[c!.status] },
              { k: "报案时间", v: fmt(c!.createdAt) },
            ]}
          />
          <div className="mt-6">
            <div className="text-[13px] font-medium mb-2">定损 / 赔付意见</div>
            <div className="border border-[#ccc] min-h-[110px] p-3 text-[13px] leading-7 text-muted-foreground">
              {c!.status === "settled" ? "（核定损失，已按保单约定完成赔付。）" : c!.status === "rejected" ? "（经核查不属于保险责任范围，不予赔付，已告知报案人。）" : c!.status === "reviewing" ? "（已受理，正在现场核损。）" : ""}
            </div>
          </div>
          <SealFooter lines={[{ label: "定损员（签字）" }, { label: "报案人（签字）" }, { label: "承保机构（盖章）" }, { label: "协会（盖章）" }]} />
        </div>
      </div>
    </AssociationShell>
  );
}
