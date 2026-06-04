import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Gavel, ShieldCheck } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getMediation } from "@/lib/data/mediations";
import { reviewMediationAction } from "../actions";
import { PrintBar, Letterhead, DocTable, SealFooter } from "@/components/print/print-doc";

export const metadata = { title: "调解处置 · 协会工作台" };

const STATUS: Record<string, string> = { pending: "待受理", accepted: "受理中", closed: "已结案", rejected: "已驳回" };

export default async function MediationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = getMediation(Number(id));

  if (!m) {
    return (
      <AssociationShell title="调解处置">
        <Link href="/dashboard/association/mediations" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> 返回列表</Link>
        <div className="mt-6 rounded-2xl border border-border bg-background p-10 text-center text-[14px] text-muted-foreground">未找到该调解申请。</div>
      </AssociationShell>
    );
  }

  const statusTone = m.status === "closed" ? "tea" : m.status === "rejected" ? "decor" : m.status === "accepted" ? "brand" : "yellow";
  const docNo = `XYJZ-TJ-${String(m.id).padStart(4, "0")}`;
  const img = (s: string) => /^(https?:)?\//.test(s);

  return (
    <AssociationShell title="调解处置" subtitle={`${m.applicant}${m.respondent ? ` · ${m.respondent}` : ""}`}>
      {/* 工具栏（不打印）：返回 + 处置操作 + 打印 */}
      <div className="no-print">
        <Link href="/dashboard/association/mediations" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回列表</Link>
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <Badge tone={statusTone}>{STATUS[m.status] ?? m.status}</Badge>
          {m.status === "pending" && (
            <>
              <form action={reviewMediationAction}>
                <input type="hidden" name="id" value={m.id} /><input type="hidden" name="act" value="accept" />
                <button className="h-10 px-5 rounded-full bg-accent-tea text-white text-[13px] font-medium inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> 受理</button>
              </form>
              <form action={reviewMediationAction}>
                <input type="hidden" name="id" value={m.id} /><input type="hidden" name="act" value="reject" />
                <button className="h-10 px-5 rounded-full border border-cat-decor/40 text-cat-decor text-[13px] font-medium inline-flex items-center gap-1.5"><XCircle className="h-4 w-4" /> 驳回</button>
              </form>
            </>
          )}
          {m.status === "accepted" && (
            <form action={reviewMediationAction}>
              <input type="hidden" name="id" value={m.id} /><input type="hidden" name="act" value="close" />
              <button className="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Gavel className="h-4 w-4" /> 标记结案</button>
            </form>
          )}
          {(m.status === "closed" || m.status === "rejected") && (
            <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground"><ShieldCheck className="h-4 w-4 text-accent-tea" /> 该调解已{STATUS[m.status]}。</span>
          )}
        </div>
        <PrintBar hint="下方为 A4 调解处置记录单，可直接打印或「另存为 PDF」存档。" />
      </div>

      {/* A4 公文（打印区） */}
      <div className="print-area">
        <div className="a4-sheet">
          <Letterhead title="纠纷调解受理 / 处置记录单" docNo={docNo} date={fmtDay(m.createdAt)} />

          <DocTable
            rows={[
              { k: "申请人", v: m.applicant },
              { k: "联系电话", v: m.phone },
              { k: "被投诉方", v: m.respondent || "—" },
              { k: "受理状态", v: STATUS[m.status] ?? m.status },
              { k: "申请时间", v: fmtTime(m.createdAt) },
              { k: "纠纷经过 / 诉求", v: <span className="whitespace-pre-wrap">{m.detail}</span> },
            ]}
          />

          {m.photos.length > 0 && (
            <div className="mt-4">
              <div className="text-[13px] font-medium mb-2">证据照片（{m.photos.length}）</div>
              <div className="flex flex-wrap gap-2.5">
                {m.photos.filter(img).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt={`证据 ${i + 1}`} className="w-[180px] max-w-[44vw] border border-[#ccc] object-cover" style={{ aspectRatio: "85.6 / 54" }} />
                ))}
              </div>
            </div>
          )}

          {/* 调解处置意见（供书写 / 归档） */}
          <div className="mt-6">
            <div className="text-[13px] font-medium mb-2">调解处置意见</div>
            <div className="border border-[#ccc] min-h-[120px] p-3 text-[13px] leading-7 text-muted-foreground">
              {m.status === "closed" ? "（双方已在协会主持下达成和解，详见调解协议书。）" : m.status === "rejected" ? "（经审查不属于本会调解范围 / 材料不足，已告知申请人。）" : ""}
            </div>
          </div>

          <SealFooter lines={[
            { label: "调解员（签字）" },
            { label: "申请人（签字）" },
            { label: "被投诉方（签字）" },
            { label: "协会调解委员会（盖章）" },
          ]} />
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
