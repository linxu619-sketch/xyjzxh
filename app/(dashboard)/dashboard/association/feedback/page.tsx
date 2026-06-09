import { MessageSquareHeart, Phone, Mail, Check, RotateCcw } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { Badge } from "@/components/ui/badge";
import { listFeedback } from "@/lib/data/feedback-source";
import { markFeedbackAction } from "./actions";

export const metadata = { title: "留言反馈 · 协会工作台" };

function fmt(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }

export default async function FeedbackAdmin() {
  const all = listFeedback();
  const news = all.filter((f) => f.status === "new").length;
  const handled = all.length - news;

  return (
    <AssociationShell title="留言反馈" subtitle={`共 ${all.length} 条 · 待处理 ${news}`}>
      <div className="mb-4 rounded-2xl border border-border bg-surface/50 px-4 py-2.5 text-[12px] text-muted-foreground leading-5">
        来自「联系我们 · 给协会留个言」的公开留言（无需登录即可提交）。秘书处可在此查看并标记处理。
      </div>

      <StatFilters
        items={[
          { key: "all", label: "全部留言", value: all.length, color: "text-cat-decor" },
          { key: "new", label: "待处理", value: news, color: "text-accent-yellow" },
          { key: "handled", label: "已处理", value: handled, color: "text-accent-tea" },
        ]}
      />

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold inline-flex items-center gap-1.5"><MessageSquareHeart className="h-4 w-4 text-cat-decor" /> 留言列表</div>
        {all.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">暂无留言。访客在「联系我们」页提交后会出现在这里。</div>
        ) : (
          <ul className="divide-y divide-border">
            {all.map((f) => (
              <li key={f.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap text-[13px]">
                      <span className="font-medium">{f.name || "匿名"}</span>
                      {f.phone && <a href={`tel:${f.phone}`} className="inline-flex items-center gap-1 text-[12px] text-brand hover:underline"><Phone className="h-3 w-3" />{f.phone}</a>}
                      {f.email && <a href={`mailto:${f.email}`} className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground"><Mail className="h-3 w-3" />{f.email}</a>}
                      <Badge tone={f.status === "new" ? "yellow" : "tea"}>{f.status === "new" ? "待处理" : "已处理"}</Badge>
                      <span className="text-[11px] text-muted-foreground">{fmt(f.createdAt)}</span>
                    </div>
                    <p className="mt-1.5 text-[13px] text-foreground/90 leading-6 whitespace-pre-wrap">{f.content}</p>
                  </div>
                  <form action={markFeedbackAction} className="shrink-0">
                    <input type="hidden" name="id" value={f.id} />
                    <input type="hidden" name="status" value={f.status === "new" ? "handled" : "new"} />
                    {f.status === "new" ? (
                      <button className="h-9 px-3.5 rounded-full bg-foreground text-background text-[12px] font-medium inline-flex items-center gap-1 hover:bg-brand active:scale-95"><Check className="h-3.5 w-3.5" /> 标记已处理</button>
                    ) : (
                      <button className="h-9 px-3.5 rounded-full border border-border text-[12px] inline-flex items-center gap-1 hover:bg-surface active:scale-95"><RotateCcw className="h-3.5 w-3.5" /> 恢复待处理</button>
                    )}
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AssociationShell>
  );
}
