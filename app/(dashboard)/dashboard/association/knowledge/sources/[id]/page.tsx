import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Power, Trash2, Rss } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getSource } from "@/lib/data/knowledge-sources-source";
import { toggleSourceAction, deleteSourceAction } from "../../actions";

export const metadata = { title: "来源详情 · 抓取来源管理" };

const KIND_LABEL: Record<string, string> = { sample: "样例来源", rss: "RSS / Atom feed", html: "网页(按链接提取)" };

function fmt(ts?: number) {
  if (!ts) return "未运行";
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <div className="w-24 shrink-0 text-[12px] text-muted-foreground">{label}</div>
      <div className="flex-1 text-[13px] break-all">{children}</div>
    </div>
  );
}

export default async function SourceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = getSource(id);
  if (!s) notFound();
  const isExternal = /^https?:\/\//.test(s.url);

  return (
    <AssociationShell title="来源详情" subtitle={s.name}>
      <Link href="/dashboard/association/knowledge/sources" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回来源列表
      </Link>

      <div className="rounded-2xl border border-border bg-background p-5 max-w-2xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-9 w-9 rounded-xl bg-cat-design-soft text-cat-design inline-flex items-center justify-center"><Rss className="h-4 w-4" /></span>
          <div className="text-[15px] font-semibold">{s.name}</div>
          {s.enabled ? <Badge tone="build">启用中</Badge> : <Badge tone="design">已停用</Badge>}
        </div>

        <Field label="抓取方式">{KIND_LABEL[s.kind] ?? s.kind}</Field>
        <Field label="默认归类"><Badge tone="design">{s.category}</Badge></Field>
        <Field label="地址">
          {isExternal ? (
            <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand hover:underline">{s.url} <ExternalLink className="h-3.5 w-3.5 shrink-0" /></a>
          ) : (
            <span className="text-muted-foreground">{s.url}</span>
          )}
        </Field>
        <Field label="上次运行">{fmt(s.lastRunAt)}</Field>

        <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 flex-wrap">
          <form action={toggleSourceAction}>
            <input type="hidden" name="id" value={s.id} />
            <input type="hidden" name="enabled" value={s.enabled ? "0" : "1"} />
            <button className="h-9 px-4 rounded-full bg-surface text-[12px] inline-flex items-center gap-1.5 hover:bg-surface-2"><Power className="h-3.5 w-3.5" /> {s.enabled ? "停用此来源" : "启用此来源"}</button>
          </form>
          <form action={deleteSourceAction}>
            <input type="hidden" name="id" value={s.id} />
            <button className="h-9 px-4 rounded-full text-cat-decor text-[12px] inline-flex items-center gap-1.5 hover:bg-cat-decor-soft"><Trash2 className="h-3.5 w-3.5" /> 删除来源</button>
          </form>
        </div>
      </div>

      <p className="mt-4 text-[12px] text-muted-foreground max-w-2xl leading-5">提示：网页来源按页面内的链接文字(含「通知/公告/政策/标准」等关键词)提取候选,不同官网结构差异较大,若抓不到可改用该栏目的 RSS 地址,或在草稿箱核对后手动补录。</p>
    </AssociationShell>
  );
}
