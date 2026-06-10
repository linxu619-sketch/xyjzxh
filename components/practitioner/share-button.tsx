"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

/* 分享电子名片：优先系统分享面板（移动端），否则复制链接到剪贴板 */
export function ShareButton({ url, title, className }: { url: string; title?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    if (nav?.share) {
      try { await nav.share({ title: title ?? "协会认证电子名片", url }); return; } catch { return; /* 用户取消 */ }
    }
    try {
      await nav?.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* 剪贴板不可用时忽略 */ }
  }

  return (
    <button
      type="button"
      onClick={onShare}
      className={className ?? "inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-foreground text-background text-[14px] font-medium active:scale-95 transition-transform"}
    >
      {copied ? <><Check className="h-4 w-4 text-accent-yellow" /> 已复制链接</> : <><Share2 className="h-4 w-4" /> 分享名片</>}
    </button>
  );
}
