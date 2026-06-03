"use client";

import { useActionState, useEffect, useState } from "react";
import { Sparkles, Plus, Loader2, AlertCircle, MessageSquareText } from "lucide-react";
import { draftKnowledgeAction, addKnowledgeAction, type DraftState } from "./actions";

const INIT: DraftState = { ok: null };
const INPUT = "w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30";
const TA = "w-full rounded-xl border border-border bg-background p-3.5 text-[13px] leading-6 outline-none focus:border-foreground/30";

export function KnowledgeComposer({ emp, name, recent }: { emp: string; name: string; recent: { q: string; count: number }[] }) {
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [keywords, setKeywords] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [draft, draftAction, drafting] = useActionState(draftKnowledgeAction, INIT);

  useEffect(() => {
    if (draft.ok === true) {
      setTitle(draft.title);
      setKeywords(draft.keywords);
      setContent(draft.content);
      if (!source) setSource("AI 提炼");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  return (
    <div className="rounded-2xl border border-border bg-background p-5 mb-6 space-y-5">
      {/* AI 从问题提炼草稿 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-cat-decor-soft text-cat-decor"><Sparkles className="h-4 w-4" /></span>
          <div className="text-[15px] font-semibold">从真实问题学习 · AI 起草词条</div>
        </div>
        <form action={draftAction} className="space-y-2.5">
          <input type="hidden" name="emp" value={emp} />
          <textarea
            name="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={2}
            placeholder={`粘贴一个用户问题 / 话题，让 AI 为「${name}」起草知识词条`}
            className={TA}
          />
          {recent.length > 0 && (
            <div className="flex items-start gap-2">
              <MessageSquareText className="h-3.5 w-3.5 text-muted-foreground mt-1.5 shrink-0" />
              <div className="flex flex-wrap gap-1.5">
                {recent.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setTopic(item.q)}
                    className="text-[12px] rounded-full bg-surface pl-2.5 pr-1.5 py-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground inline-flex items-center gap-1.5"
                    title={`${item.q}（被问 ${item.count} 次）`}
                  >
                    <span className="max-w-[220px] truncate">{item.q}</span>
                    {item.count > 1 && <span className="shrink-0 rounded-full bg-cat-decor/15 text-cat-decor text-[10px] font-semibold px-1.5 tabular-nums">{item.count}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={drafting} className="h-10 px-4 rounded-full bg-cat-decor text-white text-[13px] font-medium inline-flex items-center gap-1.5 disabled:opacity-60">
              {drafting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {drafting ? "AI 起草中…" : "AI 提炼草稿"}
            </button>
            {draft.ok === false && (
              <span className="text-[12px] text-cat-decor inline-flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{draft.error}</span>
            )}
            {draft.ok === true && (
              <span className="text-[12px] text-accent-tea">已生成草稿，请审核后保存 ↓</span>
            )}
          </div>
        </form>
      </div>

      {/* 审核 + 入库（可手动填写或编辑 AI 草稿）*/}
      <form action={addKnowledgeAction} className="space-y-3 pt-4 border-t border-border">
        <input type="hidden" name="emp" value={emp} />
        <div className="text-[13px] font-medium text-muted-foreground">确认入库（可手动编辑）</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题" className={INPUT} required />
          <input name="source" value={source} onChange={(e) => setSource(e.target.value)} placeholder="来源（可选）" className={INPUT} />
        </div>
        <input name="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="关键词（逗号/空格分隔）" className={INPUT} />
        <textarea name="content" value={content} onChange={(e) => setContent(e.target.value)} rows={3} placeholder="知识内容" className={TA} required />
        <button type="submit" className="h-10 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> 添加到知识库
        </button>
      </form>
    </div>
  );
}
