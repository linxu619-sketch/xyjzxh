"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export function CaseGallery({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState<number | null>(null);
  const total = images.length;

  const close = useCallback(() => setIdx(null), []);
  const prev = useCallback(() => setIdx((i) => (i === null ? i : (i - 1 + total) % total)), [total]);
  const next = useCallback(() => setIdx((i) => (i === null ? i : (i + 1) % total)), [total]);

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [idx, close, prev, next]);

  if (!total) return null;
  const big = images[0];
  const small = images.slice(1, 5); // 一大四小

  return (
    <>
      {/* 大图 */}
      <button onClick={() => setIdx(0)} className="group block w-full relative rounded-2xl md:rounded-3xl overflow-hidden bg-foreground/5 aspect-[16/10] md:aspect-[16/9] cursor-zoom-in">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={big} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-foreground/55 text-white text-[11px] px-2.5 py-1 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="h-3.5 w-3.5" /> 点击看大图
        </span>
      </button>

      {/* 四张小图 */}
      {small.length > 0 && (
        <div className="mt-2.5 grid grid-cols-4 gap-2 md:gap-2.5">
          {small.map((u, i) => (
            <button key={i} onClick={() => setIdx(i + 1)} className="relative aspect-square rounded-xl overflow-hidden bg-foreground/5 cursor-zoom-in group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt={`${title} ${i + 2}`} className="absolute inset-0 w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-300" />
            </button>
          ))}
        </div>
      )}

      {/* 灯箱 */}
      {idx !== null && (
        <div onClick={close} className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-4 select-none">
          <button onClick={close} aria-label="关闭" className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 text-white inline-flex items-center justify-center hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
          {total > 1 && (
            <>
              <button onClick={(ev) => { ev.stopPropagation(); prev(); }} aria-label="上一张" className="absolute left-3 md:left-6 h-11 w-11 rounded-full bg-white/10 text-white inline-flex items-center justify-center hover:bg-white/20">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={(ev) => { ev.stopPropagation(); next(); }} aria-label="下一张" className="absolute right-3 md:right-6 h-11 w-11 rounded-full bg-white/10 text-white inline-flex items-center justify-center hover:bg-white/20">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[idx]} alt={`${title} ${idx + 1}`} onClick={(ev) => ev.stopPropagation()} className="max-h-[88vh] max-w-[94vw] object-contain rounded-lg" />
          <div className="absolute bottom-4 inset-x-0 text-center text-white/80 text-[12px]">{idx + 1} / {total}</div>
        </div>
      )}
    </>
  );
}
