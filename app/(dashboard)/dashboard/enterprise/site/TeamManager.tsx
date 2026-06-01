"use client";

import { useState } from "react";
import { Plus, Trash2, Users2 } from "lucide-react";
import { SingleUpload } from "@/app/(main)/register/uploads";
import { createMemberAction, deleteMemberAction } from "./team-actions";

type Member = { id: number; name: string; role: string; exp: string; photo?: string };

export function TeamManager({ team }: { team: Member[] }) {
  const [adding, setAdding] = useState(false);
  const [photo, setPhoto] = useState("");

  return (
    <div className="rounded-2xl border border-border bg-background p-6 md:p-7">
      <div className="flex items-start justify-between gap-4 mb-5 flex-col sm:flex-row">
        <div>
          <h3 className="text-[16px] font-semibold tracking-tight">团队管理</h3>
          <p className="mt-1 text-[12px] text-muted-foreground max-w-xl">维护展示在子站「核心团队」区的成员。</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform shrink-0">
            <Plus className="h-3.5 w-3.5" /> 添加成员
          </button>
        )}
      </div>

      {adding && (
        <form action={createMemberAction} className="rounded-xl border border-border bg-surface/40 p-4 mb-5 space-y-3">
          <input type="hidden" name="photo" value={photo} />
          <div className="flex flex-col sm:flex-row gap-4">
            <SingleUpload label="成员照片" aspect="1 / 1" className="w-[110px] shrink-0" onChange={(url) => setPhoto(url ?? "")} />
            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="sm:w-[140px]">
                  <div className="text-[12px] font-medium mb-1.5">姓名 / 称呼<span className="text-cat-decor ml-0.5">*</span></div>
                  <input name="name" required placeholder="如 李工" className="w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30" />
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-medium mb-1.5">职务<span className="text-cat-decor ml-0.5">*</span></div>
                  <input name="role" required placeholder="如 首席设计师" className="w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30" />
                </div>
              </div>
              <div>
                <div className="text-[12px] font-medium mb-1.5">一句话资历（卡片展示）</div>
                <input name="exp" placeholder="如 15 年经验 · 注册一级建造师" className="w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30" />
              </div>
            </div>
          </div>
          <div>
            <div className="text-[12px] font-medium mb-1.5">详细介绍（展示在成员详情页）</div>
            <textarea name="bio" rows={3} placeholder="如：从业 15 年，主持金茂悦府等 200+ 整装项目，擅长极简与收纳一体化设计，注册一级建造师…" className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] outline-none focus:border-foreground/30 resize-none" />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="h-10 px-5 rounded-full bg-accent-tea text-white text-[13px] font-medium inline-flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> 保存成员
            </button>
            <button type="button" onClick={() => { setAdding(false); setPhoto(""); }} className="h-10 px-4 rounded-full text-[13px] text-muted-foreground hover:text-foreground">取消</button>
          </div>
        </form>
      )}

      {team.length === 0 ? (
        <div className="py-8 text-center text-[13px] text-muted-foreground inline-flex flex-col items-center w-full">
          <Users2 className="h-7 w-7 text-muted-foreground/50 mb-2" />
          还没有团队成员。添加后会展示在子站「核心团队」区。
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {team.map((m) => (
            <div key={m.id} className="flex items-center gap-3 border border-border p-3 rounded-xl">
              {m.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.photo} alt={m.name} className="h-11 w-11 rounded-full object-cover shrink-0" />
              ) : (
                <span className="h-11 w-11 rounded-full bg-foreground text-background inline-flex items-center justify-center text-[15px] font-semibold shrink-0">{m.name.slice(0, 1)}</span>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold truncate">{m.name} <span className="text-[12px] text-muted-foreground font-normal">· {m.role}</span></div>
                <div className="text-[11px] text-muted-foreground truncate">{m.exp || "—"}</div>
              </div>
              <form action={deleteMemberAction}>
                <input type="hidden" name="id" value={m.id} />
                <button className="h-8 w-8 rounded-full hover:bg-cat-decor-soft text-muted-foreground hover:text-cat-decor inline-flex items-center justify-center shrink-0" title="删除成员">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
