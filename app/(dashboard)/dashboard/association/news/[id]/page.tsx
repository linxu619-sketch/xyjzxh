import Link from "next/link";
import { ArrowLeft, Eye, Trash2, Send, Archive, ExternalLink } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getNews } from "@/lib/data/news-source";
import { setNewsStatusAction, deleteNewsAction } from "../actions";

export const metadata = { title: "新闻详情 · 协会工作台" };

const CAT_TONE: Record<string, "build" | "decor" | "design" | "tea" | "brand" | "party"> = {
  "党建": "party", "协会公告": "build", "政策解读": "decor", "行业新闻": "design", "会员动态": "tea", "活动通知": "brand",
};

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function NewsDetailAdmin({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = getNews(Number(id));

  if (!n) {
    return (
      <AssociationShell title="新闻详情">
        <Link href="/dashboard/association/news" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> 返回新闻列表</Link>
        <div className="mt-6 rounded-2xl border border-border bg-background p-10 text-center text-[14px] text-muted-foreground">未找到该新闻。</div>
      </AssociationShell>
    );
  }

  return (
    <AssociationShell title="新闻详情" subtitle={n.category}>
      <Link href="/dashboard/association/news" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回新闻列表</Link>

      <article className="rounded-2xl border border-border bg-background p-6 md:p-8">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <Badge tone={CAT_TONE[n.category] ?? "build"}>{n.category}</Badge>
          {n.hot && <Badge tone="decor">热门</Badge>}
          <Badge tone={n.status === "published" ? "tea" : "neutral"}>{n.status === "published" ? "已发布" : "草稿"}</Badge>
        </div>
        <h1 className="text-[22px] md:text-[28px] font-semibold tracking-tight leading-snug">{n.title}</h1>
        <div className="mt-2 text-[12px] text-muted-foreground inline-flex items-center gap-3">
          <span>{n.author}</span><span>{fmt(n.createdAt)}</span><span className="inline-flex items-center gap-0.5"><Eye className="h-3 w-3" />{n.views}</span>
        </div>
        <p className="mt-5 text-[14px] leading-7 text-foreground whitespace-pre-wrap">{n.content}</p>
      </article>

      <div className="mt-5 flex items-center gap-3 flex-wrap">
        {n.status === "published" ? (
          <>
            <a href={`/news/${n.id}`} target="_blank" rel="noreferrer" className="h-11 px-5 rounded-full bg-foreground text-background text-[14px] font-medium inline-flex items-center gap-1.5"><ExternalLink className="h-4 w-4" /> 查看前台</a>
            <form action={setNewsStatusAction}><input type="hidden" name="id" value={n.id} /><input type="hidden" name="status" value="draft" />
              <button className="h-11 px-5 rounded-full border border-border text-[14px] font-medium inline-flex items-center gap-1.5 hover:bg-surface"><Archive className="h-4 w-4" /> 下架（转草稿）</button>
            </form>
          </>
        ) : (
          <form action={setNewsStatusAction}><input type="hidden" name="id" value={n.id} /><input type="hidden" name="status" value="published" />
            <button className="h-11 px-5 rounded-full bg-accent-tea text-white text-[14px] font-medium inline-flex items-center gap-1.5"><Send className="h-4 w-4" /> 发布</button>
          </form>
        )}
        <form action={deleteNewsAction}><input type="hidden" name="id" value={n.id} />
          <button className="h-11 px-5 rounded-full border border-cat-decor/40 text-cat-decor text-[14px] font-medium inline-flex items-center gap-1.5"><Trash2 className="h-4 w-4" /> 删除</button>
        </form>
      </div>
    </AssociationShell>
  );
}
