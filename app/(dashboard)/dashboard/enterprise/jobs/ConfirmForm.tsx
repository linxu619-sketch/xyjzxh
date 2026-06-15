"use client";

import type { ReactNode } from "react";

// 高风险流转（取消录用 / 中止施工）二次确认：提交前弹确认框，取消则不提交。
export function ConfirmForm({
  action, message, className, children,
}: {
  action: (fd: FormData) => void | Promise<void>;
  message: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => { if (!window.confirm(message)) e.preventDefault(); }}
    >
      {children}
    </form>
  );
}
