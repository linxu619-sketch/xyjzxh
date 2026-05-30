"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { SignAgreement, type SignResult } from "./sign-agreement";
import type { AgreementTemplate } from "@/lib/data/agreements";

/* ============================================================
   批量签署器
   ------------------------------------------------------------
   按"协议堆栈"逐份签 · 全部签完才能继续注册流程
   左侧是已签 / 当前 / 未签的列表，右侧是当前协议
   ============================================================ */

export function SignStack({
  templates,
  signerRealName,
  onAllSigned,
}: {
  templates: AgreementTemplate[];
  signerRealName?: string;
  onAllSigned?: (results: SignResult[]) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<SignResult[]>([]);
  const current = templates[idx];

  const allDone = useMemo(() => results.length >= templates.length, [results, templates]);

  function handleSigned(r: SignResult) {
    const next = [...results, r];
    setResults(next);
    if (idx < templates.length - 1) {
      // 短暂延迟，让用户看到 ✓
      setTimeout(() => setIdx(idx + 1), 800);
    } else {
      setTimeout(() => onAllSigned?.(next), 600);
    }
  }

  if (allDone) {
    return (
      <div className="rounded-3xl border border-accent-tea/30 bg-[#e6f7f1] p-7 text-center">
        <ShieldCheck className="h-12 w-12 mx-auto text-accent-tea" />
        <div className="mt-3 text-[18px] font-semibold text-accent-tea">{templates.length} 份协议全部已签</div>
        <div className="mt-2 text-[12px] text-muted-foreground">已写入协会平台 · 你可以继续完成注册</div>
        <ul className="mt-5 space-y-1.5 text-left max-w-md mx-auto">
          {results.map((r, i) => (
            <li key={i} className="rounded-xl bg-background px-4 py-2.5 text-[12px] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent-tea shrink-0" />
              <span className="flex-1 truncate">{templates[i].title}</span>
              <code className="font-mono text-[10px] text-muted-foreground">v{r.templateVersion}</code>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4">
      {/* 左侧进度列表 */}
      <aside className="space-y-2">
        <div className="text-[10px] tracking-widest text-muted-foreground uppercase mb-2 px-1">
          签署进度 {results.length} / {templates.length}
        </div>
        {templates.map((t, i) => {
          const done = i < results.length;
          const active = i === idx;
          return (
            <div
              key={t.id}
              className={cn(
                "rounded-xl px-3 py-2.5 text-[12px] border transition-colors",
                done
                  ? "bg-[#e6f7f1] border-accent-tea/30 text-accent-tea"
                  : active
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background border-border text-muted-foreground",
              )}
            >
              <div className="flex items-center gap-2">
                {done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="font-medium truncate">{t.title}</span>
              </div>
              <div className="mt-1 text-[10px] opacity-70 truncate pl-5">v{t.version} · {t.category}</div>
            </div>
          );
        })}
      </aside>

      {/* 右侧当前协议 */}
      <div>
        {current && (
          <SignAgreement
            key={current.id}
            template={current}
            signerRealName={signerRealName}
            onSigned={handleSigned}
          />
        )}
      </div>
    </div>
  );
}
