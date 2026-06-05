import Link from "next/link";
import { ArrowLeft, ArrowUpRight, RefreshCw, Sparkles, Inbox, CheckCheck } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { DataTable } from "@/components/dashboard/section";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { Badge } from "@/components/ui/badge";
import { listDrafts, countDrafts, type DraftStatus } from "@/lib/data/knowledge-drafts-source";
import { runKnowledgeFetchAction, approveAllDraftsAction } from "../actions";
import { BulkApproveButton } from "./BulkApproveButton";

export const metadata = { title: "知识库草稿箱 · 协会工作台" };

const STATUS_LABEL: Record<DraftStatus, { text: string; tone: "build" | "decor" | "design" }> = {
  pending: { text: "待审", tone: "decor" },
  approved: { text: "已入库", tone: "build" },
  rejected: { text: "已驳回", tone: "design" },
};

function fmt(ts: number) {
  if (!ts) return "—";
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function DraftsPage({ searchParams }: { searchParams: Promise<{ f?: string; fetched?: string; ai?: string; approved?: string }> }) {
  const { f, fetched, ai, approved } = await searchParams;
  const filter = (["pending", "approved", "rejected"].includes(String(f)) ? f : undefined) as DraftStatus | undefined;
  const drafts = listDrafts(filter);
  const pendingCount = countDrafts("pending");
  const base = "/dashboard/association/knowledge/drafts";

  return (
    <AssociationShell title="知识库草稿箱" subtitle="AI 抓取整理的待审资料 · 点行进入审核，通过后才入库">
      <Link href="/dashboard/association/knowledge" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回知识库管理
      </Link>

      {fetched !== undefined && (
        <div className="mb-4 rounded-2xl border border-brand/30 bg-brand-50 text-brand px-4 py-3 text-[13px] flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>本次抓取新增 <b>{fetched}</b> 条草稿{Number(fetched) === 0 ? "(无新增,可能已抓过或来源暂无更新)" : ",请在下方审核入库"}。{ai === "1" ? "（AI 起草）" : "（AI 未配置,已用基础整理,请仔细核对）"}</span>
        </div>
      )}

      {approved !== undefined && (
        <div className="mb-4 rounded-2xl border border-cat-build/30 bg-cat-build-soft text-cat-build px-4 py-3 text-[13px] flex items-center gap-2">
          <CheckCheck className="h-4 w-4 shrink-0" />
          <span>已将 <b>{approved}</b> 条草稿入库,前台知识库已可见。</span>
        </div>
      )}

      <StatFilters items={[
        { key: "pending", label: "待审", value: countDrafts("pending"), color: "text-cat-decor", href: filter === "pending" ? base : `${base}?f=pending`, active: filter === "pending" },
        { key: "approved", label: "已入库", value: countDrafts("approved"), color: "text-cat-build", href: filter === "approved" ? base : `${base}?f=approved`, active: filter === "approved" },
        { key: "rejected", label: "已驳回", value: countDrafts("rejected"), color: "text-muted-foreground", href: filter === "rejected" ? base : `${base}?f=rejected`, active: filter === "rejected" },
        { key: "fetch", label: "立即抓取", value: <RefreshCw className="h-5 w-5" />, color: "text-brand" },
      ]} />

      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <form action={runKnowledgeFetchAction}>
          <button className="h-10 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-[0.98]">
            <RefreshCw className="h-4 w-4" /> 立即抓取更新
          </button>
        </form>
        <BulkApproveButton action={approveAllDraftsAction} count={pendingCount} />
        {pendingCount > 0 && <span className="text-[12px] text-muted-foreground">批量入库前建议先抽查内容</span>}
      </div>

      <DataTable
        head={["标题", "分类", "来源", "状态", "抓取时间"]}
        empty="暂无草稿,点「立即抓取更新」让 AI 去找"
        rows={drafts.map((d) => [
          <Link key="t" href={`${base}/${d.id}`} className="font-medium hover:text-brand inline-flex items-center gap-1">{d.title}<ArrowUpRight className="h-3 w-3 text-muted-foreground" /></Link>,
          <Badge key="c" tone="design">{d.category}</Badge>,
          <span key="s" className="text-[11px] text-muted-foreground">{d.sourceName}</span>,
          <Badge key="st" tone={STATUS_LABEL[d.status].tone}>{STATUS_LABEL[d.status].text}</Badge>,
          <span key="ts" className="text-muted-foreground text-[12px]">{fmt(d.createdAt)}</span>,
        ])}
      />
    </AssociationShell>
  );
}
