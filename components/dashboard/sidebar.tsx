"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import { logoutAction } from "@/app/(main)/login/actions";

type Item = { href: string; label: string; icon: React.ReactNode; badge?: string };

export function Sidebar({
  brand,
  role,
  items,
  user,
  tone = "brand",
}: {
  brand: string;
  role: string;
  items: Item[];
  user: { name: string; meta: string };
  tone?: "brand" | "build" | "decor";
}) {
  const pathname = usePathname();
  const TONE: Record<string, string> = {
    brand: "bg-brand", build: "bg-cat-build", decor: "bg-cat-decor",
  };

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-background min-h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-border">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-3 w-3" /> 返回主站
        </Link>
        <div className="mt-3 flex items-center gap-2.5">
          <span className={cn("h-9 w-9 rounded-xl flex items-center justify-center text-white text-[13px] font-semibold", TONE[tone])}>
            {brand.slice(0, 2)}
          </span>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold">{brand}</div>
            <div className="text-[10px] text-muted-foreground">{role}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition-colors",
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
    </aside>
  );
}
