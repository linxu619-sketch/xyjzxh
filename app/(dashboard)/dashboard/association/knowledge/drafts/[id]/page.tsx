import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Sparkles, ShieldCheck, XCircle, Trash2, CheckCircle2, ArrowUpRight } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getDraft } from "@/lib/data/knowledge-drafts-source";
import { KnowledgeForm } from "../../KnowledgeForm";
import { approveDraftAction, rejectDraftAction, deleteDraftAction } from "../../actions";

export const metadata = { title: "审核草稿 · 知识库草稿箱" };

function fmt(ts?: number) {
  if (!ts) return "—";
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function DraftReview({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ kerr?: string }> }) {
  const { id } = await params;
  const { kerr } = await searchParams;
  const d = getDraft(id);
  if (!d) notFound();
  const draftsBase = "/dashboard/association/knowledge/drafts";

  const isExternal = /^https?:\/\//.test(d.sourceUrl);
  const initial = {
    title: d.title, category: d.category, tags: d.tags.join("、"), excerpt: d.excerpt,
    body: d.body, sections: d.content, hot: false,
  };

  return (
    <AssociationShell title="审核草稿" subtitle={d.title}>
      <Link href={draftsBase} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回草稿箱
      </Link>

      {/* 来源 + 状态 */}
      <div className="rounded-2xl border border-border bg-surface/40 p-4 mb-5 text-[13px]">
        <div className="flex items-center gap-2 flex-wrap">
          <Sparkles className="h-4 w-4 text-brand" />
          <span className="text-muted-foreground">来源</span>
          <b>{d.sourceName}</b>
          <span className="text-muted-foreground">· 抓取于 {fmt(d.createdAt)}</span>
          {d.status === "pending" && <Badge tone="decor">待审</Badge>}
          {d.status === "approved" && <Badge tone="build">已入库</Badge>}
          {d.status === "rejected" && <Badge tone="design">已驳回</Badge>}
        </div>
        <div className="mt-2 text-[12px]">
          {isExternal ? (
            <a href={d.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand hover:underline break-all">
              {d.sourceUrl} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          ) : (
            <span className="text-muted-foreground break-all">原文链接：{d.sourceUrl}（样例/内部链接）</span>
          )}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground leading-5">⚠️ 这是 AI 自动整理的草稿{d.body ? "：正文为自动抓取的原文全文(可能含网页噪声)、要点为 AI 概括摘录" : "：仅有要点概括,未抓到原文全文"}。请对照原文核对、删改无误后再「通过并入库」。</p>
      </div>

      {d.status === "pending" ? (
        <div className="rounded-2xl border border-border bg-background p-5 md:p-6 max-w-2xl">
          {kerr && <div className="mb-3 text-[12px] text-cat-decor">入库失败：请填写资料标题。</div>}
          <KnowledgeForm action={approveDraftAction} initial={initial} submitLabel="通过并入库" hiddenFields={{ draftId: d.id }} />

          <div className="mt-6 pt-5 border-t border-border flex items-center gap-2 flex-wrap">
            <form action={rejectDraftAction}>
              <input type="hidden" name="draftId" value={d.id} />
              <button className="h-9 px-4 rounded-full bg-surface text-[12px] inline-flex items-center gap-1.5 hover:bg-surface-2"><XCircle className="h-3.5 w-3.5" /> 驳回</button>
            </form>
            <form action={deleteDraftAction}>
              <input type="hidden" name="draftId" value={d.id} />
              <button className="h-9 px-4 rounded-full text-cat-decor text-[12px] inline-flex items-center gap-1.5 hover:bg-cat-decor-soft"><Trash2 className="h-3.5 w-3.5" /> 删除草稿</button>
            </form>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-background p-5 max-w-2xl text-[13px]">
          {d.status === "approved" ? (
            <div className="flex items-center gap-2 text-cat-build"><CheckCircle2 className="h-4 w-4" /> 已由 {d.reviewedBy} 于 {fmt(d.reviewedAt)} 审核入库。</div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground"><XCircle className="h-4 w-4" /> 已由 {d.reviewedBy} 于 {fmt(d.reviewedAt)} 驳回。</div>
          )}
          {d.articleId && (
            <Link href={`/dashboard/association/knowledge/${d.articleId}`} className="mt-3 inline-flex items-center gap-1 text-brand hover:underline text-[13px]">查看入库文章 <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          )}
          <div className="mt-4 pt-4 border-t border-border">
            <form action={deleteDraftAction}>
              <input type="hidden" name="draftId" value={d.id} />
              <button className="h-9 px-4 rounded-full text-cat-decor text-[12px] inline-flex items-center gap-1.5 hover:bg-cat-decor-soft"><Trash2 className="h-3.5 w-3.5" /> 删除草稿</button>
            </form>
          </div>
        </div>
      )}

      <div className="mt-4 text-[12px] text-muted-foreground inline-flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> 草稿通过后才会出现在前台知识库,且会标注来源
      </div>
    </AssociationShell>
  );
}
