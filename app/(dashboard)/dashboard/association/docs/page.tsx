import fs from "node:fs";
import path from "node:path";
import { Download, FileText } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";

export const metadata = { title: "平台说明书 · 协会工作台" };
export const dynamic = "force-dynamic";

const DOC_PATH = "public/docs/xyjzxh-platform-guide.doc";
const DOC_URL = "/docs/xyjzxh-platform-guide.doc";

export default function GuidePreview() {
  let html = "";
  try {
    html = fs.readFileSync(path.join(process.cwd(), DOC_PATH), "utf8");
  } catch {
    html = "";
  }

  return (
    <AssociationShell
      title="平台说明书"
      subtitle="《平台现状总览 · 使用说明书》在线预览，可下载 Word 版"
    >
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex items-center gap-2 text-[13px] text-muted-foreground">
          <FileText className="h-4 w-4" /> 文档随平台版本更新；下载后可用 Word / WPS 打开、打印或分享
        </div>
        <a
          href={DOC_URL}
          download="信阳建装平台说明书.doc"
          className="shrink-0 h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center justify-center gap-1.5 hover:bg-brand transition-colors active:scale-95"
        >
          <Download className="h-4 w-4" /> 下载 Word 说明书
        </a>
      </div>

      {html ? (
        <iframe
          title="平台说明书预览"
          srcDoc={html}
          className="w-full h-[78vh] rounded-2xl border border-border bg-white"
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-[13px] text-muted-foreground">
          说明书文档暂不可用，请稍后重试或直接下载。
        </div>
      )}
    </AssociationShell>
  );
}
