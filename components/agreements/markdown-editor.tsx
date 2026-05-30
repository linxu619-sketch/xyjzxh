"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bold, Italic, List, ListOrdered, Quote, Link as LinkIcon, Code,
  Heading1, Heading2, Eye, Edit3, Save, AlertCircle, Sparkles, Loader2,
} from "lucide-react";
import { cn } from "@/lib/cn";

type Tab = "edit" | "split" | "preview";

export function MarkdownEditor({
  initialContent,
  initialHighlights = [],
  onSave,
  onScanRisks,
}: {
  initialContent: string;
  initialHighlights?: string[];
  onSave?: (content: string, highlights: string[]) => Promise<{ ok: boolean; msg: string }>;
  onScanRisks?: (content: string) => Promise<RiskFinding[]>;
}) {
  const [content, setContent] = useState(initialContent);
  const [highlights, setHighlights] = useState<string[]>(initialHighlights);
  const [tab, setTab] = useState<Tab>("split");
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [risks, setRisks] = useState<RiskFinding[] | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // 自动隐藏 msg
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(t);
  }, [msg]);

  function insertAround(left: string, right: string = "") {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = content.slice(0, start);
    const sel = content.slice(start, end);
    const after = content.slice(end);
    const newC = before + left + sel + right + after;
    setContent(newC);
    setTimeout(() => {
      ta.focus();
      const pos = start + left.length + sel.length;
      ta.setSelectionRange(pos, pos);
    }, 0);
  }

  function prependLine(prefix: string) {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const before = content.slice(0, start);
    const lineStart = before.lastIndexOf("\n") + 1;
    setContent(content.slice(0, lineStart) + prefix + content.slice(lineStart));
  }

  async function save() {
    if (!onSave) return;
    setSaving(true);
    const r = await onSave(content, highlights);
    setMsg({ ok: r.ok, text: r.msg });
    setSaving(false);
  }

  async function scan() {
    if (!onScanRisks) return;
    setScanning(true);
    setRisks(null);
    try {
      const r = await onScanRisks(content);
      setRisks(r);
    } catch (e) {
      setMsg({ ok: false, text: `扫描失败：${String(e)}` });
    }
    setScanning(false);
  }

  return (
    <div className="rounded-3xl border border-border bg-background overflow-hidden">
      {/* 顶部工具栏 */}
      <div className="px-3 py-2 border-b border-border bg-surface flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ToolBtn onClick={() => insertAround("**", "**")} title="粗体"><Bold className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => insertAround("*", "*")} title="斜体"><Italic className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => insertAround("`", "`")} title="行内代码"><Code className="h-3.5 w-3.5" /></ToolBtn>
        <Sep />
        <ToolBtn onClick={() => prependLine("# ")} title="H1"><Heading1 className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => prependLine("## ")} title="H2"><Heading2 className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => prependLine("- ")} title="无序列表"><List className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => prependLine("1. ")} title="有序列表"><ListOrdered className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => prependLine("> ")} title="引用"><Quote className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => insertAround("[", "](url)")} title="链接"><LinkIcon className="h-3.5 w-3.5" /></ToolBtn>
        <Sep />

        <div className="ml-auto flex items-center gap-1">
          {(["edit", "split", "preview"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "h-8 px-3 rounded-full text-[11px] font-medium inline-flex items-center gap-1",
                tab === t ? "bg-foreground text-background" : "text-muted-foreground hover:bg-background",
              )}
            >
              {t === "edit" ? <><Edit3 className="h-3 w-3" /> 编辑</> :
               t === "preview" ? <><Eye className="h-3 w-3" /> 预览</> :
               <>分屏</>}
            </button>
          ))}
        </div>
      </div>

      {/* 编辑 + 预览 */}
      <div className={cn(
        "grid",
        tab === "split" ? "grid-cols-1 md:grid-cols-2" :
        tab === "edit" ? "grid-cols-1" :
        "grid-cols-1",
      )}>
        {(tab === "edit" || tab === "split") && (
          <textarea
            ref={taRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
            className="h-[480px] md:h-[600px] p-5 outline-none font-mono text-[13px] leading-6 resize-none bg-background border-r border-border"
            placeholder="# 协议标题&#10;&#10;## 第一条 ...&#10;&#10;支持 markdown 语法 · 右侧实时预览"
          />
        )}

        {(tab === "preview" || tab === "split") && (
          <div className="h-[480px] md:h-[600px] overflow-y-auto p-5 prose prose-sm max-w-none font-serif text-[13px] leading-7 bg-surface/30">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "_内容为空_"}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* 重点条款 · 单独勾选项 */}
      <div className="px-5 py-4 border-t border-border bg-surface/30">
        <div className="text-[12px] font-semibold mb-2 inline-flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 text-cat-decor" />
          重点条款（用户须单独勾选 · 民法典 §496）
        </div>
        <div className="space-y-2">
          {highlights.map((h, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-[11px] text-muted-foreground tabular-nums mt-2.5 shrink-0 w-6 text-right">{i + 1}.</span>
              <input
                value={h}
                onChange={(e) => {
                  const next = [...highlights];
                  next[i] = e.target.value;
                  setHighlights(next);
                }}
                className="flex-1 h-10 rounded-lg border border-border px-3 text-[12px] outline-none focus:border-foreground/30"
              />
              <button
                onClick={() => setHighlights(highlights.filter((_, j) => j !== i))}
                className="h-10 px-3 rounded-lg text-cat-decor text-[11px] hover:bg-cat-decor-soft"
              >
                删除
              </button>
            </div>
          ))}
          <button
            onClick={() => setHighlights([...highlights, ""])}
            className="h-9 px-3 rounded-lg border border-dashed border-border text-[12px] text-muted-foreground hover:border-foreground/30 hover:text-foreground"
          >
            + 添加重点条款
          </button>
        </div>
      </div>

      {/* AI 风险扫描结果 */}
      {risks && (
        <div className="px-5 py-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-cat-decor" />
            <span className="text-[13px] font-semibold">AI 法律风险扫描结果</span>
            <span className="text-[11px] text-muted-foreground">{risks.length} 项发现</span>
          </div>
          {risks.length === 0 ? (
            <div className="rounded-2xl bg-[#e6f7f1] text-accent-tea p-3 text-[12px]">
              ✓ AI 未发现明显风险
            </div>
          ) : (
            <ul className="space-y-2">
              {risks.map((r, i) => (
                <li key={i} className={cn(
                  "rounded-2xl p-3 border",
                  r.level === "high" ? "bg-cat-decor-soft border-cat-decor/30" :
                  r.level === "medium" ? "bg-[#fff6d6] border-accent-yellow/30" :
                  "bg-surface border-border",
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      r.level === "high" ? "bg-cat-decor text-white" :
                      r.level === "medium" ? "bg-accent-yellow text-foreground" :
                      "bg-surface-2 text-muted-foreground",
                    )}>
                      {r.level === "high" ? "高" : r.level === "medium" ? "中" : "低"}风险
                    </span>
                    <span className="text-[11px] font-medium">{r.lawRef}</span>
                  </div>
                  <div className="text-[12px] font-semibold">{r.issue}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 leading-5">
                    <b>建议：</b>{r.suggestion}
                  </div>
                  {r.quote && (
                    <div className="text-[10px] text-muted-foreground mt-1 italic font-mono bg-background rounded px-2 py-1">
                      &ldquo;{r.quote}&rdquo;
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 底部 */}
      <div className="px-5 py-3 border-t border-border bg-surface flex items-center gap-2">
        {onScanRisks && (
          <button
            onClick={scan}
            disabled={scanning || saving}
            className="h-10 px-4 rounded-full border border-border text-[12px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-60"
          >
            {scanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-cat-decor" />}
            {scanning ? "AI 扫描中…" : "AI 风险扫描"}
          </button>
        )}

        <div className="text-[11px] text-muted-foreground tabular-nums ml-auto">
          {content.length} 字符 · {content.split("\n").length} 行
        </div>

        {onSave && (
          <button
            onClick={save}
            disabled={saving}
            className="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-semibold inline-flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "保存中…" : "保存草稿"}
          </button>
        )}
      </div>

      {msg && (
        <div className={cn(
          "px-5 py-2.5 text-[12px] flex items-center gap-2",
          msg.ok ? "bg-[#e6f7f1] text-accent-tea" : "bg-cat-decor-soft text-cat-decor",
        )}>
          {msg.ok ? "✓" : "×"} {msg.text}
        </div>
      )}
    </div>
  );
}

function ToolBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="h-5 w-px bg-border mx-1" />;
}

export type RiskFinding = {
  level: "low" | "medium" | "high";
  lawRef: string;        // 法规引用
  issue: string;         // 问题简述
  suggestion: string;    // 修改建议
  quote?: string;        // 原文摘录
};
