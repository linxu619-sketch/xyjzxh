"use client";

import { useState } from "react";
import { Upload, FileText, X, Loader2, Save, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { KNOWLEDGE_CATEGORIES, type KnowledgeSection } from "@/lib/data/knowledge";

// 方角输入框（本表单全部方角，不用圆角）
const INPUT = "h-10 w-full rounded-none border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/50";
const AREA = "w-full rounded-none border border-border bg-background p-3 text-[13px] leading-6 outline-none focus:border-foreground/50";

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[12px] font-medium text-foreground mb-1.5">
      {children}
      {required && <span className="text-cat-decor ml-0.5">*</span>}
    </label>
  );
}

type Initial = {
  id?: string; title?: string; category?: string; tags?: string; excerpt?: string;
  body?: string;
  date?: string; hot?: boolean; fileUrl?: string; fileName?: string; size?: string;
  sections?: KnowledgeSection[];
};

type SectionDraft = { h: string; pointsText: string };

export function KnowledgeForm({ action, initial, submitLabel, hiddenFields }: {
  action: (fd: FormData) => void | Promise<void>;
  initial?: Initial;
  submitLabel: string;
  hiddenFields?: Record<string, string>;
}) {
  const [file, setFile] = useState<{ url: string; name: string; size: string } | null>(
    initial?.fileUrl ? { url: initial.fileUrl, name: initial.fileName ?? "原文", size: initial.size ?? "" } : null,
  );
  const [sections, setSections] = useState<SectionDraft[]>(
    initial?.sections && initial.sections.length
      ? initial.sections.map((s) => ({ h: s.h, pointsText: s.points.join("\n") }))
      : [{ h: "", pointsText: "" }],
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // 序列化为提交用的 content（空小节/空要点自动剔除）
  const contentJson = JSON.stringify(
    sections
      .map((s) => ({ h: s.h.trim() || "内容要点", points: s.pointsText.split(/\r?\n/).map((x) => x.trim()).filter(Boolean) }))
      .filter((s) => s.points.length),
  );

  function setSection(i: number, patch: Partial<SectionDraft>) {
    setSections((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  }
  function addSection() { setSections((prev) => [...prev, { h: "", pointsText: "" }]); }
  function removeSection(i: number) { setSections((prev) => (prev.length <= 1 ? prev : prev.filter((_, j) => j !== i))); }

  async function pick(f?: File) {
    if (!f) return;
    setErr(""); setBusy(true);
    try {
      const fd = new FormData(); fd.append("file", f);
      const res = await fetch("/api/upload-doc", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "上传失败");
      setFile({ url: data.url, name: data.name, size: data.size ?? "" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "上传失败");
    } finally { setBusy(false); }
  }

  return (
    <form action={action} className="space-y-5">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      {hiddenFields && Object.entries(hiddenFields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <input type="hidden" name="fileUrl" value={file?.url ?? ""} />
      <input type="hidden" name="fileName" value={file?.name ?? ""} />
      <input type="hidden" name="size" value={file?.size ?? ""} />
      <input type="hidden" name="content" value={contentJson} />

      <div>
        <Label required>资料标题</Label>
        <input name="title" required defaultValue={initial?.title} placeholder="如：GB 50210-2018 建筑装饰装修工程质量验收标准" className={INPUT} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label required>分类</Label>
          <select name="category" defaultValue={initial?.category ?? "技术资料"} className={INPUT}>
            {KNOWLEDGE_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.key}</option>)}
          </select>
        </div>
        <div>
          <Label>发布日期</Label>
          <input name="date" type="date" defaultValue={initial?.date} className={INPUT} />
        </div>
      </div>

      <div>
        <Label>标签</Label>
        <input name="tags" defaultValue={initial?.tags} placeholder="逗号或顿号分隔，如：验收、防水、国标（最多 8 个）" className={INPUT} />
      </div>

      <div>
        <Label>一句话摘要</Label>
        <input name="excerpt" defaultValue={initial?.excerpt} placeholder="用于列表与阅读页顶部的简介" className={INPUT} />
      </div>

      {/* 正文全文（Markdown）—— 在线阅读主体 */}
      <div>
        <Label>正文全文</Label>
        <textarea
          name="body"
          defaultValue={initial?.body}
          rows={14}
          placeholder={"在此粘贴 / 撰写完整正文，支持 Markdown 排版：\n\n# 一级标题  ## 二级标题\n**加粗**  *斜体*\n- 列表项\n1. 有序列表\n> 引用\n[链接](https://…)   ![图片说明](图片URL)\n\n段落之间空一行分隔。"}
          className={`${AREA} font-mono leading-7`}
        />
        <p className="mt-1.5 text-[11px] text-muted-foreground leading-5">
          支持 Markdown：<code className="bg-surface px-1 rounded">#</code> 标题、<code className="bg-surface px-1 rounded">**粗**</code>、<code className="bg-surface px-1 rounded">- 列表</code>、<code className="bg-surface px-1 rounded">![]()</code> 插图；<b>段落之间空一行</b>。前台阅读页整篇渲染。
        </p>
      </div>

      {/* 正文要点 · 分小节（可选） */}
      <div>
        <Label>要点速览（可选 · 结构化小节，便于快速查阅）</Label>
        <div className="space-y-3">
          {sections.map((s, i) => (
            <div key={i} className="rounded-none border border-border bg-surface/40 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 shrink-0 rounded-none bg-brand-50 text-brand text-[11px] font-semibold inline-flex items-center justify-center tabular-nums">{i + 1}</span>
                <input
                  value={s.h}
                  onChange={(e) => setSection(i, { h: e.target.value })}
                  placeholder="小节标题，如：适用范围 / 验收层次 / 主控项目"
                  className={`${INPUT} flex-1`}
                />
                {sections.length > 1 && (
                  <button type="button" onClick={() => removeSection(i)} title="删除小节" className="h-9 w-9 shrink-0 rounded-none border border-border text-muted-foreground hover:text-cat-decor hover:border-cat-decor inline-flex items-center justify-center">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <textarea
                value={s.pointsText}
                onChange={(e) => setSection(i, { pointsText: e.target.value })}
                rows={3}
                placeholder="该小节要点，每行一条"
                className={AREA}
              />
            </div>
          ))}
        </div>
        <button type="button" onClick={addSection} className="mt-2 h-9 px-3 rounded-none border border-dashed border-border text-[12px] text-muted-foreground hover:border-foreground/40 hover:text-foreground inline-flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> 添加小节
        </button>
      </div>

      {/* PDF / DOCX 上传 */}
      <div>
        <Label>原文附件（PDF / DOC / DOCX，≤30MB，选填）</Label>
        {file ? (
          <div className="flex items-center gap-2 rounded-none border border-border bg-surface px-3 py-2.5 text-[13px]">
            <FileText className="h-4 w-4 text-cat-decor shrink-0" />
            <a href={file.url} target="_blank" rel="noreferrer" className="flex-1 min-w-0 truncate text-brand hover:underline">{file.name}</a>
            {file.size && <span className="text-[11px] text-muted-foreground shrink-0">{file.size}</span>}
            <button type="button" onClick={() => setFile(null)} className="h-6 w-6 rounded-none hover:bg-background inline-flex items-center justify-center shrink-0"><X className="h-3.5 w-3.5" /></button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 rounded-none border-2 border-dashed border-border bg-surface/40 hover:border-foreground/30 hover:bg-surface cursor-pointer text-muted-foreground py-4 text-[13px]">
            <input type="file" accept=".pdf,.doc,.docx,application/pdf" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> 上传中…</> : <><Upload className="h-4 w-4" /> 选择文件上传</>}
          </label>
        )}
        {err && <div className="mt-1 text-[11px] text-cat-decor">{err}</div>}
      </div>

      <label className="inline-flex items-center gap-2 text-[13px]">
        <input type="checkbox" name="hot" value="1" defaultChecked={initial?.hot} className="accent-brand" /> 设为热门资料
      </label>

      <div className="pt-1">
        <button type="submit" disabled={busy} className="h-10 px-5 rounded-none bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 disabled:opacity-60">
          {submitLabel.includes("新增") ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />} {submitLabel}
        </button>
      </div>
    </form>
  );
}
