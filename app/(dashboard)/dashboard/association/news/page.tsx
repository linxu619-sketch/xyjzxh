import Link from "next/link";
import { ChevronRight, Eye, CheckCircle2, AlertCircle, Newspaper } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { Badge } from "@/components/ui/badge";
import { listNews, type NewsStatus } from "@/lib/data/news-source";
import { PublishNews } from "./PublishNews";

export const metadata = { title: "新闻发布 · 协会工作台" };

const FILTERABLE: NewsStatus[] = ["published", "draft"];
const CAT_TONE: Record<string, "build" | "decor" | "design" | "tea" | "brand"> = {
  "协会公告": "build", "政策解读": "decor", "行业新闻": "design", "会员动态": "tea", "活动通知": "brand",
};

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default async function NewsAdmin({ searchParams }: { searchParams: Promise<{ f?: string; nok?: string; nerr?: string }> }) {
  const { f, nok, nerr } = await searchParams;
  const all = listNews();
  const active = f && FILTERABLE.includes(f as NewsStatus) ? (f as NewsStatus) : undefined;
  const list = active ? all.filter((n) => n.status === active) : all;
  const published = all.filter((n) => n.status === "published").length;
  const draft = all.filter((n) => n.status === "draft").length;
  const totalViews = all.reduce((a, n) => a + n.views, 0);
  const base = "/dashboard/association/news";
  const href = (st: NewsStatus) => (active === st ? base : `${base}?f=${st}`);

  return (
    <AssociationShell title="新闻发布" subtitle={`已发布 ${published} 篇 · 草稿 ${draft} 篇`} actions={<PublishNews />}>
      {nok && <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>已发布！</b>会员门户与新闻页即时可见。</div></div>}
      {nerr && <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 flex items-center gap-3"><AlertCircle className="h-5 w-5 shrink-0" /><div className="text-[13px]">发布失败：请填写标题与正文。</div></div>}

      <StatFilters
        items={[
          { key: "published", label: "已发布", value: published, color: "text-cat-build", href: href("published"), active: active === "published" },
          { key: "draft", label: "草稿", value: draft, color: "text-muted-foreground", href: href("draft"), active: active === "draft" },
          { key: "views", label: "总阅读", value: totalViews.toLocaleString(), color: "text-accent-tea" },
          { key: "all", label: "全部", value: all.length, color: "text-cat-design", href: base, active: !active },
        ]}
      />

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold flex items-center justify-between">
          <span>新闻 / 公告 · 点击查看与管理</span>
          {active && <Link href={base} className="text-[12px] text-brand font-normal">清除筛选 ✕</Link>}
        </div>
        {list.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">{active ? "没有该状态的内容。" : "还没有新闻。点右上「发布新闻」发布第一条。"}</div>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((n) => (
              <li key={n.id}>
                <Link href={`/dashboard/association/news/${n.id}`} className="flex items-center gap-3 px-5 py-4 hover:bg-surface transition-colors">
                  <span className="h-9 w-9 rounded-xl bg-cat-build-soft text-cat-build inline-flex items-center justify-center shrink-0"><Newspaper className="h-4 w-4" /></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge tone={CAT_TONE[n.category] ?? "build"}>{n.category}</Badge>
                      {n.hot && <Badge tone="decor">热门</Badge>}
                      <span className="font-medium truncate">{n.title}</span>
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-0.5 inline-flex items-center gap-2">
                      <span>{n.author}</span><span>·</span><span>{fmt(n.createdAt)}</span><span>·</span><span className="inline-flex items-center gap-0.5"><Eye className="h-3 w-3" />{n.views}</span>
                    </div>
                  </div>
                  <Badge tone={n.status === "published" ? "tea" : "neutral"} className="shrink-0">{n.status === "published" ? "已发布" : "草稿"}</Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AssociationShell>
  );
}
