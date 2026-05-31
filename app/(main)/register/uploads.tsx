"use client";

import { useRef, useState } from "react";
import { Upload, FileText, X, Check, Plus, ZoomIn } from "lucide-react";

/* 放大预览（点击已上传图片弹出）*/
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 animate-fade-up">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="预览" className="max-h-[90vh] max-w-[92vw] object-contain" onClick={(e) => e.stopPropagation()} />
      <button onClick={onClose} aria-label="关闭" className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/15 text-white inline-flex items-center justify-center hover:bg-white/25">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

/* 单张上传（按证件真实长宽比；点图放大、可替换/移除）*/
export function SingleUpload({
  label, required, aspect, className, onChange,
}: {
  label: string; required?: boolean; aspect: string; className?: string;
  onChange?: (name: string | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [zoom, setZoom] = useState<string | null>(null);

  function accept(f?: File) {
    if (preview) URL.revokeObjectURL(preview);
    if (!f) { setName(null); setPreview(null); onChange?.(null); return; }
    setName(f.name);
    setPreview(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
    onChange?.(f.name);
  }
  function clear(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (preview) URL.revokeObjectURL(preview);
    setName(null); setPreview(null);
    if (ref.current) ref.current.value = "";
    onChange?.(null);
  }

  return (
    <div className={className}>
      <div className="text-[12px] font-medium mb-1.5">{label}{required && <span className="text-cat-decor ml-0.5">*</span>}</div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => accept(e.target.files?.[0])} />
      {name ? (
        <div className="relative border border-border overflow-hidden bg-background" style={{ aspectRatio: aspect }}>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={label} onClick={() => preview && setZoom(preview)} className="absolute inset-0 h-full w-full object-cover cursor-zoom-in" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground"><FileText className="h-7 w-7" /></div>
          )}
          <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-0.5 h-5 px-1.5 rounded-full bg-accent-tea text-white text-[9px] font-medium"><Check className="h-2.5 w-2.5" /> 已传</span>
          <button type="button" onClick={clear} className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-foreground/60 text-white inline-flex items-center justify-center"><X className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => ref.current?.click()} className="absolute bottom-1.5 right-1.5 h-6 px-2 rounded-full bg-foreground/60 text-white text-[10px] font-medium">替换</button>
          {preview && (
            <button type="button" onClick={() => setZoom(preview)} className="absolute bottom-1.5 left-1.5 h-6 px-2 rounded-full bg-foreground/60 text-white text-[10px] font-medium inline-flex items-center gap-0.5"><ZoomIn className="h-3 w-3" /> 放大</button>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-border bg-surface/40 hover:border-foreground/30 hover:bg-surface cursor-pointer text-muted-foreground transition-colors" style={{ aspectRatio: aspect }}>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => accept(e.target.files?.[0])} />
          <Upload className="h-5 w-5" />
          <span className="text-[11px]">点击上传</span>
        </label>
      )}
      {zoom && <Lightbox src={zoom} onClose={() => setZoom(null)} />}
    </div>
  );
}

/* 多张上传（缩略图墙 + 添加，上限 max；点图放大）*/
export function MultiUpload({
  label, hint, max = 10, onChange,
}: {
  label: string; hint?: string; max?: number; onChange?: (names: string[]) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<{ name: string; preview: string | null }[]>([]);
  const [zoom, setZoom] = useState<string | null>(null);

  function add(files: FileList | null) {
    if (!files) return;
    const room = max - items.length;
    const added = Array.from(files).slice(0, room).map((f) => ({
      name: f.name,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
    }));
    const next = [...items, ...added];
    setItems(next);
    onChange?.(next.map((i) => i.name));
    if (ref.current) ref.current.value = "";
  }
  function remove(idx: number) {
    const it = items[idx];
    if (it.preview) URL.revokeObjectURL(it.preview);
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    onChange?.(next.map((i) => i.name));
  }

  return (
    <div>
      <div className="text-[12px] font-medium mb-1">
        {label} <span className="text-muted-foreground font-normal">（{items.length}/{max}）</span>
      </div>
      {hint && <div className="text-[11px] text-muted-foreground mb-2">{hint}</div>}
      <div className="flex flex-wrap gap-2.5">
        {items.map((it, idx) => (
          <div key={idx} className="relative w-[180px] max-w-full border border-border overflow-hidden bg-background" style={{ aspectRatio: "85.6 / 54" }}>
            {it.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.preview} alt={it.name} onClick={() => it.preview && setZoom(it.preview)} className="absolute inset-0 h-full w-full object-cover cursor-zoom-in" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground"><FileText className="h-7 w-7" /></div>
            )}
            <button type="button" onClick={() => remove(idx)} className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-foreground/60 text-white inline-flex items-center justify-center"><X className="h-3.5 w-3.5" /></button>
            {it.preview && (
              <button type="button" onClick={() => setZoom(it.preview)} className="absolute bottom-1.5 left-1.5 h-6 px-2 rounded-full bg-foreground/60 text-white text-[10px] font-medium inline-flex items-center gap-0.5"><ZoomIn className="h-3 w-3" /> 放大</button>
            )}
          </div>
        ))}
        {items.length < max && (
          <label className="w-[180px] max-w-full border-2 border-dashed border-border bg-surface/40 hover:border-foreground/30 hover:bg-surface flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground transition-colors" style={{ aspectRatio: "85.6 / 54" }}>
            <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={(e) => add(e.target.files)} />
            <Plus className="h-5 w-5" />
            <span className="text-[11px]">添加</span>
          </label>
        )}
      </div>
      {zoom && <Lightbox src={zoom} onClose={() => setZoom(null)} />}
    </div>
  );
}
