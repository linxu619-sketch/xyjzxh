"use client";

import { useState } from "react";
import { Send, CheckCircle2, XCircle, Archive, Loader2, X } from "lucide-react";
import { ACTION_META, type WorkflowAction, type WorkflowStatus } from "@/lib/agreements/workflow";
import { performWorkflowAction } from "./actions";
import { cn } from "@/lib/cn";

export function WorkflowActions({
  templateId,
  currentStatus,
  actions,
}: {
  templateId: string;
  currentStatus: WorkflowStatus;
  actions: WorkflowAction[];
}) {
  const [pendingAction, setPendingAction] = useState<WorkflowAction | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  if (actions.length === 0) {
    return (
      <div className="rounded-2xl bg-surface p-4 text-[12px] text-muted-foreground text-center">
        当前状态无可执行动作
      </div>
    );
  }

  async function execute(action: WorkflowAction) {
    const meta = ACTION_META[action];
    if (meta.requiresReason && !reason.trim()) {
      setPendingAction(action);
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("templateId", templateId);
    fd.append("action", action);
    fd.append("reason", reason);
    const r = await performWorkflowAction(fd);
    setResult(r);
    setLoading(false);
    if (r.ok) {
      setPendingAction(null);
      setReason("");
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => {
          const meta = ACTION_META[a];
          const icon =
            a.includes("reject") ? <XCircle className="h-3.5 w-3.5" /> :
            a === "archive" ? <Archive className="h-3.5 w-3.5" /> :
            a === "publish" || a === "secretary_approve" || a === "legal_approve" ? <CheckCircle2 className="h-3.5 w-3.5" /> :
            <Send className="h-3.5 w-3.5" />;
          return (
            <button
              key={a}
              onClick={() => {
                if (meta.requiresReason) setPendingAction(a);
                else execute(a);
              }}
              disabled={loading}
              className={cn(
                "h-10 px-4 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-60",
                meta.variant === "danger"
                  ? "border border-cat-decor text-cat-decor hover:bg-cat-decor-soft"
                  : "bg-foreground text-background hover:bg-brand",
              )}
            >
              {icon}
              {meta.label}
            </button>
          );
        })}
      </div>

      {result && (
        <div className={cn(
          "mt-3 rounded-xl p-3 text-[12px] flex items-start gap-2",
          result.ok ? "bg-[#e6f7f1] text-accent-tea" : "bg-cat-decor-soft text-cat-decor",
        )}>
          {result.ok ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> : <XCircle className="h-4 w-4 mt-0.5 shrink-0" />}
          <span>{result.msg}</span>
        </div>
      )}

      {/* 需要填理由的弹窗 */}
      {pendingAction && (
        <div
          onClick={() => !loading && setPendingAction(null)}
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-background border border-border shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <div className="text-[14px] font-semibold flex-1">{ACTION_META[pendingAction].label}</div>
              <button onClick={() => setPendingAction(null)} className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-surface">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <label className="block">
                <span className="text-[12px] font-medium">操作理由 · 监管要求</span>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  required
                  placeholder="请简述本次操作的原因（写入审计日志，不可修改）"
                  className="mt-1.5 w-full rounded-xl border border-border p-3 text-[13px] outline-none focus:border-foreground/30 leading-5"
                />
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPendingAction(null)}
                  disabled={loading}
                  className="flex-1 h-11 rounded-full border border-border text-[13px] font-medium"
                >
                  取消
                </button>
                <button
                  onClick={() => execute(pendingAction)}
                  disabled={loading || !reason.trim()}
                  className={cn(
                    "flex-1 h-11 rounded-full text-white text-[13px] font-medium inline-flex items-center justify-center gap-1.5 disabled:opacity-60",
                    ACTION_META[pendingAction].variant === "danger" ? "bg-cat-decor" : "bg-foreground",
                  )}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "确认"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
