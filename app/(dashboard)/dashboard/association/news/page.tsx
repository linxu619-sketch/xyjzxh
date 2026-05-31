import Link from "next/link";
import { Plus, Eye, Pencil, Trash2, Share2 } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { DataTable } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { NEWS_ITEMS } from "@/lib/data/news";

export const metadata = { title: "新闻管理 · 协会工作台" };

const TONE = { build: "build", decor: "decor", design: "design", brand: "brand", tea: "tea" } as const;

export default function NewsAdmin() {
  return (
    <AssociationShell
      title="新闻 / 公告 管理"
      subtitle={`已发布 ${NEWS_ITEMS.length} 篇 · 草稿 4 篇 · 本月总阅读 8.2 万`}
      actions={
        <button className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> 新建文章
        </button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { l: "已发布", v: NEWS_ITEMS.length, c: "text-cat-build" },
          { l: "草稿", v: 4, c: "text-cat-decor" },
          { l: "本月阅读", v: "82.4K", c: "text-cat-design" },
          { l: "平均停留", v: "2 分钟", c: "text-accent-tea" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-background p-5">
            <div className="text-[11px] text-muted-foreground tracking-wider uppercase">{s.l}</div>
            <div className={`mt-1 text-[28px] font-semibold tracking-tight ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mb-3">
        {["全部", "协会公告", "政策解读", "行业新闻", "会员动态", "活动通知", "草稿"].map((t, i) => (
          <button key={t} className={`h-9 px-4 rounded-full text-[13px] font-medium ${i === 0 ? "bg-foreground text-background" : "bg-background border border-border text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      <DataTable dropActionCol
        head={["标题", "分类", "作者", "发布时间", "阅读", "状态", "操作"]}
        rows={NEWS_ITEMS.map((n) => [
          <span key="t" className="font-medium max-w-md truncate inline-block">{n.title}</span>,
          <Badge key="c" tone={TONE[n.color]}>{n.category}</Badge>,
          <span key="a" className="text-muted-foreground">{n.author ?? "—"}</span>,
          <span key="d" className="text-muted-foreground">{n.date}</span>,
          <span key="v" className="text-muted-foreground">{n.views.toLocaleString()}</span>,
          n.hot ? <Badge key="s" tone="decor">🔥 已置顶</Badge> : <Badge key="s" tone="tea">已发布</Badge>,
          <div key="o" className="flex items-center gap-1">
            <button className="h-8 w-8 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground"><Eye className="h-3.5 w-3.5" /></button>
            <button className="h-8 w-8 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
            <button className="h-8 w-8 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground"><Share2 className="h-3.5 w-3.5" /></button>
            <button className="h-8 w-8 rounded-lg hover:bg-cat-decor-soft text-cat-decor"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>,
        ])}
      />
    </AssociationShell>
  );
}
