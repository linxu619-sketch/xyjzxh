"use client";

import { useRef, useState } from "react";
import { Upload, FileText, X, CheckCircle2 } from "lucide-react";

type Doc = { name: string; label: string; required?: boolean };

export function UploadSlots({ docs }: { docs: Doc[] }) {
  return (
    <div className="space-y-2.5">
      {docs.map((d) => <Slot key={d.name} doc={d} />)}
    </div>
  );
}

function Slot({ doc }: { doc: Doc }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (preview) URL.revokeObjectURL(preview);
    if (!f) { setFileName(null); setPreview(null); return; }
    setFileName(f.name);
    setPreview(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
  }

  function clear() {
    if (preview) URL.revokeObjectURL(preview);
    setFileName(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-center gap-3">
        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${fileName ? "bg-[#e6f7f1] text-accent-tea" : "bg-surface text-muted-foreground"}`}>
          {fileName ? <CheckCircle2 className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
        </span>
        <span className="text-[13px] flex-1 min-w-0">
          {doc.label}{doc.required && <span className="text-cat-decor ml-0.5">*</span>}
        </span>
        <label className="shrink-0 inline-flex items-center h-8 px-3 rounded-full bg-foreground text-background text-[12px] font-medium cursor-pointer active:scale-95 transition-transform">
          {fileName ? "重新选择" : "选择文件"}
          <input
            ref={inputRef}
            type="file"
            name={doc.name}
            accept="image/*,.pdf"
            className="hidden"
            onChange={onChange}
          />
        </label>
      </div>

      {fileName && (
        <div className="mt-2.5 flex items-center gap-2.5">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={fileName} className="h-16 w-16 rounded-lg object-cover border border-border" />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-surface border border-border flex items-center justify-center text-muted-foreground">
              <FileText className="h-6 w-6" />
            </div>
          )}
          <span className="text-[12px] text-muted-foreground truncate flex-1">{fileName}</span>
          <button
            type="button"
            onClick={clear}
            className="shrink-0 inline-flex items-center gap-1 text-[12px] text-cat-decor hover:underline"
          >
            <X className="h-3.5 w-3.5" /> 移除
          </button>
        </div>
      )}
    </div>
  );
}
