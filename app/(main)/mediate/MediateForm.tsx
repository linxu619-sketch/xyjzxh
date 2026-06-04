"use client";

import { useState } from "react";
import { Scale } from "lucide-react";
import { MultiUpload } from "@/app/(main)/register/uploads";
import { submitMediationAction } from "./actions";

const INPUT = "h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30";

export function MediateForm() {
  const [photos, setPhotos] = useState<string[]>([]);
  return (
    <form action={submitMediationAction} className="space-y-3 rounded-3xl border border-border bg-background p-5 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input name="applicant" placeholder="你的称呼" className={INPUT} />
        <input name="phone" required type="tel" placeholder="联系电话（必填）" className={INPUT} />
      </div>
      <input name="respondent" placeholder="被投诉方（企业名 / 项目）" className={INPUT} />
      <textarea name="detail" required rows={5} placeholder="请描述纠纷经过：时间、事项、诉求…（必填）" className="w-full rounded-xl border border-border bg-background p-3.5 text-[13px] leading-6 outline-none focus:border-foreground/30" />

      <div className="pt-1">
        <MultiUpload label="证据照片（最多 5 张，选填）" hint="合同、聊天记录、现场照片、验收单等；点已传图可放大。" max={5} onChange={setPhotos} />
      </div>
      <input type="hidden" name="photos" value={JSON.stringify(photos)} />

      <button type="submit" className="h-11 px-6 rounded-full bg-foreground text-background text-[14px] font-medium inline-flex items-center gap-1.5">
        <Scale className="h-4 w-4" /> 提交调解申请
      </button>
    </form>
  );
}
