"use client";

import Link from "next/link";
import { AlertCircle, ChevronRight, Clock } from "lucide-react";

export type PendingResign = {
  templateId: string;
  templateTitle: string;
  reason: "version_changed" | "expired" | "new_user";
  changelogPreview?: string;
  daysLeft: number;
};

/**
 * 待重签横幅 · 给用户 dashboard 顶部用
 * 显示 N 份协议需要重签（版本升级 / 过期）
 */
export function ResignBanner({
  pending,
  href = "/dashboard/resign",
}: {
  pending: PendingResign[];
  href?: string;
}) {
  if (pending.length === 0) return null;
  const minDays = Math.min(...pending.map((p) => p.daysLeft));
  const urgent = minDays <= 3;

  return (
    <Link
      href={href}
      className={`block rounded-3xl text-white p-4 shadow-md active:scale-[0.99] transition-transform bg-gradient-to-br ${
        urgent ? "from-cat-decor to-[#e6531f]" : "from-cat-build to-brand-600"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="relative h-10 w-10 rounded-2xl bg-white/20 inline-flex items-center justify-center shrink-0">
          <AlertCircle className="h-5 w-5" />
          {urgent && <span className="absolute inset-0 rounded-2xl bg-white/20 animate-ping opacity-40" />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold">
            {pending.length} 份协议待重签
          </div>
          <div className="text-[11px] text-white/85 mt-0.5 inline-flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {urgent ? `紧急：${minDays} 天内未签将影响账号` : `距截止 ${minDays} 天`} · 内容已更新
          </div>
        </div>
        <ChevronRight className="h-5 w-5" />
      </div>
      {pending[0]?.changelogPreview && (
        <div className="mt-2.5 pl-13 text-[10px] text-white/70 line-clamp-1">
          📝 {pending[0].templateTitle} {pending[0].changelogPreview}
        </div>
      )}
    </Link>
  );
}
