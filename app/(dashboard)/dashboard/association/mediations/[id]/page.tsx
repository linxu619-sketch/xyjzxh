import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Gavel, ShieldCheck } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getMediation } from "@/lib/data/mediations";
import { reviewMediationAction } from "../actions";

export const metadata = { title: "调解申请详情 · 协会工作台" };

const STATUS: Record<string, string> = { pending: "待受理", accepted: "受理中", closed: "已结案", rejected: "已驳回" };

export default async function MediationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = getMediation(Number(id));

  if (!m) {
    return (
      <AssociationShell title="调解申请详情">
        <Link href="/dashboard/association/mediations" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> 返回列表</Link>
        <div className="mt-6 rounded-2xl border border-border bg-background p-10 text-center text-[14px] text-muted-foreground">未找到该调解申请。</div>
      </AssociationShell>
    );
  }

  const statusTone = m.status === "closed" ? "tea" : m.status === "rejected" ? "decor" : m.status === "accepted" ? "brand" : "yellow";

  return (
    <AssociationShell title="调解申请详情" subtitle={`${m.applicant}${m.respondent ? ` · ${m.respondent}` : ""}`}>
      <Link href="/dashboard/association/mediations" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回列表</Link>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <span className="text-[16px] font-semibold">{m.applicant}</span>
          <Badge tone={statusTone}>{STATUS[m.status] ?? m.status}</Badge>
        </div>
        <dl className="divide-y divide-border">
          <Row k="联系电话" v={m.phone} />
          <Row k="被投诉方" v={m.respondent || "—"} />
          <Row k="纠纷经过 / 诉求" v={m.detail} />
        </dl>
      </div>

      <div className="mt-5 flex items-center gap-3 flex-wrap">
        {m.status === "pending" && (
          <>
            <form action={reviewMediationAction}>
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="act" value="accept" />
              <button className="h-11 px-6 rounded-full bg-accent-tea text-white text-[14px] font-medium inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> 受理</button>
            </form>
            <form action={reviewMediationAction}>
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="act" value="reject" />
              <button className="h-11 px-6 rounded-full border border-cat-decor/40 text-cat-decor text-[14px] font-medium inline-flex items-center gap-1.5"><XCircle className="h-4 w-4" /> 驳回</button>
            </form>
          </>
        )}
        {m.status === "accepted" && (
          <form action={reviewMediationAction}>
            <input type="hidden" name="id" value={m.id} />
            <input type="hidden" name="act" value="close" />
            <button className="h-11 px-6 rounded-full bg-foreground text-background text-[14px] font-medium inline-flex items-center gap-1.5"><Gavel className="h-4 w-4" /> 标记结案</button>
          </form>
        )}
        {(m.status === "closed" || m.status === "rejected") && (
          <div className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground"><ShieldCheck className="h-4 w-4 text-accent-tea" /> 该调解已{STATUS[m.status]}。</div>
        )}
      </div>
    </AssociationShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="px-5 py-3 flex justify-between gap-4 text-[14px]">
      <dt className="text-muted-foreground shrink-0">{k}</dt>
      <dd className="text-right break-all whitespace-pre-wrap">{v || "—"}</dd>
    </div>
  );
}
