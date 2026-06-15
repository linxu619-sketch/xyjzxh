import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Eye, User, ChevronRight } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/ui/markdown";
import { getNews, listPublished, incrementViews } from "@/lib/data/news-source";
import { requireLogin } from "@/lib/auth/guard";

export const metadata = { title: "资讯详情 · 协会资讯 · 企业工作台" };

const TONE: Record<string, "build" | "decor" | "design" | "brand" | "tea" | "party"> = {
  build: "build", decor: "decor", design: "design", brand: "brand", tea: "tea", party: "party",
};

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default async function EntAssocNewsDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireLogin();
  const { id } = await params;
  const n = getNews(Number(id));
  if (!n || n.status !== "published") notFound();
  incrementViews(n.id);
  const related = listPublished().filter((x) => x.id !== n.id && x.category === n.category).slice(0, 3);

  return (
    <EnterpriseShell title="协会资讯" subtitle="工作台内阅读">
      <Link href="/dashboard/enterprise/association" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回协会资讯
      </Link>

      <article className="rounded-2xl border border-border bg-background p-5 md:p-8 max-w-3xl">
        <Badge tone={TONE[n.color] ?? "build"}>{n.category}</Badge>
        <h1 className="mt-4 text-[24px] md:text-[32px] font-semibold tracking-tight leading-[1.2]">{n.title}</h1>
        <div className="mt-3 flex items-center gap-4 text-[12px] text-muted-foreground flex-wrap">
          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {fmt(n.createdAt)}</span>
          {n.author && <span className="inline-flex items-center gap-1"><User className="h-3 w-3" /> {n.author}</span>}
          <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {n.views.toLocaleString()} 阅读</span>
        </div>

        {n.cover && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={n.cover} alt={n.title} className="mt-6 w-full rounded-2xl border border-border object-cover" style={{ aspectRatio: "16 / 9" }} />
        )}

        <Markdown className="mt-6 text-[15px]">{n.content}</Markdown>

        {n.images.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
            {n.images.map((u) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={u} src={u} alt="配图" className="w-full rounded-xl border border-border object-cover" style={{ aspectRatio: "4 / 3" }} />
            ))}
          </div>
        )}
      </article>

      {related.length > 0 && (
        <div className="mt-6 max-w-3xl">
          <h3 className="text-[15px] font-semibold tracking-tight mb-2">相关阅读</h3>
          <div className="rounded-2xl border border-border bg-background divide-y divide-border overflow-hidden">
            {related.map((r) => (
              <Link key={r.id} href={`/dashboard/enterprise/association/news/${r.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface transition-colors group">
                <span className="flex-1 min-w-0 truncate text-[13px] font-medium group-hover:text-brand transition-colors">{r.title}</span>
                <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums hidden sm:inline">{fmt(r.createdAt)}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </EnterpriseShell>
  );
}
