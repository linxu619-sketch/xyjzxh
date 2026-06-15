"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, FileText, Umbrella, Sparkles, Settings,
  Briefcase, Library, Wallet, Users2,
} from "lucide-react";
import { Container } from "@/components/container";
import { cn } from "@/lib/cn";
import type { BottomTab, TabIconKey } from "@/lib/dashboard/nav";

const ICON_MAP: Record<TabIconKey, React.ComponentType<{ className?: string }>> = {
  home: Home,
  projects: FileText,
  insurance: Umbrella,
  ai: Sparkles,
  settings: Settings,
  jobs: Briefcase,
  training: Library,
  wallet: Wallet,
  user: Users2,
};

// 该 tab 与当前路径的匹配长度（-1=不匹配）。取 href 与 match 前缀里最长的命中。
function tabScore(tab: BottomTab, pathname: string): number {
  let best = -1;
  for (const p of [tab.href, ...(tab.match ?? [])]) {
    if (pathname === p || pathname.startsWith(p + "/")) best = Math.max(best, p.length);
  }
  return best;
}

export function CustomerBottomNav({ tabs }: { tabs: BottomTab[] }) {
  const pathname = usePathname();
  // 最长前缀匹配：每个子页都点亮唯一父 tab，避免子页无选中态导致底栏「不固定」。
  let activeIdx = -1, activeScore = -1;
  tabs.forEach((t, i) => { const s = tabScore(t, pathname); if (s > activeScore) { activeScore = s; activeIdx = i; } });
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border">
      <Container className="max-w-2xl">
        <div className="grid grid-cols-5 h-16 items-center">
          {tabs.map((t, i) => {
            const Icon = ICON_MAP[t.icon] ?? Home;
            const active = i === activeIdx;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 text-[10px] transition-colors",
                  active ? "text-foreground font-semibold" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-brand")} />
                {t.label}
              </Link>
            );
          })}
        </div>
      </Container>
    </nav>
  );
}
