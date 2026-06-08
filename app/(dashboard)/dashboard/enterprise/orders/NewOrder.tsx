"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createOrderAction } from "./actions";

const INPUT = "w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30";

export function NewOrder() {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform">
        <Plus className="h-3.5 w-3.5" /> 新建订单
      </button>
    );
  }
  return (
    <div className="fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setOpen(false)}>
      <form action={createOrderAction} onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl border border-border p-5 md:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold">新建施工订单</h3>
          <button type="button" onClick={() => setOpen(false)} className="h-8 w-8 rounded-full hover:bg-surface inline-flex items-center justify-center text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="客户称呼" required><input name="customerName" required placeholder="如 刘女士" className={INPUT} /></Field>
            <Field label="客户电话" hint="业主凭此手机号在「我的项目」实时看进度，建议填写"><input name="customerPhone" type="tel" placeholder="11 位手机号" className={INPUT} /></Field>
          </div>
          <Field label="项目 / 工程范围" required><input name="scope" required placeholder="如 金茂悦府 1602 整装" className={INPUT} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="类型"><select name="type" defaultValue="家装" className={INPUT}>{["家装", "工装", "公装", "市政"].map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field label="面积(㎡)"><input name="area" inputMode="numeric" placeholder="168" className={INPUT} /></Field>
            <Field label="区域"><input name="district" placeholder="浉河区" className={INPUT} /></Field>
          </div>
          <Field label="合同金额(元)"><input name="amount" inputMode="numeric" placeholder="318600" className={INPUT} /></Field>
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" className="h-11 px-6 rounded-full bg-accent-tea text-white text-[14px] font-medium inline-flex items-center gap-1.5"><Plus className="h-4 w-4" /> 创建</button>
            <button type="button" onClick={() => setOpen(false)} className="h-11 px-4 rounded-full text-[13px] text-muted-foreground hover:text-foreground">取消</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium">{label}{required && <span className="text-cat-decor ml-0.5">*</span>}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-[10px] text-muted-foreground leading-4">{hint}</span>}
    </label>
  );
}
