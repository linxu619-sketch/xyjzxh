"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createTrainingAction } from "./actions";

const INPUT = "w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30";
const CATS = ["政策合规", "职业认证", "技能提升", "行业交流", "安全培训"];

export function PublishTraining() {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform">
        <Plus className="h-3.5 w-3.5" /> 发布培训
      </button>
    );
  }
  return (
    <div className="fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setOpen(false)}>
      <form action={createTrainingAction} onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl border border-border p-5 md:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold">发布培训课程</h3>
          <button type="button" onClick={() => setOpen(false)} className="h-8 w-8 rounded-full hover:bg-surface inline-flex items-center justify-center text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <Field label="课程标题" required><input name="title" required placeholder="如：二级建造师考前冲刺班" className={INPUT} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="类别"><select name="category" defaultValue="技能提升" className={INPUT}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="讲师/主办"><input name="instructor" placeholder="如 协会技术委员会" className={INPUT} /></Field>
          </div>
          <Field label="时间安排"><input name="schedule" placeholder="如 2026-06-15 09:00-12:00" className={INPUT} /></Field>
          <Field label="地点"><input name="location" placeholder="如 协会四楼培训中心 / 线上直播" className={INPUT} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="名额"><input name="capacity" inputMode="numeric" placeholder="如 60（0=不限）" className={INPUT} /></Field>
            <Field label="费用"><input name="fee" placeholder="免费 / 会员价 ¥800" className={INPUT} /></Field>
          </div>
          <Field label="课程说明"><textarea name="detail" rows={3} placeholder="课程内容、对象、注意事项等" className={`${INPUT} h-auto py-2.5 leading-6`} /></Field>
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" className="h-11 px-6 rounded-full bg-accent-tea text-white text-[14px] font-medium inline-flex items-center gap-1.5"><Plus className="h-4 w-4" /> 发布</button>
            <button type="button" onClick={() => setOpen(false)} className="h-11 px-4 rounded-full text-[13px] text-muted-foreground hover:text-foreground">取消</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium">{label}{required && <span className="text-cat-decor ml-0.5">*</span>}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
