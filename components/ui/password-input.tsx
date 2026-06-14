"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

/* 密码输入框 —— 右侧带「眼睛」可切换明文/密文显示。
   用于登录 / 注册 / 设置改密 / 各类密钥输入，统一交互。
   透传全部原生 <input> 属性（name、required、autoComplete、placeholder…），
   仅接管 type（在 password ⇄ text 间切换）并补足右侧留白给眼睛按钮。 */
type Props = Omit<React.ComponentPropsWithoutRef<"input">, "type"> & {
  /** 外层定位容器的额外类名（如需在外层加 margin） */
  wrapClassName?: string;
};

export function PasswordInput({ className, wrapClassName, ...props }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className={cn("relative", wrapClassName)}>
      <input {...props} type={show ? "text" : "password"} className={cn(className, "pr-11")} />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "隐藏密码" : "显示密码"}
        title={show ? "隐藏密码" : "显示密码"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground transition-colors"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
