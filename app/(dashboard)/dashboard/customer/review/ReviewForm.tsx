"use client";

import { useState } from "react";
import { Star, Send } from "lucide-react";
import { submitReviewAction } from "./actions";
import { cn } from "@/lib/cn";

export function ReviewForm({ enterprises, defaultEnterprise }: { enterprises: string[]; defaultEnterprise?: string }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);

  return (
    <form action={submitReviewAction} className="rounded-3xl border border-border bg-background p-5 space-y-4">
      <input type="hidden" name="rating" value={rating} />

      <label className="block">
        <span className="text-[12px] font-medium">评价企业<span className="text-cat-decor ml-0.5">*</span></span>
        <select name="enterprise" defaultValue={defaultEnterprise ?? ""} required className="mt-1.5 w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30">
          <option value="" disabled>选择为你服务的企业</option>
          {enterprises.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="text-[12px] font-medium">项目 / 户型</span>
        <input name="project" placeholder="如：金茂悦府 1602 · 168㎡ 整装" className="mt-1.5 w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30" />
      </label>

      <div>
        <span className="text-[12px] font-medium">总体评分</span>
        <div className="mt-1.5 flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${n} 星`}
              className="active:scale-90 transition-transform"
            >
              <Star className={cn("h-7 w-7", (hover || rating) >= n ? "fill-[#FFB400] text-[#FFB400]" : "text-border")} />
            </button>
          ))}
          <span className="ml-2 text-[13px] text-muted-foreground">{rating} 星</span>
        </div>
      </div>

      <label className="block">
        <span className="text-[12px] font-medium">评价内容<span className="text-cat-decor ml-0.5">*</span></span>
        <textarea name="content" required rows={4} minLength={5} placeholder="设计、施工质量、项目经理、工期、售后等，真实评价帮助其他业主决策…" className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] outline-none focus:border-foreground/30 resize-none" />
      </label>

      <div className="flex items-center gap-3">
        <button type="submit" className="h-11 px-6 rounded-full bg-foreground text-background text-[14px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform">
          <Send className="h-4 w-4" /> 发布评价
        </button>
        <span className="text-[11px] text-muted-foreground">发布后展示在企业子站与评价广场，企业不可删除</span>
      </div>
    </form>
  );
}
