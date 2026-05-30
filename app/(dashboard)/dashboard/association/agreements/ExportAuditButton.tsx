"use client";

import { useState } from "react";
import { Download, Loader2, CheckCircle2 } from "lucide-react";
import { exportAuditAction } from "./export-actions";

export function ExportAuditButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function go() {
    setLoading(true);
    setDone(false);
    const csv = await exportAuditAction();
    if (csv) {
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `xyjzxh-agreement-audit-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={go}
      disabled={loading}
      className="h-11 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-60 shrink-0"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> :
       done ? <CheckCircle2 className="h-4 w-4 text-accent-yellow" /> :
       <Download className="h-4 w-4" />}
      {loading ? "导出中…" : done ? "已下载" : "导出 CSV"}
    </button>
  );
}
