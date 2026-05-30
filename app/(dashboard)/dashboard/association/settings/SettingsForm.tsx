"use client";

import { useActionState } from "react";
import { Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { saveSettingsAction, type SaveResult } from "./actions";

const INITIAL_RESULT: SaveResult = { ok: null };

export function SettingsForm({ children }: { children: React.ReactNode }) {
  const [state, action, pending] = useActionState<SaveResult, FormData>(
    saveSettingsAction,
    INITIAL_RESULT,
  );

  return (
    <form action={action} className="space-y-6">
      {/* sticky 顶部保存条 */}
      <div className="sticky top-0 z-20 -mx-6 md:-mx-10 px-6 md:px-10 py-3 bg-surface/85 backdrop-blur border-b border-border flex items-center justify-between gap-3">
        <div className="text-[12px] flex-1 min-w-0 truncate">
          {pending && (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> 正在保存到 .runtime-settings.json…
            </span>
          )}
          {!pending && state.ok === true && (
            <span className="inline-flex items-center gap-1.5 text-accent-tea font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> 已保存 · {new Date(state.savedAt).toLocaleTimeString("zh-CN", { hour12: false })}
              {state.aiProvider && state.aiProvider !== "auto" && (
                <span className="text-muted-foreground font-normal">· AI 提供方：{state.aiProvider}</span>
              )}
            </span>
          )}
          {!pending && state.ok === false && (
            <span className="inline-flex items-center gap-1.5 text-cat-decor font-medium">
              <AlertCircle className="h-3.5 w-3.5" /> {state.error}
            </span>
          )}
          {!pending && state.ok === null && (
            <span className="text-muted-foreground">修改后点「保存全部」生效；密码 / API key 已脱敏，留空则保持不变</span>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="h-9 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          保存全部
        </button>
      </div>

      {children}
    </form>
  );
}
