"use client";

import { setLeadAssigneeAction } from "./actions";

// 选负责人即提交（无需额外保存按钮）。value 0 = 未分派。
export function AssigneeSelect({ leadId, staffId, options }: { leadId: number; staffId: number; options: { value: number; label: string }[] }) {
  return (
    <form action={setLeadAssigneeAction}>
      <input type="hidden" name="id" value={leadId} />
      <select
        name="staffId"
        defaultValue={staffId}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="h-9 rounded-lg border border-border bg-background text-[13px] px-2.5 outline-none focus:border-foreground/30"
      >
        <option value={0}>未分派</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </form>
  );
}
