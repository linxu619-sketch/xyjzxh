import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Plus, Rss } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { DataTable } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { listSources } from "@/lib/data/knowledge-sources-source";
import { KNOWLEDGE_CATEGORIES } from "@/lib/data/knowledge";
import { addSourceAction } from "../actions";

export const metadata = { title: "抓取来源管理 · 知识库" };

const INPUT = "h-10 w-full rounded-none border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/50";
const KIND_LABEL: Record<string, string> = { sample: "样例", rss: "RSS", html: "网页" };

function fmt(ts?: number) {
  if (!ts) return "未运行";
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function SourcesPage() {
  const sources = listSources();
  const base = "/dashboard/association/knowledge/sources";

  return (
    <AssociationShell title="抓取来源管理" subtitle="AI 每日从这些政府 / 行业来源抓取更新 · 点行进入启停或删除">
      <Link href="/dashboard/association/knowledge" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回知识库管理
      </Link>

      {/* 添加来源 */}
      <details className="rounded-2xl border border-border bg-background mb-6">
        <summary className="px-5 py-3.5 cursor-pointer list-none flex items-center gap-2 text-[14px] font-semibold">
          <Plus className="h-4 w-4" /> 添加来源
        </summary>
        <form action={addSourceAction} className="px-5 pb-5 pt-1 space-y-3">
          <div>
            <label className="block text-[12px] font-medium mb-1.5">来源名称 <span className="text-cat-decor">*</span></label>
            <input name="name" required placeholder="如：信阳市住房和城乡建设局" className={INPUT} />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5">网址 / Feed 地址 <span className="text-cat-decor">*</span></label>
            <input name="url" required placeholder="https://… 政策栏目页或 RSS 地址" className={INPUT} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium mb-1.5">抓取方式</label>
              <select name="kind" defaultValue="html" className={INPUT}>
                <option value="html">网页(按链接提取)</option>
                <option value="rss">RSS / Atom feed</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5">默认归类</label>
              <select name="category" defaultValue="地方政策" className={INPUT}>
                {KNOWLEDGE_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.key}</option>)}
              </select>
            </div>
          </div>
          <button className="h-10 px-5 rounded-none bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Plus className="h-4 w-4" /> 添加</button>
        </form>
      </details>

      <DataTable
        head={["来源名称", "方式", "默认归类", "状态", "上次运行"]}
        empty="暂无来源"
        rows={sources.map((s) => [
          <Link key="n" href={`${base}/${s.id}`} className="font-medium hover:text-brand inline-flex items-center gap-1">{s.name}<ArrowUpRight className="h-3 w-3 text-muted-foreground" /></Link>,
          <span key="k" className="text-[12px] text-muted-foreground">{KIND_LABEL[s.kind] ?? s.kind}</span>,
          <Badge key="c" tone="design">{s.category}</Badge>,
          s.enabled ? <span key="e" className="text-[11px] text-cat-build font-medium">● 启用</span> : <span key="d" className="text-[11px] text-muted-foreground">○ 停用</span>,
          <span key="r" className="text-[12px] text-muted-foreground">{fmt(s.lastRunAt)}</span>,
        ])}
      />
    </AssociationShell>
  );
}
