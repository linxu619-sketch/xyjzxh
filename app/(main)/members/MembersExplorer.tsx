"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Star, MapPin, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import type { Enterprise, EnterpriseCategory } from "@/lib/data/enterprises";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

const CATS: { key: "all" | EnterpriseCategory; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "build", label: "建筑" },
  { key: "decor", label: "装修" },
  { key: "design", label: "设计" },
];

const TONE: Record<string, "build" | "decor" | "design"> = { build: "build", decor: "decor", design: "design" };
const BG: Record<string, string> = { build: "bg-cat-build", decor: "bg-cat-decor", design: "bg-cat-design" };
const CAT_LABEL: Record<string, string> = { build: "建筑", decor: "装修", design: "设计" };

export function MembersExplorer({
  all, covers, initial,
}: {
  all: Enterprise[];
  covers: Record<string, string[]>;
  initial: { cat?: string; q?: string };
}) {
  const [cat, setCat] = useState<typeof CATS[number]["key"]>((initial.cat as EnterpriseCategory) || "all");
  const [q, setQ] = useState(initial.q || "");
  const [sort, setSort] = useState<"rating" | "cases" | "reviews">("rating");
  const [district, setDistrict] = useState<string>("全部");

  const districts = useMemo(() => ["全部", ...Array.from(new Set(all.map((e) => e.district)))], [all]);

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
  function reset() { setQ(""); setCat("all"); setDistrict("全部"); setSort("rating"); }

  return (
    <div>
      {/* 筛选条 */}
      <div className="rounded-2xl border border-border bg-background p-3 md:p-3.5">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground ml-2 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜企业名 / 风格 / 资质"
            className="flex-1 bg-transparent outline-none text-[15px] py-2"
          />
          {q && (
            <button onClick={() => setQ("")} className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-surface text-muted-foreground" aria-label="清除搜索">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="mt-3 -mx-1 px-1 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATS.map((c) => {
            const active = cat === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className={cn(
                  "shrink-0 h-9 px-4 rounded-full text-[13px] font-medium border transition-colors inline-flex items-center gap-1.5",
                  active ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground border-border active:bg-surface",
                )}
              >
                {c.label}
                <span className={cn("text-[10px] tabular-nums", active ? "text-background/70" : "text-muted-foreground")}>{catCounts[c.key]}</span>
              </button>
            );
          })}

          <span className="h-5 w-px bg-border mx-1 shrink-0" />

          <div className="relative shrink-0">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className={cn(
                "h-9 pl-3 pr-7 rounded-full text-[13px] appearance-none cursor-pointer border transition-colors",
                district !== "全部" ? "bg-foreground text-background border-foreground" : "bg-surface text-foreground border-transparent",
              )}
            >
              {districts.map((d) => <option key={d} value={d} className="bg-background text-foreground">{d === "全部" ? "全区域" : d}</option>)}
            </select>
            <ChevronDown className={cn("h-3.5 w-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none", district !== "全部" ? "text-background/70" : "text-muted-foreground")} />
          </div>

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
            <button onClick={reset} className="shrink-0 inline-flex items-center gap-1 h-9 px-3 rounded-full text-[12px] text-cat-decor hover:bg-cat-decor-soft">
              <X className="h-3 w-3" /> 重置
            </button>
          )}
        </div>

        <div className="mt-2.5 text-[12px] text-muted-foreground">
          共 <span className="text-foreground font-semibold tabular-nums">{filtered.length}</span> 家{hasFilter && <span className="ml-1 text-cat-decor">（已筛选）</span>}
        </div>
      </div>

      {/* 结果 —— 照片优先卡片 */}
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
        <div className="mt-5 md:mt-6 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filtered.map((e) => {
            const cover = covers[e.id]?.[0];
            return (
              <Link
                key={e.id}
                href={`/biz/${e.slug}`}
                className="group block rounded-2xl overflow-hidden border border-border bg-background hover:shadow-[0_24px_60px_-32px_rgba(0,0,0,0.22)] active:scale-[0.99] transition-all"
              >
                {/* 案例封面 —— 统一 4:5 等比框 */}
                <div className="relative aspect-[4/5] bg-surface overflow-hidden">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt={e.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]" />
                  ) : (
                    <div className={cn("h-full w-full flex items-center justify-center text-white text-[28px] font-semibold", BG[e.color] ?? "bg-foreground")}>
                      {e.hero.brand.slice(0, 1)}
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <Badge tone={TONE[e.category]} className="!px-2 !py-0.5 !text-[10px] shadow-sm">{CAT_LABEL[e.category]}</Badge>
                    {e.featured && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-accent-yellow text-foreground px-1.5 py-0.5 text-[9px] font-semibold shadow-sm">★ 推荐</span>
                    )}
                  </div>
                  <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2 py-0.5 text-[11px] font-semibold shadow-sm">
                    <Star className="h-3 w-3 fill-[#FFB400] text-[#FFB400]" /> {e.rating.toFixed(1)}
                  </span>
                </div>

                {/* 信息 —— 精简一行，等高对齐 */}
                <div className="p-3">
                  <h3 className="text-[14px] font-semibold tracking-tight truncate group-hover:text-brand transition-colors">{e.name}</h3>
                  <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1.5 truncate">
                    <MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{e.district}</span>
                    <span className="text-border shrink-0">·</span><span className="shrink-0">{e.cases} 案例</span>
                    <span className="text-border shrink-0">·</span><span className="shrink-0">{e.reviews} 评</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
