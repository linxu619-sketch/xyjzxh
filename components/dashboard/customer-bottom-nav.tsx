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

export function CustomerBottomNav({ tabs }: { tabs: BottomTab[] }) {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border">
      <Container className="max-w-2xl">
        <div className="grid grid-cols-5 h-16 items-center">
          {tabs.map((t) => {
            const Icon = ICON_MAP[t.icon] ?? Home;
            const active = pathname === t.href;
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
