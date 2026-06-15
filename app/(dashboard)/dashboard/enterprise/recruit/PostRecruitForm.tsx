"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { PROFESSIONS, DISTRICTS } from "@/lib/data/professions";
import { createRecruitAction } from "../jobs/actions";

const INPUT = "w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30";
const EDU = ["不限", "中专/技校", "大专", "本科", "硕士及以上"];
const BENEFITS = ["五险一金", "包住", "包餐", "双休", "法定节假日", "年终奖", "带薪年假", "晋升空间"];

export function PostRecruitForm() {
  const [open, setOpen] = useState(false);
  const [benefits, setBenefits] = useState<string[]>([]);
  const toggleBen = (b: string) => setBenefits((v) => (v.includes(b) ? v.filter((x) => x !== b) : [...v, b]));

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform">
        <Plus className="h-3.5 w-3.5" /> 发布招聘
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setOpen(false)}>
      <form action={createRecruitAction} onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl border border-border p-5 md:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[16px] font-semibold">发布招聘岗位 · 长期（月薪）</h3>
          <button type="button" onClick={() => setOpen(false)} className="h-8 w-8 rounded-full hover:bg-surface inline-flex items-center justify-center text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
        <p className="text-[12px] text-muted-foreground mb-4">面向专业个人会员（设计师 / 项目经理 / 监理 / 造价 / 工长等），月薪雇佣。零工/散工请用「用工派单」。</p>
        <div className="space-y-3">
          <Field label="岗位标题" required><input name="title" required placeholder="如：室内设计师 1 名 · 整装设计" className={INPUT} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="职位 / 工种" required>
              <select name="kind" required defaultValue="设计师" className={INPUT}>{PROFESSIONS.map((k) => <option key={k}>{k}</option>)}</select>
            </Field>
            <Field label="工作地区">
              <input name="district" list="recruit-districts" placeholder="如 浉河区" className={INPUT} />
              <datalist id="recruit-districts">{DISTRICTS.map((d) => <option key={d} value={d} />)}</datalist>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="月薪下限(元)"><input name="daily" inputMode="numeric" placeholder="6000" className={INPUT} /></Field>
            <Field label="月薪上限(元)"><input name="dailyMax" inputMode="numeric" placeholder="10000（不填=单值）" className={INPUT} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="招聘人数"><input name="openings" inputMode="numeric" placeholder="1" className={INPUT} /></Field>
            <Field label="学历要求"><select name="edu" defaultValue="不限" className={INPUT}>{EDU.map((e) => <option key={e}>{e}</option>)}</select></Field>
          </div>
          <Field label="可入职日期"><input name="startDate" type="date" className={INPUT} /><span className="text-[11px] text-muted-foreground">期望到岗日；不填=面议。</span></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="最低年龄"><input name="minAge" inputMode="numeric" placeholder="22" className={INPUT} /></Field>
            <Field label="最高年龄"><input name="maxAge" inputMode="numeric" placeholder="55" className={INPUT} /></Field>
            <Field label="最低年限(年)"><input name="minYears" inputMode="numeric" placeholder="3" className={INPUT} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="性别要求"><select name="genderReq" defaultValue="" className={INPUT}><option value="">不限</option><option value="男">限男</option><option value="女">限女</option></select></Field>
            <Field label="持证要求"><label className="flex items-center gap-2 h-11 text-[13px]"><input type="checkbox" name="needCert" className="accent-cat-decor h-4 w-4" /> 需持证 / 资质</label></Field>
          </div>
          <div className="-mt-1 text-[11px] text-muted-foreground">月薪与从业者「期望月薪范围」求交集匹配；年龄/年限/学历/性别/持证留空或不勾=不限。</div>
          <Field label="福利待遇（多选）">
            {benefits.map((b) => <input key={b} type="hidden" name="benefits" value={b} />)}
            <div className="flex flex-wrap gap-2">
              {BENEFITS.map((b) => (
                <button type="button" key={b} onClick={() => toggleBen(b)} className={`rounded-full px-3 py-1.5 text-[12.5px] border transition-colors ${benefits.includes(b) ? "bg-foreground text-background border-foreground" : "bg-surface text-muted-foreground border-transparent hover:border-border"}`}>{b}</button>
              ))}
            </div>
          </Field>
          <Field label="岗位职责 / 要求"><textarea name="detail" rows={3} placeholder="工作内容、任职要求、晋升空间等" className={`${INPUT} h-auto py-2.5 leading-6`} /></Field>
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" className="h-11 px-6 rounded-full bg-accent-tea text-white text-[14px] font-medium inline-flex items-center gap-1.5"><Plus className="h-4 w-4" /> 发布招聘</button>
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
