"use client";

import { useState } from "react";
import { Plus, X, Save } from "lucide-react";
import { SingleUpload } from "@/app/(main)/register/uploads";
import { addCertAction } from "./cert-actions";

const INPUT = "w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30";

// 上传一张证书：名称 + 图片(真实上传到 /api/upload) → 存证书库(待协会核验)
export function CertUploader() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full h-11 rounded-xl border border-dashed border-border text-[13px] text-muted-foreground inline-flex items-center justify-center gap-1.5 hover:border-foreground/30 hover:text-foreground transition-colors">
        <Plus className="h-4 w-4" /> 上传证书
      </button>
    );
  }

  return (
    <form action={addCertAction} className="rounded-2xl border border-border bg-surface/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold">上传证书</span>
        <button type="button" onClick={() => setOpen(false)} className="h-7 w-7 rounded-full hover:bg-surface inline-flex items-center justify-center text-muted-foreground"><X className="h-4 w-4" /></button>
      </div>
      <input type="hidden" name="imageUrl" value={url ?? ""} />
      <label className="block">
        <span className="text-[12px] font-medium">证书名称</span>
        <input name="title" required placeholder="如：二级建造师 / 电工证 / 设计师证" className={`${INPUT} mt-1`} />
      </label>
      <label className="block">
        <span className="text-[12px] font-medium">发证日期 / 编号 <span className="text-muted-foreground font-normal">(选填)</span></span>
        <input name="issued" placeholder="如：2024-06 / 证书编号" className={`${INPUT} mt-1`} />
      </label>
      <SingleUpload label="证书图片" required aspect="1.4 / 1" onChange={setUrl} />
      <div className="flex items-center gap-2 pt-1">
        <button type="submit" disabled={!url} className="h-10 px-5 rounded-full bg-accent-tea text-white text-[13px] font-medium inline-flex items-center gap-1.5 disabled:opacity-50">
          <Save className="h-4 w-4" /> 保存
        </button>
        <span className="text-[11px] text-muted-foreground">上传后待协会核验</span>
      </div>
    </form>
  );
}
