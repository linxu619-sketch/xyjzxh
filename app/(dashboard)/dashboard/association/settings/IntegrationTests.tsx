"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { testRegulatorAction, testEqianbaoAction } from "./actions";

type Result =
  | { ok: true; latencyMs?: number }
  | { ok: false; error?: string }
  | null;

function ResultPill({ result }: { result: Result }) {
  if (!result) return null;
  if (result.ok) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-accent-tea font-medium">
        <CheckCircle2 className="h-3 w-3" /> 通{result.latencyMs ? ` · ${result.latencyMs}ms` : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-cat-decor font-medium max-w-[180px] truncate" title={result.error}>
      <AlertCircle className="h-3 w-3" /> {result.error || "失败"}
    </span>
  );
}

export function TestRegulator({
  target,
  disabled,
}: {
  target: "provincial" | "city";
  disabled?: boolean;
}) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<Result>(null);

  return (
    <div className="inline-flex items-center gap-2">
      <ResultPill result={result} />
      <button
        type="button"
        disabled={pending || disabled}
        onClick={() =>
          start(async () => {
            const r = await testRegulatorAction(target);
            setResult(r.ok ? { ok: true, latencyMs: r.latencyMs } : { ok: false, error: r.error });
          })
        }
        className="inline-flex items-center gap-1 h-7 px-3 rounded-full border border-border text-[11px] hover:bg-surface disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
        测试连接
      </button>
    </div>
  );
}

export function TestEqianbao({ disabled }: { disabled?: boolean }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<Result>(null);

  return (
    <div className="inline-flex items-center gap-2">
      <ResultPill result={result} />
      <button
        type="button"
        disabled={pending || disabled}
        onClick={() =>
          start(async () => {
            const r = await testEqianbaoAction();
            setResult(r.ok ? { ok: true } : { ok: false, error: r.error });
          })
        }
        className="inline-flex items-center gap-1 h-7 px-3 rounded-full border border-border text-[11px] hover:bg-surface disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
        测试连接
      </button>
    </div>
  );
}
