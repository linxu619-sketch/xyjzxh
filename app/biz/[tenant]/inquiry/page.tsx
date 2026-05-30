import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Phone, ArrowLeft, ShieldCheck, Sparkles, Clock, MessageSquareText,
  ArrowRight, Send, Bot,
} from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { getEnterprise } from "@/lib/data/enterprises";
import { cn } from "@/lib/cn";

const BG: Record<string, string> = {
  build: "bg-cat-build", decor: "bg-cat-decor", design: "bg-cat-design",
};
const SOFT: Record<string, string> = {
  build: "bg-cat-build-soft text-cat-build",
  decor: "bg-cat-decor-soft text-cat-decor",
  design: "bg-cat-design-soft text-cat-design",
};

const QUICK_QUESTIONS = [
  "我家 120㎡ 预算 30 万够吗？",
  "699 套餐含什么？",
  "工期一般多久？",
  "如何对比报价是否合理？",
  "施工质保多少年？怎么理赔？",
];

export default async function InquiryPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const e = getEnterprise(tenant);
  if (!e) notFound();

  return (
    <Container className="py-6 md:py-12 max-w-5xl pb-28 md:pb-12">
      <Link
        href={`/biz/${tenant}`}
        className="inline-flex items-center gap-1.5 text-[12px] md:text-[13px] text-muted-foreground hover:text-foreground mb-4 md:mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> 返回 {e.hero.brand}
      </Link>

      {/* Hero */}
      <div className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-6 md:mb-10">
        <div>
          <Badge tone={e.color === "build" ? "build" : e.color === "decor" ? "decor" : "design"} className="mb-3">
            免费咨询 · 协会担保
          </Badge>
          <h1 className="text-[28px] sm:text-[36px] md:text-[48px] font-semibold tracking-tight leading-tight">
            在线咨询<br className="sm:hidden" />
            <span className="text-muted-foreground"> 和 {e.hero.brand} 聊聊</span>
          </h1>
          <p className="mt-2 md:mt-3 text-[13px] md:text-[14px] text-muted-foreground max-w-lg leading-6">
            7×24 在线 · 平均 30 秒响应 · 不强制留电话 · 全过程协会平台留痕。
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cat-build-soft text-cat-build px-3 py-1.5 text-[11px] md:text-[12px] font-medium shrink-0">
          <ShieldCheck className="h-3.5 w-3.5" /> 协会担保咨询
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 左侧聊天气泡 */}
        <div className="lg:col-span-3 rounded-3xl border border-border bg-background p-5 md:p-8 flex flex-col">
          {/* 客服头 */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
            <span className={cn("h-10 w-10 rounded-2xl text-white inline-flex items-center justify-center text-[14px] font-semibold shrink-0", BG[e.color])}>
              {e.hero.brand.slice(0, 1)}
            </span>
            <div className="flex-1 leading-tight min-w-0">
              <div className="text-[14px] font-semibold truncate">{e.hero.brand} · 客服</div>
              <div className="text-[11px] text-accent-tea inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-tea animate-pulse" /> 在线 · 平均 30 秒响应
              </div>
            </div>
            <Link
              href="/ai/decor"
              className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-foreground text-background text-[11px] active:scale-95 transition-transform"
            >
              <Sparkles className="h-3 w-3 text-accent-yellow" /> 切 AI 小装
            </Link>
          </div>

          {/* 示例对话气泡 */}
          <div className="space-y-3 flex-1 min-h-[260px] md:min-h-[320px]">
            <Bubble side="them" name={e.hero.brand} color={e.color}>
              您好，我是 {e.hero.brand} 客户经理。<br />
              我看到您从协会主站进来。我们是协会认证企业，签约可同步获得 <b>消费保险</b> 和 <b>14 天协会调解</b>。<br />
              请问您是想装修自住房还是商铺？
            </Bubble>

            <Bubble side="me">三居 120㎡，预算 30 万，想要现代极简风</Bubble>

            <Bubble side="them" name={e.hero.brand} color={e.color}>
              好的，参考案例：<a href={`/biz/${tenant}#cases`} className="text-brand underline">金茂悦府 1602</a> 户型相近。<br />
              30 万预算可做整装中端：<br />
              · 基装 ~1080 元/㎡ ≈ 13 万<br />
              · 主材包 ≈ 11 万<br />
              · 软装家电 ≈ 6 万<br />
              要不要约设计师上门量房？免费的。
            </Bubble>
          </div>

          {/* 真实输入框 — 提交后跳 /ai/decor 自动开聊 */}
          <div className="mt-5 pt-5 border-t border-border">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {QUICK_QUESTIONS.map((q) => (
                <Link
                  key={q}
                  href={`/ai/decor?q=${encodeURIComponent(q)}`}
                  className="rounded-full bg-surface px-3 py-1.5 text-[11px] md:text-[12px] hover:bg-surface-2 active:scale-95 transition-all"
                >
                  {q}
                </Link>
              ))}
            </div>
            <form
              method="GET"
              action="/ai/decor"
              className="flex items-end gap-2"
            >
              <input
                type="hidden"
                name="enterprise"
                value={e.id}
              />
              <input
                name="q"
                placeholder={`输入您的问题，AI 小装会先帮您把关 …`}
                required
                className="flex-1 h-12 rounded-2xl border border-border bg-background px-4 text-[14px] outline-none focus:border-foreground/30"
              />
              <button
                type="submit"
                className={cn(
                  "inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shrink-0 active:scale-95 transition-transform",
                  BG[e.color],
                )}
                aria-label="发送"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-2 text-[10px] text-muted-foreground text-center inline-flex items-center justify-center gap-1 w-full">
              <Bot className="h-3 w-3 text-cat-decor" /> 默认先由 AI 小装把关 · 复杂问题自动转人工
            </div>
          </div>
        </div>

        {/* 右侧侧栏 */}
        <aside className="lg:col-span-2 space-y-3">
          <div className="rounded-3xl border border-border bg-background p-5 md:p-6">
            <div className="text-[11px] tracking-wider uppercase text-muted-foreground mb-3">为什么放心咨询？</div>
            <ul className="space-y-3 text-[13px]">
              <Li icon={ShieldCheck} text="协会实名认证企业 · 资质实时核验" tone="tea" />
              <Li icon={MessageSquareText} text="对话留痕 · 调解时可作为证据" tone="brand" />
              <Li icon={Clock} text="承诺响应 ≤ 30 秒 · 超时自动转值班" tone="decor" />
              <Li icon={Phone} text="不强制留电话 · 您主动给才会用" tone="design" />
            </ul>
          </div>

          <div className="rounded-3xl bg-foreground text-background p-5 md:p-6 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cat-decor/30 blur-2xl" />
            <Sparkles className="relative h-6 w-6 text-accent-yellow" />
            <div className="relative mt-3 text-[16px] md:text-[18px] font-semibold">不想等？AI 小装</div>
            <p className="relative mt-1.5 text-[11px] md:text-[12px] text-background/70 leading-5">
              30 秒给方案 + 估价 + 案例匹配，结果可一键发给本企业。
            </p>
            <Link
              href="/ai/decor"
              className="relative mt-3 md:mt-4 inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-accent-yellow text-foreground text-[12px] font-medium active:scale-95 transition-transform"
            >
              立即试试 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* 下一步 */}
          <div className="rounded-3xl border border-border bg-background p-5 md:p-6">
            <div className="text-[11px] tracking-wider uppercase text-muted-foreground mb-3">下一步</div>
            <ol className="space-y-2 text-[12px]">
              {[
                "咨询满意 → 提交正式需求 / 量房预约",
                "设计师上门量房 + 出方案",
                "正式报价 + 协会监理介入",
                "电子签约 + 工装报备",
                "开工 → 分步验收 → 收款 → 维保",
              ].map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className={cn("h-5 w-5 rounded-full inline-flex items-center justify-center text-[10px] font-semibold shrink-0", i === 0 ? SOFT[e.color] : "bg-surface text-muted-foreground")}>
                    {i + 1}
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
            <Link
              href={`/biz/${tenant}/order`}
              className={cn(
                "mt-4 inline-flex w-full items-center justify-center gap-1.5 h-11 rounded-full text-white text-[13px] font-medium active:scale-[0.99]",
                BG[e.color],
              )}
            >
              提交正式需求 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </aside>
      </div>

      {/* 移动端 sticky 底部 CTA */}
      <div className="md:hidden fixed bottom-3 inset-x-0 z-30 px-3 pointer-events-none">
        <div className="pointer-events-auto mx-auto max-w-md rounded-full bg-foreground text-background shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] flex items-center gap-1.5 p-1.5">
          <a
            href={`tel:${e.contact.tel.replace(/-/g, "")}`}
            className="h-11 w-11 inline-flex items-center justify-center rounded-full bg-accent-tea text-white shrink-0"
            aria-label={`致电 ${e.contact.tel}`}
          >
            <Phone className="h-4 w-4" />
          </a>
          <Link
            href="/ai/decor"
            className="h-11 w-11 inline-flex items-center justify-center rounded-full bg-accent-yellow text-foreground shrink-0"
            aria-label="AI 估价"
          >
            <Sparkles className="h-4 w-4" />
          </Link>
          <Link
            href={`/biz/${tenant}/order`}
            className={cn(
              "flex-1 h-11 inline-flex items-center justify-center gap-1.5 rounded-full text-white text-[13px] font-medium",
              BG[e.color],
            )}
          >
            提交需求 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </Container>
  );
}

