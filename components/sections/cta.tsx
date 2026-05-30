import { ArrowRight, Building2, UserRound, Sparkles, HardHat } from "lucide-react";
import { Container } from "../container";
import { Button } from "../ui/button";

const ITEMS = [
  {
    icon: Building2,
    title: "我是企业",
    desc: "申请入会 · 二级子站 · 工装报备",
    cta: "申请入会",
    href: "/join",
    bg: "bg-cat-build-soft",
    iconBg: "bg-cat-build text-white",
  },
  {
    icon: HardHat,
    title: "我是从业者",
    desc: "找活 · 工伤险 · 收入证明",
    cta: "免费注册",
    href: "/practitioners",
    bg: "bg-cat-design-soft",
    iconBg: "bg-cat-design text-white",
  },
  {
    icon: UserRound,
    title: "我是业主",
    desc: "找企业 · 消费保险 · 协会担保",
    cta: "找企业",
    href: "/members",
    bg: "bg-cat-decor-soft",
    iconBg: "bg-cat-decor text-white",
  },
  {
    icon: Sparkles,
    title: "试试 AI 助手",
    desc: "10 位 AI · 7×24 在线",
    cta: "AI 大厅",
    href: "/ai",
    bg: "bg-[#fff6d6]",
    iconBg: "bg-accent-yellow text-foreground",
  },
];

export function Cta() {
  return (
    <section className="pb-16 md:pb-32">
      <Container>
        <div className="relative overflow-hidden rounded-[24px] md:rounded-[40px] border border-border p-5 md:p-12 bg-background">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cat-build/10 blur-3xl" aria-hidden />
          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-cat-decor/10 blur-3xl" aria-hidden />

          <div className="relative max-w-2xl">
            <div className="text-[11px] md:text-[12px] tracking-[0.2em] text-brand font-medium uppercase">
              GET STARTED · 立刻开始
            </div>
            <h2 className="mt-2 md:mt-3 text-[26px] md:text-[44px] font-semibold tracking-tight leading-[1.1]">
              四种身份，<br className="sm:hidden" />
              一处直达
            </h2>
            <p className="mt-3 md:mt-4 text-[13px] md:text-[15px] text-muted-foreground max-w-md">
              企业、业主、行业从业者、AI 体验者 — 都能在这里找到入口。
            </p>
          </div>

          <div className="relative mt-6 md:mt-10 grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-5">
            {ITEMS.map(({ icon: Icon, ...it }) => (
              <div
                key={it.title}
                className={`group relative overflow-hidden rounded-2xl md:rounded-3xl ${it.bg} p-4 md:p-7 transition-all md:hover:-translate-y-1 active:scale-[0.99]`}
              >
                <div className={`inline-flex h-10 md:h-12 w-10 md:w-12 items-center justify-center rounded-xl md:rounded-2xl ${it.iconBg}`}>
                  <Icon className="h-4 md:h-5 w-4 md:w-5" />
                </div>
                <div className="mt-3 md:mt-5 text-[15px] md:text-[20px] font-semibold tracking-tight">{it.title}</div>
                <div className="mt-1 md:mt-1.5 text-[11px] md:text-[13px] text-muted-foreground leading-4 md:leading-6">{it.desc}</div>
                <div className="mt-3 md:mt-6">
                  <Button href={it.href} size="sm" variant="primary">
                    {it.cta} <ArrowRight className="h-3 md:h-3.5 w-3 md:w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
