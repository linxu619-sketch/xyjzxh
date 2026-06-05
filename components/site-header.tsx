"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles, ChevronRight, Building2 } from "lucide-react";
import { SITE, ASSOCIATION_NAV, CONSUMER_NAV } from "@/lib/site";
import { Container } from "./container";
import { Button } from "./ui/button";
import { cn } from "@/lib/cn";

type Face = "consumer" | "xh";

export function SiteHeader({ face = "consumer", authed = false, todo = 0 }: { face?: Face; authed?: boolean; todo?: number }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const NAV = face === "xh" ? ASSOCIATION_NAV : CONSUMER_NAV;
  const homeHref = face === "xh" ? "/xh" : "/";
  const isXh = face === "xh";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border"
          : "bg-background/0",
      )}
    >
      {/* 协会门户顶部条 — 提示用户在哪个门面 */}
      {isXh && (
        <div className="bg-foreground text-background text-[11px]">
          <Container>
            <div className="flex items-center justify-between gap-2 py-1.5">
              <span className="inline-flex items-center gap-1.5 min-w-0">
                <Building2 className="h-3 w-3 text-accent-yellow shrink-0" />
                <span className="truncate">您在 <b>协会门户</b> · 面向企业 / 从业者 / 合作机构</span>
              </span>
              <Link href="/" className="text-background/70 hover:text-background whitespace-nowrap shrink-0">
                返回业主门户 →
              </Link>
            </div>
          </Container>
        </div>
      )}

      <Container>
        <div className="flex h-16 lg:h-18 items-center justify-between">
          {/* Logo */}
          <Link href={homeHref} className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/seal.png" alt="信阳市建筑装饰装修协会" className="h-9 w-9 object-contain shrink-0" />
            <div className="leading-tight">
              <div className="text-[15px] font-semibold tracking-tight">
                {SITE.shortName}
                <span className="ml-1 text-muted-foreground font-normal hidden sm:inline">
                  {isXh ? "协会门户" : "·业主门户"}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground tracking-[0.18em] uppercase font-medium">
                {isXh ? `xh.${SITE.domain}` : SITE.domain}
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.slice(1, isXh ? 8 : 7).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-surface"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {isXh ? (
              <>
                <Link
                  href="/ai"
                  className="hidden md:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-foreground text-background text-[13px] font-medium hover:bg-brand transition-colors group"
                >
                  <Sparkles className="h-3.5 w-3.5 text-accent-yellow group-hover:rotate-12 transition-transform" />
                  AI 助手
                </Link>
                <Link
                  href={authed ? "/dashboard" : "/login?role=association"}
                  className="inline-flex h-9 items-center px-3 sm:px-3.5 rounded-full text-[13px] text-foreground hover:bg-surface transition-colors"
                >
                  {authed ? "我的" : "登录"}
                  {authed && todo > 0 && (
                    <span className="ml-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-cat-decor text-white text-[10px] font-semibold inline-flex items-center justify-center">
                      {todo > 99 ? "99+" : todo}
                    </span>
                  )}
                </Link>
                <Button href="/join" size="sm" variant="secondary">
                  申请入会
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/ai/decor"
                  className="hidden md:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-foreground text-background text-[13px] font-medium hover:bg-cat-decor transition-colors group"
                >
                  <Sparkles className="h-3.5 w-3.5 text-accent-yellow group-hover:rotate-12 transition-transform" />
                  AI 估价
                </Link>
                {authed && (
                  <Link
                    href="/dashboard/customer"
                    className="hidden sm:inline-flex h-9 items-center px-3.5 rounded-full text-[13px] text-foreground hover:bg-surface transition-colors"
                  >
                    我的项目
                  </Link>
                )}
                <Button
                  href={authed ? "/dashboard" : "/login?role=customer"}
                  size="sm"
                  variant="secondary"
                >
                  {authed ? "我的" : "登录"}
                  {authed && todo > 0 ? (
                    <span className="min-w-[16px] h-[16px] px-1 rounded-full bg-cat-decor text-white text-[10px] font-semibold inline-flex items-center justify-center">
                      {todo > 99 ? "99+" : todo}
                    </span>
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </Container>

    </header>
  );
}
