import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Gavel, ShieldCheck, User, Phone, Building2, Clock } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getMediation } from "@/lib/data/mediations";
import { reviewMediationAction } from "../actions";
import { ConfirmButton } from "../ConfirmButton";
import { MediationStepper } from "@/components/dashboard/mediation-stepper";
import { PrintBar, Letterhead, DocTable, SealFooter } from "@/components/print/print-doc";
import { getPlatformInfo } from "@/lib/runtime-config";

export const metadata = { title: "调解处置 · 协会工作台" };

const STATUS: Record<string, string> = { pending: "待受理", accepted: "受理中", closed: "已结案", rejected: "已驳回" };
const DONE_MSG: Record<string, string> = { accept: "已受理 —— 该纠纷进入「受理中」，可联系双方开展调解。", reject: "已驳回 —— 已记录，请告知申请人原因。", close: "已结案 —— 调解流程完成，记录单可打印归档。" };

export default async function MediationDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ done?: string }> }) {
  const { id } = await params;
  const { done } = await searchParams;
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
  const org = await getPlatformInfo();
  const img = (s: string) => /^(https?:)?\//.test(s);
  const doneMsg = done ? DONE_MSG[done] : undefined;

  return (
    <AssociationShell title="调解处置" subtitle={`${m.applicant}${m.respondent ? ` · 投诉 ${m.respondent}` : ""}`}>
      {/* 工具栏（不打印）：返回 + 反馈 + 当事人卡 + 进度 + 处置操作 + 打印 */}
      <div className="no-print">
        <Link href="/dashboard/association/mediations" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回列表</Link>

        {/* 操作成功反馈横幅（受理/驳回/结案后留在本页，不再甩回列表）*/}
        {doneMsg && (
          <div className={`mb-4 rounded-2xl border p-3.5 flex items-center gap-2 text-[13px] ${done === "reject" ? "border-cat-decor/30 bg-cat-decor-soft text-cat-decor" : "border-accent-tea/30 bg-[#e6f7f1] text-accent-tea"}`}>
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {doneMsg}
          </div>
        )}

        {/* 当事人信息卡（屏幕醒目展示，不用到 A4 公文里找名字）*/}
        <div className="mb-4 rounded-2xl border border-border bg-background p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="text-[12px] text-muted-foreground inline-flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> 申请人（业主）</div>
              <div className="mt-1 text-[22px] font-semibold tracking-tight">{m.applicant || "未具名"}</div>
              <a href={`tel:${m.phone}`} className="mt-1 inline-flex items-center gap-1.5 text-[14px] text-brand font-medium hover:underline"><Phone className="h-3.5 w-3.5" /> {m.phone || "未留电话"}</a>
            </div>
            <Badge tone={statusTone}>{STATUS[m.status] ?? m.status}</Badge>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[13px]">
            <InfoCell icon={Building2} label="被投诉方" value={m.respondent || "—"} />
            <InfoCell icon={Clock} label="提交时间" value={fmtTime(m.createdAt)} />
            <InfoCell icon={ShieldCheck} label="经办人" value={m.handledBy ? `${m.handledBy} · ${fmtDay(m.handledAt)}` : "尚未经办"} />
          </div>
        </div>

        {/* 进度条 / 当前环节 */}
        <MediationStepper status={m.status} rejectedHint="该申请未予受理（不属于调解范围 / 材料不足等），流程终止。" />

        {/* 处置操作 */}
        <div className="mt-4 mb-4">
          {m.status === "pending" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 受理（直接进入受理中） */}
              <form action={reviewMediationAction} className="rounded-2xl border border-accent-tea/30 bg-[#e6f7f1]/40 p-4">
                <input type="hidden" name="id" value={m.id} /><input type="hidden" name="act" value="accept" />
                <div className="text-[13px] font-semibold mb-2">受理这起纠纷</div>
                <p className="text-[12px] text-muted-foreground mb-3 leading-5">确认属于本会调解范围，进入「受理中」联系双方。</p>
                <button className="h-10 px-5 rounded-full bg-accent-tea text-white text-[13px] font-medium inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> 受理</button>
              </form>
              {/* 驳回（需填原因 + 二次确认） */}
              <form action={reviewMediationAction} className="rounded-2xl border border-cat-decor/30 bg-cat-decor-soft/40 p-4">
                <input type="hidden" name="id" value={m.id} /><input type="hidden" name="act" value="reject" />
                <div className="text-[13px] font-semibold mb-2">驳回申请</div>
                <textarea name="note" rows={2} placeholder="驳回原因（将告知申请人，如：不属于本会调解范围 / 材料不足）" className="w-full rounded-xl border border-border bg-background p-2.5 text-[13px] leading-6 outline-none focus:border-cat-decor/50 mb-3" />
                <ConfirmButton confirmText="确认驳回该调解申请？驳回后流程终止。" className="h-10 px-5 rounded-full border border-cat-decor/50 text-cat-decor text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-cat-decor-soft">
                  <XCircle className="h-4 w-4" /> 确认驳回
                </ConfirmButton>
              </form>
            </div>
          )}
          {m.status === "accepted" && (
            <form action={reviewMediationAction} className="rounded-2xl border border-border bg-background p-4">
              <input type="hidden" name="id" value={m.id} /><input type="hidden" name="act" value="close" />
              <div className="text-[13px] font-semibold mb-2">结案 · 填写调解结果</div>
              <textarea name="note" rows={3} placeholder="调解结果 / 处置意见（如：双方在协会主持下达成和解，企业 7 日内返工…）将记入处置记录单。" className="w-full rounded-xl border border-border bg-background p-2.5 text-[13px] leading-6 outline-none focus:border-foreground/40 mb-3" />
              <button className="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Gavel className="h-4 w-4" /> 标记结案</button>
            </form>
          )}
          {(m.status === "closed" || m.status === "rejected") && (
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="text-[12px] text-muted-foreground inline-flex items-center gap-1.5 mb-1"><ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> {m.status === "rejected" ? "驳回原因" : "调解结果 / 处置意见"}{m.handledBy ? ` · ${m.handledBy}` : ""}</div>
              <p className="text-[13px] leading-7 whitespace-pre-wrap">{m.note || (m.status === "closed" ? "（双方已在协会主持下达成和解。）" : "（未填写原因。）")}</p>
            </div>
          )}
        </div>

        <PrintBar hint="下方为 A4 调解处置记录单，可直接打印或「另存为 PDF」存档。" />
      </div>

      {/* A4 公文（打印区） */}
      <div className="print-area">
        <div className="a4-sheet">
          <Letterhead title="纠纷调解受理 / 处置记录单" docNo={docNo} date={fmtDay(m.createdAt)} org={org} />

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
            <div className="border border-[#ccc] min-h-[120px] p-3 text-[13px] leading-7 whitespace-pre-wrap">
              {m.note
                ? m.note
                : m.status === "closed" ? "（双方已在协会主持下达成和解，详见调解协议书。）" : m.status === "rejected" ? "（经审查不属于本会调解范围 / 材料不足，已告知申请人。）" : ""}
            </div>
          </div>

          <SealFooter
            date={m.handledAt ? fmtDay(m.handledAt) : undefined}
            lines={[
              { label: "调解经办", value: m.handledBy ? `${m.handledBy} · ${fmtDay(m.handledAt)}` : undefined },
              { label: "申请人（签字）" },
              { label: "被投诉方（签字）" },
              { label: "协会调解委员会（盖章）" },
            ]}
          />
        </div>
      </div>
    </AssociationShell>
  );
}

function InfoCell({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 px-3.5 py-2.5">
      <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1"><Icon className="h-3 w-3" /> {label}</div>
      <div className="mt-0.5 font-medium truncate">{value}</div>
    </div>
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
