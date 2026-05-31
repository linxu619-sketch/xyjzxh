import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getReport } from "@/lib/data/reports";
import { reviewReportAction } from "../actions";

export const metadata = { title: "工装报备详情 · 协会工作台" };

export default async function ReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = getReport(Number(id));

  if (!r) {
    return (
      <AssociationShell title="工装报备详情">
        <Link href="/dashboard/association/reports" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> 返回列表</Link>
        <div className="mt-6 rounded-2xl border border-border bg-background p-10 text-center text-[14px] text-muted-foreground">未找到该报备。</div>
      </AssociationShell>
    );
  }

  const p = r.payload as Record<string, string>;
  const statusTone = r.status === "approved" ? "tea" : r.status === "rejected" ? "decor" : "yellow";
  const statusLabel = r.status === "approved" ? "已通过" : r.status === "rejected" ? "已驳回" : "待审核";

  return (
    <AssociationShell title="工装报备详情" subtitle={`${r.code} · ${r.project}`}>
      <Link href="/dashboard/association/reports" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回列表</Link>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-[12px] font-mono text-muted-foreground">{r.code}</code>
            <span className="text-[16px] font-semibold">{r.project}</span>
            {r.type && <Badge tone="build">{r.type}</Badge>}
          </div>
          <Badge tone={statusTone}>{statusLabel}</Badge>
        </div>
        <dl className="divide-y divide-border">
          <Row k="施工企业" v={r.enterprise} />
          <Row k="面积 / 价款" v={`${r.area || "—"} ㎡ · ${r.budget || "—"} 万`} />
          <Row k="负责人" v={`${r.manager || "—"} · ${r.phone || "—"}`} />
          <Row k="工期" v={`${p.planStart || "—"} → ${p.planEnd || "—"}`} />
          <Row k="项目地址" v={p.address || "—"} />
          <Row k="项目摘要" v={p.summary || "—"} />
          <Row k="安全员" v={p.safetyOfficer || "—"} />
        </dl>
      </div>

      {r.status === "pending" ? (
        <div className="mt-5 flex items-center gap-3">
          <form action={reviewReportAction}>
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="act" value="approve" />
            <button className="h-11 px-6 rounded-full bg-accent-tea text-white text-[14px] font-medium inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> 通过</button>
          </form>
          <form action={reviewReportAction}>
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="act" value="reject" />
            <button className="h-11 px-6 rounded-full border border-cat-decor/40 text-cat-decor text-[14px] font-medium inline-flex items-center gap-1.5"><XCircle className="h-4 w-4" /> 驳回</button>
          </form>
        </div>
      ) : (
        <div className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground"><ShieldCheck className="h-4 w-4 text-accent-tea" /> 该报备已{statusLabel}。</div>
      )}
    </AssociationShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="px-5 py-3 flex justify-between gap-4 text-[14px]">
      <dt className="text-muted-foreground shrink-0">{k}</dt>
      <dd className="text-right break-all">{v || "—"}</dd>
    </div>
  );
}
