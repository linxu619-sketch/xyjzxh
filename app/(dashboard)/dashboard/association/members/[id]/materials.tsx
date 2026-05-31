"use client";

import { useState } from "react";
import { X, ZoomIn, FileImage } from "lucide-react";

type Group = { label: string; files: string[] };

// 按材料类别给真实长宽比（见 UI-STYLE.md）
function ratioFor(label: string): { aspect: string; w: number } {
  if (label.includes("身份证")) return { aspect: "85.6 / 54", w: 200 };
  if (label.includes("营业执照")) return { aspect: "297 / 210", w: 248 };
  if (label.includes("资质") || label.includes("资格")) return { aspect: "297 / 210", w: 248 };
  if (label.includes("业绩") || label.includes("作品")) return { aspect: "4 / 3", w: 220 };
  return { aspect: "4 / 3", w: 200 };
}

const isImg = (s: string) => /^(https?:)?\//.test(s) && /\.(svg|png|jpe?g|webp|gif)$/i.test(s);

export function Materials({ groups }: { groups: Group[] }) {
  const [zoom, setZoom] = useState<string | null>(null);
  return (
    <div className="border-t border-border px-5 py-4">
      <div className="text-[13px] font-semibold text-muted-foreground mb-3">上传材料</div>
      <div className="space-y-4">
        {groups.map((g) => {
          const { aspect, w } = ratioFor(g.label);
          return (
            <div key={g.label}>
              <div className="text-[12px] text-muted-foreground mb-1.5">{g.label}（{g.files.length}）</div>
              <div className="flex flex-wrap gap-2.5">
                {g.files.map((f, i) =>
                  isImg(f) ? (
                    <div key={i} className="relative border border-border overflow-hidden bg-background" style={{ width: w, maxWidth: "100%", aspectRatio: aspect }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f} alt={g.label} onClick={() => setZoom(f)} className="absolute inset-0 h-full w-full object-cover cursor-zoom-in" />
                      <button type="button" onClick={() => setZoom(f)} className="absolute bottom-1.5 left-1.5 h-6 px-2 rounded-full bg-foreground/60 text-white text-[10px] font-medium inline-flex items-center gap-0.5">
                        <ZoomIn className="h-3 w-3" /> 放大
                      </button>
                    </div>
                  ) : (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-surface border border-border text-[12px]">
                      <FileImage className="h-3.5 w-3.5 text-cat-design shrink-0" />{f}
                    </span>
                  ),
                )}
              </div>
            </div>
          );
        })}
      </div>

      {zoom && (
        <div onClick={() => setZoom(null)} className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom} alt="预览" className="max-h-[90vh] max-w-[92vw] object-contain" onClick={(e) => e.stopPropagation()} />
          <button onClick={() => setZoom(null)} aria-label="关闭" className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/15 text-white inline-flex items-center justify-center hover:bg-white/25">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
