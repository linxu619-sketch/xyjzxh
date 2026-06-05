"use client";

import { useState } from "react";

export function RebindPhone({ action }: { action: (fd: FormData) => void | Promise<void> }) {
  const [phone, setPhone] = useState("");
  const [countdown, setCountdown] = useState(0);
  const canSend = /^1\d{10}$/.test(phone) && countdown === 0;

  function sendCode() {
    if (!canSend) return;
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  return (
    <form action={action} className="px-4 pb-4 pt-1 space-y-2.5">
      <input
        name="newPhone"
        type="tel"
        inputMode="numeric"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
        placeholder="新手机号（11 位）"
        className="w-full h-10 rounded-xl border border-border bg-background px-3 text-[14px] outline-none focus:border-foreground/30"
      />
      <div className="flex gap-2">
        <input
          name="code"
          inputMode="numeric"
          placeholder="短信验证码"
          className="flex-1 h-10 rounded-xl border border-border bg-background px-3 text-[14px] outline-none focus:border-foreground/30"
        />
        <button
          type="button"
          onClick={sendCode}
          disabled={!canSend}
          className="h-10 px-4 rounded-xl bg-surface text-[13px] font-medium shrink-0 hover:bg-surface-2 disabled:opacity-50"
        >
          {countdown > 0 ? `${countdown}s 后重发` : "发送验证码"}
        </button>
      </div>
      <button type="submit" className="w-full h-10 rounded-xl bg-foreground text-background text-[13px] font-medium">
        确认换绑
      </button>
      <p className="text-[11px] text-muted-foreground">验证码将发送至新手机号；换绑后用新手机号登录。（演示环境验证码任意 4-6 位即可）</p>
    </form>
  );
}
