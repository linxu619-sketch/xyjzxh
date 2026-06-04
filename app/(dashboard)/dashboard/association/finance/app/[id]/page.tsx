import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Banknote } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getFinanceApplication, type FinAppStatus } from "@/lib/data/finance-source";
import { reviewFinanceAppAction } from "../../actions";
import { PrintBar, Letterhead, DocTable, SealFooter } from "@/components/print/print-doc";

export const metadata = { title: "金融申请处置 · 协会工作台" };

const FIN_LABEL: Record<FinAppStatus, string> = { pending: "待审核", approved: "已批准", rejected: "已驳回", disbursed: "已放款/出函" };
const FIN_TONE: Record<FinAppStatus, "yellow" | "brand" | "decor" | "tea"> = { pending: "yellow", approved: "brand", rejected: "decor", disbursed: "tea" };

function fmt(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }
function fmtDay(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()} 年 ${p(d.getMonth() + 1)} 月 ${p(d.getDate())} 日`; }

export default async function FinanceAppDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const a = id ? getFinanceApplication(id) : undefined;
  if (!a) notFound();
  const self = `/dashboard/association/finance/app/${a!.id}`;
  const docNo = `XYJZ-JR-${String(a!.id).padStart(4, "0")}`;

  return (
    <AssociationShell title="金融申请处置" subtitle={`${a!.enterpriseName} · ${a!.productName}`}>
      <div className="no-print">
        <Link href="/dashboard/association/finance" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回金融保险</Link>
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <Badge tone={FIN_TONE[a!.status]}>{FIN_LABEL[a!.status]}</Badge>
          {a!.status === "pending" && (
            <>
              <form action={reviewFinanceAppAction}><input type="hidden" name="id" value={a!.id} /><input type="hidden" name="status" value="approved" /><input type="hidden" name="redirect" value={self} /><button className="h-10 px-5 rounded-full bg-accent-tea text-white text-[13px] font-medium inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> 批准</button></form>
              <form action={reviewFinanceAppAction}><input type="hidden" name="id" value={a!.id} /><input type="hidden" name="status" value="rejected" /><input type="hidden" name="redirect" value={self} /><button className="h-10 px-5 rounded-full border border-cat-decor/40 text-cat-decor text-[13px] font-medium inline-flex items-center gap-1.5"><XCircle className="h-4 w-4" /> 驳回</button></form>
            </>
          )}
          {a!.status === "approved" && (
            <form action={reviewFinanceAppAction}><input type="hidden" name="id" value={a!.id} /><input type="hidden" name="status" value="disbursed" /><input type="hidden" name="redirect" value={self} /><button className="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Banknote className="h-4 w-4" /> 标记放款 / 出函</button></form>
          )}
          {(a!.status === "rejected" || a!.status === "disbursed") && <span className="text-[12px] text-muted-foreground">该申请已终态（{FIN_LABEL[a!.status]}）。</span>}
        </div>
        <PrintBar hint="下方为 A4 金融服务申请受理单，可直接打印或「另存为 PDF」存档。" />
      </div>

      <div className="print-area">
        <div className="a4-sheet">
          <Letterhead title="金融服务申请受理单" docNo={docNo} date={fmtDay(a!.createdAt)} />
          <DocTable
            rows={[
              { k: "申请企业", v: a!.enterpriseName },
              { k: "申请产品", v: a!.productName },
              { k: "申请额度", v: a!.amount },
              { k: "备注", v: <span className="whitespace-pre-wrap">{a!.note || "—"}</span> },
              { k: "受理状态", v: FIN_LABEL[a!.status] },
              { k: "申请时间", v: fmt(a!.createdAt) },
            ]}
          />
          <div className="mt-6">
            <div className="text-[13px] font-medium mb-2">审批意见</div>
            <div className="border border-[#ccc] min-h-[100px] p-3 text-[13px] leading-7 text-muted-foreground">
              {a!.status === "disbursed" ? "（已批准并完成放款 / 出函。）" : a!.status === "approved" ? "（资格审核通过，待放款 / 出函。）" : a!.status === "rejected" ? "（不符合受理条件，已告知申请企业。）" : ""}
            </div>
          </div>
          <SealFooter
            date={a!.reviewedAt ? fmtDay(a!.reviewedAt) : undefined}
            lines={[
              { label: "审批经办", value: a!.reviewedBy ? `${a!.reviewedBy} · ${fmtDay(a!.reviewedAt)}` : undefined },
              { label: "复核人（签字）" },
              { label: "申请企业（盖章）" },
              { label: "协会 / 合作机构（盖章）" },
            ]}
          />
        </div>
      </div>
    </AssociationShell>
  );
}
