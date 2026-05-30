"use client";

import { Printer, Download } from "lucide-react";

export function PrintButton() {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => window.print()}
        className="h-9 px-3.5 rounded-full bg-accent-yellow text-foreground text-[12px] font-semibold inline-flex items-center gap-1.5"
      >
        <Printer className="h-3.5 w-3.5" /> 打印
      </button>
      <button
        onClick={() => {
          // 浏览器打印 → 另存为 PDF
          window.print();
        }}
        className="h-9 px-3.5 rounded-full bg-white/10 text-background text-[12px] inline-flex items-center gap-1.5"
      >
        <Download className="h-3.5 w-3.5" /> 另存 PDF
      </button>
    </div>
  );
}
