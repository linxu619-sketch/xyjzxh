"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { PROFESSIONS, DISTRICTS } from "@/lib/data/professions";
import { createJobAction } from "./actions";

const INPUT = "w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30";

export function PostJobForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform">
        <Plus className="h-3.5 w-3.5" /> 发布用工
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
          <h3 className="text-[16px] font-semibold">发布用工 · 零工/散工（日薪）</h3>
          <button type="button" onClick={() => setOpen(false)} className="h-8 w-8 rounded-full hover:bg-surface inline-flex items-center justify-center text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <Field label="岗位标题" required><input name="title" required placeholder="如：急招水电工 5 名 · 金茂悦府工地" className={INPUT} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="工种" required>
              <select name="kind" required defaultValue="水电工" className={INPUT}>
                {PROFESSIONS.map((k) => <option key={k}>{k}</option>)}
              </select>
            </Field>
            <Field label="工地区域">
              <input name="district" list="job-districts" placeholder="如 浉河区" className={INPUT} />
              <datalist id="job-districts">{DISTRICTS.map((d) => <option key={d} value={d} />)}</datalist>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="日薪下限(元)"><input name="daily" inputMode="numeric" placeholder="380" className={INPUT} /></Field>
            <Field label="日薪上限(元)"><input name="dailyMax" inputMode="numeric" placeholder="420（不填=单值）" className={INPUT} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="名额"><input name="openings" inputMode="numeric" placeholder="5" className={INPUT} /></Field>
            <Field label="工期"><input name="duration" placeholder="约25天" className={INPUT} /></Field>
          </div>
          {/* 招工要求（用于与从业者资料双向匹配；留空=不限）*/}
          <div className="grid grid-cols-3 gap-3">
            <Field label="最低年龄"><input name="minAge" inputMode="numeric" placeholder="18" className={INPUT} /></Field>
            <Field label="最高年龄"><input name="maxAge" inputMode="numeric" placeholder="55" className={INPUT} /></Field>
            <Field label="最低年限(年)"><input name="minYears" inputMode="numeric" placeholder="0" className={INPUT} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="性别要求">
              <select name="genderReq" defaultValue="" className={INPUT}>
                <option value="">不限</option><option value="男">限男</option><option value="女">限女</option>
              </select>
            </Field>
            <Field label="持证要求">
              <label className="flex items-center gap-2 h-11 text-[13px]"><input type="checkbox" name="needCert" className="accent-cat-decor h-4 w-4" /> 需持证上岗</label>
            </Field>
          </div>
          <div className="-mt-1 text-[11px] text-muted-foreground">年龄 / 年限 / 性别 / 持证留空或不勾 = 不限。填了系统只把符合的从业者匹配过来，双方不做无用功。</div>
          <Field label="工伤保障（协会团险 · 5 元/天/人）">
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 h-11 px-3 rounded-xl border border-border text-[13px] cursor-pointer has-[:checked]:border-accent-tea has-[:checked]:bg-[#e6f7f1]">
                <input type="radio" name="insurance" value="company" defaultChecked className="accent-accent-tea" /> 企业承保（推荐）
              </label>
              <label className="flex items-center gap-2 h-11 px-3 rounded-xl border border-border text-[13px] cursor-pointer has-[:checked]:border-foreground/40">
                <input type="radio" name="insurance" value="self" className="accent-foreground" /> 工人自理
              </label>
            </div>
            <div className="mt-1.5 text-[11px] text-muted-foreground">选「企业承保」岗位会标「含工伤险」，录用后由协会团险统一为工人投保，费用走协会监管账户。</div>
          </Field>
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
