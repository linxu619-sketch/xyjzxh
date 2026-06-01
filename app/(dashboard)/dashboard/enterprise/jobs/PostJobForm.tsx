"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createJobAction } from "./actions";

const INPUT = "w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30";

export function PostJobForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform">
        <Plus className="h-3.5 w-3.5" /> 发布岗位
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setOpen(false)}>
      <form
        action={createJobAction}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl border border-border p-5 md:p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold">发布招聘岗位</h3>
          <button type="button" onClick={() => setOpen(false)} className="h-8 w-8 rounded-full hover:bg-surface inline-flex items-center justify-center text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <Field label="岗位标题" required><input name="title" required placeholder="如：急招水电工 5 名 · 金茂悦府工地" className={INPUT} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="工种" required>
              <select name="kind" required defaultValue="水电工" className={INPUT}>
                {["工长", "项目经理", "监理", "木工", "瓦工", "水电工", "油漆工", "设计师", "造价/预算", "普工"].map((k) => <option key={k}>{k}</option>)}
              </select>
            </Field>
            <Field label="区域"><input name="district" placeholder="如 浉河区" className={INPUT} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="日薪(元)"><input name="daily" inputMode="numeric" placeholder="380" className={INPUT} /></Field>
            <Field label="名额"><input name="openings" inputMode="numeric" placeholder="5" className={INPUT} /></Field>
            <Field label="工期"><input name="duration" placeholder="约25天" className={INPUT} /></Field>
          </div>
          <Field label="岗位说明"><textarea name="detail" rows={3} placeholder="工作内容、要求、是否包餐、结算方式等" className={`${INPUT} h-auto py-2.5 leading-6`} /></Field>
          <label className="flex items-center gap-2 text-[13px]">
            <input type="checkbox" name="urgent" className="accent-cat-decor h-4 w-4" /> 标记为「急招」
          </label>
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
