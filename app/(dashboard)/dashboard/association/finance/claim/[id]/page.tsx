import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getClaim, type ClaimStatus } from "@/lib/data/insurance-claims";
import { reviewClaimAction } from "../../actions";

export const metadata = { title: "理赔详情 · 协会工作台" };

const CLAIM_LABEL: Record<ClaimStatus, string> = { pending: "待受理", reviewing: "定损中", settled: "已赔付", rejected: "已驳回" };
const CLAIM_TONE: Record<ClaimStatus, "yellow" | "brand" | "tea" | "decor"> = { pending: "yellow", reviewing: "brand", settled: "tea", rejected: "decor" };
const CLAIM_NEXT: Record<ClaimStatus, { status: ClaimStatus; label: string } | null> = { pending: { status: "reviewing", label: "受理 · 定损" }, reviewing: { status: "settled", label: "确认赔付" }, settled: null, rejected: null };

function fmt(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }

export default async function ClaimDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const c = id ? getClaim(id) : undefined;
  if (!c) notFound();
  const nx = CLAIM_NEXT[c!.status];
  const self = `/dashboard/association/finance/claim/${c!.id}`;

  return (
    <AssociationShell title="理赔详情" subtitle={`CL-${String(c!.id).padStart(4, "0")} · ${c!.applicant}`}>
      <Link href="/dashboard/association/finance#claims" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回金融保险
      </Link>
      <div className="rounded-2xl border border-border bg-background p-5 md:p-6 max-w-2xl">
        <div className="flex items-start gap-4 pb-5 border-b border-border">
          <span className="h-12 w-12 rounded-2xl bg-surface inline-flex items-center justify-center shrink-0"><ShieldAlert className="h-5 w-5 text-cat-decor" /></span>
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-semibold">{c!.subject}</div>
            <div className="text-[12px] text-muted-foreground mt-1">CL-{String(c!.id).padStart(4, "0")} · 报案 {fmt(c!.createdAt)}</div>
          </div>
          <Badge tone={CLAIM_TONE[c!.status]} className="shrink-0">{CLAIM_LABEL[c!.status]}</Badge>
        </div>
        <dl className="mt-5 space-y-3 text-[13px]">
          <Row k="报案人" v={`${c!.applicant} · ${c!.phone}`} />
          <Row k="保单 / 产品" v={c!.policy || c!.product || "—"} />
          {c!.detail && <Row k="出险描述" v={c!.detail} />}
          <Row k="报案时间" v={fmt(c!.createdAt)} />
        </dl>
        <div className="mt-6 pt-5 border-t border-border">
          <div className="text-[12px] text-muted-foreground mb-3 inline-flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5" /> 理赔处理</div>
          {nx ? (
            <div className="flex flex-wrap items-center gap-2">
              <form action={reviewClaimAction}><input type="hidden" name="id" value={c!.id} /><input type="hidden" name="status" value={nx.status} /><input type="hidden" name="redirect" value={self} /><button className="h-10 px-5 rounded-full bg-accent-tea text-white text-[13px] font-medium inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> {nx.label}</button></form>
              {c!.status === "pending" && <form action={reviewClaimAction}><input type="hidden" name="id" value={c!.id} /><input type="hidden" name="status" value="rejected" /><input type="hidden" name="redirect" value={self} /><button className="h-10 px-5 rounded-full border border-cat-decor/40 text-cat-decor text-[13px] font-medium inline-flex items-center gap-1.5"><XCircle className="h-4 w-4" /> 驳回</button></form>}
            </div>
          ) : <p className="text-[12px] text-muted-foreground">该理赔已终态（{CLAIM_LABEL[c!.status]}）。</p>}
        </div>
      </div>
    </AssociationShell>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex items-start gap-3"><dt className="text-muted-foreground w-20 shrink-0">{k}</dt><dd className="font-medium">{v}</dd></div>;
}
