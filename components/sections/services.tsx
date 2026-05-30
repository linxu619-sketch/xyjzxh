import Link from "next/link";
import {
  ShieldCheck, Wallet, Umbrella, FileCheck2, Library, GraduationCap,
  Newspaper, Globe2, MessageSquareHeart, Sparkles, ArrowUpRight,
  ShoppingBag, Hammer,
} from "lucide-react";
import { Container } from "../container";
import { SERVICES } from "@/lib/site";
import { cn } from "@/lib/cn";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  service: ShieldCheck,
  finance: Wallet,
  insurance: Umbrella,
  projects: FileCheck2,
  knowledge: Library,
  talents: GraduationCap,
  news: Newspaper,
  tenant: Globe2,
  review: MessageSquareHeart,
  ai: Sparkles,
  supplies: ShoppingBag,
  construction: Hammer,
};

const HREF: Record<string, string> = {
  service: "/services",
  finance: "/finance",
  insurance: "/insurance",
  projects: "/projects",
  knowledge: "/knowledge",
  talents: "/talents",
  news: "/news",
  tenant: "/tenant",
  review: "/review",
  ai: "/ai",
  supplies: "/supplies",
  construction: "/dashboard/enterprise/orders",
};

const TONE: Record<string, { bg: string; text: string; ring: string }> = {
  brand: { bg: "bg-brand-50", text: "text-brand", ring: "group-hover:ring-brand/20" },
  build: { bg: "bg-cat-build-soft", text: "text-cat-build", ring: "group-hover:ring-cat-build/20" },
  decor: { bg: "bg-cat-decor-soft", text: "text-cat-decor", ring: "group-hover:ring-cat-decor/20" },
  design: { bg: "bg-cat-design-soft", text: "text-cat-design", ring: "group-hover:ring-cat-design/20" },
  tea: { bg: "bg-[#e6f7f1]", text: "text-accent-tea", ring: "group-hover:ring-accent-tea/20" },
  yellow: { bg: "bg-[#fff6d6]", text: "text-[#a37200]", ring: "group-hover:ring-accent-yellow/30" },
};

export function Services() {
  return (
    <section className="py-14 md:py-28 bg-surface">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="max-w-2xl">
            <div className="text-[11px] md:text-[12px] tracking-[0.2em] text-cat-decor font-medium uppercase">
              SERVICES · 服务矩阵
            </div>
            <h2 className="mt-2 md:mt-3 text-[28px] md:text-[48px] font-semibold tracking-tight leading-[1.1]">
              12 大模块<br className="md:hidden" />
              覆盖企业与业主全场景
            </h2>
          </div>
          <p className="text-[13px] md:text-[15px] text-muted-foreground max-w-md">
            从入会到经营、从报备到理赔、从查规范到聊 AI — 一处入口、一套账号、一次到位。
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
          {SERVICES.map((s) => {
            const Icon = ICONS[s.key] ?? Sparkles;
            const t = TONE[s.color] ?? TONE.brand;
            return (
              <Link
                key={s.key}
                href={HREF[s.key] ?? "/"}
                className={cn(
                  "group relative overflow-hidden rounded-2xl bg-background p-4 md:p-6 transition-all active:scale-[0.98] md:hover:-translate-y-1 md:hover:shadow-md ring-1 ring-border",
                  t.ring,
                )}
              >
                <div className={cn(
                  "inline-flex h-10 md:h-11 w-10 md:w-11 items-center justify-center rounded-xl",
                  t.bg, t.text,
                )}>
                  <Icon className="h-4 md:h-5 w-4 md:w-5" />
                </div>
                <div className="mt-3 md:mt-4 text-[13px] md:text-[15px] font-semibold tracking-tight">
                  {s.title}
                </div>
                <div className="mt-1 md:mt-1.5 text-[11px] md:text-[12px] text-muted-foreground leading-4 md:leading-5 line-clamp-2">
                  {s.desc}
                </div>
                <ArrowUpRight className="absolute top-3 md:top-5 right-3 md:right-5 h-3.5 md:h-4 w-3.5 md:w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
