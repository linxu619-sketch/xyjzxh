"use client";

import { useState, type ReactNode } from "react";
import { X, ShieldAlert } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";

/* 高危操作「管理员密码确认」弹框 —— 删除账号 / 重置他人密码 / 停用账号等
   不可随意执行的动作，点击触发后弹出模态，必须输入「本人管理员登录密码」
   才放行（服务端 verifyAdminPassword 二次核验，密码不入库 / 不回显）。
   - trigger：页面上的触发按钮内容与样式；
   - fields：操作特有字段（如「新密码」输入框），渲染在密码框上方；
   - errored：服务端核验失败带 ?err=xxx 回退时为 true，弹框自动重开并红字提示。 */
export function GuardedActionModal({
  action,
  hidden = {},
  trigger,
  triggerClassName,
  title,
  description,
  fields,
  confirmLabel,
  confirmClassName,
  errored,
  errorText,
}: {
  action: (fd: FormData) => void | Promise<void>;
  hidden?: Record<string, string>;
  trigger: ReactNode;
  triggerClassName: string;
  title: string;
  description?: string;
  fields?: ReactNode;
  confirmLabel: ReactNode;
  confirmClassName: string;
  errored?: boolean;
  errorText?: string;
}) {
  // 核验失败回退时（errored）自动重开弹框，让用户看到错误并重试
  const [open, setOpen] = useState(Boolean(errored));

  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => setOpen(true)}>
        {trigger}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="inline-flex items-center gap-2 text-[15px] font-semibold text-cat-decor">
              <ShieldAlert className="h-4 w-4" /> {title}
            </div>
            {description && <p className="mt-2 text-[13px] text-muted-foreground leading-6">{description}</p>}

            <form action={action} className="mt-4">
              {Object.entries(hidden).map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v} />
              ))}
              {fields}
              <label className="block text-[12px] text-muted-foreground mb-1.5 mt-3 inline-flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-cat-decor" /> 管理员登录密码
              </label>
              <PasswordInput
                name="admin_pwd"
                required
                autoFocus
                autoComplete="off"
                placeholder="请输入您的管理员密码"
                wrapClassName="w-full"
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:border-cat-decor/50"
              />
              {errored && <p className="mt-1.5 text-[12px] text-cat-decor">{errorText || "密码不正确,未执行操作,请重试。"}</p>}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-10 px-4 rounded-full border border-border text-[13px] font-medium hover:bg-surface"
                >
                  取消
                </button>
                <button className={confirmClassName}>{confirmLabel}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
