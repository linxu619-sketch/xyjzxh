import { Crown, Award, TrendingUp } from "lucide-react";
import type { GrowthCriterion } from "@/lib/data/member-tier";

/* 个人会员「荣誉等级」展示组件（纯展示，由页面在服务端算好后传入）
   - TierBadge：金色等级徽章，体现荣耀感
   - GrowthMeter：协会评定为准的「成长进度」，激励 + 晋级参考 */

export function TierBadge({
  tier, level, isMax, size = "md", track = false,
}: {
  tier: string; level: number; isMax?: boolean;
  size?: "sm" | "md" | "lg"; track?: boolean;
}) {
  const Icon = isMax ? Crown : Award;
  const pad = size === "lg" ? "px-3.5 py-1.5 text-[14px]" : size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-[12.5px]";
  const ic = size === "lg" ? "h-4 w-4" : size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${pad} bg-gradient-to-r from-[#f6c915] to-[#e0a900] text-[#5a3e00] shadow-sm`}
    >
      <Icon className={`${ic} text-[#7a5400]`} />
      {tier}
      <span className="opacity-60 font-medium">· L{level}</span>
      {track && <span className="opacity-60 font-normal">· 协会评定</span>}
    </span>
  );
}

export function GrowthMeter({
  next, percent, criteria, compact = false,
}: {
  next: string | null; percent: number; criteria: GrowthCriterion[]; compact?: boolean;
}) {
  if (!next) {
    return (
      <div className="inline-flex items-center gap-1.5 text-[12px] text-[#a37200]">
        <Crown className="h-3.5 w-3.5" /> 已是最高档 · 专业资历封顶
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between text-[11.5px] mb-1.5">
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <TrendingUp className="h-3 w-3 text-accent-tea" /> 距「{next}」评审参考
        </span>
        <span className="font-semibold tabular-nums text-foreground">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#f6c915] to-accent-tea transition-all"
          style={{ width: `${Math.max(4, percent)}%` }}
        />
      </div>
      {!compact && (
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {criteria.map((c) => (
            <div key={c.label} className="rounded-xl bg-surface px-2.5 py-2 text-center">
              <div className="text-[10px] text-muted-foreground">{c.label}</div>
              <div className="mt-0.5 text-[13px] font-semibold tabular-nums leading-none">
                {c.label === "评分" ? c.cur.toFixed(1) : c.cur}
                <span className="text-[10px] font-normal text-muted-foreground">/{c.label === "评分" ? c.target.toFixed(1) : c.target}{c.unit}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
