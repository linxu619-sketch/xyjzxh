import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers, Calendar, Eye, ChevronRight, Flag } from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { getTopic, newsForTopic } from "@/lib/data/party-source";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = getTopic(id);
  return { title: t ? `${t.title} · 党建专题 · 信阳市建筑装饰装修协会` : "党建专题" };
}

function fmt(ms: number) {
  if (!ms) return "";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default async function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = getTopic(id);
  if (!topic) notFound();
  const items = newsForTopic(topic);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-party via-[#b1000a] to-party-dark text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/party-emblem.svg" alt="" aria-hidden className="pointer-events-none absolute -right-8 -top-6 w-64 md:w-80 opacity-[0.10] rotate-6" />
        <Container className="relative py-10 md:py-14">
          <Link href="/cpc" className="inline-flex items-center gap-1.5 text-[13px] text-white/85 hover:text-white mb-5">
            <ArrowLeft className="h-3.5 w-3.5" /> 返回党的建设
          </Link>
          <div className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.2em] uppercase text-white/80 font-medium">
            <Layers className="h-3.5 w-3.5" /> TOPIC · 党建专题
          </div>
          <h1 className="mt-3 text-[28px] md:text-[44px] font-semibold tracking-tight leading-[1.12] max-w-3xl">{topic.title}</h1>
          {topic.summary && <p className="mt-4 text-[14px] md:text-[16px] leading-7 md:leading-8 text-white/85 max-w-2xl">{topic.summary}</p>}
          {topic.keywords.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {topic.keywords.map((k) => (
                <span key={k} className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[12px] font-medium">{k}</span>
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="py-8 md:py-12">
        <Container>
          <h2 className="text-[20px] md:text-[26px] font-semibold tracking-tight mb-5">专题文章 · {items.length} 篇</h2>
          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-background p-12 text-center text-[13px] text-muted-foreground">
              暂无命中本专题关键词的已发布文章。<br />支部以「党建 / 理论学习」发文、内容包含关键词即自动归入本专题。
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-background divide-y divide-border overflow-hidden">
              {items.map((n) => (
                <Link key={n.id} href={`/news/${n.id}`} className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-4 hover:bg-surface transition-colors group">
                  <span className="h-11 w-16 rounded-lg overflow-hidden border border-border bg-party-soft shrink-0 inline-flex items-center justify-center">
                    {n.cover
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={n.cover} alt="" className="h-full w-full object-cover" />
                      : <Flag className="h-4 w-4 text-party/50" />}
                  </span>
                  <Badge tone="party" className="!px-2 !py-0.5 shrink-0 hidden sm:inline-flex">{n.category}</Badge>
                  <span className="flex-1 min-w-0">
                    <span className="block truncate text-[14px] md:text-[15px] font-medium group-hover:text-party transition-colors">{n.title}</span>
                    <span className="block truncate text-[12px] text-muted-foreground mt-0.5">{n.excerpt}</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[12px] text-muted-foreground shrink-0"><Eye className="h-3 w-3" />{n.views.toLocaleString()}</span>
                  <span className="text-[12px] text-muted-foreground shrink-0 tabular-nums inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{fmt(n.createdAt)}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
