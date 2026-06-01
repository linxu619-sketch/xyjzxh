import { Star, AlertTriangle, MessageSquareHeart } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { listReviewsByEnterprise } from "@/lib/data/reviews";
import { cn } from "@/lib/cn";

export const metadata = { title: "口碑评价 · 企业工作台" };

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default async function ReviewsPage() {
  const session = await getSession();
  const ent = session?.enterpriseId ? await getEnterpriseBySlugOrId(session.enterpriseId) : undefined;
  const names = [ent?.hero.brand, ent?.name].filter(Boolean) as string[];
  const reviews = names.length ? listReviewsByEnterprise(names) : [];

  const total = reviews.length;
  const avg = total ? (reviews.reduce((a, r) => a + r.rating, 0) / total).toFixed(1) : "—";
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: reviews.filter((r) => r.rating === s).length }));
  const lowCount = reviews.filter((r) => r.rating <= 3).length;

  return (
    <EnterpriseShell
      title="口碑评价"
      subtitle={total ? `累计 ${total} 条 · 平均 ${avg} ★` : "暂无评价"}
      actions={
        <button className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <MessageSquareHeart className="h-3.5 w-3.5" /> AI 批量回复
        </button>
      }
    >
      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-background p-12 text-center text-[14px] text-muted-foreground">
          暂无业主评价。完工后业主在协会平台对本企业作出的真实评价会展示在这里，并同步到子站。
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-2xl border border-border bg-background p-6">
              <div className="text-[11px] text-muted-foreground tracking-wider uppercase">平均评分</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[56px] font-semibold tracking-tight leading-none text-cat-decor">{avg}</span>
                <span className="text-muted-foreground">/ 5.0</span>
              </div>
              <div className="mt-3 flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={cn("h-5 w-5", i < Math.round(+avg) ? "fill-[#FFB400] text-[#FFB400]" : "text-border")} />
                ))}
                <span className="ml-2 text-[12px] text-muted-foreground">{total} 条评价</span>
              </div>
            </div>

            <div className="md:col-span-2 rounded-2xl border border-border bg-background p-6">
              <div className="text-[11px] text-muted-foreground tracking-wider uppercase mb-3">评分分布</div>
              <div className="space-y-2">
                {dist.map((d) => (
                  <div key={d.s} className="flex items-center gap-3 text-[12px]">
                    <span className="w-4 text-right">{d.s}★</span>
                    <div className="flex-1 h-1.5 rounded-full bg-surface">
                      <div className="h-full rounded-full bg-cat-decor" style={{ width: `${(d.n / total) * 100}%` }} />
                    </div>
                    <span className="text-muted-foreground w-8 text-right">{d.n}</span>
                  </div>
                ))}
              </div>
              {lowCount > 0 && (
                <div className="mt-4 rounded-xl bg-cat-decor-soft p-3 text-[12px] text-cat-decor flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <div>3 星及以下评价 {lowCount} 条 · 建议主动跟进以提升口碑</div>
                </div>
              )}
            </div>
          </div>

          <h2 className="text-[18px] font-semibold mb-3">全部评价</h2>
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-background p-5">
                <div className="flex items-start gap-3">
                  <span className="h-10 w-10 rounded-full bg-surface inline-flex items-center justify-center text-[13px] font-semibold shrink-0">{r.user.slice(0, 1)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[13px] font-medium">{r.user}</span>
                      <span className="text-[11px] text-muted-foreground">· {fmt(r.createdAt)}</span>
                      {r.project && <Badge tone={r.rating >= 5 ? "tea" : r.rating >= 4 ? "build" : "decor"} className="ml-auto">项目：{r.project}</Badge>}
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {Array.from({ length: 5 }, (_, j) => (
                        <Star key={j} className={cn("h-3.5 w-3.5", j < r.rating ? "fill-[#FFB400] text-[#FFB400]" : "text-border")} />
                      ))}
                    </div>
                    <p className="text-[13px] leading-6 text-foreground">{r.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </EnterpriseShell>
  );
}
