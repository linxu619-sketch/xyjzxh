"use client";

import { useRef, useState } from "react";
import { Upload, FileText, X, Check } from "lucide-react";

type Doc = { name: string; label: string; required?: boolean };

export function UploadSlots({ docs }: { docs: Doc[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {docs.map((d) => <Slot key={d.name} doc={d} />)}
    </div>
  );
}

function Slot({ doc }: { doc: Doc }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function accept(file: File | undefined) {
    if (preview) URL.revokeObjectURL(preview);
    if (!file) { setFileName(null); setPreview(null); return; }
    setFileName(file.name);
    setPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    accept(e.target.files?.[0]);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      inputRef.current.files = dt.files; // 同步给表单字段
      accept(file);
    }
  }

  function clear(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (preview) URL.revokeObjectURL(preview);
    setFileName(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const input = (
    <input ref={inputRef} type="file" name={doc.name} accept="image/*,.pdf" className="hidden" onChange={onChange} />
  );

  // 已上传：整卡可点重选，移除按钮阻止冒泡
  if (fileName) {
    return (
      <label className="relative block rounded-2xl border border-border overflow-hidden bg-background h-[150px] cursor-pointer">
        {input}
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={doc.label} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <FileText className="h-9 w-9" />
            <span className="text-[12px]">PDF 文档</span>
          </div>
        )}
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 h-6 px-2 rounded-full bg-accent-tea text-white text-[10px] font-medium">
          <Check className="h-3 w-3" /> 已上传
        </span>
        <button
          type="button"
          onClick={clear}
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-foreground/60 text-white inline-flex items-center justify-center hover:bg-foreground transition-colors z-10"
          aria-label="移除"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent px-3 pt-6 pb-2.5">
          <div className="text-[12px] font-medium text-white truncate">{doc.label}</div>
          <div className="text-[10px] text-white/80 truncate">{fileName} · 点击可替换</div>
        </div>
      </label>
    );
  }

  // 空槽：可点可拖
  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed h-[150px] p-4 text-center cursor-pointer transition-colors ${
        dragOver ? "border-brand bg-brand-50/50" : "border-border bg-surface/40 hover:border-foreground/30 hover:bg-surface"
      }`}
    >
      {input}
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-background border border-border text-muted-foreground">
        <Upload className="h-5 w-5" />
      </span>
      <div className="text-[13px] font-medium">
        {doc.label}{doc.required && <span className="text-cat-decor ml-0.5">*</span>}
      </div>
      <div className="text-[11px] text-muted-foreground">点击或拖拽到此 · JPG / PNG / PDF</div>
    </label>
  );
}
