"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createPartyNewsAction } from "./actions";

const INPUT = "w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30";
// 党建工作台只发这两类
const CATS = ["党建", "理论学习"];

export function PublishPartyNews() {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="h-9 px-4 rounded-full bg-party text-white text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform">
        <Plus className="h-3.5 w-3.5" /> 发布党建内容
      </button>
    );
  }
  return (
    <div className="fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setOpen(false)}>
      <form action={createPartyNewsAction} onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl border border-border p-5 md:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold">发布党建内容</h3>
          <button type="button" onClick={() => setOpen(false)} className="h-8 w-8 rounded-full hover:bg-surface inline-flex items-center justify-center text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <Field label="标题" required><input name="title" required placeholder="如：支部召开「党建引领行业自律」主题党日活动" className={INPUT} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="类别"><select name="category" defaultValue="党建" className={INPUT}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="发布单位"><input name="author" defaultValue="协会党支部" className={INPUT} /></Field>
          </div>
          <Field label="摘要"><input name="excerpt" placeholder="一句话概要（列表展示用，可留空自动截取）" className={INPUT} /></Field>
          <Field label="正文" required><textarea name="content" rows={6} required placeholder="党建动态 / 理论学习正文内容" className={`${INPUT} h-auto py-2.5 leading-6`} /></Field>
          <div className="flex items-center gap-5">
            <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" name="hot" className="accent-party h-4 w-4" /> 标为「热门」</label>
            <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" name="draft" className="accent-foreground h-4 w-4" /> 存为草稿（不公开）</label>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" className="h-11 px-6 rounded-full bg-party text-white text-[14px] font-medium inline-flex items-center gap-1.5"><Plus className="h-4 w-4" /> 发布</button>
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
