import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Eye, User, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { getNews, listPublished, incrementViews } from "@/lib/data/news-source";

const TONE: Record<string, "build" | "decor" | "design" | "brand" | "tea" | "party"> = {
  build: "build", decor: "decor", design: "design", brand: "brand", tea: "tea", party: "party",
};

// 党建 / 理论学习 文章属党建专栏，返回应回 /cpc 而非普通新闻列表
const PARTY_CATS = ["党建", "理论学习"];

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default async function NewsDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = getNews(Number(id));
  if (!n || n.status !== "published") notFound();

  incrementViews(n.id);
  const related = listPublished().filter((x) => x.id !== n.id && x.category === n.category).slice(0, 3);
  const isParty = PARTY_CATS.includes(n.category);
  const back = isParty ? { href: "/cpc", label: "返回党建专栏" } : { href: "/news", label: "返回新闻列表" };

  return (
    <Container className="py-10 md:py-14 max-w-3xl">
      <Link href={back.href} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> {back.label}
      </Link>

      <Badge tone={TONE[n.color] ?? "build"}>{n.category}</Badge>
      <h1 className="mt-4 text-[28px] md:text-[40px] font-semibold tracking-tight leading-[1.15]">{n.title}</h1>
      <div className="mt-4 flex items-center gap-4 text-[12px] text-muted-foreground flex-wrap">
        <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {fmt(n.createdAt)}</span>
        {n.author && <span className="inline-flex items-center gap-1"><User className="h-3 w-3" /> {n.author}</span>}
        <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {n.views.toLocaleString()} 阅读</span>
      </div>

      <article className="mt-8 text-[15px] leading-8 text-foreground whitespace-pre-wrap">{n.content}</article>

      {related.length > 0 && (
        <div className="mt-14 pt-10 border-t border-border">
          <h3 className="text-[20px] font-semibold tracking-tight">相关阅读</h3>
          <ul className="mt-4 divide-y divide-border">
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/news/${r.id}`} className="flex items-center justify-between gap-4 py-4 group">
                  <div>
                    <div className="text-[14px] font-medium group-hover:text-brand transition-colors">{r.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{fmt(r.createdAt)}</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Container>
  );
}
