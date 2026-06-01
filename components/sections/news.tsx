import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Container } from "../container";
import { listPublished } from "@/lib/data/news-source";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/cn";

function fmt(ms: number) {
  if (!ms) return "";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const TONE: Record<string, "build" | "decor" | "design" | "tea" | "brand"> = {
  build: "build",
  decor: "decor",
  design: "design",
  tea: "tea",
  brand: "brand",
};

const ACCENT: Record<string, string> = {
  build: "before:bg-cat-build",
  decor: "before:bg-cat-decor",
  design: "before:bg-cat-design",
  tea: "before:bg-accent-tea",
  brand: "before:bg-brand",
};

export async function News() {
  const items = listPublished().slice(0, 3);
  if (items.length === 0) return null;
  return (
    <section className="py-14 md:py-28">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="max-w-2xl">
            <div className="text-[11px] md:text-[12px] tracking-[0.2em] text-cat-design font-medium uppercase">
              NEWS · 新闻动态
            </div>
            <h2 className="mt-2 md:mt-3 text-[28px] md:text-[48px] font-semibold tracking-tight leading-[1.1]">
              动态、政策、解读 <br className="md:hidden" />
              <span className="text-muted-foreground">第一时间</span>
            </h2>
          </div>
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-[13px] md:text-[14px] font-medium hover:text-brand transition-colors"
          >
            查看全部 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
          {items.map((n) => (
            <Link
              key={n.id}
              href={`/news/${n.id}`}
              className={cn(
                "group relative overflow-hidden rounded-3xl border border-border bg-background p-5 md:p-7 transition-all active:scale-[0.99] md:hover:-translate-y-1 md:hover:shadow-md",
                "before:absolute before:left-0 before:top-0 before:h-1 before:w-full",
                ACCENT[n.color] ?? ACCENT.brand,
              )}
            >
              <div className="flex items-center gap-2.5">
                <Badge tone={TONE[n.color] ?? "brand"}>{n.category}</Badge>
                <time className="text-[11px] md:text-[12px] text-muted-foreground">{fmt(n.createdAt)}</time>
              </div>
              <h3 className="mt-4 md:mt-5 text-[15px] md:text-[19px] font-semibold leading-6 md:leading-7 line-clamp-2 group-hover:text-brand transition-colors">
                {n.title}
              </h3>
              <p className="mt-2 md:mt-3 text-[12px] md:text-[13px] leading-5 md:leading-6 text-muted-foreground line-clamp-2 md:line-clamp-3">
                {n.excerpt}
              </p>
              <div className="mt-4 md:mt-6 inline-flex items-center gap-1.5 text-[12px] md:text-[13px] font-medium">
                阅读全文
                <ArrowUpRight className="h-3 md:h-3.5 w-3 md:w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
