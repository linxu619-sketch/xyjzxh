"use client";

import { useState } from "react";
import { Wallet, Pencil, Save, X } from "lucide-react";
import { bindPayoutAccountAction } from "./actions";

const METHODS = [{ v: "wechat", t: "微信" }, { v: "alipay", t: "支付宝" }, { v: "bank", t: "银行卡" }] as const;
const INPUT = "w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30";

// 工人收款账户：未绑展示绑定表单;已绑展示账户+编辑
export function PayoutAccountForm({ bound }: { bound: { method: string; account: string; name: string } | null }) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<string>(bound?.method || "wechat");
  const methodLabel = METHODS.find((m) => m.v === bound?.method)?.t ?? "";
  const masked = bound ? (bound.account.length > 6 ? `${bound.account.slice(0, 3)}****${bound.account.slice(-3)}` : bound.account) : "";

  if (bound && !open) {
    return (
      <div className="rounded-3xl border border-border bg-background p-4 mb-4 flex items-center gap-3">
        <span className="h-10 w-10 rounded-xl bg-accent-tea/15 text-accent-tea inline-flex items-center justify-center shrink-0"><Wallet className="h-5 w-5" /></span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold">收款账户 · {methodLabel}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{bound.name} · {masked} · 工资自动到此</div>
        </div>
        <button onClick={() => setOpen(true)} className="h-9 px-3.5 rounded-full border border-border text-[12px] inline-flex items-center gap-1 hover:bg-surface"><Pencil className="h-3.5 w-3.5" /> 修改</button>
      </div>
    );
  }

  return (
    <form action={bindPayoutAccountAction} className="rounded-3xl border border-border bg-background p-5 mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-semibold inline-flex items-center gap-1.5"><Wallet className="h-4 w-4 text-cat-decor" /> {bound ? "修改收款账户" : "绑定收款账户"}</span>
        {bound && <button type="button" onClick={() => setOpen(false)} className="h-7 w-7 rounded-full hover:bg-surface inline-flex items-center justify-center text-muted-foreground"><X className="h-4 w-4" /></button>}
      </div>
      {!bound && <p className="text-[12px] text-muted-foreground">绑定后,已挂账的工资会自动补发到此账户;之后结算的工资直接到账。</p>}
      <input type="hidden" name="method" value={method} />
      <div className="grid grid-cols-3 gap-2">
        {METHODS.map((m) => (
          <button type="button" key={m.v} onClick={() => setMethod(m.v)} className={`h-10 rounded-xl border text-[13px] ${method === m.v ? "border-accent-tea bg-[#e6f7f1] text-accent-tea font-medium" : "border-border text-muted-foreground"}`}>{m.t}</button>
        ))}
      </div>
      <label className="block">
        <span className="text-[12px] font-medium">{method === "bank" ? "银行卡号" : method === "alipay" ? "支付宝账号" : "微信号 / 绑定手机号"}</span>
        <input name="account" required defaultValue={bound?.account ?? ""} placeholder={method === "bank" ? "如 6217 0000 0000 0000" : "收款账号"} className={`${INPUT} mt-1`} />
      </label>
      <label className="block">
        <span className="text-[12px] font-medium">户名（与账号一致）</span>
        <input name="name" required defaultValue={bound?.name ?? ""} placeholder="本人真实姓名" className={`${INPUT} mt-1`} />
      </label>
      <button type="submit" className="h-11 px-6 rounded-full bg-accent-tea text-white text-[14px] font-medium inline-flex items-center gap-1.5"><Save className="h-4 w-4" /> 保存收款账户</button>
    </form>
  );
}
