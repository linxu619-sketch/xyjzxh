import Link from "next/link";
import { Upload, Eye, Pencil, Trash2, Library, Sparkles } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { DataTable } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { KNOWLEDGE_CATEGORIES } from "@/lib/data/knowledge";
import { listKnowledge } from "@/lib/data/knowledge-source";

export const metadata = { title: "知识库管理 · 协会工作台" };

export default function KnowledgeAdmin() {
  const KNOWLEDGE = listKnowledge();
  return (
    <AssociationShell
      title="知识库管理"
      subtitle={`共 ${KNOWLEDGE.length + 314} 份资料 · 本月新增 24 份 · 本周热门 ${KNOWLEDGE.filter((k) => k.hot).length}`}
      actions={
        <button className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <Upload className="h-3.5 w-3.5" /> 上传资料
        </button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        {KNOWLEDGE_CATEGORIES.map((c) => (
          <div key={c.key} className="rounded-2xl border border-border bg-background p-5">
            <Badge tone={c.color as "build"}>{c.key}</Badge>
            <div className="mt-3 text-[28px] font-semibold tracking-tight">{c.count}</div>
            <div className="text-[11px] text-muted-foreground">份资料</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 rounded-2xl bg-foreground text-background p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cat-design/30 blur-2xl" />
          <Sparkles className="relative h-6 w-6 text-accent-yellow" />
          <div className="relative mt-3 text-[18px] font-semibold">AI 小知 · 知识库导航</div>
          <p className="relative mt-2 text-[12px] text-background/70 max-w-md leading-5">
            上传 PDF/DOCX 后 30 秒内自动抽取标签、摘要、关键词，并生成条款级 QA 供 AI 检索。
          </p>
          <div className="relative mt-4 flex items-center gap-3">
            <Library className="h-4 w-4 text-accent-yellow" />
            <div className="flex-1">
              <div className="text-[12px]">本月已自动标注 86 份</div>
              <div className="mt-1 h-1.5 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-accent-yellow" style={{ width: "76%" }} />
              </div>
            </div>
            <span className="text-[12px] font-semibold">76%</span>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-6">
          <div className="text-[12px] text-muted-foreground tracking-wider uppercase">本周下载排行</div>
          <ol className="mt-3 space-y-2.5 text-[13px]">
            {KNOWLEDGE.slice(0, 4).map((k, i) => (
              <li key={k.id} className="flex items-center gap-2">
                <span className={`w-5 text-center text-[11px] font-semibold ${i < 3 ? "text-cat-decor" : "text-muted-foreground"}`}>{i + 1}</span>
                <span className="truncate flex-1">{k.title}</span>
                <span className="text-[11px] text-muted-foreground">{1200 - i * 180}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <DataTable dropActionCol
        head={["标题", "分类", "标签", "发布日期", "大小", "热度", "操作"]}
        rows={KNOWLEDGE.map((k) => [
          <span key="t" className="font-medium">{k.title}</span>,
          <Badge key="c" tone="design">{k.category}</Badge>,
          <span key="g" className="text-[11px] text-muted-foreground">{k.tags.slice(0, 2).join(" · ")}</span>,
          <span key="d" className="text-muted-foreground">{k.date}</span>,
          <span key="s" className="text-muted-foreground">{k.size ?? "—"}</span>,
          k.hot ? <span key="h" className="text-cat-decor text-[11px] font-medium">🔥 HOT</span> : <span key="nh" className="text-muted-foreground text-[11px]">—</span>,
          <div key="o" className="flex items-center gap-1">
            <button className="h-8 w-8 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground"><Eye className="h-3.5 w-3.5" /></button>
            <button className="h-8 w-8 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
            <button className="h-8 w-8 rounded-lg hover:bg-cat-decor-soft text-cat-decor"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>,
        ])}
      />
    </AssociationShell>
  );
}
