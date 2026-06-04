import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { cn } from "@/lib/cn";

export const metadata = { title: "平台文档 · 协会工作台" };
export const dynamic = "force-dynamic";

const DOCS = {
  full: { path: "public/docs/xyjzxh-platform-guide.doc", url: "/docs/xyjzxh-platform-guide.doc", dl: "信阳建装平台说明书.doc", label: "完整版（内部）", note: "含模块完成度、运维与上线要点、演示账号——供协会内部使用" },
  member: { path: "public/docs/xyjzxh-member-guide.doc", url: "/docs/xyjzxh-member-guide.doc", dl: "信阳建装会员使用指南.doc", label: "会员版（对外）", note: "聚焦平台价值与各角色用法、协会保障——可发给会员 / 公开" },
  launch: { path: "public/docs/xyjzxh-launch-checklist.doc", url: "/docs/xyjzxh-launch-checklist.doc", dl: "信阳建装上线检查清单.doc", label: "上线清单", note: "上线前检查清单 + 待接外部服务清单——供运维与上线规划" },
} as const;

export default async function GuidePreview({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  const { v } = await searchParams;
  const key = v === "member" ? "member" : v === "launch" ? "launch" : "full";
  const doc = DOCS[key];
  let html = "";
  try { html = fs.readFileSync(path.join(process.cwd(), doc.path), "utf8"); } catch { html = ""; }

  return (
    <AssociationShell title="平台文档" subtitle="平台说明书在线预览，可下载 Word 版（完整版 / 会员版）">
      {/* 版本切换 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(["full", "member", "launch"] as const).map((k) => (
          <Link
            key={k}
            href={`/dashboard/association/docs${k === "full" ? "" : `?v=${k}`}`}
            className={cn(
              "h-9 px-4 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5 border transition-colors",
              k === key ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground border-border hover:bg-surface",
            )}
          >
            {DOCS[k].label}
          </Link>
        ))}
        <a
          href={doc.url}
          download={doc.dl}
          className="ml-auto h-9 px-4 rounded-full bg-brand text-white text-[13px] font-medium inline-flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95"
        >
          <Download className="h-4 w-4" /> 下载本版 Word
        </a>
      </div>

      <div className="mb-3 inline-flex items-center gap-2 text-[12px] text-muted-foreground">
        <FileText className="h-3.5 w-3.5" /> {doc.note}
      </div>

      {html ? (
        <iframe title="文档预览" srcDoc={html} className="w-full h-[74vh] rounded-2xl border border-border bg-white" />
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-[13px] text-muted-foreground">
          文档暂不可用，请稍后重试或直接下载。
        </div>
      )}
    </AssociationShell>
  );
}
