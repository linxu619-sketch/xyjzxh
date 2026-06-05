"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Search, Sparkles, Star, UserRound,
  Building2, LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/cn";

type Face = "consumer" | "xh";

type Tab = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match?: (path: string) => boolean;
};

const CONSUMER_TABS: Tab[] = [
  { href: "/",          label: "首页",   icon: Home,        match: (p) => p === "/" },
  { href: "/members",   label: "找装企", icon: Search,      match: (p) => p.startsWith("/members") },
  { href: "/ai/decor",  label: "AI",     icon: Sparkles,    match: (p) => p.startsWith("/ai") },
  { href: "/review",    label: "评价",   icon: Star,        match: (p) => p.startsWith("/review") },
  { href: "/dashboard/customer", label: "我的", icon: UserRound, match: (p) => p.startsWith("/dashboard") || p.startsWith("/login") },
];

const XH_TABS: Tab[] = [
  { href: "/xh",        label: "协会",   icon: Home,        match: (p) => p === "/xh" || p === "/" },
  { href: "/members",   label: "会员",   icon: Building2,   match: (p) => p.startsWith("/members") },
  { href: "/ai",        label: "AI",     icon: Sparkles,    match: (p) => p.startsWith("/ai") },
  { href: "/xh#services", label: "办事", icon: LayoutGrid, match: (p) => p.startsWith("/projects") },
  { href: "/dashboard", label: "我的",   icon: UserRound,   match: (p) => p.startsWith("/dashboard") || p.startsWith("/login") },
];

export function GlobalBottomNav({ face = "consumer", todo = 0 }: { face?: Face; todo?: number }) {
  const pathname = usePathname();
  const tabs = face === "xh" ? XH_TABS : CONSUMER_TABS;

  // AI 聊天页有自己的底部输入框、客户/从业者控制台有自己的底栏 —— 都不叠加
  if (
    pathname.startsWith("/ai/") ||
    pathname.startsWith("/dashboard/customer") ||
    pathname.startsWith("/dashboard/practitioner")
  ) {
    return null;
  }

  return (
    <>
      {/* 移动端占位：撑出底栏高度，避免固定底栏遮住页脚/页面底部内容 */}
      <div aria-hidden className="lg:hidden h-[calc(3.5rem+max(env(safe-area-inset-bottom),0.5rem))]" />
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 pointer-events-none"
        aria-label="主导航"
      >
      {/* 底部白条 + 上阴影 */}
      <div className="pointer-events-auto relative bg-background/95 backdrop-blur-xl border-t border-border pb-[max(env(safe-area-inset-bottom),0.5rem)]">
        <div className="mx-auto max-w-md grid grid-cols-5 h-14 items-end">
          {tabs.map((t, i) => {
            const active = t.match ? t.match(pathname) : pathname === t.href;
            const Icon = t.icon;
            const isAI = i === 2;

            if (isAI) {
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className="flex flex-col items-center justify-end pb-1.5 -mt-4 relative"
                  aria-label={t.label}
                >
                  <span className={cn(
                    "h-10 w-10 rounded-full inline-flex items-center justify-center text-foreground shadow-[0_8px_22px_-5px_rgba(255,170,0,0.55)] transition-transform active:scale-95 relative",
                    "bg-gradient-to-br from-accent-yellow to-[#ffae00]",
                  )}>
                    <Icon className="h-5 w-5" />
                    <span className="absolute inset-0 rounded-full bg-accent-yellow opacity-40 animate-ping" />
                  </span>
                  <span className={cn(
                    "mt-1 text-[10px] font-semibold",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}>
                    {t.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 h-full active:bg-surface/60 transition-colors",
                )}
                aria-label={t.label}
              >
                <span className="relative">
                  <Icon className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-foreground" : "text-muted-foreground",
                  )} />
                  {t.href === "/dashboard" && todo > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-cat-decor text-white text-[9px] font-semibold inline-flex items-center justify-center ring-2 ring-background">
                      {todo > 99 ? "99+" : todo}
                    </span>
                  )}
                </span>
                <span className={cn(
                  "text-[10px] transition-colors",
                  active ? "text-foreground font-semibold" : "text-muted-foreground",
                )}>
                  {t.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      </nav>
    </>
  );
}
