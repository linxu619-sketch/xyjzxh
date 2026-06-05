"use client";

import { useState } from "react";
import { Upload, FileText, X, Loader2, Save, CheckCircle2 } from "lucide-react";
import { KNOWLEDGE_CATEGORIES } from "@/lib/data/knowledge";

const INPUT = "h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/30";

type Initial = {
  id?: string; title?: string; category?: string; tags?: string; excerpt?: string;
  points?: string; hot?: boolean; fileUrl?: string; fileName?: string; size?: string;
};

export function KnowledgeForm({ action, initial, submitLabel }: {
  action: (fd: FormData) => void | Promise<void>;
  initial?: Initial;
  submitLabel: string;
}) {
  const [file, setFile] = useState<{ url: string; name: string; size: string } | null>(
    initial?.fileUrl ? { url: initial.fileUrl, name: initial.fileName ?? "原文", size: initial.size ?? "" } : null,
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

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
    <form action={action} className="space-y-3">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="fileUrl" value={file?.url ?? ""} />
      <input type="hidden" name="fileName" value={file?.name ?? ""} />
      <input type="hidden" name="size" value={file?.size ?? ""} />

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-2.5">
        <input name="title" required defaultValue={initial?.title} placeholder="资料标题 *" className={INPUT} />
        <select name="category" defaultValue={initial?.category ?? "技术资料"} className={INPUT}>
          {KNOWLEDGE_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.key}</option>)}
        </select>
      </div>
      <input name="tags" defaultValue={initial?.tags} placeholder="标签（逗号分隔，如 验收,防水）" className={INPUT} />
      <input name="excerpt" defaultValue={initial?.excerpt} placeholder="一句话摘要" className={INPUT} />
      <textarea name="points" defaultValue={initial?.points} rows={4} placeholder="正文要点（每行一条，在线阅读页展示；可留空）" className="w-full rounded-xl border border-border bg-background p-3 text-[13px] leading-6 outline-none focus:border-foreground/30" />

      {/* PDF / DOCX 上传 */}
      <div>
        {file ? (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px]">
            <FileText className="h-4 w-4 text-cat-decor shrink-0" />
            <a href={file.url} target="_blank" rel="noreferrer" className="flex-1 min-w-0 truncate text-brand hover:underline">{file.name}</a>
            {file.size && <span className="text-[11px] text-muted-foreground shrink-0">{file.size}</span>}
            <button type="button" onClick={() => setFile(null)} className="h-6 w-6 rounded-full hover:bg-background inline-flex items-center justify-center shrink-0"><X className="h-3.5 w-3.5" /></button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface/40 hover:border-foreground/30 hover:bg-surface cursor-pointer text-muted-foreground py-4 text-[13px]">
            <input type="file" accept=".pdf,.doc,.docx,application/pdf" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> 上传中…</> : <><Upload className="h-4 w-4" /> 上传 PDF / DOC 原文（≤30MB，选填）</>}
          </label>
        )}
        {err && <div className="mt-1 text-[11px] text-cat-decor">{err}</div>}
      </div>

      <label className="inline-flex items-center gap-2 text-[13px]"><input type="checkbox" name="hot" value="1" defaultChecked={initial?.hot} className="accent-brand" /> 设为热门</label>

      <div>
        <button type="submit" disabled={busy} className="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 disabled:opacity-60">
          {submitLabel.includes("新增") ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />} {submitLabel}
        </button>
      </div>
    </form>
  );
}
