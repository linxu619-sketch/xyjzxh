import Link from "next/link";
import { Library, Sparkles, ArrowUpRight } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { DataTable } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { KNOWLEDGE_CATEGORIES } from "@/lib/data/knowledge";
import { listKnowledge } from "@/lib/data/knowledge-source";

export const metadata = { title: "知识库管理 · 协会工作台" };

export default function KnowledgeAdmin() {
  const KNOWLEDGE = listKnowledge();
  const hotCount = KNOWLEDGE.filter((k) => k.hot).length;
  const catCount = (key: string) => KNOWLEDGE.filter((k) => k.category === key).length;

  return (
    <AssociationShell
      title="知识库管理"
      subtitle={`共 ${KNOWLEDGE.length} 篇资料 · 热门 ${hotCount} 篇 · 点标题可在线阅读`}
    >
      {/* 分类统计（真实条数，可点筛选式查看）*/}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        {KNOWLEDGE_CATEGORIES.map((c) => (
          <div key={c.key} className="rounded-2xl border border-border bg-background p-5">
            <Badge tone={c.color as "build"}>{c.key}</Badge>
            <div className="mt-3 text-[28px] font-semibold tracking-tight tabular-nums">{catCount(c.key)}</div>
            <div className="text-[11px] text-muted-foreground">篇资料</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 rounded-2xl bg-foreground text-background p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cat-design/30 blur-2xl" />
          <Sparkles className="relative h-6 w-6 text-accent-yellow" />
          <div className="relative mt-3 text-[18px] font-semibold">AI 小知 · 知识库导航</div>
          <p className="relative mt-2 text-[12px] text-background/70 max-w-md leading-5">
            上传 PDF / DOCX 后自动抽取标签、摘要、关键词，并生成条款级 QA 供 AI 检索（接入文档解析后启用）。
          </p>
          <div className="relative mt-4 inline-flex items-center gap-2 text-[12px]">
            <Library className="h-4 w-4 text-accent-yellow" /> 当前已收录 <b className="text-accent-yellow">{KNOWLEDGE.length}</b> 篇可检索资料
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-6">
          <div className="text-[12px] text-muted-foreground tracking-wider uppercase">热门资料</div>
          <ol className="mt-3 space-y-2.5 text-[13px]">
            {KNOWLEDGE.filter((k) => k.hot).concat(KNOWLEDGE.filter((k) => !k.hot)).slice(0, 4).map((k, i) => (
              <li key={k.id}>
                <Link href={`/knowledge/${k.id}`} className="flex items-center gap-2 hover:text-brand">
                  <span className={`w-5 text-center text-[11px] font-semibold ${i < 3 ? "text-cat-decor" : "text-muted-foreground"}`}>{i + 1}</span>
                  <span className="truncate flex-1">{k.title}</span>
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground shrink-0" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* 资料列表：点标题在线阅读 */}
      <DataTable
        head={["标题", "分类", "标签", "发布日期", "大小", "热度"]}
        rows={KNOWLEDGE.map((k) => [
          <Link key="t" href={`/knowledge/${k.id}`} className="font-medium hover:text-brand inline-flex items-center gap-1">{k.title}<ArrowUpRight className="h-3 w-3 text-muted-foreground" /></Link>,
          <Badge key="c" tone="design">{k.category}</Badge>,
          <span key="g" className="text-[11px] text-muted-foreground">{k.tags.slice(0, 2).join(" · ")}</span>,
          <span key="d" className="text-muted-foreground">{k.date}</span>,
          <span key="s" className="text-muted-foreground">{k.size ?? "—"}</span>,
          k.hot ? <span key="h" className="text-cat-decor text-[11px] font-medium">🔥 HOT</span> : <span key="nh" className="text-muted-foreground text-[11px]">—</span>,
        ])}
      />
    </AssociationShell>
  );
}
