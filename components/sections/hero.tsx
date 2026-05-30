import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Building2 } from "lucide-react";
import { Container } from "../container";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* 背景：mesh + grid */}
      <div className="absolute inset-0 bg-mesh" aria-hidden />
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" aria-hidden />

      {/* 顶部气泡 */}
      <div className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-cat-decor/20 blur-3xl" aria-hidden />
      <div className="absolute -top-20 right-0 h-80 w-80 rounded-full bg-cat-build/15 blur-3xl" aria-hidden />
      <div className="absolute top-40 left-1/3 h-60 w-60 rounded-full bg-cat-design/15 blur-3xl" aria-hidden />

      <Container className="relative pt-10 md:pt-24 pb-14 md:pb-28">
        {/* 公告条 */}
        <div className="animate-fade-up flex justify-center px-2">
          <Link
            href="/news"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-background/70 backdrop-blur px-2.5 md:px-3.5 py-1 md:py-1.5 text-[11px] md:text-[12px] text-muted-foreground hover:border-foreground/20 hover:text-foreground transition-colors shadow-sm max-w-full"
          >
            <Badge tone="decor" className="!px-2 !py-0.5 shrink-0">NEW</Badge>
            <span className="truncate">2026 新版验收规范 6 月 1 日起施行</span>
            <ArrowRight className="h-3 md:h-3.5 w-3 md:w-3.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        </div>

        {/* 主标题 */}
        <div className="mt-6 md:mt-12 text-center max-w-4xl mx-auto">
          <h1 className="animate-fade-up animate-fade-up-delay-1 text-[36px] leading-[1.05] sm:text-[56px] md:text-[76px] md:leading-[1.02] font-semibold tracking-tight">
            让每一次<span className="text-gradient-brand">装修</span>
            <br className="hidden sm:block" />
            都有协会<span className="relative inline-block">
              守护
              <svg
                viewBox="0 0 200 12"
                className="absolute -bottom-2 left-0 w-full h-2 text-cat-decor"
                fill="none"
                aria-hidden
              >
                <path
                  d="M2 9 C 50 2, 150 2, 198 9"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="animate-fade-up animate-fade-up-delay-2 mt-5 md:mt-9 text-[13px] md:text-[18px] leading-6 md:leading-8 text-muted-foreground max-w-2xl mx-auto px-2">
            信阳市建筑装饰装修协会官方平台 — 汇聚 1,052 家建筑、装修与设计企业，
            <br className="hidden md:block" />
            提供工装报备、消费保险、金融、知识与 AI 助手等一站式在线服务。
          </p>

          {/* CTA */}
          <div className="animate-fade-up animate-fade-up-delay-3 mt-7 md:mt-11 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button href="/members" size="lg" variant="primary">
              找一家靠谱企业
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/join" size="lg" variant="outline">
              企业申请入会
            </Button>
          </div>

          {/* 信任徽章 */}
          <div className="animate-fade-up animate-fade-up-delay-4 mt-7 md:mt-12 flex flex-wrap items-center justify-center gap-x-4 md:gap-x-6 gap-y-2 text-[11px] md:text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 md:h-4 w-3.5 md:w-4 text-accent-tea" /> 协会认证
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 md:h-4 w-3.5 md:w-4 text-cat-build" /> 报备直连省厅
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 md:h-4 w-3.5 md:w-4 text-cat-decor" /> 10 位 AI 在线
            </span>
          </div>
        </div>

        {/* 底部 hero 视觉卡片 — 三大入口预览 */}
        <div className="animate-fade-up animate-fade-up-delay-5 mt-10 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
          {[
            { label: "建筑企业", count: "326 家", tone: "build", grad: "from-cat-build to-[#0e44c9]" },
            { label: "装修企业", count: "542 家", tone: "decor", grad: "from-cat-decor to-[#e6531f]" },
            { label: "设计公司及个人", count: "184 家 / 人", tone: "design", grad: "from-cat-design to-[#6d3df0]" },
          ].map((it) => (
            <Link
              key={it.label}
              href="/members"
              className="group relative overflow-hidden rounded-3xl border border-border bg-background p-5 md:p-6 hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${it.grad} opacity-90`} />
              <div className="relative">
                <div className="text-[12px] text-muted-foreground">在册</div>
                <div className="mt-1 text-[28px] md:text-[34px] font-semibold tracking-tight">{it.count}</div>
                <div className="mt-1 text-[14px] font-medium">{it.label}</div>
              </div>
              <div className="relative mt-8 flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                  浏览全部
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
