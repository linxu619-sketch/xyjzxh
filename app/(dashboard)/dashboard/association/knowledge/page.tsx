import Link from "next/link";
import { Library, Sparkles, ArrowUpRight, Plus, FileText, RefreshCw, Inbox, Rss, ChevronRight } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { DataTable } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { KNOWLEDGE_CATEGORIES } from "@/lib/data/knowledge";
import { listKnowledge } from "@/lib/data/knowledge-source";
import { countDrafts } from "@/lib/data/knowledge-drafts-source";
import { listSources } from "@/lib/data/knowledge-sources-source";
import { KnowledgeForm } from "./KnowledgeForm";
import { createKnowledgeAction, runKnowledgeFetchAction, backfillBodiesAction } from "./actions";

export const metadata = { title: "知识库管理 · 协会工作台" };

export default async function KnowledgeAdmin({ searchParams }: { searchParams: Promise<{ kerr?: string; bf?: string }> }) {
  const { kerr, bf } = await searchParams;
  const bfParts = bf ? bf.split("_").map((n) => Number(n) || 0) : null; // [filled, failed, scanned]
  const KNOWLEDGE = listKnowledge();
  const hotCount = KNOWLEDGE.filter((k) => k.hot).length;
  const catCount = (key: string) => KNOWLEDGE.filter((k) => k.category === key).length;
  const base = "/dashboard/association/knowledge";
  const pendingDrafts = countDrafts("pending");
  const enabledSources = listSources(true).length;
  const totalSources = listSources().length;

  return (
    <AssociationShell title="知识库管理" subtitle={`共 ${KNOWLEDGE.length} 篇资料 · 热门 ${hotCount} 篇 · 点行可编辑`}>
      {/* 分类统计（真实条数）*/}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        {KNOWLEDGE_CATEGORIES.map((c) => (
          <div key={c.key} className="rounded-2xl border border-border bg-background p-5">
            <Badge tone={c.color as "build"}>{c.key}</Badge>
            <div className="mt-3 text-[28px] font-semibold tracking-tight tabular-nums">{catCount(c.key)}</div>
            <div className="text-[11px] text-muted-foreground">篇资料</div>
          </div>
        ))}
      </div>

      {/* 新增资料（上传 PDF + 录入）*/}
      <details className="rounded-2xl border border-border bg-background mb-6 group">
        <summary className="px-5 py-3.5 cursor-pointer list-none flex items-center gap-2 text-[14px] font-semibold">
          <Plus className="h-4 w-4" /> 新增资料 <span className="text-[12px] text-muted-foreground font-normal">· 上传 PDF / DOC 原文,录入标题分类后入库</span>
        </summary>
        <div className="px-5 pb-5 pt-1">
          {kerr && <div className="mb-3 text-[12px] text-cat-decor">新增失败：请填写资料标题。</div>}
          <KnowledgeForm action={createKnowledgeAction} submitLabel="新增资料" />
        </div>
      </details>

      {/* AI 自动更新：立即抓取 + 草稿箱 + 来源管理 */}
      <div className="rounded-2xl border border-border bg-background p-5 mb-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[14px] font-semibold inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-brand" /> AI 自动更新知识库</div>
            <p className="mt-1 text-[12px] text-muted-foreground max-w-lg leading-5">从配置的政府 / 行业来源抓取最新政策资讯,AI 整理成草稿进「草稿箱」<b>待人工审核</b>后入库,不会自动直接发布。当前 {enabledSources}/{totalSources} 个来源启用。</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <form action={backfillBodiesAction}>
              <button className="h-10 px-4 rounded-full border border-border text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-surface active:scale-[0.98]" title="给之前已入库但没有正文的旧文章补抓原文全文（单次最多 12 篇，可重复点）">
                <FileText className="h-4 w-4" /> 回填旧文章正文
              </button>
            </form>
            <form action={runKnowledgeFetchAction}>
              <button className="h-10 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-[0.98]">
                <RefreshCw className="h-4 w-4" /> 立即抓取更新
              </button>
            </form>
          </div>
        </div>

        {bfParts && (
          <div className="mt-3 rounded-xl border border-accent-tea/30 bg-[#e6f7f1]/60 text-accent-tea px-4 py-2.5 text-[12px] inline-flex items-center gap-2">
            <FileText className="h-4 w-4 shrink-0" />
            回填完成：成功补全 <b>{bfParts[0]}</b> 篇{bfParts[1] ? `,${bfParts[1]} 篇未抓到(可重试或人工补)` : ""}{bfParts[2] === 12 ? "。本批已满 12 篇,如还有可再点一次。" : "。"}
          </div>
        )}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`${base}/drafts`} className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 p-3.5 hover:bg-surface transition-colors">
            <span className="h-9 w-9 rounded-xl bg-brand-50 text-brand inline-flex items-center justify-center shrink-0"><Inbox className="h-4 w-4" /></span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium">草稿箱{pendingDrafts > 0 && <span className="ml-1.5 text-[11px] text-cat-decor font-semibold">{pendingDrafts} 条待审</span>}</div>
              <div className="text-[11px] text-muted-foreground">审核 AI 抓取的待审资料</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </Link>
          <Link href={`${base}/sources`} className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 p-3.5 hover:bg-surface transition-colors">
            <span className="h-9 w-9 rounded-xl bg-cat-design-soft text-cat-design inline-flex items-center justify-center shrink-0"><Rss className="h-4 w-4" /></span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium">抓取来源管理</div>
              <div className="text-[11px] text-muted-foreground">增删 / 启停政府·行业来源({totalSources})</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-foreground text-background p-6 relative overflow-hidden mb-6">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cat-design/30 blur-2xl" />
        <Sparkles className="relative h-6 w-6 text-accent-yellow" />
        <div className="relative mt-3 text-[18px] font-semibold">AI 小知 · 知识库导航</div>
        <p className="relative mt-2 text-[12px] text-background/70 max-w-md leading-5">上传 PDF / DOCX 后可在阅读页查看原文；后续接入文档解析将自动抽取标签、摘要与条款级 QA 供 AI 检索。</p>
        <div className="relative mt-4 inline-flex items-center gap-2 text-[12px]"><Library className="h-4 w-4 text-accent-yellow" /> 当前已收录 <b className="text-accent-yellow">{KNOWLEDGE.length}</b> 篇可检索资料</div>
      </div>

      {/* 资料列表：点行进入编辑 */}
      <DataTable
        head={["标题", "分类", "标签", "发布日期", "原文", "热度"]}
        rows={KNOWLEDGE.map((k) => [
          <Link key="t" href={`${base}/${k.id}`} className="font-medium hover:text-brand inline-flex items-center gap-1">{k.title}<ArrowUpRight className="h-3 w-3 text-muted-foreground" /></Link>,
          <Badge key="c" tone="design">{k.category}</Badge>,
          <span key="g" className="text-[11px] text-muted-foreground">{k.tags.slice(0, 2).join(" · ")}</span>,
          <span key="d" className="text-muted-foreground">{k.date}</span>,
          k.fileUrl ? <span key="f" className="inline-flex items-center gap-1 text-[11px] text-cat-decor"><FileText className="h-3 w-3" />{k.size || "原文"}</span> : <span key="nf" className="text-muted-foreground text-[11px]">—</span>,
          k.hot ? <span key="h" className="text-cat-decor text-[11px] font-medium">🔥 HOT</span> : <span key="nh" className="text-muted-foreground text-[11px]">—</span>,
        ])}
      />
    </AssociationShell>
  );
}
