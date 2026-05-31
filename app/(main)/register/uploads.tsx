"use client";

import { useRef, useState } from "react";
import { Upload, FileText, X, Check, Plus, ZoomIn, Loader2, AlertCircle } from "lucide-react";

async function uploadToServer(f: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", f);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "上传失败");
  return data.url as string;
}

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

/* 单张上传（按证件真实长宽比；真实上传到服务器；点图放大、可替换/移除）*/
export function SingleUpload({
  label, required, aspect, className, onChange,
}: {
  label: string; required?: boolean; aspect: string; className?: string;
  onChange?: (url: string | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // 上传中=本地 objectURL；完成后=服务器 URL
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<string | null>(null);

  async function accept(f?: File) {
    setError(null);
    if (!f) return;
    const local = f.type.startsWith("image/") ? URL.createObjectURL(f) : null;
    setName(f.name); setPreview(local); setBusy(true); onChange?.(null);
    try {
      const url = await uploadToServer(f);
      if (local) URL.revokeObjectURL(local);
      setPreview(url); onChange?.(url);
    } catch (e) {
      if (local) URL.revokeObjectURL(local);
      setName(null); setPreview(null); onChange?.(null);
      setError(e instanceof Error ? e.message : "上传失败");
      if (ref.current) ref.current.value = "";
    } finally {
      setBusy(false);
    }
  }
  function clear(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setName(null); setPreview(null); setError(null);
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
            <img src={preview} alt={label} onClick={() => !busy && preview && setZoom(preview)} className="absolute inset-0 h-full w-full object-cover cursor-zoom-in" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground"><FileText className="h-7 w-7" /></div>
          )}
          {busy ? (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[11px] gap-1.5"><Loader2 className="h-4 w-4 animate-spin" /> 上传中…</div>
          ) : (
            <>
              <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-0.5 h-5 px-1.5 rounded-full bg-accent-tea text-white text-[9px] font-medium"><Check className="h-2.5 w-2.5" /> 已传</span>
              <button type="button" onClick={clear} className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-foreground/60 text-white inline-flex items-center justify-center"><X className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => ref.current?.click()} className="absolute bottom-1.5 right-1.5 h-6 px-2 rounded-full bg-foreground/60 text-white text-[10px] font-medium">替换</button>
              {preview && (
                <button type="button" onClick={() => setZoom(preview)} className="absolute bottom-1.5 left-1.5 h-6 px-2 rounded-full bg-foreground/60 text-white text-[10px] font-medium inline-flex items-center gap-0.5"><ZoomIn className="h-3 w-3" /> 放大</button>
              )}
            </>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-border bg-surface/40 hover:border-foreground/30 hover:bg-surface cursor-pointer text-muted-foreground transition-colors" style={{ aspectRatio: aspect }}>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => accept(e.target.files?.[0])} />
          <Upload className="h-5 w-5" />
          <span className="text-[11px]">点击上传</span>
        </label>
      )}
      {error && <div className="mt-1 text-[11px] text-cat-decor inline-flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {error}</div>}
      {zoom && <Lightbox src={zoom} onClose={() => setZoom(null)} />}
    </div>
  );
}

type Item = { id: number; name: string; preview: string | null; url: string | null; busy: boolean; error?: string };

/* 多张上传（缩略图墙 + 添加，上限 max；真实上传；点图放大）*/
export function MultiUpload({
  label, hint, max = 10, onChange,
}: {
  label: string; hint?: string; max?: number; onChange?: (urls: string[]) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);
  const itemsRef = useRef<Item[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [zoom, setZoom] = useState<string | null>(null);

  function commit(next: Item[]) {
    itemsRef.current = next;
    setItems(next);
    onChange?.(next.filter((i) => i.url).map((i) => i.url as string));
  }

  async function uploadOne(id: number, f: File) {
    try {
      const url = await uploadToServer(f);
      commit(itemsRef.current.map((x) => {
        if (x.id !== id) return x;
        if (x.preview && x.preview.startsWith("blob:")) URL.revokeObjectURL(x.preview);
        return { ...x, url, preview: url, busy: false };
      }));
    } catch (e) {
      commit(itemsRef.current.map((x) => x.id === id ? { ...x, busy: false, error: e instanceof Error ? e.message : "上传失败" } : x));
    }
  }

  function add(files: FileList | null) {
    if (!files) return;
    const cur = itemsRef.current;
    const room = max - cur.length;
    const picked = Array.from(files).slice(0, room);
    const fresh: Item[] = picked.map((f) => ({
      id: ++idRef.current,
      name: f.name,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
      url: null,
      busy: true,
    }));
    commit([...cur, ...fresh]);
    picked.forEach((f, i) => uploadOne(fresh[i].id, f));
    if (ref.current) ref.current.value = "";
  }
  function remove(id: number) {
    commit(itemsRef.current.filter((x) => {
      if (x.id === id && x.preview && x.preview.startsWith("blob:")) URL.revokeObjectURL(x.preview);
      return x.id !== id;
    }));
  }

  return (
    <div>
      <div className="text-[12px] font-medium mb-1">
        {label} <span className="text-muted-foreground font-normal">（{items.length}/{max}）</span>
      </div>
      {hint && <div className="text-[11px] text-muted-foreground mb-2">{hint}</div>}
      <div className="flex flex-wrap gap-2.5">
        {items.map((it) => (
          <div key={it.id} className="relative w-[180px] max-w-full border border-border overflow-hidden bg-background" style={{ aspectRatio: "85.6 / 54" }}>
            {it.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.preview} alt={it.name} onClick={() => !it.busy && it.preview && setZoom(it.preview)} className="absolute inset-0 h-full w-full object-cover cursor-zoom-in" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground"><FileText className="h-7 w-7" /></div>
            )}
            {it.busy ? (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[11px] gap-1.5"><Loader2 className="h-4 w-4 animate-spin" /> 上传中…</div>
            ) : it.error ? (
              <div className="absolute inset-0 bg-cat-decor/85 flex flex-col items-center justify-center text-white text-[10px] gap-1 p-1.5 text-center"><AlertCircle className="h-4 w-4" /> {it.error}
                <button type="button" onClick={() => remove(it.id)} className="mt-1 underline">移除</button>
              </div>
            ) : (
              <>
                <button type="button" onClick={() => remove(it.id)} className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-foreground/60 text-white inline-flex items-center justify-center"><X className="h-3.5 w-3.5" /></button>
                {it.preview && (
                  <button type="button" onClick={() => setZoom(it.preview)} className="absolute bottom-1.5 left-1.5 h-6 px-2 rounded-full bg-foreground/60 text-white text-[10px] font-medium inline-flex items-center gap-0.5"><ZoomIn className="h-3 w-3" /> 放大</button>
                )}
              </>
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
