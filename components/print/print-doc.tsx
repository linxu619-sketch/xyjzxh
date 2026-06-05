"use client";

import { Printer } from "lucide-react";
import { SITE } from "@/lib/site";

/* 顶部工具栏（打印 / 另存为 PDF）。打印时自动隐藏（.no-print）。 */
export function PrintBar({ hint }: { hint?: string }) {
  return (
    <div className="no-print mb-4 flex items-center justify-between gap-3 flex-wrap">
      <span className="text-[12px] text-muted-foreground">{hint ?? "下方为 A4 公文预览，可直接打印或「另存为 PDF」。"}</span>
      <button
        onClick={() => window.print()}
        className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform"
      >
        <Printer className="h-3.5 w-3.5" /> 打印 / 下载 PDF
      </button>
    </div>
  );
}

/* 协会信笺抬头（套用协会 VI：青绿 #267C7C + 官方圆形徽章 Logo） */
export function Letterhead({ title, docNo, date }: { title: string; docNo?: string; date?: string }) {
  return (
    <header className="mb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/seal.png" alt="信阳市建筑装饰装修协会" className="h-14 w-14 object-contain shrink-0" />
          <div className="min-w-0">
            <div className="text-[22px] font-bold tracking-tight text-[#267c7c] leading-tight">{SITE.name}</div>
            <div className="text-[9px] tracking-[0.18em] text-[#267c7c]/70 mt-0.5">XINYANG BUILDING DECORATION ASSOCIATION</div>
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground text-right leading-5 shrink-0">
          电话：{SITE.tel}<br />{SITE.address}
        </div>
      </div>
      <div className="mt-2 border-t-[3px] border-[#267c7c]" />
      <h1 className="mt-5 text-center text-[20px] font-semibold tracking-tight">{title}</h1>
      {(docNo || date) && (
        <div className="mt-4 flex items-center justify-between text-[12px] text-muted-foreground">
          <span>编号：{docNo ?? "—"}</span>
          <span>日期：{date ?? "—"}</span>
        </div>
      )}
    </header>
  );
}

/* 公文信息表（两列 key/value，带边框，打印友好） */
export function DocTable({ rows }: { rows: { k: string; v: React.ReactNode }[] }) {
  return (
    <table className="w-full border-collapse text-[13px]">
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <th className="border border-[#ccc] bg-[#f5f5f5] px-3 py-1.5 text-left font-medium align-top w-[120px] whitespace-nowrap">{r.k}</th>
            <td className="border border-[#ccc] px-3 py-1.5 align-top leading-6">{r.v || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* 落款 / 盖章栏
   - line.value 有值 = 系统已记录的经办人/时间，直接打印在签名线上（单据与流程挂钩）
   - 无值 = 留空线供手写签字 / 盖章 */
export function SealFooter({ lines, date }: { lines?: { label: string; value?: string }[]; date?: string }) {
  const items = lines ?? [
    { label: "经办人（签字）" },
    { label: "审核人（签字）" },
    { label: "当事人（签字）" },
    { label: "协会（盖章）" },
  ];
  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-x-10 gap-y-5 text-[13px]">
        {items.map((it, i) => (
          <div key={i} className="flex items-end gap-2">
            <span className="text-muted-foreground whitespace-nowrap">{it.label}：</span>
            {it.value
              ? <span className="flex-1 border-b border-[#999] h-6 font-medium pb-0.5">{it.value}</span>
              : <span className="flex-1 border-b border-[#999] h-6" />}
          </div>
        ))}
      </div>
      <div className="mt-6 text-right text-[12px] text-muted-foreground">{date ? `出具日期：${date}` : "　　　　年　　月　　日"}</div>
    </div>
  );
}
