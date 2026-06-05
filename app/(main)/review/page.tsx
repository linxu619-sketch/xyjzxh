import Link from "next/link";
import { Star, Search, ShieldCheck, ArrowUpRight, CheckCircle2, PencilLine } from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { getEnterprises } from "@/lib/data/enterprises-source";
import { listReviews } from "@/lib/data/reviews";
import { listGalleryCases } from "@/lib/data/cases";
import { submitReviewAction } from "./actions";

export const metadata = {
  title: "真实业主，真实评价 · 信阳建装",
  description: "信阳本地业主的实名装修评价：每条关联具体项目、发布后企业不可删。看真实口碑，挑放心的装修公司。",
};

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
  const enterprises = await getEnterprises();
  const allRv = listReviews(500);
  const total = allRv.length;
  const avg = total ? Number((allRv.reduce((a, r) => a + r.rating, 0) / total).toFixed(1)) : 5;

  // 企业封面（五星企业卡用）
  const coverByEnt: Record<string, string> = {};
  for (const c of listGalleryCases({ limit: 400 })) {
    if (c.cover && !coverByEnt[c.enterpriseId]) coverByEnt[c.enterpriseId] = c.cover;
  }

  const feed = allRv.slice(0, 24).map((r) => ({
    id: `db${r.id}`,
    user: maskName(r.user),
    enterprise: r.enterprise,
    project: r.project,
    rating: r.rating,
    content: r.content,
    date: fmtDate(r.createdAt),
    cat: (["build", "decor", "design"].includes(r.category) ? r.category : "decor") as "build" | "decor" | "design",
  }));

  const fiveStar = enterprises.filter((e) => e.rating >= 4.8).slice(0, 6);

  return (
    <>
      {/* 头部 —— 消费者向 */}
      <Container className="pt-12 md:pt-20 pb-2">
        <div className="text-[12px] tracking-[0.2em] text-muted-foreground uppercase mb-4">信阳本地 · 实名口碑</div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-[34px] sm:text-[44px] md:text-[56px] font-semibold tracking-tight leading-[1.05]">
              真实业主，<br className="sm:hidden" />真实评价
            </h1>
            <p className="mt-5 text-[15px] md:text-[16px] leading-7 text-muted-foreground max-w-xl">
              每条评价都关联具体装修项目、由协会实名业主发布，企业能回复但<b className="text-foreground">不能删</b>。你看到的，就是真实发生过的。
            </p>
          </div>
          {total > 0 && (
            <div className="shrink-0 flex items-end gap-3">
              <span className="text-[64px] md:text-[80px] font-semibold leading-none tracking-tight text-cat-decor">{avg}</span>
              <div className="pb-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={i < Math.round(avg) ? "h-4 w-4 fill-[#FFB400] text-[#FFB400]" : "h-4 w-4 text-border"} />
                  ))}
                </div>
                <div className="mt-1 text-[12px] text-muted-foreground">{total.toLocaleString()} 条真实评价</div>
              </div>
            </div>
          )}
        </div>
      </Container>

      <Container className="py-8 md:py-12">
        {/* 信任细带 + 搜索 */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 rounded-2xl border border-border bg-background px-4 flex items-center gap-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input placeholder="搜企业 / 项目 / 关键词" className="flex-1 bg-transparent outline-none text-[15px] py-3" />
          </div>
          <div className="rounded-2xl border border-border bg-surface/50 px-4 py-3 inline-flex items-center gap-2 text-[12px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-accent-tea shrink-0" /> 关联项目 · 实名核验 · 刷评一票否决
          </div>
        </div>

        {/* 写评价 */}
        {posted === "1" && (
          <div className="mb-4 rounded-2xl bg-[#e6f7f1] border border-accent-tea/30 px-4 py-3 text-[13px] text-accent-tea inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> 评价已发布，感谢你的反馈！
          </div>
        )}
        <details className="rounded-2xl border border-border bg-background p-5 mb-8">
          <summary className="cursor-pointer font-semibold inline-flex items-center gap-2 list-none [&::-webkit-details-marker]:hidden">
            <PencilLine className="h-4 w-4 text-cat-decor" /> 写一条评价
          </summary>
          <form action={submitReviewAction} className="mt-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input name="user" placeholder="你的称呼（如 刘女士）" className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30" />
              <select name="enterprise" required defaultValue="" className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30">
                <option value="" disabled>选择被评价企业</option>
                {enterprises.map((e) => <option key={e.id} value={e.name}>{e.name}</option>)}
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

        {/* 口碑墙 —— masonry */}
        <h2 className="text-[18px] md:text-[22px] font-semibold tracking-tight mb-4">口碑墙</h2>
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {feed.map((r) => (
            <article key={r.id} className="mb-4 break-inside-avoid rounded-2xl border border-border bg-background p-5">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={i < r.rating ? "h-3.5 w-3.5 fill-[#FFB400] text-[#FFB400]" : "h-3.5 w-3.5 text-border"} />
                  ))}
                </div>
                <Badge tone={r.cat} className="ml-auto !text-[10px]">{r.cat === "build" ? "建筑" : r.cat === "decor" ? "装修" : "设计"}</Badge>
              </div>
              <p className="text-[13.5px] leading-6 text-foreground">{r.content}</p>
              <Link href={`/members?q=${encodeURIComponent(r.enterprise)}`} className="mt-3 text-[12px] text-brand hover:underline inline-flex items-center gap-1">
                {r.enterprise}{r.project ? ` · ${r.project}` : ""} <ArrowUpRight className="h-3 w-3 shrink-0" />
              </Link>
              <div className="mt-2 text-[11px] text-muted-foreground">{r.user} · 协会实名业主 · {r.date}</div>
            </article>
          ))}
        </div>

        {/* 五星好评企业 —— 照片卡 */}
        {fiveStar.length > 0 && (
          <>
            <h2 className="text-[18px] md:text-[22px] font-semibold tracking-tight mt-14 mb-4">业主公认的好口碑</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {fiveStar.map((e) => (
                <Link key={e.id} href={`/biz/${e.slug}`} className="group rounded-2xl overflow-hidden border border-border bg-background hover:shadow-[0_24px_60px_-32px_rgba(0,0,0,0.22)] transition-all">
                  <div className="relative aspect-[16/10] bg-surface overflow-hidden">
                    {coverByEnt[e.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coverByEnt[e.id]} alt={e.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground text-[12px]">暂无案例图</div>
                    )}
                    <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2 py-0.5 text-[11px] font-semibold shadow-sm">
                      <Star className="h-3 w-3 fill-[#FFB400] text-[#FFB400]" /> {e.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="p-3.5">
                    <div className="text-[14px] font-semibold tracking-tight truncate group-hover:text-brand transition-colors">{e.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{e.district} · {e.reviews} 条评价</div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </Container>
    </>
  );
}
