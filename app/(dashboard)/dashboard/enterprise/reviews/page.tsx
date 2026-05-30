import { Star, Reply, AlertTriangle, MessageSquareHeart } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

export const metadata = { title: "口碑评价 · 企业工作台" };

const REVIEWS = [
  { user: "刘**", rating: 5, project: "金茂悦府 1602", content: "项目经理特别负责，水电改造的时候多次主动来工地，质量超预期。", date: "2026-05-26", replied: true },
  { user: "陈**", rating: 5, project: "茶都商务 22F", content: "设计师很懂年轻人审美，方案改了两版就定稿，后期施工严格按图。", date: "2026-05-22", replied: true },
  { user: "李**", rating: 4, project: "南湖一号 401", content: "整体满意，唯一一点是材料到场比预计晚了 3 天，沟通后补偿到位。", date: "2026-05-18", replied: true },
  { user: "王**", rating: 5, project: "海宁城 12 栋", content: "全程透明，每次工序进入都有照片+视频同步，售后两次都很及时。", date: "2026-05-14", replied: false },
  { user: "赵**", rating: 3, project: "凯文府邸 203", content: "前期方案很惊艳，但后期施工换了项目经理，沟通成本变高。", date: "2026-05-08", replied: false },
];

export default function ReviewsPage() {
  const avg = (REVIEWS.reduce((a, r) => a + r.rating, 0) / REVIEWS.length).toFixed(1);
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: REVIEWS.filter((r) => r.rating === s).length }));
  const total = REVIEWS.length;
  return (
    <EnterpriseShell
      title="口碑评价"
      subtitle={`累计 ${1284 + REVIEWS.length} 条评价 · 平均 ${avg} ★ · 本月新增 ${REVIEWS.length} 条`}
      actions={
        <button className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <MessageSquareHeart className="h-3.5 w-3.5" /> AI 批量回复
        </button>
      }
    >
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
            <span className="ml-2 text-[12px] text-muted-foreground">{1284 + REVIEWS.length} 条评价</span>
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
          <div className="mt-4 rounded-xl bg-cat-decor-soft p-3 text-[12px] text-cat-decor flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <div>3 星及以下评价 {REVIEWS.filter((r) => r.rating <= 3).length} 条 · 建议本周内主动回复以提升 NPS</div>
          </div>
        </div>
      </div>

      <h2 className="text-[18px] font-semibold mb-3">本月评价</h2>
      <div className="space-y-3">
        {REVIEWS.map((r, i) => (
          <div key={i} className="rounded-2xl border border-border bg-background p-5">
            <div className="flex items-start gap-3">
              <span className="h-10 w-10 rounded-full bg-surface inline-flex items-center justify-center text-[13px] font-semibold shrink-0">{r.user.slice(0, 1)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] font-medium">{r.user}</span>
                  <span className="text-[11px] text-muted-foreground">· {r.date}</span>
                  <Badge tone={r.rating >= 5 ? "tea" : r.rating >= 4 ? "build" : "decor"} className="ml-auto">
                    项目：{r.project}
                  </Badge>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: 5 }, (_, j) => (
                    <Star key={j} className={cn("h-3.5 w-3.5", j < r.rating ? "fill-[#FFB400] text-[#FFB400]" : "text-border")} />
                  ))}
                </div>
                <p className="text-[13px] leading-6 text-foreground">{r.content}</p>
                <div className="mt-3 flex items-center gap-2">
                  {r.replied ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-accent-tea">
                      <Reply className="h-3 w-3" /> 已回复
                    </span>
                  ) : (
                    <button className="inline-flex items-center gap-1 h-8 px-3 rounded-full bg-foreground text-background text-[11px] font-medium">
                      <Reply className="h-3 w-3" /> 回复
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </EnterpriseShell>
  );
}
