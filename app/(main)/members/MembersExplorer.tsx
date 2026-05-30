"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Star, MapPin, ShieldCheck, ArrowUpRight, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import type { Enterprise, EnterpriseCategory } from "@/lib/data/enterprises";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

const CATS: { key: "all" | EnterpriseCategory; label: string; tone: "neutral" | "build" | "decor" | "design" }[] = [
  { key: "all", label: "全部", tone: "neutral" },
  { key: "build", label: "建筑", tone: "build" },
  { key: "decor", label: "装修", tone: "decor" },
  { key: "design", label: "设计", tone: "design" },
];

const TONE: Record<string, "build" | "decor" | "design"> = {
  build: "build", decor: "decor", design: "design",
};

const ACCENT_BAR: Record<string, string> = {
  build: "bg-cat-build",
  decor: "bg-cat-decor",
  design: "bg-cat-design",
};

export function MembersExplorer({
  all, initial,
}: {
  all: Enterprise[];
  initial: Promise<{ cat?: string; q?: string }>;
}) {
  const params = use(initial);
  const [cat, setCat] = useState<typeof CATS[number]["key"]>(
    (params.cat as EnterpriseCategory) || "all",
  );
  const [q, setQ] = useState(params.q || "");
  const [sort, setSort] = useState<"rating" | "cases" | "reviews">("rating");
  const [district, setDistrict] = useState<string>("全部");

  const districts = useMemo(
    () => ["全部", ...Array.from(new Set(all.map((e) => e.district)))],
    [all],
  );

  // 各品类数量（用于 chip 上的小角标）
  const catCounts = useMemo(() => {
    const c = { all: all.length, build: 0, decor: 0, design: 0 };
    for (const e of all) c[e.category]++;
    return c;
  }, [all]);

  const filtered = useMemo(() => {
    let list = all;
    if (cat !== "all") list = list.filter((e) => e.category === cat);
    if (district !== "全部") list = list.filter((e) => e.district === district);
    if (q.trim()) {
      const k = q.trim().toLowerCase();
      list = list.filter((e) =>
        e.name.toLowerCase().includes(k) ||
        e.tags.some((t) => t.toLowerCase().includes(k)) ||
        e.short.includes(q.trim()),
      );
    }
    list = [...list].sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "cases") return b.cases - a.cases;
      return b.reviews - a.reviews;
    });
    return list;
  }, [all, cat, q, sort, district]);

  const hasFilter = q.trim() || cat !== "all" || district !== "全部" || sort !== "rating";

  function reset() {
    setQ(""); setCat("all"); setDistrict("全部"); setSort("rating");
  }

  return (
    <div>
      {/* 筛选条：移动 sticky 在 SiteHeader 下方 */}
      <div className="sticky top-16 lg:top-20 z-30 -mx-5 sm:-mx-8 lg:-mx-12 px-5 sm:px-8 lg:px-12 py-3 bg-background/85 backdrop-blur-xl border-b border-border lg:border-0 lg:bg-transparent lg:backdrop-blur-none lg:relative lg:top-0">
        <div className="rounded-3xl border border-border bg-background p-3 md:p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground ml-2 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索企业名 / 标签 / 资质"
              className="flex-1 bg-transparent outline-none text-[15px] py-2"
            />
            {q && (
              <button onClick={() => setQ("")} className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-surface text-muted-foreground" aria-label="清除搜索">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* 品类 chips · 移动横滑 */}
          <div className="mt-3 -mx-1 px-1 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATS.map((c) => {
              const active = cat === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setCat(c.key)}
                  className={cn(
                    "shrink-0 h-9 px-4 rounded-full text-[13px] font-medium border transition-colors inline-flex items-center gap-1.5",
                    active
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-muted-foreground border-border active:bg-surface",
                  )}
                >
                  {c.label}
                  <span className={cn("text-[10px] tabular-nums", active ? "text-background/70" : "text-muted-foreground")}>
                    {catCounts[c.key]}
                  </span>
                </button>
              );
            })}

            <span className="h-5 w-px bg-border mx-1 shrink-0" />

            {/* 区域 */}
            <div className="relative shrink-0">
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className={cn(
                  "h-9 pl-3 pr-7 rounded-full text-[13px] appearance-none cursor-pointer border transition-colors",
                  district !== "全部"
                    ? "bg-foreground text-background border-foreground"
                    : "bg-surface text-foreground border-transparent",
                )}
              >
                {districts.map((d) => (
                  <option key={d} value={d} className="bg-background text-foreground">{d === "全部" ? "全区域" : d}</option>
                ))}
              </select>
              <ChevronDown className={cn(
                "h-3.5 w-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none",
                district !== "全部" ? "text-background/70" : "text-muted-foreground",
              )} />
            </div>

            {/* 排序 */}
            <div className="relative shrink-0">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="h-9 pl-7 pr-7 rounded-full bg-surface text-[13px] text-foreground border border-transparent appearance-none cursor-pointer"
              >
                <option value="rating">按评分</option>
                <option value="cases">按案例</option>
                <option value="reviews">按评价</option>
              </select>
              <SlidersHorizontal className="h-3 w-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <ChevronDown className="h-3.5 w-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>

            {hasFilter && (
              <button
                onClick={reset}
                className="shrink-0 inline-flex items-center gap-1 h-9 px-3 rounded-full text-[12px] text-cat-decor hover:bg-cat-decor-soft"
              >
                <X className="h-3 w-3" /> 重置
              </button>
            )}
          </div>

          {/* 计数 */}
          <div className="mt-2.5 text-[12px] text-muted-foreground flex items-center justify-between">
            <span>
              共 <span className="text-foreground font-semibold tabular-nums">{filtered.length}</span> 家
              {hasFilter && <span className="ml-1 text-cat-decor">（已筛选）</span>}
            </span>
            <span className="hidden sm:inline">← 滑动横向筛选条 →</span>
          </div>
        </div>
      </div>

      {/* 结果 */}
      {filtered.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border p-10 md:p-16 text-center">
          <Search className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
          <div className="text-[14px] font-medium">没有找到匹配的企业</div>
          <div className="mt-1.5 text-[12px] text-muted-foreground">试试更换品类、区域，或清空搜索词</div>
          <button onClick={reset} className="mt-5 inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium">
            <X className="h-3.5 w-3.5" /> 清空筛选
          </button>
        </div>
      ) : (
        <div className="mt-5 md:mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filtered.map((e) => (
            <Link
              key={e.id}
              href={`/members/${e.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-border bg-background p-5 active:scale-[0.99] hover:shadow-md md:hover:-translate-y-0.5 transition-all min-h-[180px] flex flex-col"
            >
              <span className={cn("absolute left-0 top-0 h-1 w-full", ACCENT_BAR[e.color])} />
              <div className="flex items-start gap-3 flex-1">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center text-white text-base font-semibold shrink-0",
                  e.color === "build" && "bg-cat-build",
                  e.color === "decor" && "bg-cat-decor",
                  e.color === "design" && "bg-cat-design",
                )}>
                  {e.hero.brand.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground flex-wrap">
                    <Badge tone={TONE[e.category]} className="!px-2 !py-0.5 !text-[10px]">
                      {e.category === "build" ? "建筑" : e.category === "decor" ? "装修" : "设计"}
                    </Badge>
                    {e.verified && (
                      <span className="inline-flex items-center gap-0.5 text-accent-tea text-[10px]">
                        <ShieldCheck className="h-3 w-3" /> 认证
                      </span>
                    )}
                    {e.featured && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-accent-yellow text-foreground px-1.5 py-0.5 text-[9px] font-semibold">
                        ★ 推荐
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1.5 text-[15px] font-semibold tracking-tight leading-5 truncate group-hover:text-brand transition-colors">
                    {e.name}
                  </h3>
                  <p className="mt-1 text-[12px] text-muted-foreground line-clamp-2 leading-5">{e.short}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1">
                {e.tags.slice(0, 3).map((t) => (
                  <span key={t} className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[12px] gap-3">
                <div className="inline-flex items-center gap-1 text-foreground shrink-0">
                  <Star className="h-3.5 w-3.5 fill-[#FFB400] text-[#FFB400]" />
                  <span className="font-semibold tabular-nums">{e.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground text-[11px] tabular-nums">({e.reviews})</span>
                </div>
                <div className="text-muted-foreground text-[11px] tabular-nums">{e.cases} 案例</div>
                <div className="inline-flex items-center gap-1 text-muted-foreground text-[11px] truncate">
                  <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{e.district}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
