"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

// 案例户型筛选：方角下拉(一行、不溢出、无圆角)
export function TagFilter({ tags, active }: { tags: { tag: string; count: number }[]; active?: string }) {
  const router = useRouter();
  return (
    <div className="relative inline-flex">
      <select
        value={active ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          router.push(v ? `/?tag=${encodeURIComponent(v)}#cases` : "/#cases");
        }}
        aria-label="按户型筛选案例"
        className="h-11 w-full sm:w-auto appearance-none rounded-none border border-border bg-background pl-4 pr-10 text-[14px] font-medium outline-none focus:border-foreground/40 cursor-pointer"
      >
        <option value="">全部户型</option>
        {tags.map((t) => (
          <option key={t.tag} value={t.tag}>{t.tag}（{t.count}）</option>
        ))}
      </select>
      <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
    </div>
  );
}
