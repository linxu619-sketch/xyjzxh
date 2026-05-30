import Link from "next/link";
import {
  Search, MapPin, Sparkles, ChevronRight, Clock, ShieldCheck,
  ArrowUpRight, Filter, BookmarkPlus,
} from "lucide-react";
import { PractitionerShell } from "@/components/dashboard/practitioner-shell";
import { Badge } from "@/components/ui/badge";
import { PRACTITIONER_JOBS } from "@/lib/data/practitioners";

export const metadata = { title: "找活 · 从业者门户" };

const FILTERS = ["全部", "工长", "项目经理", "木工", "瓦工", "水电工", "油漆工", "设计师", "监理"];

export default function PractitionerJobs() {
  const urgentCount = PRACTITIONER_JOBS.filter((j) => j.urgent).length;
  return (
    <PractitionerShell
      title="找活"
      subtitle={`${PRACTITIONER_JOBS.length} 条新岗位${urgentCount > 0 ? ` · ${urgentCount} 急招` : ""}`}
    >
      {/* AI 推荐 · 置顶 */}
      <Link
        href="/ai/hr"
        className="block rounded-3xl bg-gradient-to-br from-foreground via-brand-600 to-brand text-white p-4 mb-4 active:scale-[0.99] transition-transform relative overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-yellow/20 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <span className="h-11 w-11 rounded-2xl bg-accent-yellow text-foreground inline-flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold">AI 小才推荐了 3 条最匹配的</div>
            <div className="text-[11px] text-white/80 mt-0.5">基于你的工种 / 工龄 / 上月接单距离</div>
          </div>
          <ChevronRight className="h-5 w-5" />
        </div>
      </Link>

      {/* 搜索 + 工种过滤 — sticky */}
      <div className="sticky top-0 z-20 -mx-5 px-5 py-2 bg-surface/85 backdrop-blur-xl border-b border-border mb-3">
        <div className="rounded-2xl bg-background border border-border p-2.5 mb-2 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground ml-1.5 shrink-0" />
          <input placeholder="工种 / 地区 / 工期 / 关键词" className="flex-1 bg-transparent outline-none text-[13px] py-1" />
          <button className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-surface" aria-label="筛选">
            <Filter className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f, i) => (
            <button key={f} className={`shrink-0 h-8 px-3 rounded-full text-[12px] font-medium ${i === 0 ? "bg-foreground text-background" : "bg-background border border-border text-muted-foreground active:bg-surface"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* 岗位列表 */}
      <div className="space-y-3">
        {PRACTITIONER_JOBS.map((j) => (
          <div key={j.id} className="rounded-3xl border border-border bg-background p-4 active:scale-[0.99] transition-transform relative overflow-hidden">
            {/* status accent bar */}
            <span className={`absolute left-0 top-0 h-1 w-full ${j.urgent ? "bg-cat-decor" : "bg-cat-build"}`} />

            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <Badge tone="brand">{j.openings} 名额</Badge>
              {j.urgent && <Badge tone="decor">🔥 急招</Badge>}
              <span className="inline-flex items-center gap-0.5 text-[10px] text-accent-tea">
                <ShieldCheck className="h-2.5 w-2.5" /> 协会监管
              </span>
              <button className="ml-auto inline-flex items-center justify-center h-7 w-7 rounded-full hover:bg-surface text-muted-foreground" aria-label="收藏">
                <BookmarkPlus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="text-[14px] font-semibold leading-5">{j.title}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{j.enterprise}</div>

            <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
              <span className="inline-flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" /> {j.district}</span>
              <span>·</span>
              <span>{j.area}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{j.duration}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">{j.postedAt}</span>
            </div>

            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <div className="text-[18px] font-semibold text-cat-decor tabular-nums">¥{j.daily}<span className="text-[10px] font-normal text-muted-foreground"> /天</span></div>
              <button className="h-10 px-4 rounded-full bg-foreground text-background text-[12px] font-medium inline-flex items-center gap-1 active:scale-95 transition-transform">
                立即报名 <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 协会保障 */}
      <div className="mt-6 rounded-3xl bg-foreground text-background p-5 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-tea/30 blur-2xl" />
        <div className="relative flex items-start gap-3">
          <ShieldCheck className="h-6 w-6 text-accent-yellow mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="text-[14px] font-semibold">所有岗位 · 协会监管账户保障</div>
            <p className="mt-1.5 text-[12px] text-background/70 leading-5">
              工资由协会监管账户托管 · 如发生欠薪，<b className="text-accent-yellow">协会 7 天内先行垫付 ≤ 5 万</b>。
            </p>
            <Link href="/dashboard/practitioner/insurance" className="mt-3 inline-flex items-center gap-1 text-[11px] text-accent-yellow">
              了解防欠薪保函 <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </PractitionerShell>
  );
}
