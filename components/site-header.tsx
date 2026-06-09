"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles, ChevronRight } from "lucide-react";
import { SITE, ASSOCIATION_NAV, CONSUMER_NAV } from "@/lib/site";
import { Container } from "./container";
import { Button } from "./ui/button";
import { cn } from "@/lib/cn";

type Face = "consumer" | "xh";

/**
 * 全站统一表头（业主门户 / 协会门户「同款」）：
 * 结构完全一致 —— Logo · 导航 · AI · 账号 · CTA；只有数据按门户(face)切换。
 * 账号按钮行为统一：登录后一律进 /dashboard（按真实身份分流，绝不跳错端），
 * 未登录进对应端登录页。不再有协会专属顶部条 / 登录前后结构差异。
 */
export function SiteHeader({ face = "consumer", authed = false, todo = 0 }: { face?: Face; authed?: boolean; todo?: number }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isXh = face === "xh";
  const NAV = isXh ? ASSOCIATION_NAV : CONSUMER_NAV;
  const homeHref = isXh ? "/xh" : "/";
  // 账号：登录→通用工作台(/dashboard 按真实身份分流)；未登录→对应端登录
  const accountHref = authed ? "/dashboard" : `/login?role=${isXh ? "association" : "customer"}`;
  const ai = isXh ? { href: "/ai", label: "AI 助手" } : { href: "/ai/decor", label: "AI 估价" };
  const cta = isXh ? { href: "/join", label: "申请入会" } : { href: "/members?cat=decor", label: "找装企" };

  return (
    <header
      className={cn(
        // 表头恒为不透明实底，确保滚动内容绝不透上来与 logo/导航重叠；
        // 滚动后再加下边框+阴影做分隔（未滚动时边框透明，融入首页浅色 hero）。
        "sticky top-0 z-50 w-full bg-background transition-all duration-300",
        scrolled ? "border-b border-border shadow-sm" : "border-b border-transparent",
      )}
    >
      <Container>
        <div className="flex h-16 lg:h-18 items-center justify-between">
          {/* Logo（结构一致，门户标签按 face 切换文字）*/}
          <Link href={homeHref} className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/seal.png" alt="信阳市建筑装饰装修协会" className="h-9 w-9 object-contain shrink-0" />
            <div className="leading-tight">
              <div className="text-[15px] font-semibold tracking-tight">
                {SITE.shortName}
                <span className="ml-1 text-muted-foreground font-normal hidden sm:inline">
                  {isXh ? "协会门户" : "业主门户"}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground tracking-[0.18em] uppercase font-medium">
                {isXh ? `xh.${SITE.domain}` : SITE.domain}
              </div>
            </div>
          </Link>

          {/* Desktop nav（唯一按门户切换的部分）*/}
          {/* 协会门户顶栏中间留空：办事入口集中在 /xh 首页「会员办事大厅」，顶栏只保留 LOGO + AI + 登录 + 申请入会。消费者门户仍展示导航。*/}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.slice(1, isXh ? 1 : 7).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-surface"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right actions（同款：AI · 账号 · CTA）*/}
          <div className="flex items-center gap-2">
            <Link
              href={ai.href}
              className="hidden md:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-foreground text-background text-[13px] font-medium hover:bg-brand transition-colors group"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent-yellow group-hover:rotate-12 transition-transform" />
              {ai.label}
            </Link>
            <Link
              href={accountHref}
              className="inline-flex h-9 items-center px-3 sm:px-3.5 rounded-full text-[13px] text-foreground hover:bg-surface transition-colors"
            >
              {authed ? "我的" : "登录"}
              {authed && todo > 0 && (
                <span className="ml-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-cat-decor text-white text-[10px] font-semibold inline-flex items-center justify-center">
                  {todo > 99 ? "99+" : todo}
                </span>
              )}
            </Link>
            <Button href={cta.href} size="sm" variant="secondary">
              {cta.label}
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
