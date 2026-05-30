"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, X, ArrowUpRight } from "lucide-react";
import { AI_EMPLOYEES } from "@/lib/site";
import { cn } from "@/lib/cn";

const TONE: Record<string, string> = {
  brand: "from-brand to-brand-600",
  build: "from-cat-build to-brand-600",
  decor: "from-cat-decor to-[#e6531f]",
  design: "from-cat-design to-[#6d3df0]",
  tea: "from-accent-tea to-[#008a63]",
  yellow: "from-[#ffd34d] to-[#ffae00]",
};

export function AiDock() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 悬浮按钮 — 桌面端显示；移动端被底部固定栏的 AI 按钮替代 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="hidden lg:inline-flex fixed bottom-7 right-7 z-50 items-center gap-2 h-14 px-5 rounded-full bg-foreground text-background shadow-[0_20px_50px_-12px_rgba(20,86,240,0.5)] hover:bg-brand transition-colors group"
        aria-label="打开 AI 助手"
      >
        <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-yellow text-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="absolute inset-0 rounded-full bg-accent-yellow animate-ping opacity-40" />
        </span>
        <span className="text-[13px] md:text-[14px] font-medium">
          AI 助手 <span className="opacity-70 hidden md:inline">· 10 位在线</span>
        </span>
      </button>

      {/* 面板 */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-end md:items-center justify-center md:justify-end p-0 md:p-7 animate-fade-up"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full md:w-[440px] max-h-[88vh] overflow-hidden rounded-t-3xl md:rounded-3xl bg-background border border-border shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand" />
                <div className="text-[14px] font-semibold">选择一位 AI 员工</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-3 grid grid-cols-2 gap-2.5">
              {AI_EMPLOYEES.map((ai) => (
                <Link
                  key={ai.key}
                  href={`/ai/${ai.key}`}
                  className="group relative overflow-hidden rounded-2xl border border-border p-3.5 hover:border-foreground/20 hover:shadow-md transition-all"
                >
                  <div
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-xl text-white text-lg bg-gradient-to-br",
                      TONE[ai.color] ?? TONE.brand,
                    )}
                  >
                    {ai.emoji}
                  </div>
                  <div className="mt-2.5 text-[13px] font-semibold">{ai.name} · {ai.role}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">{ai.duty}</div>
                  <ArrowUpRight className="absolute top-3 right-3 h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
