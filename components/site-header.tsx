"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, Sparkles, ChevronRight, Building2 } from "lucide-react";
import { SITE, ASSOCIATION_NAV, CONSUMER_NAV } from "@/lib/site";
import { Container } from "./container";
import { Button } from "./ui/button";
import { cn } from "@/lib/cn";

type Face = "consumer" | "xh";

export function SiteHeader({ face = "consumer", authed = false, todo = 0 }: { face?: Face; authed?: boolean; todo?: number }) {
  const [open, setOpen] = useState(false);
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
            <span className={cn(
              "relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-background text-[15px] font-bold shadow-sm",
              isXh ? "bg-brand" : "bg-foreground",
            )}>
              {isXh ? "协" : "信"}
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-cat-decor animate-pulse-glow" />
            </span>
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
                  className="hidden sm:inline-flex"
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
            {/* 三横菜单：仅消费者面保留；协会面已移除（功能由首页办事大厅 + 底部栏 + 页脚承载） */}
            {!isXh && (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface"
                aria-label="菜单"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>
      </Container>

      {/* Mobile menu — 仅消费者面 */}
      <div
        className={cn(
          "lg:hidden overflow-hidden border-t border-border transition-[max-height,opacity] duration-300",
          !isXh && open ? "max-h-[90vh] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <Container className="py-4">
          <nav className="grid grid-cols-2 gap-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3.5 text-[14px] font-medium hover:bg-surface-2"
              >
                {item.label}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </nav>

          {/* 跨门户跳转 */}
          <Link
            href={isXh ? "/" : "/xh"}
            className="mt-3 flex items-center justify-between rounded-2xl bg-foreground text-background px-4 py-3.5 text-[13px] font-medium"
          >
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-accent-yellow" />
              {isXh ? "返回业主门户 (xyjzxh.com)" : "进入协会门户 (xh.xyjzxh.com)"}
            </span>
            <ChevronRight className="h-4 w-4" />
          </Link>

          {authed ? (
            <div className="mt-4">
              <Button href="/dashboard" variant="secondary" size="md" className="w-full">进入我的</Button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button href={isXh ? "/login?role=association" : "/login?role=customer"} variant="outline" size="md">登录</Button>
              <Button href={isXh ? "/join" : "/register?role=customer"} variant="secondary" size="md">
                {isXh ? "申请入会" : "注册"}
              </Button>
            </div>
          )}
        </Container>
      </div>
    </header>
  );
}
