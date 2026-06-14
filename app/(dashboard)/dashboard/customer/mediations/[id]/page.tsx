import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Building2, Clock, ShieldCheck, MessageSquareWarning, Phone, Sparkles } from "lucide-react";
import { CustomerShell } from "@/components/dashboard/customer-shell";
import { Badge } from "@/components/ui/badge";
import { MediationStepper } from "@/components/dashboard/mediation-stepper";
import { getSession } from "@/lib/auth/session";
import { listMediationsByUid } from "@/lib/data/mediations";

export const metadata = { title: "我的调解 · 业主中心" };

const STATUS: Record<string, string> = { pending: "待受理", accepted: "受理中", closed: "已结案", rejected: "已驳回" };
// 各状态对业主的友好说明
const STATUS_HINT: Record<string, string> = {
  pending: "已提交，协会调解委员会会尽快受理并与您联系。",
  accepted: "协会已受理，正在联系双方开展调解，请保持电话畅通。",
  closed: "调解已结案，处理结果见下方。",
  rejected: "很抱歉，本次申请未予受理，原因见下方。",
};

function fmtTime(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function CustomerMediationDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "customer") redirect("/login?next=/dashboard/customer");
  const { id } = await params;
  // 仅能看自己名下的调解（按 uid 取，天然鉴权，防止改 id 越权查看他人）
  const m = listMediationsByUid(session!.uid).find((x) => x.id === Number(id));
  if (!m) notFound();

  const tone = m.status === "closed" ? "tea" : m.status === "rejected" ? "decor" : m.status === "accepted" ? "brand" : "yellow";
  const img = (s: string) => /^(https?:)?\//.test(s);

  return (
    <CustomerShell showHeader={false}>
      <Link href="/dashboard/customer" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回业主中心
      </Link>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[12px] text-muted-foreground inline-flex items-center gap-1.5"><MessageSquareWarning className="h-4 w-4 text-cat-decor" /> 我的调解申请</span>
        <Badge tone={tone}>{STATUS[m.status] ?? m.status}</Badge>
      </div>
      <h1 className="text-[22px] md:text-[28px] font-semibold tracking-tight leading-tight">{m.respondent ? `投诉 ${m.respondent}` : "装修纠纷调解"}</h1>
      <p className="mt-2 text-[13px] text-muted-foreground leading-6">{STATUS_HINT[m.status]}</p>

      {/* 进度条 */}
      <div className="mt-5"><MediationStepper status={m.status} rejectedHint="未予受理，原因见下方。" /></div>

      {/* 处理结果 / 驳回原因（协会处置意见） */}
      {(m.status === "closed" || m.status === "rejected") && (
        <div className={`mt-4 rounded-2xl border p-5 ${m.status === "rejected" ? "border-cat-decor/30 bg-cat-decor-soft/40" : "border-accent-tea/30 bg-[#e6f7f1]/50"}`}>
          <div className="text-[12px] text-muted-foreground inline-flex items-center gap-1.5 mb-1.5"><ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> {m.status === "rejected" ? "未受理原因" : "协会调解结果"}{m.handledBy ? ` · 经办 ${m.handledBy}` : ""}</div>
          <p className="text-[14px] leading-7 whitespace-pre-wrap">{m.note || (m.status === "closed" ? "双方已在协会主持下达成和解。" : "未填写原因，可联系协会咨询。")}</p>
        </div>
      )}

      {/* 申请信息 */}
      <div className="mt-4 rounded-2xl border border-border bg-background p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
          <Cell icon={Building2} label="被投诉方" value={m.respondent || "—"} />
          <Cell icon={Clock} label="提交时间" value={fmtTime(m.createdAt)} />
        </div>
        <div className="mt-3">
          <div className="text-[11px] text-muted-foreground mb-1">纠纷经过 / 诉求</div>
          <p className="text-[13px] leading-7 whitespace-pre-wrap text-foreground/90">{m.detail}</p>
        </div>
        {m.photos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {m.photos.filter(img).map((src, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={i} src={src} alt={`证据 ${i + 1}`} className="w-[120px] max-w-[40vw] rounded-lg border border-border object-cover" style={{ aspectRatio: "85.6 / 54" }} />
            ))}
          </div>
        )}
      </div>

      {/* 帮助 */}
      <div className="mt-4 rounded-2xl border border-border bg-surface/40 p-4 flex items-center justify-between gap-3 flex-wrap">
        <span className="text-[12px] text-muted-foreground">对处理有疑问？可咨询 AI 小和或再次提交补充材料。</span>
        <div className="flex gap-2">
          <Link href="/ai/mediate" className="h-9 px-4 rounded-full bg-foreground text-background text-[12px] font-medium inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-accent-yellow" /> 问 AI 小和</Link>
          <a href="tel:" className="h-9 px-4 rounded-full border border-border text-[12px] font-medium inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> 联系协会</a>
        </div>
      </div>
    </CustomerShell>
  );
}

function Cell({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 px-3.5 py-2.5">
      <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1"><Icon className="h-3 w-3" /> {label}</div>
      <div className="mt-0.5 font-medium truncate">{value}</div>
    </div>
  );
}
