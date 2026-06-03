import { CheckCircle2, AlertCircle, Star, MessageSquareHeart } from "lucide-react";
import { CustomerShell } from "@/components/dashboard/customer-shell";
import { getSession } from "@/lib/auth/session";
import { getEnterprises } from "@/lib/data/enterprises-source";
import { listReviewsByUid } from "@/lib/data/reviews";
import { ReviewForm } from "./ReviewForm";
import { cn } from "@/lib/cn";

export const metadata = { title: "写评价 · 信阳市建筑装饰装修协会" };

function fmt(ms: number) {
  if (!ms) return "";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default async function CustomerReview({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string; ent?: string }> }) {
  const { ok, err, ent } = await searchParams;
  const session = await getSession();
  const ents = await getEnterprises();
  const brands = Array.from(new Set(ents.map((e) => e.hero.brand || e.name).filter(Boolean)));
  const mine = session?.uid ? listReviewsByUid(session.uid) : [];

  return (
    <CustomerShell title="写评价">
      {ok && <div className="mb-4 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>评价已发布！</b>已展示在该企业子站与评价广场。</div></div>}
      {err && <div className="mb-4 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 text-[13px] flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />发布失败：请选择企业并填写至少 5 个字的评价内容。</div>}

      <p className="text-[13px] text-muted-foreground mb-4 inline-flex items-center gap-1.5">
        <MessageSquareHeart className="h-4 w-4 text-cat-decor" /> 真实评价受协会留痕保护，发布后企业不可删除、不可修改。
      </p>

      <ReviewForm enterprises={brands} defaultEnterprise={ent} />

      {/* 我的评价 */}
      <h2 className="text-[15px] font-semibold mt-7 mb-3">我的评价 <span className="text-[12px] font-normal text-muted-foreground">{mine.length} 条</span></h2>
      {mine.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-[13px] text-muted-foreground">还没有发布过评价。完工后给为你服务的企业写一条吧。</div>
      ) : (
        <div className="space-y-3">
          {mine.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[14px] font-semibold">{r.enterprise}</div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {Array.from({ length: 5 }, (_, j) => (
                    <Star key={j} className={cn("h-3.5 w-3.5", j < r.rating ? "fill-[#FFB400] text-[#FFB400]" : "text-border")} />
                  ))}
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{r.project} · {fmt(r.createdAt)}</div>
              <p className="text-[13px] leading-6 mt-2 text-foreground">&ldquo;{r.content}&rdquo;</p>
            </div>
          ))}
        </div>
      )}
    </CustomerShell>
  );
}
