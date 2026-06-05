import Link from "next/link";
import { ArrowLeft, UserCog, Save, KeyRound, AlertTriangle } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { createStaffAction } from "../../actions";
import { roleLabel, ROLE_KEYS, STAFF_ROLES, PERMISSIONS } from "@/lib/auth/roles";

export const metadata = { title: "新增工作人员 · 协会工作台" };

export default async function NewStaff({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  const { err } = await searchParams;

  return (
    <AssociationShell title="新增工作人员" subtitle="为协会职员开通工作台登录账号并分配角色">
      <Link href="/dashboard/association/users?tab=staff" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回工作人员列表
      </Link>

      {err && (
        <div className="mb-4 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor px-4 py-2.5 text-[13px] inline-flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {err}
        </div>
      )}

      <form action={createStaffAction} className="rounded-2xl border border-border bg-background p-5 md:p-6 max-w-2xl space-y-5">
        <div>
          <label className="block text-[12px] text-muted-foreground mb-1.5">姓名</label>
          <input name="name" required placeholder="如:张秘书" className="h-10 w-full max-w-xs rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/30" />
        </div>

        <div>
          <label className="block text-[12px] text-muted-foreground mb-1.5">登录手机号</label>
          <input name="phone" required inputMode="numeric" placeholder="11 位手机号" className="h-10 w-full max-w-xs rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/30" />
        </div>

        <div>
          <label className="block text-[12px] text-muted-foreground mb-1.5">邮箱 <span className="text-muted-foreground/60">(选填)</span></label>
          <input name="email" type="email" placeholder="可留空" className="h-10 w-full max-w-xs rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/30" />
        </div>

        <div>
          <label className="block text-[12px] text-muted-foreground mb-1.5 inline-flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5" /> 初始登录密码</label>
          <input name="password" type="text" required placeholder="至少 6 位,可告知本人后自行修改" className="h-10 w-full max-w-xs rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/30" />
        </div>

        <div>
          <div className="text-[12px] text-muted-foreground mb-2 inline-flex items-center gap-1.5"><UserCog className="h-3.5 w-3.5" /> 角色 · 可多选(权限取并集)</div>
          <div className="flex flex-wrap gap-2">
            {ROLE_KEYS.filter((r) => r !== "super_admin").map((r) => (
              <label key={r} title={STAFF_ROLES[r].permissions.map((p) => PERMISSIONS[p]).join(" / ")} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] border cursor-pointer transition-colors bg-background border-border hover:bg-surface has-[:checked]:bg-foreground has-[:checked]:text-background has-[:checked]:border-foreground">
                <input type="checkbox" name="role" value={r} className="accent-brand" />{roleLabel(r)}
              </label>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">超级管理员账号写死源码、不可在此创建。</p>
        </div>

        <div className="pt-2 border-t border-border flex items-center gap-2">
          <button className="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Save className="h-4 w-4" /> 创建并开通账号</button>
          <Link href="/dashboard/association/users?tab=staff" className="h-10 px-5 rounded-full border border-border text-[13px] font-medium inline-flex items-center hover:bg-surface">取消</Link>
        </div>
      </form>
    </AssociationShell>
  );
}
