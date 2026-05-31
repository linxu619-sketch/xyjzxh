"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, ArrowRight, ShieldCheck, ExternalLink } from "lucide-react";

type Tpl = { id: string; title: string; version: string };

export function RegisterAgreements({
  role,
  agreements,
  isCustomer,
}: {
  role: string;
  agreements: Tpl[];
  isCustomer: boolean;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const allAgreed = agreements.length > 0 && agreements.every((a) => checked[a.id]);

  function toggle(id: string) {
    setChecked((c) => ({ ...c, [id]: !c[id] }));
  }
  function agreeAll() {
    const all: Record<string, boolean> = {};
    agreements.forEach((a) => (all[a.id] = true));
    setChecked(all);
  }

  return (
    <div className="rounded-2xl border-2 border-cat-decor/25 bg-cat-decor-soft/50 p-4 md:p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-[14px] font-semibold inline-flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-cat-decor" /> 第 2 步 · 签署必签协议（{agreements.length} 份）
        </div>
        <button type="button" onClick={agreeAll} className="text-[12px] text-brand hover:underline shrink-0">
          全部已读并同意
        </button>
      </div>

      <ul className="space-y-2">
        {agreements.map((a) => (
          <li key={a.id} className="flex items-center gap-2.5 rounded-xl bg-background border border-border px-3 py-2.5">
            <input
              id={`agr-${a.id}`}
              type="checkbox"
              checked={!!checked[a.id]}
              onChange={() => toggle(a.id)}
              className="accent-cat-decor h-4 w-4 shrink-0"
            />
            <label htmlFor={`agr-${a.id}`} className="text-[13px] flex-1 min-w-0 cursor-pointer">
              {a.title}
              <span className="text-[11px] text-muted-foreground ml-1.5">v{a.version}</span>
            </label>
            <Link
              href={`/register/agreements?role=${role}`}
              target="_blank"
              className="shrink-0 text-[11px] text-brand inline-flex items-center gap-0.5 hover:underline"
            >
              查看全文 <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-3 text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-accent-tea" />
        勾选即代表已阅读并同意；签署内容将记录时间戳与设备指纹供协会审计存证。
      </div>

      <button
        type="submit"
        disabled={!allAgreed}
        className={`mt-4 h-12 w-full rounded-full font-medium inline-flex items-center justify-center gap-2 transition-all ${
          allAgreed
            ? "bg-foreground text-background hover:bg-brand active:scale-[0.99]"
            : "bg-muted/30 text-muted-foreground cursor-not-allowed"
        }`}
      >
        {allAgreed
          ? (isCustomer ? "完成注册" : "提交入会申请")
          : `请先勾选全部 ${agreements.length} 份协议`}
        {allAgreed && <ArrowRight className="h-4 w-4" />}
      </button>
    </div>
  );
}
