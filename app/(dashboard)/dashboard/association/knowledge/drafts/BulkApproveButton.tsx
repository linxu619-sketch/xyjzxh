"use client";

import { useState } from "react";
import { CheckCheck, Loader2 } from "lucide-react";

export function BulkApproveButton({ action, count }: {
  action: () => void | Promise<void>;
  count: number;
}) {
  const [busy, setBusy] = useState(false);
  if (count <= 0) return null;
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(`确认把全部 ${count} 条待审草稿一次性「通过并入库」吗？\n入库后前台知识库立即可见。建议先大致浏览过内容再批量通过。`)) {
          e.preventDefault();
          return;
        }
        setBusy(true);
      }}
    >
      <button
        disabled={busy}
        className="h-10 px-4 rounded-full border border-cat-build/40 bg-cat-build-soft text-cat-build text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-[0.98] disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
        全部通过并入库（{count}）
      </button>
    </form>
  );
}
