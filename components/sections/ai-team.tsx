import Link from "next/link";
import { Container } from "../container";
import { AI_EMPLOYEES } from "@/lib/site";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

const GRAD: Record<string, string> = {
  brand: "from-brand to-brand-600",
  build: "from-cat-build to-brand-600",
  decor: "from-cat-decor to-[#e6531f]",
  design: "from-cat-design to-[#6d3df0]",
  tea: "from-accent-tea to-[#008a63]",
  yellow: "from-[#ffd34d] to-[#ffae00]",
};

export function AiTeam() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* 深色块：制造对比、突出 AI */}
      <div className="absolute inset-0 bg-foreground" aria-hidden />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(at 20% 20%, rgba(20,86,240,0.45) 0px, transparent 50%)," +
            "radial-gradient(at 80% 30%, rgba(139,92,246,0.35) 0px, transparent 55%)," +
            "radial-gradient(at 50% 90%, rgba(255,107,53,0.25) 0px, transparent 55%)",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-grid opacity-[0.06]" aria-hidden />

      <Container className="relative text-background">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-8 md:mb-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-2.5 md:px-3 py-1 text-[10px] md:text-[11px] tracking-[0.2em] font-medium uppercase">
              <Sparkles className="h-3 w-3 text-accent-yellow" />
              AI · 10 位 AI 员工
            </div>
            <h2 className="mt-3 md:mt-4 text-[28px] md:text-[52px] font-semibold tracking-tight leading-[1.05]">
              你的协会，<br className="md:hidden" />
              <span className="text-accent-yellow">永远在线</span>
            </h2>
          </div>
          <p className="text-[13px] md:text-[15px] text-white/70 max-w-md">
            10 位经过场景调优的 AI 员工，覆盖咨询、估价、报备、合规、调解、招聘等高频场景，
            7×24 小时随问随答。
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 md:gap-4">
          {AI_EMPLOYEES.map((ai, i) => (
            <Link
              key={ai.key}
              href={`/ai/${ai.key}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-3 md:p-5 active:scale-[0.99] md:hover:bg-white/[0.08] md:hover:border-white/20 transition-all md:hover:-translate-y-1"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className={cn(
                "inline-flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-2xl text-lg md:text-2xl bg-gradient-to-br shadow-lg",
                GRAD[ai.color] ?? GRAD.brand,
              )}>
                {ai.emoji}
              </div>
              <div className="mt-2.5 md:mt-4 text-[12px] md:text-[15px] font-semibold leading-4">
                {ai.name} · {ai.role}
              </div>
              <div className="mt-1 text-[10px] md:text-[12px] text-white/60 line-clamp-2 leading-4">
                {ai.duty}
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-accent-yellow opacity-0 group-hover:opacity-100 transition-opacity">
                立即对话 <ArrowUpRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <Link
            href="/ai"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-accent-yellow text-foreground font-medium text-[14px] hover:bg-white transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            进入 AI 助手大厅
          </Link>
          <span className="text-[12px] text-white/50">企业可在二级子站嵌入定制 AI 员工</span>
        </div>
      </Container>
    </section>
  );
}
