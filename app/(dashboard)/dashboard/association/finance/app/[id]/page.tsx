import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Landmark, CheckCircle2, XCircle, Banknote } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getFinanceApplication, type FinAppStatus } from "@/lib/data/finance-source";
import { reviewFinanceAppAction } from "../../actions";

export const metadata = { title: "金融申请详情 · 协会工作台" };

const FIN_LABEL: Record<FinAppStatus, string> = { pending: "待审核", approved: "已批准", rejected: "已驳回", disbursed: "已放款/出函" };
const FIN_TONE: Record<FinAppStatus, "yellow" | "brand" | "decor" | "tea"> = { pending: "yellow", approved: "brand", rejected: "decor", disbursed: "tea" };

function fmt(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }

export default async function FinanceAppDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const a = id ? getFinanceApplication(id) : undefined;
  if (!a) notFound();
  const self = `/dashboard/association/finance/app/${a!.id}`;

  return (
    <AssociationShell title="金融申请详情" subtitle={`${a!.enterpriseName} · ${a!.productName}`}>
      <Link href="/dashboard/association/finance" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回金融保险
      </Link>
      <div className="rounded-2xl border border-border bg-background p-5 md:p-6 max-w-2xl">
        <div className="flex items-start gap-4 pb-5 border-b border-border">
          <span className="h-12 w-12 rounded-2xl bg-surface inline-flex items-center justify-center shrink-0"><Landmark className="h-5 w-5 text-cat-build" /></span>
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-semibold">{a!.productName}</div>
            <div className="text-[12px] text-muted-foreground mt-1">{a!.enterpriseName} · 申请 {fmt(a!.createdAt)}</div>
          </div>
          <Badge tone={FIN_TONE[a!.status]} className="shrink-0">{FIN_LABEL[a!.status]}</Badge>
        </div>
        <dl className="mt-5 space-y-3 text-[13px]">
          <Row k="申请企业" v={a!.enterpriseName} />
          <Row k="申请额度" v={a!.amount} />
          {a!.note && <Row k="备注" v={a!.note} />}
          <Row k="申请时间" v={fmt(a!.createdAt)} />
        </dl>
        <div className="mt-6 pt-5 border-t border-border">
          <div className="text-[12px] text-muted-foreground mb-3 inline-flex items-center gap-1.5"><Landmark className="h-3.5 w-3.5" /> 审批操作</div>
          <div className="flex flex-wrap items-center gap-2">
            {a!.status === "pending" && (
              <>
                <form action={reviewFinanceAppAction}><input type="hidden" name="id" value={a!.id} /><input type="hidden" name="status" value="approved" /><input type="hidden" name="redirect" value={self} /><button className="h-10 px-5 rounded-full bg-accent-tea text-white text-[13px] font-medium inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> 批准</button></form>
                <form action={reviewFinanceAppAction}><input type="hidden" name="id" value={a!.id} /><input type="hidden" name="status" value="rejected" /><input type="hidden" name="redirect" value={self} /><button className="h-10 px-5 rounded-full border border-cat-decor/40 text-cat-decor text-[13px] font-medium inline-flex items-center gap-1.5"><XCircle className="h-4 w-4" /> 驳回</button></form>
              </>
            )}
            {a!.status === "approved" && (
              <form action={reviewFinanceAppAction}><input type="hidden" name="id" value={a!.id} /><input type="hidden" name="status" value="disbursed" /><input type="hidden" name="redirect" value={self} /><button className="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Banknote className="h-4 w-4" /> 标记放款 / 出函</button></form>
            )}
            {(a!.status === "rejected" || a!.status === "disbursed") && <p className="text-[12px] text-muted-foreground">该申请已终态（{FIN_LABEL[a!.status]}）。</p>}
          </div>
        </div>
      </div>
    </AssociationShell>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex items-start gap-3"><dt className="text-muted-foreground w-20 shrink-0">{k}</dt><dd className="font-medium">{v}</dd></div>;
}
