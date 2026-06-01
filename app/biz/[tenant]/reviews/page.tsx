import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { Container } from "@/components/container";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { listReviews } from "@/lib/data/reviews";
import { cn } from "@/lib/cn";

export default async function ReviewsList({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const e = await getEnterpriseBySlugOrId(tenant);
  if (!e) notFound();
  const reviews = listReviews(200).filter((r) => r.enterprise === e.hero.brand || r.enterprise === e.name);
  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) : 0;

  return (
    <div className="overflow-x-hidden">
      <Container className="py-6 md:py-10">
        <Link href={`/biz/${tenant}`} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> 返回 {e.hero.brand}
        </Link>
        <h1 className="text-[22px] md:text-[30px] font-semibold tracking-tight inline-flex items-baseline gap-2">
          业主真实评价
          {reviews.length > 0 && <span className="text-[14px] font-normal text-muted-foreground inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-[#FFB400] text-[#FFB400]" />{avg.toFixed(1)} · {reviews.length} 条</span>}
        </h1>

        {reviews.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-[13px] text-muted-foreground">暂无评价 · 完工后业主可在协会平台对本企业作出真实评价。</div>
        ) : (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-background p-4 md:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-9 w-9 rounded-full bg-surface inline-flex items-center justify-center text-[13px] font-semibold shrink-0">{r.user.slice(0, 1)}</span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium">{r.user}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{r.project}</div>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-0.5 text-[12px] shrink-0"><Star className="h-3.5 w-3.5 fill-[#FFB400] text-[#FFB400]" />{r.rating}</span>
                </div>
                <p className="text-[13px] leading-6 text-muted-foreground">&ldquo;{r.content}&rdquo;</p>
              </div>
            ))}
          </div>
        )}

        <div className={cn("mt-8 rounded-2xl text-white p-5 flex items-center justify-between gap-4 flex-wrap", e.color === "build" ? "bg-cat-build" : e.color === "design" ? "bg-cat-design" : e.color === "tea" ? "bg-accent-tea" : e.color === "brand" ? "bg-brand" : "bg-cat-decor")}>
          <div className="text-[14px] font-medium">想找 {e.hero.brand} 做项目？</div>
          <Link href={`/biz/${tenant}/order`} className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-white text-foreground text-[13px] font-medium">立即预约 / 下单 →</Link>
        </div>
      </Container>
    </div>
  );
}
