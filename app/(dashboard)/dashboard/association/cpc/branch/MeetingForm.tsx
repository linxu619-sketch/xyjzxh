"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Save, X } from "lucide-react";
import { MultiUpload } from "@/app/(main)/register/uploads";
import { MEETING_TYPES, type PartyMeeting } from "@/lib/data/party";
import { addMeetingAction, updateMeetingAction } from "./actions";

const INPUT = "h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/40";
const AREA = "w-full rounded-xl border border-border bg-background p-3 text-[13px] leading-6 outline-none focus:border-foreground/40";

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-muted-foreground">{label}{required && <span className="text-party ml-0.5">*</span>}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export function MeetingForm({ meeting }: { meeting?: PartyMeeting }) {
  const editing = !!meeting;
  const [images, setImages] = useState<string[]>(meeting?.images ?? []);

  return (
    <form action={editing ? updateMeetingAction : addMeetingAction} className={`rounded-2xl border bg-background p-5 grid grid-cols-1 md:grid-cols-3 gap-3 ${editing ? "border-party/40 ring-1 ring-party/20" : "border-border"}`}>
      {editing && <input type="hidden" name="id" value={meeting!.id} />}
      {editing && <div className="md:col-span-3 text-[13px] font-semibold text-party">编辑会议台账</div>}
      <Field label="类型"><select name="type" defaultValue={meeting?.type ?? "主题党日"} className={INPUT}>{MEETING_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
      <Field label="召开日期" required><input name="date" type="date" required defaultValue={meeting?.date} className={INPUT} /></Field>
      <Field label="主持 / 主讲"><input name="host" defaultValue={meeting?.host} className={INPUT} placeholder="如 解彦波" /></Field>
      <div className="md:col-span-3"><Field label="会议主题 / 标题" required><input name="title" required defaultValue={meeting?.title} className={INPUT} placeholder="如 「党建引领行业自律」主题党日" /></Field></div>
      <Field label="地点"><input name="location" defaultValue={meeting?.location} className={INPUT} placeholder="如 协会党群活动室" /></Field>
      <Field label="参会情况"><input name="attend" defaultValue={meeting?.attend} className={INPUT} placeholder="如 应到 12 实到 11" /></Field>
      <div className="md:col-span-3"><Field label="议题 / 内容（支持 Markdown）"><textarea name="summary" rows={4} defaultValue={meeting?.summary} className={`${AREA} font-mono`} placeholder={"会议议题与主要内容，可用 Markdown：\n- 学习内容\n- 议定事项"} /></Field></div>

      {/* 现场照片 */}
      <div className="md:col-span-3">
        <MultiUpload label="现场照片" hint="会议/活动现场图，最多 9 张" max={9} initial={meeting?.images} onChange={setImages} />
        {images.map((u) => <input key={u} type="hidden" name="images" value={u} />)}
      </div>

      <div className="md:col-span-3 flex items-center gap-2">
        <button className="h-10 px-4 rounded-full bg-party text-white text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform">
          {editing ? <><Save className="h-4 w-4" /> 保存修改</> : <><Plus className="h-4 w-4" /> 记入台账</>}
        </button>
        {editing && (
          <Link href="/dashboard/association/cpc/branch?tab=meetings" className="h-10 px-4 rounded-full text-[13px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><X className="h-3.5 w-3.5" /> 取消</Link>
        )}
      </div>
    </form>
  );
}
