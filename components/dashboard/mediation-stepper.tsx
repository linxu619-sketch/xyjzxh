import { Check, XCircle } from "lucide-react";
import type { MediationStatus } from "@/lib/data/mediations";

/* 调解进度条：待受理 → 受理中 → 已结案（驳回为终止旁支）。
   协会端与业主端共用，仅状态驱动，无交互。 */
export function MediationStepper({ status, rejectedHint }: { status: MediationStatus; rejectedHint?: string }) {
  if (status === "rejected") {
    return (
      <div className="rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 flex items-center gap-2.5 text-[13px]">
        <XCircle className="h-5 w-5 shrink-0" />
        <div><b>已驳回</b> —— {rejectedHint ?? "该申请未予受理，流程终止。"}</div>
      </div>
    );
  }
  const steps = ["待受理", "受理中", "已结案"];
  const idx = status === "pending" ? 0 : status === "accepted" ? 1 : 2;
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="text-[12px] text-muted-foreground mb-4">处理进度</div>
      <ol className="flex items-center">
        {steps.map((s, i) => {
          const doneStep = i < idx || (i === 2 && idx === 2);
          const current = i === idx && !doneStep;
          return (
            <li key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <span className={`h-8 w-8 rounded-full inline-flex items-center justify-center text-[13px] font-semibold ring-4 ${doneStep ? "bg-accent-tea text-white ring-accent-tea/15" : current ? "bg-brand text-white ring-brand/15" : "bg-surface text-muted-foreground ring-transparent"}`}>
                  {doneStep ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className={`text-[12px] whitespace-nowrap ${doneStep || current ? "font-medium text-foreground" : "text-muted-foreground"}`}>{s}</span>
              </div>
              {i < steps.length - 1 && <span className={`h-0.5 flex-1 mx-2 mb-5 rounded ${i < idx ? "bg-accent-tea" : "bg-border"}`} />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
