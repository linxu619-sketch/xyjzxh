import Link from "next/link";
import { ArrowUpRight, Sparkles, Search, Star } from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { AI_EMPLOYEES, SITE } from "@/lib/site";
import { AI_PROMPTS } from "@/lib/ai/prompts";
import { listKnowledge } from "@/lib/data/knowledge-source";
import { cn } from "@/lib/cn";

const GRAD: Record<string, string> = {
  brand: "from-brand to-brand-600",
  build: "from-cat-build to-brand-600",
  decor: "from-cat-decor to-[#e6531f]",
  design: "from-cat-design to-[#6d3df0]",
  tea: "from-accent-tea to-[#008a63]",
  yellow: "from-[#ffd34d] to-[#ffae00]",
};

// 几个高曝光位的快捷动作（精挑细选）
const QUICK_ACTIONS = [
  { label: "30 秒装修估价", href: "/ai/decor",   color: "decor" as const, emoji: "🛋", who: "小装" },
  { label: "AI 帮我报备",   href: "/ai/report",  color: "build" as const, emoji: "📑", who: "小报" },
  { label: "调解 / 投诉文书", href: "/ai/mediate", color: "decor" as const, emoji: "⚖️", who: "小和" },
  { label: "找一份合适的活", href: "/ai/hr",      color: "tea" as const,   emoji: "👷",  who: "小才" },
];

export const metadata = { title: "AI 助手大厅 · 信阳市建筑装饰装修协会" };

export default async function AiHall() {
  const aiCount = AI_EMPLOYEES.length;
  const kbCount = listKnowledge().length;
  return (
    <>
      <PageHeader
        eyebrow="AI 助手大厅"
        tone="yellow"
        title={<>{aiCount} 位 AI 员工<br className="md:hidden" /> 永远在线</>}
        description="覆盖咨询、估价、报备、合规、调解、招聘等高频场景，7×24 小时随问随答；企业可在子站嵌入定制化 AI 员工。"
      />

      <Container className="py-8 md:py-14">
        {/* 高频快捷动作 · 纵向网格 */}
        <div className="mb-8 md:mb-10">
          <div className="text-[12px] tracking-[0.1em] text-cat-decor font-medium mb-3">高频动作</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
              {QUICK_ACTIONS.map((q) => (
                <Link
                  key={q.label}
                  href={q.href}
                  className={cn(
                    "group rounded-3xl p-4 md:p-5 text-white relative overflow-hidden active:scale-[0.99] transition-transform",
                    "bg-gradient-to-br", GRAD[q.color],
                  )}
                >
                  <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/15" />
                  <div className="relative text-[28px]">{q.emoji}</div>
                  <div className="relative mt-3 text-[15px] font-semibold tracking-tight">{q.label}</div>
                  <div className="relative mt-1 text-[11px] opacity-80">{q.who} 在线 · 立即开始</div>
                  <div className="relative mt-4 inline-flex items-center gap-1 text-[12px]">
                    立即试 <ArrowUpRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
          </div>
        </div>

        {/* 搜索 */}
        <div className="rounded-2xl border border-border bg-background p-3 flex items-center gap-2 mb-5">
          <Search className="h-4 w-4 text-muted-foreground ml-1.5 shrink-0" />
          <input
            placeholder="按场景搜索 · 估价 / 报备 / 投诉 …"
            className="flex-1 bg-transparent outline-none text-[14px] py-1.5"
          />
          <span className="text-[11px] text-muted-foreground hidden sm:inline">10 位 AI · 选最合适的</span>
        </div>

        {/* 10 位 AI 员工卡片墙 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {AI_EMPLOYEES.map((ai) => {
            const p = AI_PROMPTS[ai.key];
            return (
              <Link
                key={ai.key}
                href={`/ai/${ai.key}`}
                className="group relative overflow-hidden rounded-3xl border border-border bg-background p-5 md:p-6 active:scale-[0.99] hover:shadow-md md:hover:-translate-y-1 transition-all"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className={cn(
                    "h-12 w-12 md:h-14 md:w-14 rounded-2xl flex items-center justify-center text-white text-[22px] md:text-[28px] bg-gradient-to-br shadow-md shrink-0",
                    GRAD[ai.color] ?? GRAD.brand,
                  )}>
                    {ai.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-muted-foreground">AI · {ai.role}</div>
                    <div className="text-[18px] md:text-[20px] font-semibold tracking-tight leading-tight">{ai.name}</div>
                    <div className="mt-0.5 text-[11px] md:text-[12px] text-muted-foreground line-clamp-1">{ai.duty}</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>

                {p && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.suggested.slice(0, 2).map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[10px] md:text-[11px] text-muted-foreground">
                        <Sparkles className="h-2.5 w-2.5 text-cat-decor" /> {s}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* 能力一览（真实/真陈述，不放虚构指标） */}
        <div className="mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 text-center">
          {[
            { l: "AI 助手", v: `${aiCount} 位`, c: "text-cat-build" },
            { l: "知识库支撑", v: `${kbCount} 篇`, c: "text-cat-design" },
            { l: "在线", v: "7×24", c: "text-cat-decor" },
            { l: "对话", v: "实时流式", c: "text-accent-tea" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-border bg-background p-3 md:p-4">
              <div className="text-[10px] text-muted-foreground tracking-wider uppercase">{s.l}</div>
              <div className={`mt-1 text-[18px] md:text-[24px] font-semibold tracking-tight ${s.c}`}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* 企业自定义 AI */}
        <div className="mt-8 md:mt-10 rounded-3xl border border-border bg-surface p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <Star className="h-7 w-7 text-cat-decor shrink-0 mt-0.5" />
            <div>
              <div className="text-[12px] text-muted-foreground tracking-wider uppercase">企业自定义 AI</div>
              <div className="mt-1 text-[18px] md:text-[22px] font-semibold tracking-tight">
                在子站嵌入贴牌 AI 员工
              </div>
              <p className="mt-1.5 text-[12px] md:text-[13px] text-muted-foreground max-w-2xl leading-5">
                企业可基于协会 AI 模板定制人设、知识库与话术，在 yourbrand.<code className="text-foreground">{SITE.domain}</code> 子站独立运行。
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/enterprise/ai"
            className="inline-flex items-center gap-2 h-11 md:h-12 px-5 md:px-6 rounded-full bg-foreground text-background font-medium text-[13px] md:text-[14px] hover:bg-brand shrink-0"
          >
            企业后台配置
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </>
  );
}
