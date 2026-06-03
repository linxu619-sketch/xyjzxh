import Link from "next/link";
import { Library, Search, ArrowUpRight, FileText, Sparkles } from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { KNOWLEDGE, KNOWLEDGE_CATEGORIES } from "@/lib/data/knowledge";

const TONE: Record<string, "build" | "decor" | "design" | "tea" | "brand"> = {
  brand: "brand", build: "build", decor: "decor", design: "design", tea: "tea",
};

export const metadata = { title: "知识库 · 信阳市建筑装饰装修协会" };

export default function KnowledgePage() {
  const hot = KNOWLEDGE.filter((k) => k.hot);
  return (
    <>
      <PageHeader
        eyebrow="KNOWLEDGE · 知识库"
        tone="design"
        title={<>规范 · 政策 · 案例<br className="md:hidden" /> 一键检索</>}
        description="国家标准、地方政策、技术资料、典型案例与合同范本，由协会技术委员会审核维护。"
      />
      <Container className="py-12 md:py-16">
        {/* 搜索 */}
        <div className="rounded-3xl border border-border bg-background p-4 flex items-center gap-3">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <input
            placeholder="搜索规范号 / 关键词 / 案例标题…"
            className="flex-1 bg-transparent outline-none text-[15px] py-2"
          />
          <Link href="/ai/know" className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-foreground text-background text-[12px] font-medium">
            <Sparkles className="h-3.5 w-3.5 text-accent-yellow" /> AI 小知
          </Link>
        </div>

        {/* 分类 */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
          {KNOWLEDGE_CATEGORIES.map((c) => (
            <Link key={c.key} href={`#${c.key}`} className="rounded-2xl border border-border bg-background p-4 hover:shadow-md transition-all hover:-translate-y-0.5 group">
              <Badge tone={TONE[c.color]}>{c.key}</Badge>
              <div className="mt-3 text-[24px] font-semibold leading-tight">{c.count}</div>
              <div className="text-[11px] text-muted-foreground">份资料</div>
              <ArrowUpRight className="mt-3 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          ))}
        </div>

        {/* 热门 */}
        {hot.length > 0 && (
          <div className="mt-12">
            <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight">本周热门</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hot.map((k) => (
                <article key={k.id} className="rounded-3xl border border-border bg-background p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <Badge tone="design">{k.category}</Badge>
                    <span className="text-[11px] text-muted-foreground">{k.date}</span>
                  </div>
                  <h3 className="mt-3 text-[16px] font-semibold leading-6 line-clamp-2">{k.title}</h3>
                  <p className="mt-2 text-[12px] text-muted-foreground leading-5 line-clamp-2">{k.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <FileText className="h-3 w-3" /> {k.size || "在线浏览"}
                    </div>
                    <Link href={`/knowledge/${k.id}`} className="inline-flex items-center gap-1 text-[12px] font-medium text-brand">
                      查看 <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* 全部列表 */}
        <div className="mt-12">
          <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight">全部资料</h2>
          <div className="mt-4 rounded-3xl border border-border bg-background divide-y divide-border overflow-hidden">
            {KNOWLEDGE.map((k) => (
              <Link key={k.id} href={`/knowledge/${k.id}`} className="block p-5 hover:bg-surface/60 transition-colors">
                <div className="flex items-start gap-4">
                  <span className="h-10 w-10 rounded-xl bg-cat-design-soft text-cat-design shrink-0 inline-flex items-center justify-center">
                    <Library className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] tracking-wider text-muted-foreground uppercase">{k.category}</span>
                      {k.tags.map((t) => (
                        <span key={t} className="text-[10px] rounded-full bg-surface px-1.5 py-0.5 text-muted-foreground">{t}</span>
                      ))}
                    </div>
                    <div className="text-[14px] font-medium">{k.title}</div>
                    <div className="mt-0.5 text-[12px] text-muted-foreground line-clamp-1">{k.excerpt}</div>
                  </div>
                  <div className="hidden md:block text-right text-[11px] text-muted-foreground shrink-0">
                    <div>{k.date}</div>
                    {k.size && <div className="mt-0.5">{k.size}</div>}
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}
