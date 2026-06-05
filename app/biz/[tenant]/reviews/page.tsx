import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { Container } from "@/components/container";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { listReviews } from "@/lib/data/reviews";
import { cn } from "@/lib/cn";

function maskName(n: string) {
  if (!n || n === "匿名业主") return "匿名业主";
  return n.slice(0, 1) + "**";
}
function fmtDate(ts: number) {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function ReviewsList({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const e = await getEnterpriseBySlugOrId(tenant);
  if (!e) notFound();
  const reviews = listReviews(200).filter((r) => r.enterprise === e.hero.brand || r.enterprise === e.name);
  const total = reviews.length;
  const avg = total ? reviews.reduce((a, r) => a + r.rating, 0) / total : 0;
  // 评分分布
  const dist = [5, 4, 3, 2, 1].map((star) => ({ star, n: reviews.filter((r) => Math.round(r.rating) === star).length }));
  const ctaBg = e.color === "build" ? "bg-cat-build" : e.color === "design" ? "bg-cat-design" : e.color === "tea" ? "bg-accent-tea" : e.color === "brand" ? "bg-brand" : "bg-cat-decor";

  return (
    <div className="overflow-x-hidden">
      <Container className="py-6 md:py-10 max-w-5xl">
        <Link href={`/biz/${tenant}`} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> 返回 {e.hero.brand}
        </Link>
        <h1 className="text-[24px] md:text-[34px] font-semibold tracking-tight">{e.hero.brand} · 业主真实评价</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">每条评价关联具体项目、实名业主发布，发布后企业不可删。</p>

        {total === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-[13px] text-muted-foreground">暂无评价 · 完工后业主可在协会平台对本企业作出真实评价。</div>
        ) : (
          <>
            {/* 汇总 */}
            <div className="mt-6 rounded-3xl border border-border bg-background p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex items-end gap-3 shrink-0">
                <span className="text-[56px] md:text-[64px] font-semibold leading-none tracking-tight text-cat-decor">{avg.toFixed(1)}</span>
                <div className="pb-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={i < Math.round(avg) ? "h-4 w-4 fill-[#FFB400] text-[#FFB400]" : "h-4 w-4 text-border"} />
                    ))}
                  </div>
                  <div className="mt-1 text-[12px] text-muted-foreground">{total} 条评价</div>
                </div>
              </div>
              <div className="flex-1 space-y-1.5 min-w-0">
                {dist.map((d) => (
                  <div key={d.star} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="w-6 shrink-0 tabular-nums">{d.star}★</span>
                    <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-[#FFB400]" style={{ width: `${total ? (d.n / total) * 100 : 0}%` }} />
                    </div>
                    <span className="w-7 shrink-0 text-right tabular-nums">{d.n}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 口碑墙 */}
            <div className="mt-6 columns-1 sm:columns-2 lg:columns-3 gap-4">
              {reviews.map((r) => (
                <div key={r.id} className="mb-4 break-inside-avoid rounded-2xl border border-border bg-background p-5">
                  <div className="flex items-center gap-0.5 mb-2.5">
                    {Array.from({ length: 5 }, (_, j) => (
                      <Star key={j} className={j < r.rating ? "h-3.5 w-3.5 fill-[#FFB400] text-[#FFB400]" : "h-3.5 w-3.5 text-border"} />
                    ))}
                  </div>
                  <p className="text-[13.5px] leading-6 text-foreground">&ldquo;{r.content}&rdquo;</p>
                  <div className="mt-3 text-[11px] text-muted-foreground">{maskName(r.user)} · 协会实名业主{r.project ? ` · ${r.project}` : ""}{r.createdAt ? ` · ${fmtDate(r.createdAt)}` : ""}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className={cn("mt-8 rounded-2xl text-white p-5 flex items-center justify-between gap-4 flex-wrap", ctaBg)}>
          <div className="text-[14px] font-medium">想找 {e.hero.brand} 做项目？</div>
          <Link href={`/biz/${tenant}/order`} className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-white text-foreground text-[13px] font-medium">立即预约 / 下单 →</Link>
        </div>
      </Container>
    </div>
  );
}
