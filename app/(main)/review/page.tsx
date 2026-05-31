import Link from "next/link";
import { Star, Search, ShieldCheck, MessageSquareHeart, ArrowUpRight, CheckCircle2, PencilLine } from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { ENTERPRISES } from "@/lib/data/enterprises";
import { listReviews } from "@/lib/data/reviews";
import { submitReviewAction } from "./actions";

export const metadata = { title: "口碑评价 · 信阳市建筑装饰装修协会" };

const CAT_LABEL = { build: "建筑", decor: "装修", design: "设计" } as const;
function maskName(n: string) {
  if (!n || n === "匿名业主") return "匿名业主";
  return n.slice(0, 1) + "**";
}
function fmtDate(ts: number) {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}


export default async function ReviewsHubPage({ searchParams }: { searchParams: Promise<{ posted?: string }> }) {
  const { posted } = await searchParams;
  const total = 12640;
  const avg = 4.8;

  const realItems = listReviews(20).map((r) => ({
    id: `db${r.id}`,
    user: maskName(r.user),
    enterprise: r.enterprise,
    project: r.project,
    rating: r.rating,
    content: r.content,
    date: fmtDate(r.createdAt),
    cat: (["build", "decor", "design"].includes(r.category) ? r.category : "decor") as "build" | "decor" | "design",
  }));
  const feed = realItems;
  return (
    <>
      <PageHeader
        eyebrow="REVIEWS · 口碑评价"
        tone="decor"
        title={<>所有评价实名验证<br className="md:hidden" /> 发布后不可删改</>}
        description={<>累计 <b>{total.toLocaleString()}</b> 条业主评价 · 平均 <b>{avg}</b> ★ · 100% 关联具体项目可追溯</>}
      />

      <Container className="py-12 max-w-5xl">
        {/* 搜索栏 */}
        <div className="rounded-3xl border border-border bg-background p-4 flex items-center gap-3 mb-6">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <input placeholder="搜索企业 / 项目 / 关键词…" className="flex-1 bg-transparent outline-none text-[15px] py-2" />
        </div>

        {/* 评分汇总 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-3xl border border-border bg-background p-6">
            <div className="text-[11px] text-muted-foreground tracking-wider uppercase">平均评分</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[64px] font-semibold leading-none text-cat-decor">{avg}</span>
              <span className="text-muted-foreground">/ 5.0</span>
            </div>
            <div className="mt-3 flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className={i < Math.round(avg) ? "h-4 w-4 fill-[#FFB400] text-[#FFB400]" : "h-4 w-4 text-border"} />
              ))}
            </div>
          </div>

          <div className="md:col-span-2 rounded-3xl bg-foreground text-background p-6 flex items-center gap-4">
            <ShieldCheck className="h-8 w-8 text-accent-yellow shrink-0" />
            <div className="flex-1">
              <div className="text-[16px] font-semibold">所有评价均经协会核验</div>
              <p className="mt-1 text-[12px] text-background/70 max-w-md">
                每条评价必须关联具体报备项目 + 业主实名身份 · 发布后企业可回复但不能删除 · 涉嫌刷评一票否决
              </p>
            </div>
            <Link href="/ai/mediate" className="hidden md:inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-accent-yellow text-foreground text-[12px] font-medium">
              <MessageSquareHeart className="h-3.5 w-3.5" /> 评价异议
            </Link>
          </div>
        </div>

        {/* 写评价 */}
        {posted === "1" && (
          <div className="mb-4 rounded-2xl bg-[#e6f7f1] border border-accent-tea/30 px-4 py-3 text-[13px] text-accent-tea inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> 评价已发布，感谢你的反馈！
          </div>
        )}
        <details className="rounded-3xl border border-border bg-background p-5 mb-6">
          <summary className="cursor-pointer font-semibold inline-flex items-center gap-2 list-none [&::-webkit-details-marker]:hidden">
            <PencilLine className="h-4 w-4 text-cat-decor" /> 写一条评价
          </summary>
          <form action={submitReviewAction} className="mt-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input name="user" placeholder="你的称呼（如 刘女士）" className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30" />
              <select name="enterprise" required defaultValue="" className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30">
                <option value="" disabled>选择被评价企业</option>
                {ENTERPRISES.map((e) => <option key={e.id} value={e.name}>{e.name}</option>)}
              </select>
              <input name="project" placeholder="项目（如 金茂悦府 1602）" className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30" />
              <select name="rating" defaultValue="5" className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} 星</option>)}
              </select>
            </div>
            <textarea name="content" rows={3} required placeholder="说说你的真实装修体验…（发布后企业可回复但不可删除）" className="w-full rounded-xl border border-border bg-background p-3.5 text-[13px] leading-6 outline-none focus:border-foreground/30" />
            <button type="submit" className="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
              <PencilLine className="h-3.5 w-3.5" /> 发布评价
            </button>
          </form>
        </details>

        {/* 评价流 */}
        <h2 className="text-[18px] font-semibold mb-3">最新评价</h2>
        <div className="space-y-3">
          {feed.map((r) => (
            <article key={r.id} className="rounded-3xl border border-border bg-background p-5">
              <div className="flex items-start gap-3">
                <span className="h-10 w-10 rounded-full bg-surface inline-flex items-center justify-center text-[13px] font-semibold shrink-0">
                  {r.user.slice(0, 1)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[13px] font-medium">{r.user}</span>
                    <span className="text-[11px] text-muted-foreground">· 协会实名业主</span>
                    <Badge tone={r.cat} className="ml-auto">{r.cat === "build" ? "建筑" : r.cat === "decor" ? "装修" : "设计"}</Badge>
                  </div>
                  <Link href={`/members?q=${encodeURIComponent(r.enterprise)}`} className="text-[12px] text-brand hover:underline inline-flex items-center gap-1">
                    {r.enterprise} · {r.project} <ArrowUpRight className="h-3 w-3" />
                  </Link>
                  <div className="mt-1 flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={i < r.rating ? "h-3.5 w-3.5 fill-[#FFB400] text-[#FFB400]" : "h-3.5 w-3.5 text-border"} />
                    ))}
                  </div>
                  <p className="mt-2 text-[13px] leading-6">{r.content}</p>
                  <div className="mt-3 text-[11px] text-muted-foreground">{r.date}</div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <h2 className="text-[18px] font-semibold mt-12 mb-4">五星热门企业</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ENTERPRISES.filter((e) => e.rating >= 4.8).slice(0, 6).map((e) => (
            <Link key={e.id} href={`/members/${e.slug}`} className="rounded-2xl border border-border bg-background p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 fill-[#FFB400] text-[#FFB400]" />
                <span className="font-semibold">{e.rating.toFixed(1)}</span>
                <span className="text-muted-foreground text-[12px]">({e.reviews} 条评价)</span>
              </div>
              <div className="text-[14px] font-medium">{e.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{e.district} · {e.tags.slice(0, 2).join(" · ")}</div>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
