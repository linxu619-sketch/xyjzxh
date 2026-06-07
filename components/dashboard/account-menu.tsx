"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Settings, Users2, LogOut, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/app/(main)/login/actions";
import { cn } from "@/lib/cn";

/**
 * 后台右上角「账号菜单」。
 * 显示登录者姓名（替代以前不可点的 SUPER ADMIN 装饰徽章），点击展开下拉：
 * 顶部为「我的信息」（姓名 / 角色 / 手机号），下面是账号设置、用户管理、退出登录。
 */
export function AccountMenu({
  name,
  roleLabel,
  phone,
  isSys = false,
  onBrand = false,
  settingsHref,
  usersHref,
}: {
  name: string;
  roleLabel: string;
  phone?: string;
  isSys?: boolean;
  onBrand?: boolean;
  settingsHref: string;
  usersHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-2 h-9 pl-1 pr-2.5 rounded-full border transition-colors",
          onBrand
            ? open ? "border-white/40 bg-white/25 text-white" : "border-white/25 bg-white/15 text-white hover:bg-white/25"
            : open ? "border-foreground bg-surface" : "border-border bg-background hover:bg-surface",
        )}
      >
        <span className={cn(
          "h-7 w-7 rounded-full inline-flex items-center justify-center text-[12px] font-semibold shrink-0",
          onBrand ? "bg-white/25 text-white" : "bg-foreground text-background",
        )}>
          {name.slice(0, 1)}
        </span>
        <span className="text-[13px] font-medium max-w-[100px] sm:max-w-[140px] truncate">{name}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform shrink-0", onBrand ? "text-white/80" : "text-muted-foreground", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-2xl border border-border bg-background shadow-xl overflow-hidden animate-fade-up">
          {/* 我的信息 */}
          <div className="px-4 py-3.5 border-b border-border bg-surface/60">
            <div className="flex items-center gap-2.5">
              <span className="h-9 w-9 rounded-full bg-foreground text-background inline-flex items-center justify-center text-[13px] font-semibold shrink-0">
                {name.slice(0, 1)}
              </span>
              <div className="min-w-0 leading-tight">
                <div className="text-[13px] font-semibold truncate">{name}</div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {roleLabel}{phone ? ` · ${phone}` : ""}
                </div>
              </div>
            </div>
            {isSys && (
              <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-accent-tea" /> 系统管理员 · 此账号永不入库
              </div>
            )}
          </div>

          {/* 账号相关 */}
          <div className="p-1.5">
            <Link
              href={settingsHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-foreground hover:bg-surface transition-colors"
            >
              <Settings className="h-4 w-4 text-muted-foreground shrink-0" /> 账号与系统设置
            </Link>
            {usersHref && (
              <Link
                href={usersHref}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-foreground hover:bg-surface transition-colors"
              >
                <Users2 className="h-4 w-4 text-muted-foreground shrink-0" /> 用户与员工管理
              </Link>
            )}
          </div>

          {/* 退出 */}
          <div className="p-1.5 border-t border-border">
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-cat-decor hover:bg-cat-decor-soft transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" /> 退出登录
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
