"use client";

import { useState } from "react";
import { Plus, X, Upload, Loader2, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { createListingAction } from "@/app/(dashboard)/dashboard/store-actions";

const INPUT = "w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30";
const CATS = ["主材", "辅材", "设备", "后期", "瓷砖/石材", "地板", "卫浴/五金", "门窗", "灯具/电气", "油漆/墙纸", "防水", "水泥/砂浆", "电动工具", "软装/家具", "其他"];
const REASONS = [
  { v: "agent", label: "独家代理（信阳总代）" },
  { v: "self", label: "自产自销" },
  { v: "direct", label: "厂家直供" },
];

export function ListingForm({ disabled, disabledHint }: { disabled?: boolean; disabledHint?: string }) {
  const [open, setOpen] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);

  async function uploadTo(
    file: File | undefined,
    setUrl: (u: string) => void,
    setBusy: (b: boolean) => void,
  ) {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setUrl(data.url);
    } finally {
      setBusy(false);
    }
  }
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => uploadTo(e.target.files?.[0], setProofUrl, setUploading);
  const onPickImg = (e: React.ChangeEvent<HTMLInputElement>) => uploadTo(e.target.files?.[0], setImageUrl, setUploadingImg);

  if (!open) {
    return (
      <button
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        title={disabled ? disabledHint : undefined}
        className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100"
      >
        <Plus className="h-3.5 w-3.5" /> 我要卖货
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setOpen(false)}>
      <form action={createListingAction} onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl border border-border p-5 md:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[16px] font-semibold">上架商品 · 申请销售</h3>
          <button type="button" onClick={() => setOpen(false)} className="h-8 w-8 rounded-full hover:bg-surface inline-flex items-center justify-center text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
        <p className="text-[12px] text-muted-foreground mb-4">提交后进入协会审核。<b>同一品牌平台仅允许一家在售</b>，以最低价为准。</p>
        <div className="space-y-3">
          <Field label="商品名称" required><input name="name" required placeholder="如：美巢墙锢界面剂" className={INPUT} /></Field>
          <Field label="商品效果图（建议正方形，展示在商城）">
            <input type="hidden" name="imageUrl" value={imageUrl} />
            {imageUrl ? (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="商品图" className="w-full h-full object-cover" />
                <label className="absolute inset-0 bg-foreground/0 hover:bg-foreground/30 transition-colors cursor-pointer flex items-center justify-center text-white text-[11px] opacity-0 hover:opacity-100">
                  重新上传<input type="file" accept="image/*" className="hidden" onChange={onPickImg} />
                </label>
              </div>
            ) : (
              <label className="flex items-center gap-2 h-24 w-full rounded-xl border border-dashed border-border px-3.5 text-[13px] text-muted-foreground cursor-pointer hover:border-foreground/30">
                {uploadingImg ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
                {uploadingImg ? "上传中…" : "点击上传商品图（≤8MB）"}
                <input type="file" accept="image/*" className="hidden" onChange={onPickImg} />
              </label>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="品牌" required><input name="brand" required placeholder="如：美巢 / 海螺 / 自有品牌" className={INPUT} /></Field>
            <Field label="类别"><select name="category" defaultValue="主材" className={INPUT}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></Field>
          </div>
          <Field label="上架理由 / 资格" required>
            <select name="reasonType" defaultValue="agent" className={INPUT}>{REASONS.map((r) => <option key={r.v} value={r.v}>{r.label}</option>)}</select>
          </Field>
          <Field label="资格说明"><input name="reasonNote" placeholder="如：XX品牌信阳区域独家代理，凭授权书" className={INPUT} /></Field>
          <Field label="资格证明（授权书 / 营业执照 / 自产证明）">
            <input type="hidden" name="proofUrl" value={proofUrl} />
            <label className="flex items-center gap-2 h-11 rounded-xl border border-dashed border-border px-3.5 text-[13px] text-muted-foreground cursor-pointer hover:border-foreground/30">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : proofUrl ? <CheckCircle2 className="h-4 w-4 text-accent-tea" /> : <Upload className="h-4 w-4" />}
              {uploading ? "上传中…" : proofUrl ? "已上传，可点击重新上传" : "点击上传图片（≤8MB）"}
              <input type="file" accept="image/*" className="hidden" onChange={onPick} />
            </label>
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="单位"><input name="unit" placeholder="桶/㎡/件/吨" className={INPUT} /></Field>
            <Field label="规格"><input name="spec" placeholder="18kg" className={INPUT} /></Field>
            <Field label="起批量"><input name="moq" inputMode="numeric" defaultValue="1" className={INPUT} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="市场参考价(元)"><input name="marketPrice" inputMode="numeric" placeholder="96" className={INPUT} /></Field>
            <Field label="会员批发价(元)" required><input name="memberPrice" inputMode="numeric" required placeholder="72" className={INPUT} /></Field>
          </div>
          <div>
            <span className="text-[12px] font-medium">阶梯量价（选填 · 买得越多越便宜）</span>
            <div className="mt-1.5 space-y-2">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                满 <input name="tier1Qty" inputMode="numeric" placeholder="50" className="w-20 h-10 rounded-xl border border-border bg-background px-2.5 text-[14px] outline-none focus:border-foreground/30" /> 单价 <input name="tier1Price" inputMode="numeric" placeholder="69" className="w-20 h-10 rounded-xl border border-border bg-background px-2.5 text-[14px] outline-none focus:border-foreground/30" /> 元
              </div>
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                满 <input name="tier2Qty" inputMode="numeric" placeholder="100" className="w-20 h-10 rounded-xl border border-border bg-background px-2.5 text-[14px] outline-none focus:border-foreground/30" /> 单价 <input name="tier2Price" inputMode="numeric" placeholder="66" className="w-20 h-10 rounded-xl border border-border bg-background px-2.5 text-[14px] outline-none focus:border-foreground/30" /> 元
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={uploading} className="h-11 px-6 rounded-full bg-accent-tea text-white text-[14px] font-medium inline-flex items-center gap-1.5 disabled:opacity-50"><Plus className="h-4 w-4" /> 提交审核</button>
            <button type="button" onClick={() => setOpen(false)} className="h-11 px-4 rounded-full text-[13px] text-muted-foreground hover:text-foreground">取消</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium">{label}{required && <span className="text-cat-decor ml-0.5">*</span>}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
