import Link from "next/link";
import { ArrowLeft, Eye, Trash2, Send, Archive, ExternalLink } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getNews } from "@/lib/data/news-source";
import { setPartyNewsStatusAction, deletePartyNewsAction } from "../actions";

export const metadata = { title: "党建内容 · 协会工作台" };

const PARTY_CATS = ["党建", "理论学习"];

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function PartyDetailAdmin({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = getNews(Number(id));
  const valid = n && PARTY_CATS.includes(n.category);

  if (!valid) {
    return (
      <AssociationShell title="党建内容">
        <Link href="/dashboard/association/cpc" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> 返回党的建设</Link>
        <div className="mt-6 rounded-2xl border border-border bg-background p-10 text-center text-[14px] text-muted-foreground">未找到该党建内容。</div>
      </AssociationShell>
    );
  }

  return (
    <AssociationShell title="党建内容" subtitle={n.category}>
      <Link href="/dashboard/association/cpc" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回党的建设</Link>

      <article className="rounded-2xl border border-border bg-background p-6 md:p-8">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <Badge tone="party">{n.category}</Badge>
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
            <form action={setPartyNewsStatusAction}><input type="hidden" name="id" value={n.id} /><input type="hidden" name="status" value="draft" />
              <button className="h-11 px-5 rounded-full border border-border text-[14px] font-medium inline-flex items-center gap-1.5 hover:bg-surface"><Archive className="h-4 w-4" /> 下架（转草稿）</button>
            </form>
          </>
        ) : (
          <form action={setPartyNewsStatusAction}><input type="hidden" name="id" value={n.id} /><input type="hidden" name="status" value="published" />
            <button className="h-11 px-5 rounded-full bg-party text-white text-[14px] font-medium inline-flex items-center gap-1.5"><Send className="h-4 w-4" /> 发布</button>
          </form>
        )}
        <form action={deletePartyNewsAction}><input type="hidden" name="id" value={n.id} />
          <button className="h-11 px-5 rounded-full border border-cat-decor/40 text-cat-decor text-[14px] font-medium inline-flex items-center gap-1.5"><Trash2 className="h-4 w-4" /> 删除</button>
        </form>
      </div>
    </AssociationShell>
  );
}
