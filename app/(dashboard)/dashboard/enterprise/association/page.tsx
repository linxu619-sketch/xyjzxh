import Link from "next/link";
import { Megaphone, Newspaper, Flag, Library, ChevronRight, ArrowUpRight, Sparkles, FileText } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { listPublished } from "@/lib/data/news-source";
import { listKnowledge } from "@/lib/data/knowledge-source";
import { KNOWLEDGE_CATEGORIES } from "@/lib/data/knowledge";

export const metadata = { title: "协会资讯 · 企业工作台" };

const NEWS_TONE: Record<string, "build" | "decor" | "design" | "brand" | "tea" | "party"> = {
  build: "build", decor: "decor", design: "design", brand: "brand", tea: "tea", party: "party",
};
const KCAT_TONE: Record<string, "build" | "decor" | "design" | "brand" | "tea"> = {
  build: "build", decor: "decor", design: "design", brand: "brand", tea: "tea",
};

// 新闻分组（协会层资讯打通到企业工作台；企业属协会层，可在自己后台看协会通知/新闻/党建）
const NOTICE_CATS = ["协会公告", "活动通知", "政策解读"];
const INDUSTRY_CATS = ["行业新闻", "会员动态"];
const PARTY_CATS = ["党建", "理论学习"];

function fmt(ms: number) {
  if (!ms) return "";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default async function EnterpriseAssociation({ searchParams }: { searchParams: Promise<{ kc?: string }> }) {
  const { kc } = await searchParams;
  const allNews = listPublished();
  const inCats = (cats: string[]) => allNews.filter((n) => cats.includes(n.category));
  const notices = inCats(NOTICE_CATS).slice(0, 6);
  const industry = inCats(INDUSTRY_CATS).slice(0, 5);
  const party = inCats(PARTY_CATS).slice(0, 5);

  const knowledge = listKnowledge();
  const kcat = KNOWLEDGE_CATEGORIES.some((c) => c.key === kc) ? kc : undefined;
  const kCount = (key: string) => knowledge.filter((k) => k.category === key).length;
  const kList = (kcat ? knowledge.filter((k) => k.category === kcat) : [...knowledge].sort((a, b) => Number(b.hot) - Number(a.hot))).slice(0, 8);

  return (
    <EnterpriseShell title="协会资讯" subtitle="协会发布的通知公告 · 行业新闻 · 党建 · 知识库">
      <div className="mb-5 rounded-2xl border border-cat-build/30 bg-cat-build-soft/40 p-4 flex items-start gap-3">
        <span className="h-10 w-10 rounded-xl bg-cat-build text-white inline-flex items-center justify-center shrink-0"><Megaphone className="h-5 w-5" /></span>
        <div className="min-w-0">
          <div className="text-[14px] font-semibold">承上：协会发布给会员的内容，在这里一站看全</div>
          <div className="text-[12px] text-muted-foreground mt-0.5">作为协会企业会员，协会的通知公告、政策解读、行业新闻、党建学习与知识库（规范 / 政策 / 范本）都汇总于此，点开即在工作台内阅读，无需离开后台。</div>
        </div>
      </div>

      {/* 协会通知公告（与会员直接相关，置顶） */}
      <section className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="text-[14px] font-semibold inline-flex items-center gap-1.5"><Megaphone className="h-4 w-4 text-cat-build" /> 协会通知公告</div>
          <Link href="/news" target="_blank" className="text-[12px] text-brand inline-flex items-center gap-0.5">门户全部 <ArrowUpRight className="h-3 w-3" /></Link>
        </div>
        {notices.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px] text-muted-foreground">协会暂无通知公告。</div>
        ) : (
          <ul className="divide-y divide-border">
            {notices.map((n) => (
              <li key={n.id}>
                <Link href={`/dashboard/enterprise/association/news/${n.id}`} className="px-5 py-3.5 flex items-center gap-3 hover:bg-surface transition-colors group">
                  <Badge tone={NEWS_TONE[n.color] ?? "build"} className="!px-2 !py-0.5 shrink-0">{n.category}</Badge>
                  <span className="flex-1 min-w-0 truncate text-[13px] font-medium group-hover:text-brand transition-colors">{n.title}</span>
                  {n.hot && <span className="text-[10px] text-cat-decor border border-cat-decor/40 rounded px-1 shrink-0">置顶</span>}
                  <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums hidden sm:inline">{fmt(n.createdAt)}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 行业新闻 + 党建学习 两栏 */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <FeedCard title="行业新闻 · 会员动态" icon={<Newspaper className="h-4 w-4 text-cat-design" />} items={industry} emptyText="暂无行业新闻。" />
        <FeedCard title="党建 · 理论学习" icon={<Flag className="h-4 w-4 text-party" />} items={party} emptyText="暂无党建动态。" tone="party" moreHref="/cpc" />
      </div>

      {/* 知识库 */}
      <section className="mt-5 rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="text-[14px] font-semibold inline-flex items-center gap-1.5"><Library className="h-4 w-4 text-cat-design" /> 协会知识库</div>
          <Link href="/knowledge" target="_blank" className="text-[12px] text-brand inline-flex items-center gap-0.5">门户检索全部 <ArrowUpRight className="h-3 w-3" /></Link>
        </div>
        {/* 分类筛选 */}
        <div className="px-5 py-3 border-b border-border flex flex-wrap gap-1.5">
          <Link href="/dashboard/enterprise/association" className={`h-8 px-3 rounded-full border text-[12px] inline-flex items-center ${!kcat ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:bg-surface"}`}>热门精选</Link>
          {KNOWLEDGE_CATEGORIES.map((c) => (
            <Link key={c.key} href={`/dashboard/enterprise/association?kc=${encodeURIComponent(c.key)}`} className={`h-8 px-3 rounded-full border text-[12px] inline-flex items-center gap-1 ${kcat === c.key ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:bg-surface"}`}>
              {c.key} <span className="opacity-60">{kCount(c.key)}</span>
            </Link>
          ))}
        </div>
        {kList.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px] text-muted-foreground">该分类暂无资料。</div>
        ) : (
          <ul className="divide-y divide-border">
            {kList.map((k) => (
              <li key={k.id}>
                <Link href={`/dashboard/enterprise/association/knowledge/${k.id}`} className="px-5 py-3.5 flex items-center gap-3 hover:bg-surface transition-colors group">
                  <span className="h-9 w-9 rounded-xl bg-cat-design-soft text-cat-design shrink-0 inline-flex items-center justify-center"><FileText className="h-4 w-4" /></span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate group-hover:text-brand transition-colors">{k.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{k.excerpt}</div>
                  </div>
                  <Badge tone={KCAT_TONE[KNOWLEDGE_CATEGORIES.find((c) => c.key === k.category)?.color ?? "design"] ?? "design"} className="!px-2 !py-0.5 shrink-0 hidden sm:inline-flex">{k.category}</Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="px-5 py-3 border-t border-border text-[12px] text-muted-foreground inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-accent-yellow" /> 想要条文解读 / 适用范围？工作台「AI 员工」里问 AI 小知更快。
        </div>
      </section>
    </EnterpriseShell>
  );
}

function FeedCard({ title, icon, items, emptyText, tone, moreHref }: { title: string; icon: React.ReactNode; items: { id: number; title: string; category: string; color: string; createdAt: number }[]; emptyText: string; tone?: "party"; moreHref?: string }) {
  return (
    <section className="rounded-2xl border border-border bg-background overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <div className="text-[14px] font-semibold inline-flex items-center gap-1.5">{icon} {title}</div>
        {moreHref && <Link href={moreHref} target="_blank" className={`text-[12px] inline-flex items-center gap-0.5 ${tone === "party" ? "text-party" : "text-brand"}`}>门户全部 <ArrowUpRight className="h-3 w-3" /></Link>}
      </div>
      {items.length === 0 ? (
        <div className="px-5 py-10 text-center text-[13px] text-muted-foreground">{emptyText}</div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((n) => (
            <li key={n.id}>
              <Link href={`/dashboard/enterprise/association/news/${n.id}`} className="px-5 py-3.5 flex items-center gap-3 hover:bg-surface transition-colors group">
                <Badge tone={(NEWS_TONE[n.color] ?? "build")} className="!px-2 !py-0.5 shrink-0">{n.category}</Badge>
                <span className="flex-1 min-w-0 truncate text-[13px] group-hover:text-foreground transition-colors">{n.title}</span>
                <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums hidden sm:inline">{fmt(n.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
