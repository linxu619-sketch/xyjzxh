import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Trash2, Flame, ShieldCheck } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getKnowledgeArticle } from "@/lib/data/knowledge-source";
import { KnowledgeForm } from "../KnowledgeForm";
import { updateKnowledgeAction, toggleKnowledgeHotAction, deleteKnowledgeAction } from "../actions";

export const metadata = { title: "编辑资料 · 知识库管理" };

export default async function KnowledgeEdit({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const k = getKnowledgeArticle(id);
  if (!k) notFound();

  const initial = {
    id: k.id, title: k.title, category: k.category, tags: k.tags.join("、"), excerpt: k.excerpt,
    date: k.date, sections: k.content ?? [],
    hot: k.hot, fileUrl: k.fileUrl, fileName: k.fileName, size: k.size,
  };

  return (
    <AssociationShell title="编辑资料" subtitle={k.title}>
      <Link href="/dashboard/association/knowledge" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回知识库列表
      </Link>
      {saved && <div className="mb-4 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea px-4 py-2.5 text-[13px] inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> 已保存</div>}

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Badge tone="design">{k.category}</Badge>
        {k.hot && <Badge tone="decor">🔥 热门</Badge>}
        <Link href={`/knowledge/${k.id}`} target="_blank" className="ml-auto inline-flex items-center gap-1 text-[13px] text-brand hover:underline">前台预览 <ArrowUpRight className="h-3.5 w-3.5" /></Link>
      </div>

      <div className="rounded-2xl border border-border bg-background p-5 md:p-6 max-w-2xl">
        <KnowledgeForm action={updateKnowledgeAction} initial={initial} submitLabel="保存修改" />

        <div className="mt-6 pt-5 border-t border-border flex items-center gap-2 flex-wrap">
          <form action={toggleKnowledgeHotAction}>
            <input type="hidden" name="id" value={k.id} />
            <input type="hidden" name="hot" value={k.hot ? "0" : "1"} />
            <button className="h-9 px-4 rounded-full bg-surface text-[12px] inline-flex items-center gap-1.5 hover:bg-surface-2"><Flame className="h-3.5 w-3.5" /> {k.hot ? "取消热门" : "设为热门"}</button>
          </form>
          <form action={deleteKnowledgeAction}>
            <input type="hidden" name="id" value={k.id} />
            <button className="h-9 px-4 rounded-full text-cat-decor text-[12px] inline-flex items-center gap-1.5 hover:bg-cat-decor-soft"><Trash2 className="h-3.5 w-3.5" /> 删除资料</button>
          </form>
        </div>
      </div>
    </AssociationShell>
  );
}
