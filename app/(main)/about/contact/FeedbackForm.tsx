"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitFeedbackAction, type FeedbackResult } from "./actions";

const INIT: FeedbackResult = { ok: false, msg: "" };
const inputCls = "h-11 rounded-xl border border-border px-4 text-[14px] outline-none focus:border-foreground/30";

export function FeedbackForm() {
  const [state, action, pending] = useActionState(submitFeedbackAction, INIT);

  if (state.ok) {
    return (
      <div className="mt-6 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] p-6 text-center">
        <CheckCircle2 className="h-9 w-9 text-accent-tea mx-auto" />
        <p className="mt-2 text-[14px] text-accent-tea font-medium">{state.msg}</p>
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <input name="name" placeholder="姓名" className={inputCls} />
      <input name="phone" placeholder="手机号" className={inputCls} />
      <input name="email" placeholder="邮箱 (可选)" className={`${inputCls} md:col-span-2`} />
      <textarea name="content" rows={5} required placeholder="您想说的内容…" className="rounded-xl border border-border px-4 py-3 text-[14px] outline-none focus:border-foreground/30 md:col-span-2" />
      {state.msg && !state.ok && <p className="text-[13px] text-cat-decor md:col-span-2">{state.msg}</p>}
      <button disabled={pending} className="h-12 rounded-full bg-foreground text-background font-medium md:col-span-2 disabled:opacity-60">
        {pending ? "提交中…" : "提交反馈"}
      </button>
    </form>
  );
}
