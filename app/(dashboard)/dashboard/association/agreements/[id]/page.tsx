import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, ShieldCheck, FileText, Clock, CheckCircle2, AlertCircle,
  XCircle, Pencil, Archive, Send, Sparkles, GitCommit, User,
} from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getAgreementTemplate } from "@/lib/data/agreements-source";
import { WORKFLOW_META, getEventsForTemplate, type WorkflowStatus } from "@/lib/agreements/workflow";
import { WorkflowActions } from "./WorkflowActions";

const CATEGORY_LABEL: Record<string, string> = {
  membership: "入会 / 服务", privacy: "隐私", data_processing: "DPA",
  consent_sensitive: "敏感同意", consent_cross_border: "跨境同意",
  insurance: "保险授权", supervisor: "监管 / 共享", ndma: "保密 / 反舞弊",
  compliance: "合规",
};

const TARGET_LABEL: Record<string, string> = {
  enterprise: "企业", enterprise_staff: "企业员工", practitioner: "从业者",
  customer: "业主", association_staff: "协会员工", public: "全用户",
};

export default async function TemplateDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tpl = getAgreementTemplate(id);
  if (!tpl) notFound();

  // Demo：所有 published 模板视为已走完工作流
  const wfStatus: WorkflowStatus = tpl.status === "published" ? "published" : "draft";
  const meta = WORKFLOW_META[wfStatus];
  const events = getEventsForTemplate(tpl.id);

  return (
    <AssociationShell
      title={tpl.title}
      subtitle={`${tpl.code} · v${tpl.version} · ${CATEGORY_LABEL[tpl.category]} · 面向 ${TARGET_LABEL[tpl.target]}`}
      actions={
        <>
          <Badge tone={meta.tone}>{meta.label}</Badge>
          <Link href={`/dashboard/association/agreements/${tpl.id}/edit`} className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform">
            <Pencil className="h-3.5 w-3.5" /> 编辑 · AI 审查
          </Link>
        </>
      }
    >
      <Link href="/dashboard/association/agreements" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回协议列表
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主体 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 工作流状态 */}
          <section className="rounded-3xl border border-border bg-background p-6 md:p-8">
            <h2 className="text-[18px] font-semibold tracking-tight mb-2 flex items-center gap-2">
              <GitCommit className="h-4 w-4 text-cat-build" />
              发布工作流
            </h2>
            <p className="text-[12px] text-muted-foreground mb-5">
              {meta.description}
            </p>

            {/* 状态机进度 */}
            <ol className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {[
                { k: "draft" as WorkflowStatus, l: "草稿", n: 1 },
                { k: "legal_approved" as WorkflowStatus, l: "法务通过", n: 2 },
                { k: "secretary_approved" as WorkflowStatus, l: "秘书长批准", n: 3 },
                { k: "published" as WorkflowStatus, l: "已发布", n: 4 },
                { k: "archived" as WorkflowStatus, l: "归档", n: 5 },
              ].map((s) => {
                const past = events.some((e) => e.toStatus === s.k) || s.k === "draft";
                const current = s.k === wfStatus;
                return (
                  <li key={s.k} className="text-center">
                    <div className={`mx-auto h-10 w-10 rounded-full inline-flex items-center justify-center text-[14px] font-semibold ${
                      current ? "bg-foreground text-background ring-4 ring-foreground/10" :
                      past ? "bg-accent-tea text-white" :
                      "bg-surface text-muted-foreground"
                    }`}>
                      {past && !current ? <CheckCircle2 className="h-4 w-4" /> : s.n}
                    </div>
                    <div className={`mt-1.5 text-[11px] ${current || past ? "font-semibold" : "text-muted-foreground"}`}>
                      {s.l}
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* 可用动作 */}
            <WorkflowActions
              templateId={tpl.id}
              currentStatus={wfStatus}
              actions={meta.nextActions}
            />
          </section>

          {/* 协议正文 */}
          <section className="rounded-3xl border border-border bg-background p-6 md:p-8">
            <h2 className="text-[18px] font-semibold tracking-tight mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-cat-build" />
              协议正文
            </h2>
            <article className="prose prose-sm max-w-none whitespace-pre-wrap font-serif text-[13px] leading-7 bg-surface p-5 rounded-2xl">
              {tpl.content}
            </article>

            {/* 重点条款 */}
            <h3 className="mt-6 mb-3 text-[14px] font-semibold flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-cat-decor" />
              重点条款 · 用户须单独勾选
            </h3>
            <ul className="space-y-2">
              {tpl.highlights.map((h, i) => (
                <li key={i} className="rounded-xl bg-cat-decor-soft p-3 text-[12px] text-cat-decor flex gap-2">
                  <span className="font-semibold tabular-nums shrink-0">{i + 1}.</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            {tpl.changelog && (
              <>
                <h3 className="mt-6 mb-2 text-[14px] font-semibold">本版变更</h3>
                <div className="rounded-2xl bg-[#fff6d6] border border-accent-yellow/30 p-4 text-[13px] leading-6">
                  {tpl.changelog}
                </div>
              </>
            )}
          </section>

          {/* 审批链路 */}
          <section className="rounded-3xl border border-border bg-background p-6 md:p-8">
            <h2 className="text-[18px] font-semibold tracking-tight mb-4">审批链路</h2>
            <ol className="relative">
              <span className="absolute left-3 top-1 bottom-1 w-px bg-border" />
              {events.length > 0 ? events.map((e, i) => (
                <li key={i} className="relative pl-10 pb-5 last:pb-0">
                  <span className={`absolute left-0 top-0.5 h-6 w-6 rounded-full flex items-center justify-center ${
                    e.action.includes("reject") ? "bg-cat-decor" :
                    e.action === "publish" ? "bg-accent-tea" :
                    "bg-foreground"
                  } text-white`}>
                    {e.action.includes("reject") ? <XCircle className="h-3 w-3" /> :
                     e.action === "publish" ? <CheckCircle2 className="h-3 w-3" /> :
                     <Send className="h-3 w-3" />}
                  </span>
                  <div className="text-[13px] font-medium">{WORKFLOW_META[e.toStatus].label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 inline-flex items-center gap-1.5">
                    <User className="h-2.5 w-2.5" /> {e.actor}
                    <span>·</span>
                    <Clock className="h-2.5 w-2.5" /> {e.at}
                  </div>
                  {e.reason && (
                    <div className="text-[11px] text-muted-foreground mt-1 italic">"{e.reason}"</div>
                  )}
                </li>
              )) : (
                <li className="pl-10 text-[12px] text-muted-foreground">尚无审批历史</li>
              )}
            </ol>
          </section>
        </div>

        {/* 侧栏 */}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-background p-6">
            <div className="text-[12px] text-muted-foreground tracking-wider uppercase">关键参数</div>
            <ul className="mt-4 space-y-2.5 text-[13px]">
              <Row k="版本" v={`v${tpl.version}`} />
              <Row k="生效日" v={tpl.effectiveAt} />
              <Row k="是否必签" v={tpl.required ? "是" : "否（可选）"} />
              <Row k="PIPL 单独同意" v={tpl.requiresSeparateConsent ? "是" : "否"} />
              <Row k="升级要求重签" v={tpl.requiresResignOnChange ? "是" : "否"} />
              <Row k="最少阅读" v={`${tpl.minReadSeconds} 秒`} />
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-background p-6">
            <div className="text-[12px] text-muted-foreground tracking-wider uppercase">起草 · 审核</div>
            <ul className="mt-4 space-y-2.5 text-[13px]">
              <Row k="起草" v={tpl.draftedBy} />
              {tpl.reviewedBy && <Row k="法务核验" v={tpl.reviewedBy} />}
              {tpl.approvedBy && <Row k="批准" v={tpl.approvedBy} />}
              {tpl.approvedAt && <Row k="批准时间" v={tpl.approvedAt} />}
            </ul>
          </div>

          {wfStatus === "published" && (
            <div className="rounded-3xl bg-foreground text-background p-6">
              <AlertCircle className="h-6 w-6 text-accent-yellow" />
              <div className="mt-3 text-[14px] font-semibold">已生效 · {Math.floor((Date.now() - new Date(tpl.effectiveAt).getTime()) / 86400000)} 天</div>
              <div className="mt-1 text-[11px] text-background/70 leading-5">
                已有 1,824 名用户签署。如需归档，所有已签用户的记录将保留为
                <code className="font-mono mx-0.5">archived</code>，新用户不再可见。
              </div>
            </div>
          )}
        </aside>
      </div>
    </AssociationShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground shrink-0">{k}</span>
      <span className="font-medium text-right">{v}</span>
    </li>
  );
}
