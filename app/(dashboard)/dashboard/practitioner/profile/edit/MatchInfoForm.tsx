"use client";

import { useState } from "react";
import { Save, Check } from "lucide-react";
import { PROFESSIONS, DISTRICTS } from "@/lib/data/professions";
import { saveMatchInfoAction } from "./actions";

const INPUT = "w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30";

export function MatchInfoForm({ init }: {
  init: { canKinds: string[]; canDistricts: string[]; birthYear: number | null; expectDaily: number | null; years: number };
}) {
  const [kinds, setKinds] = useState<string[]>(init.canKinds);
  const [dists, setDists] = useState<string[]>(init.canDistricts);
  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <form action={saveMatchInfoAction} className="space-y-5">
      {kinds.map((k) => <input key={k} type="hidden" name="canKinds" value={k} />)}
      {dists.map((d) => <input key={d} type="hidden" name="canDistricts" value={d} />)}

      {/* 可接工种 */}
      <Section title="我能做的工种" hint="多选 · 决定给你推荐哪些岗位（招的工种你会才推）">
        <div className="flex flex-wrap gap-2">
          {PROFESSIONS.map((k) => (
            <Chip key={k} on={kinds.includes(k)} onClick={() => toggle(kinds, setKinds, k)}>{k}</Chip>
          ))}
        </div>
      </Section>

      {/* 出生年 + 从业年限 */}
      <Section title="年龄与经验" hint="出生年用于匹配岗位的年龄要求；年限用于匹配经验门槛">
        <div className="grid grid-cols-2 gap-3">
          <Field label="出生年份">
            <input name="birthYear" inputMode="numeric" defaultValue={init.birthYear ?? ""} placeholder="如 1988" className={INPUT} />
          </Field>
          <Field label="从业年限（年）">
            <input name="years" inputMode="numeric" defaultValue={init.years || ""} placeholder="如 8" className={INPUT} />
          </Field>
        </div>
      </Section>

      {/* 期望日薪 */}
      <Section title="期望最低日薪（元）" hint="低于这个价的岗位不会推给你，省得双方白聊">
        <input name="expectDaily" inputMode="numeric" defaultValue={init.expectDaily ?? ""} placeholder="如 350（不填=不限）" className={INPUT} />
      </Section>

      {/* 可接区域 */}
      <Section title="可接工地区域" hint="多选 · 同区岗位会优先推给你">
        <div className="flex flex-wrap gap-2">
          {DISTRICTS.map((d) => (
            <Chip key={d} on={dists.includes(d)} onClick={() => toggle(dists, setDists, d)}>{d}</Chip>
          ))}
        </div>
      </Section>

      <button type="submit" className="w-full h-12 rounded-full bg-accent-tea text-white text-[14px] font-medium inline-flex items-center justify-center gap-2 active:scale-[0.99] transition-transform">
        <Save className="h-4 w-4" /> 保存找活资料
      </button>
    </form>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-background border border-border p-5">
      <div className="text-[14px] font-semibold tracking-tight">{title}</div>
      {hint && <div className="text-[11px] text-muted-foreground mt-0.5 mb-3">{hint}</div>}
      {!hint && <div className="mb-3" />}
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[13px] border transition-colors ${on ? "bg-foreground text-background border-foreground" : "bg-surface text-muted-foreground border-transparent hover:border-border"}`}>
      {on && <Check className="h-3 w-3" />}{children}
    </button>
  );
}