function Bubble({
  side, name, color, children,
}: {
  side: "me" | "them"; name?: string; color?: string; children: React.ReactNode;
}) {
  return (
    <div className={cn("flex gap-2", side === "me" ? "justify-end" : "justify-start")}>
      {side === "them" && (
        <span className={cn("h-7 w-7 rounded-xl text-white text-[11px] font-semibold inline-flex items-center justify-center shrink-0", BG[color ?? "build"])}>
          {name?.slice(0, 1)}
        </span>
      )}
      <div className={cn(
        "max-w-[82%] md:max-w-[80%] rounded-2xl px-3.5 md:px-4 py-2 md:py-2.5 text-[12.5px] md:text-[13px] leading-6",
        side === "me"
          ? "bg-foreground text-background rounded-br-sm"
          : "bg-surface rounded-bl-sm",
      )}>
        {children}
      </div>
    </div>
  );
}

function Li({ icon: Ic, text, tone }: { icon: React.ComponentType<{ className?: string }>; text: string; tone: "tea" | "brand" | "decor" | "design" }) {
  const COLOR: Record<string, string> = {
    tea: "text-accent-tea", brand: "text-brand", decor: "text-cat-decor", design: "text-cat-design",
  };
  return (
    <li className="flex items-start gap-2.5">
      <Ic className={cn("h-4 w-4 mt-0.5 shrink-0", COLOR[tone])} /> {text}
    </li>
  );
}
