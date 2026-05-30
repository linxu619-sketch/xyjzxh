import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "../container";
import { CATEGORIES } from "@/lib/site";
import { cn } from "@/lib/cn";

const SURFACE: Record<string, string> = {
  build: "bg-cat-build text-white",
  decor: "bg-cat-decor text-white",
  design: "bg-cat-design text-white",
};

const SOFT: Record<string, string> = {
  build: "bg-cat-build-soft",
  decor: "bg-cat-decor-soft",
  design: "bg-cat-design-soft",
};

export function Categories() {
  return (
    <section className="py-14 md:py-28">
      <Container>
        {/* 标题区 */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="max-w-2xl">
            <div className="text-[11px] md:text-[12px] tracking-[0.2em] text-brand font-medium uppercase">
              MEMBERS · 三大品类
            </div>
            <h2 className="mt-2 md:mt-3 text-[28px] md:text-[48px] font-semibold tracking-tight leading-[1.1]">
              一站汇聚<br className="md:hidden" />
              本地全行业会员
            </h2>
          </div>
          <p className="text-[13px] md:text-[15px] text-muted-foreground max-w-md">
            所有入会企业均经资质核验、信用评估与现场核查。
          </p>
        </div>

        {/* 大色块 · 移动端高度更紧凑 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat.key}
              href={`/members?cat=${cat.key}`}
              className={cn(
                "group relative overflow-hidden rounded-3xl p-6 md:p-8 min-h-[240px] md:min-h-[420px] flex flex-col justify-between transition-all duration-300 active:scale-[0.99] md:hover:-translate-y-1 md:hover:shadow-xl",
                SURFACE[cat.color],
              )}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* 装饰图形 */}
              <div className="absolute -right-16 -bottom-16 h-72 w-72 rounded-full bg-white/10" />
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-foreground/20" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] tracking-[0.25em] font-semibold opacity-80 uppercase">
                    {cat.en}
                  </div>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 group-hover:bg-white group-hover:text-foreground transition-colors">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
                <h3 className="mt-4 md:mt-6 text-[28px] md:text-[44px] font-semibold tracking-tight leading-tight">
                  {cat.title}
                </h3>
                <p className="mt-2 md:mt-3 text-[12px] md:text-[14px] leading-5 md:leading-6 text-white/85 max-w-xs">
                  {cat.desc}
                </p>
              </div>

              <div className="relative flex items-end justify-between">
                <div>
                  <div className="text-[10px] md:text-[11px] opacity-70 uppercase tracking-wider">在册</div>
                  <div className="text-[32px] md:text-[48px] font-semibold leading-none tabular-nums">
                    {cat.count}
                    <span className="ml-1 text-[13px] md:text-[14px] font-normal opacity-80 align-top">家</span>
                  </div>
                </div>
                <span className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-medium",
                  SOFT[cat.color],
                  "text-foreground/80",
                )}>
                  {cat.badge}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
