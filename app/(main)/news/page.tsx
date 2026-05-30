import Link from "next/link";
import { ArrowUpRight, Eye, Calendar } from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { NEWS_ITEMS } from "@/lib/data/news";

const TONE: Record<string, "build" | "decor" | "design" | "brand" | "tea"> = {
  build: "build", decor: "decor", design: "design", brand: "brand", tea: "tea",
};

const CATS = ["全部", "协会公告", "政策解读", "行业新闻", "会员动态", "活动通知"];

export const metadata = { title: "新闻动态 · 信阳市建筑装修协会" };

export default function NewsPage() {
  const [feature, ...rest] = NEWS_ITEMS;
  return (
    <>
      <PageHeader
        eyebrow="NEWS · 新闻动态"
        tone="design"
        title={<>动态 · 政策 · 解读 <br className="md:hidden" /><span className="text-muted-foreground">第一时间</span></>}
      />

      <Container className="py-10 md:py-14">
        {/* 分类 tab */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {CATS.map((c, i) => (
            <button key={c} className={`shrink-0 h-9 px-4 rounded-full text-[13px] font-medium transition-colors ${i === 0 ? "bg-foreground text-background" : "bg-surface text-muted-foreground hover:text-foreground"}`}>
              {c}
            </button>
          ))}
        </div>

        {/* 头条 */}
        <Link href={`/news/${feature.id}`} className="mt-6 block rounded-3xl overflow-hidden border border-border hover:shadow-md transition-shadow group">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className={`relative aspect-[16/10] md:aspect-auto bg-cat-build`}>
              <div className="absolute inset-0 bg-gradient-to-br from-foreground/0 to-foreground/40" />
              <div className="absolute top-5 left-5 inline-flex items-center gap-1.5 rounded-full bg-accent-yellow text-foreground px-2.5 py-1 text-[11px] font-semibold">
                ★ 头条
              </div>
              <div className="absolute bottom-5 left-5 text-white text-[11px] inline-flex items-center gap-3">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {feature.date}</span>
                <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {feature.views.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-6 md:p-8 flex flex-col">
              <Badge tone={TONE[feature.color]} className="self-start">{feature.category}</Badge>
              <h2 className="mt-4 text-[24px] md:text-[32px] font-semibold tracking-tight leading-[1.2] group-hover:text-brand transition-colors">
                {feature.title}
              </h2>
              <p className="mt-3 text-[14px] leading-7 text-muted-foreground flex-1">
                {feature.excerpt}
              </p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium">
                阅读全文 <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </Link>

        {/* 列表 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((n) => (
            <Link key={n.id} href={`/news/${n.id}`} className="group rounded-3xl border border-border bg-background p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <Badge tone={TONE[n.color]}>{n.category}</Badge>
                {n.hot && <span className="text-[10px] tracking-wider text-cat-decor font-semibold">🔥 HOT</span>}
              </div>
              <h3 className="mt-4 text-[16px] font-semibold tracking-tight leading-6 line-clamp-2 group-hover:text-brand transition-colors">{n.title}</h3>
              <p className="mt-2 text-[12px] text-muted-foreground leading-5 line-clamp-2">{n.excerpt}</p>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{n.date}</span>
                <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {n.views.toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
