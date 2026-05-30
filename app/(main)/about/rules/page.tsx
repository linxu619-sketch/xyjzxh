import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Download, FileText } from "lucide-react";

export const metadata = { title: "章程制度 · 信阳市建筑装修协会" };

const DOCS = [
  { name: "信阳市建筑装修协会章程（2026 修订）",       size: "412 KB", date: "2026-03-15", hot: true },
  { name: "理事会议事规则",                          size: "186 KB", date: "2024-10-01" },
  { name: "调解委员会工作细则",                       size: "264 KB", date: "2024-06-12" },
  { name: "会员管理办法（含入会 / 退会 / 处分）",      size: "318 KB", date: "2025-12-08" },
  { name: "技术委员会标准制定流程",                   size: "152 KB", date: "2023-09-20" },
  { name: "财务管理办法",                            size: "208 KB", date: "2024-04-22" },
  { name: "AI 员工使用与数据合规规范",                size: "186 KB", date: "2026-04-01", hot: true },
];

export default function RulesPage() {
  return (
    <>
      <PageHeader
        eyebrow="ABOUT · 章程制度"
        tone="brand"
        title={<>章程与内部制度</>}
        description="协会的全部治理文件、议事规则、内部制度均向会员单位公开。"
      />
      <Container className="py-12 max-w-3xl">
        <ul className="rounded-3xl border border-border bg-background divide-y divide-border overflow-hidden">
          {DOCS.map((d) => (
            <li key={d.name} className="px-5 py-4 flex items-center gap-4 hover:bg-surface/60 transition-colors">
              <span className="h-10 w-10 rounded-xl bg-cat-build-soft text-cat-build inline-flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium flex items-center gap-2">
                  {d.name}
                  {d.hot && <span className="text-[10px] tracking-wider text-cat-decor font-semibold">NEW</span>}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">PDF · {d.size} · 修订于 {d.date}</div>
              </div>
              <button className="inline-flex items-center gap-1 h-9 px-4 rounded-full bg-foreground text-background text-[12px] font-medium shrink-0">
                <Download className="h-3 w-3" /> 下载
              </button>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
