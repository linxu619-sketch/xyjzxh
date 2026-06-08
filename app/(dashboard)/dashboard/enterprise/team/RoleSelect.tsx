"use client";

import { setStaffRoleAction } from "./actions";

// 改角色即提交（无需额外保存按钮）
export function RoleSelect({ id, role, options }: { id: number; role: string; options: { value: string; label: string }[] }) {
  return (
    <form action={setStaffRoleAction}>
      <input type="hidden" name="id" value={id} />
      <select
        name="role"
        defaultValue={role}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="h-8 rounded-lg border border-border bg-background text-[12px] px-2 outline-none focus:border-foreground/30"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </form>
  );
}
