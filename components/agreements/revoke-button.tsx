"use client";

import { useActionState, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { revokeAgreementAction, type RevokeResult } from "@/app/(dashboard)/dashboard/customer/agreements/actions";

const INITIAL: RevokeResult = { ok: null };

export function RevokeButton({
  templateId,
  templateTitle,
}: {
  templateId: string;
  templateTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(revokeAgreementAction, INITIAL);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-10 px-4 rounded-full border border-cat-decor/40 text-cat-decor text-[11px] font-medium inline-flex items-center gap-1 active:scale-95 transition-transform"
      >
        撤回授权
      </button>

      {open && (
        <div
          onClick={() => !pending && setOpen(false)}
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-7 animate-fade-up"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full md:w-[480px] max-h-[90vh] overflow-hidden rounded-t-3xl md:rounded-3xl bg-background border border-border shadow-2xl flex flex-col"
          >
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-cat-decor" />
              <div className="text-[15px] font-semibold flex-1">撤回协议授权</div>
              <button
                onClick={() => !pending && setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {state.ok === true ? (
              <div className="p-6 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-accent-tea" />
                <div className="mt-3 text-[16px] font-semibold text-accent-tea">已提交撤回申请</div>
                <div className="mt-2 text-[12px] text-muted-foreground">
                  协会将在 7 日内删除非法定保留信息
                </div>

                <div className="mt-5 rounded-2xl bg-cat-decor-soft p-4 text-left">
                  <div className="text-[12px] font-semibold text-cat-decor mb-2">受影响的业务：</div>
                  <ul className="space-y-1.5 text-[12px] text-cat-decor">
                    {state.affects.map((a, i) => (
                      <li key={i} className="flex gap-2">
                        <span>·</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="mt-5 h-11 w-full rounded-full bg-foreground text-background text-[13px] font-medium"
                >
                  我知道了
                </button>
              </div>
            ) : (
              <form action={formAction} className="p-5 space-y-4">
                <input type="hidden" name="templateId" value={templateId} />

                <div className="text-[13px] leading-6">
                  您正在撤回 <b>{templateTitle}</b> 的授权。
                </div>

                <div className="rounded-2xl bg-cat-decor-soft p-4 text-[12px] text-cat-decor flex items-start gap-2.5 leading-5">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <b>请注意：</b>撤回是 PIPL 第 15 条赋予您的权利，但可能影响您当前使用的服务。
                    部分撤回（如服务协议）等同于注销账号。协议受 7 日内删除规则约束。
                  </div>
                </div>

                <label className="block">
                  <span className="text-[12px] font-medium">撤回原因（监管要求 · 必填）</span>
                  <textarea
                    name="reason"
                    rows={3}
                    required
                    placeholder="例：不再使用 AI 功能 / 已注销账户 / 不同意条款变更"
                    className="mt-1.5 w-full rounded-xl border border-border p-3 text-[13px] outline-none focus:border-foreground/30 leading-5"
                  />
                </label>

                {state.ok === false && (
                  <div className="rounded-xl bg-cat-decor-soft text-cat-decor px-3 py-2 text-[12px] flex items-start gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    {state.error}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={pending}
                    className="flex-1 h-11 rounded-full border border-border text-[13px] font-medium"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="flex-1 h-11 rounded-full bg-cat-decor text-white text-[13px] font-medium inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {pending ? "提交中…" : "确认撤回"}
                  </button>
                </div>

                <div className="text-[10px] text-muted-foreground text-center pt-2 border-t border-border">
                  撤回操作将完整记录入审计日志 · 协会 / 监管机构可查
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
