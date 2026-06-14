"use client";

import { Trash2, ShieldAlert } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";

/* 高危删除表单 —— 删除账号 / 工作人员等不可恢复操作前的统一拦截：
   1) 必须输入「管理员本人登录密码」（服务端二次核验，密码不入库不回显）；
   2) 点击删除时再弹一次浏览器确认框（防误点）。
   两道关卡叠加，杜绝「一键裸删」。 */
export function DangerDeleteForm({
  action,
  idName,
  idValue,
  buttonLabel,
  confirmText,
  errored,
}: {
  action: (fd: FormData) => void | Promise<void>;
  idName: string;
  idValue: string;
  buttonLabel: string;
  confirmText: string;
  errored?: boolean;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name={idName} value={idValue} />
      <label className="block text-[12px] text-muted-foreground mb-1.5 inline-flex items-center gap-1.5">
        <ShieldAlert className="h-3.5 w-3.5 text-cat-decor" /> 请输入您的管理员登录密码以确认删除
      </label>
      <PasswordInput
        name="admin_pwd"
        required
        autoComplete="off"
        placeholder="管理员密码"
        wrapClassName="max-w-[18rem]"
        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:border-cat-decor/50"
      />
      {errored && <p className="mt-1.5 text-[12px] text-cat-decor">密码不正确,未执行删除,请重试。</p>}
      <button className="mt-3 h-10 px-5 rounded-full border border-cat-decor/40 text-cat-decor text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-cat-decor-soft">
        <Trash2 className="h-4 w-4" /> {buttonLabel}
      </button>
    </form>
  );
}
