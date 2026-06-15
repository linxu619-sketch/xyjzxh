"use client";

import { setReportAssigneeAction } from "./actions";

// 选负责人即提交。value 0 = 未分派。
export function ReportAssigneeSelect({ reportId, staffId, options }: { reportId: number; staffId: number; options: { value: number; label: string }[] }) {
  return (
    <form action={setReportAssigneeAction}>
      <input type="hidden" name="id" value={reportId} />
      <select
        name="staffId"
        defaultValue={staffId}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="h-8 w-full max-w-[150px] rounded-lg border border-border bg-background text-[12px] px-2 outline-none focus:border-foreground/30"
      >
        <option value={0}>未分派</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </form>
  );
}
