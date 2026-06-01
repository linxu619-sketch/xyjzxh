"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createProductAction } from "./actions";

const INPUT = "w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30";
const CATS = ["墙面涂料", "防水材料", "水电材料", "电气", "地板", "瓷砖", "板材", "五金", "其他"];

export function PublishProduct() {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform">
        <Plus className="h-3.5 w-3.5" /> 上架商品
      </button>
    );
  }
  return (
    <div className="fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setOpen(false)}>
      <form action={createProductAction} onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl border border-border p-5 md:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold">上架集采商品</h3>
          <button type="button" onClick={() => setOpen(false)} className="h-8 w-8 rounded-full hover:bg-surface inline-flex items-center justify-center text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <Field label="商品名称" required><input name="name" required placeholder="如：立邦内墙乳胶漆" className={INPUT} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="类别"><select name="category" defaultValue="墙面涂料" className={INPUT}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="单位"><input name="unit" placeholder="桶 / ㎡ / 件" className={INPUT} /></Field>
          </div>
          <Field label="规格"><input name="spec" placeholder="如 净味五合一 18L" className={INPUT} /></Field>
          <Field label="供应商"><input name="supplier" placeholder="如 立邦中国" className={INPUT} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="市场价(元)"><input name="marketPrice" inputMode="numeric" placeholder="580" className={INPUT} /></Field>
            <Field label="会员集采价(元)" required><input name="memberPrice" inputMode="numeric" required placeholder="459" className={INPUT} /></Field>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" className="h-11 px-6 rounded-full bg-accent-tea text-white text-[14px] font-medium inline-flex items-center gap-1.5"><Plus className="h-4 w-4" /> 上架</button>
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
