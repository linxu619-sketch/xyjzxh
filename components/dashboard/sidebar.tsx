"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogOut, ChevronLeft, Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { logoutAction } from "@/app/(main)/login/actions";

type Item = { href: string; label: string; icon: React.ReactNode; badge?: string };

export function Sidebar({
  brand,
  role,
  items,
  user,
  tone = "brand",
  back,
}: {
  brand: string;
  role: string;
  items: Item[];
  user: { name: string; meta: string };
  tone?: "brand" | "build" | "decor";
  back?: { href: string; label: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const TONE: Record<string, string> = {
    brand: "bg-brand", build: "bg-cat-build", decor: "bg-cat-decor",
  };

  const navList = (onNavigate?: () => void) => (
    <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
      {items.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-surface hover:text-foreground",
            )}
          >
            {it.icon}
            <span className="flex-1">{it.label}</span>
            {it.badge && (
              <span className={cn(
                "h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-medium inline-flex items-center justify-center",
                active ? "bg-background/20 text-background" : "bg-cat-decor text-white",
              )}>
                {it.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const userFooter = (
    <div className="p-3 border-t border-border">
      <div className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-surface">
        <span className="h-8 w-8 rounded-full bg-foreground text-background inline-flex items-center justify-center text-[12px] font-semibold">
          {user.name.slice(0, 1)}
        </span>
        <div className="flex-1 min-w-0 leading-tight">
          <div className="text-[12px] font-medium truncate">{user.name}</div>
          <div className="text-[10px] text-muted-foreground truncate">{user.meta}</div>
        </div>
        <form action={logoutAction}>
          <button type="submit" title="退出登录" className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );

  const brandBlock = (
    <div className="px-5 py-5 border-b border-border">
      {back && (
        <Link href={back.href} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-3 w-3" /> {back.label}
        </Link>
      )}
      <div className={cn("flex items-center gap-2.5", back && "mt-3")}>
        <span className={cn("h-9 w-9 rounded-xl flex items-center justify-center text-white text-[13px] font-semibold", TONE[tone])}>
          {brand.slice(0, 2)}
        </span>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold">{brand}</div>
          <div className="text-[10px] text-muted-foreground">{role}</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 桌面侧栏 */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-background min-h-screen sticky top-0">
        {brandBlock}
        {navList()}
        {userFooter}
      </aside>

      {/* 移动顶栏（固定，全宽） */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center gap-3 px-4 border-b border-border bg-background/90 backdrop-blur-xl">
        <button
          onClick={() => setOpen(true)}
          aria-label="打开菜单"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface -ml-1.5"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className={cn("h-7 w-7 rounded-lg flex items-center justify-center text-white text-[11px] font-semibold shrink-0", TONE[tone])}>
          {brand.slice(0, 2)}
        </span>
        <div className="text-[14px] font-semibold truncate flex-1">{brand}</div>
        <form action={logoutAction}>
          <button type="submit" title="退出登录" className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface text-muted-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* 移动抽屉 */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-up"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[82vw] bg-background border-r border-border flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <span className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-white text-[12px] font-semibold", TONE[tone])}>
                  {brand.slice(0, 2)}
                </span>
                <div className="leading-tight">
                  <div className="text-[13px] font-semibold">{brand}</div>
                  <div className="text-[10px] text-muted-foreground">{role}</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="关闭菜单"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {back && (
              <Link href={back.href} onClick={() => setOpen(false)} className="px-4 py-2.5 text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 border-b border-border">
                <ChevronLeft className="h-3 w-3" /> {back.label}
              </Link>
            )}
            {navList(() => setOpen(false))}
            {userFooter}
          </aside>
        </div>
      )}
    </>
  );
}
