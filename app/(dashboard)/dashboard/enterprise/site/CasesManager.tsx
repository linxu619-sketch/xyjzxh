"use client";

import { useState } from "react";
import { Plus, Trash2, ImageIcon } from "lucide-react";
import { SingleUpload } from "@/app/(main)/register/uploads";
import { createCaseAction, deleteCaseAction } from "./cases-actions";

type CaseItem = { id: number; title: string; cover: string; area: string; tag: string };

export function CasesManager({ cases }: { cases: CaseItem[] }) {
  const [cover, setCover] = useState<string>("");
  const [adding, setAdding] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-background p-6 md:p-7">
      <div className="flex items-start justify-between gap-4 mb-5 flex-col sm:flex-row">
        <div>
          <h3 className="text-[16px] font-semibold tracking-tight">案例管理</h3>
          <p className="mt-1 text-[12px] text-muted-foreground max-w-xl">上传的案例会展示在您的子站「案例」区。封面建议横版 4:3。</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform shrink-0">
            <Plus className="h-3.5 w-3.5" /> 添加案例
          </button>
        )}
      </div>

      {/* 添加表单 */}
      {adding && (
        <form action={createCaseAction} className="rounded-xl border border-border bg-surface/40 p-4 mb-5 space-y-4">
          <input type="hidden" name="cover" value={cover} />
          <div className="flex flex-col md:flex-row gap-4">
            <SingleUpload label="案例封面" required aspect="4 / 3" className="w-[220px] max-w-full shrink-0" onChange={(url) => setCover(url ?? "")} />
            <div className="flex-1 space-y-3">
              <div>
                <div className="text-[12px] font-medium mb-1.5">案例标题<span className="text-cat-decor ml-0.5">*</span></div>
                <input name="title" required placeholder="如：金茂悦府 1602 · 现代极简整装" className="w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="text-[12px] font-medium mb-1.5">面积（㎡）</div>
                  <input name="area" inputMode="numeric" placeholder="如 168" className="w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30" />
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-medium mb-1.5">类型 / 风格</div>
                  <input name="tag" placeholder="如 整装 / 软装" className="w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="text-[12px] font-medium mb-1.5">项目描述（选填，展示在案例详情页）</div>
            <textarea name="detail" rows={3} placeholder="如：三居室整装，全屋定制到顶，18 道工序质检交付，工期 75 天…" className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] outline-none focus:border-foreground/30 resize-none" />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={!cover} className="h-10 px-5 rounded-full bg-accent-tea text-white text-[13px] font-medium inline-flex items-center gap-1.5 disabled:opacity-50">
              <Plus className="h-3.5 w-3.5" /> 保存案例
            </button>
            <button type="button" onClick={() => { setAdding(false); setCover(""); }} className="h-10 px-4 rounded-full text-[13px] text-muted-foreground hover:text-foreground">取消</button>
            {!cover && <span className="text-[11px] text-muted-foreground">先上传封面图后可保存</span>}
          </div>
        </form>
      )}

      {/* 已有案例 */}
      {cases.length === 0 ? (
        <div className="py-8 text-center text-[13px] text-muted-foreground inline-flex flex-col items-center w-full">
          <ImageIcon className="h-7 w-7 text-muted-foreground/50 mb-2" />
          还没有案例。点「添加案例」上传第一个，子站案例区即会展示。
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {cases.map((c) => (
            <div key={c.id} className="relative border border-border overflow-hidden bg-background group">
              <div className="relative" style={{ aspectRatio: "4 / 3" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.cover} alt={c.title} className="absolute inset-0 h-full w-full object-cover" />
                <form action={deleteCaseAction} className="absolute top-1.5 right-1.5">
                  <input type="hidden" name="id" value={c.id} />
                  <button className="h-7 w-7 rounded-full bg-foreground/60 text-white inline-flex items-center justify-center hover:bg-cat-decor" title="删除案例">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
              <div className="p-2.5">
                <div className="text-[12px] font-medium truncate">{c.title}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{[c.area && `${c.area}㎡`, c.tag].filter(Boolean).join(" · ") || "—"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
