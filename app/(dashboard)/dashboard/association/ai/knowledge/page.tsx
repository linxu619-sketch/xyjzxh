import Link from "next/link";
import { Trash2, Save, Power, BookOpen } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { AI_EMPLOYEES } from "@/lib/site";
import { listKnowledge, topQuestions } from "@/lib/ai/knowledge-source";
import {
  updateKnowledgeAction,
  deleteKnowledgeAction,
  toggleKnowledgeAction,
} from "./actions";
import { KnowledgeComposer } from "./KnowledgeComposer";
import { cn } from "@/lib/cn";

export const metadata = { title: "AI 知识库 · 协会工作台" };

const INPUT = "w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30";
const TEXTAREA = "w-full rounded-xl border border-border bg-background p-3.5 text-[13px] leading-6 outline-none focus:border-foreground/30";

export default async function KnowledgeAdmin({
  searchParams,
}: {
  searchParams: Promise<{ emp?: string }>;
}) {
  const { emp: e } = await searchParams;
  const emp = AI_EMPLOYEES.some((a) => a.key === e) ? (e as string) : AI_EMPLOYEES[0].key;
  const current = AI_EMPLOYEES.find((a) => a.key === emp)!;
  const entries = listKnowledge(emp);

  return (
    <AssociationShell
      title="AI 知识库"
      subtitle="为每位 AI 员工维护专业知识；聊天时按问题自动检索注入。越维护越专业。"
    >
      {/* 员工切换 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {AI_EMPLOYEES.map((a) => {
          const n = listKnowledge(a.key).length;
          return (
            <Link
              key={a.key}
              href={`?emp=${a.key}`}
              className={cn(
                "px-3 h-9 rounded-full text-[13px] inline-flex items-center gap-1.5 transition-colors",
                a.key === emp ? "bg-foreground text-background" : "bg-surface text-muted-foreground hover:bg-surface-2",
              )}
            >
              <span>{a.emoji}</span>
              {a.name}
              <span className={cn("text-[11px]", a.key === emp ? "opacity-70" : "opacity-50")}>{n}</span>
            </Link>
          );
        })}
      </div>

      {/* 新增词条（AI 从真实问题提炼 + 人审入库）*/}
      <KnowledgeComposer emp={emp} name={current.name} recent={topQuestions(emp)} />

      {/* 词条列表 */}
      <div className="flex items-center gap-2 mb-3 text-[13px] text-muted-foreground">
        <BookOpen className="h-4 w-4" /> 共 {entries.length} 条知识
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-[13px] text-muted-foreground">
          这位员工还没有知识词条，用上面的表单添加第一条吧。
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((k) => (
            <div key={k.id} className={cn("rounded-2xl border bg-background p-4", k.enabled ? "border-border" : "border-border/60 opacity-70")}>
              <form action={updateKnowledgeAction} className="space-y-2.5">
                <input type="hidden" name="emp" value={emp} />
                <input type="hidden" name="id" value={k.id} />
                <div className="flex items-center gap-2">
                  <input name="title" defaultValue={k.title} className={cn(INPUT, "!h-10 font-semibold")} />
                  {!k.enabled && <span className="text-[11px] text-cat-decor whitespace-nowrap">已停用</span>}
                </div>
                <input name="keywords" defaultValue={k.keywords.join(", ")} placeholder="关键词" className={cn(INPUT, "!h-10 !text-[13px]")} />
                <textarea name="content" defaultValue={k.content} rows={3} className={TEXTAREA} />
                <input name="source" defaultValue={k.source ?? ""} placeholder="来源（可选）" className={cn(INPUT, "!h-10 !text-[13px]")} />
                <div className="flex items-center gap-2 pt-1">
                  <button type="submit" className="h-9 px-3.5 rounded-full bg-foreground text-background text-[12px] font-medium inline-flex items-center gap-1.5">
                    <Save className="h-3.5 w-3.5" /> 保存
                  </button>
                </div>
              </form>
              {/* 启停 / 删除（独立表单，避免嵌套） */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                <form action={toggleKnowledgeAction}>
                  <input type="hidden" name="emp" value={emp} />
                  <input type="hidden" name="id" value={k.id} />
                  <input type="hidden" name="enabled" value={k.enabled ? "0" : "1"} />
                  <button type="submit" className="h-8 px-3 rounded-full bg-surface text-[12px] inline-flex items-center gap-1.5 hover:bg-surface-2">
                    <Power className="h-3.5 w-3.5" /> {k.enabled ? "停用" : "启用"}
                  </button>
                </form>
                <form action={deleteKnowledgeAction}>
                  <input type="hidden" name="emp" value={emp} />
                  <input type="hidden" name="id" value={k.id} />
                  <button type="submit" className="h-8 px-3 rounded-full text-cat-decor text-[12px] inline-flex items-center gap-1.5 hover:bg-cat-decor-soft">
                    <Trash2 className="h-3.5 w-3.5" /> 删除
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </AssociationShell>
  );
}
