"use client";

import Link from "next/link";
import { useState } from "react";
import { SignStack } from "@/components/agreements/sign-stack";
import { ArrowRight, ShieldCheck } from "lucide-react";
import type { AgreementTemplate } from "@/lib/data/agreements";
import type { SignResult } from "@/components/agreements/sign-agreement";

export function AgreementsClient({
  templates,
  nextHref,
}: {
  templates: AgreementTemplate[];
  nextHref: string;
}) {
  const [allDone, setAllDone] = useState(false);
  const [results, setResults] = useState<SignResult[]>([]);

  return (
    <>
      <SignStack
        templates={templates}
        onAllSigned={(rs) => {
          setResults(rs);
          setAllDone(true);
          // 演示：把签署记录写到 localStorage（落地 Supabase 后改成 API）
          if (typeof window !== "undefined") {
            const key = "demo:agreement-signatures";
            const prev = JSON.parse(localStorage.getItem(key) || "[]");
            localStorage.setItem(key, JSON.stringify([...prev, ...rs]));
          }
        }}
      />

      {allDone && (
        <div className="mt-6 rounded-3xl bg-foreground text-background p-5 md:p-7 flex items-center gap-4">
          <ShieldCheck className="h-8 w-8 text-accent-yellow shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold">{results.length} 份协议已存证 · 可继续注册</div>
            <div className="text-[11px] text-background/70 mt-0.5">签署号 ESB-2026-... · 可在「我的协议」随时下载 PDF</div>
          </div>
          <Link
            href={nextHref}
            className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-accent-yellow text-foreground text-[13px] font-semibold active:scale-95 transition-transform"
          >
            继续 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </>
  );
}
