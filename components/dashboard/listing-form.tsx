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

export function ListingForm({ disabled, disabledHint, action, selfOperated, triggerLabel }: {
  disabled?: boolean; disabledHint?: string;
  action?: (fd: FormData) => void | Promise<void>; // 不传=企业会员上架(走审核)；传协会action+selfOperated=协会自营
  selfOperated?: boolean; triggerLabel?: string;
}) {
  const formAction = action ?? createListingAction;
  const [open, setOpen] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imgs, setImgs] = useState<string[]>([]);   // 商品图，最多 3 张
  const [uploadingImg, setUploadingImg] = useState(false);
  const [params, setParams] = useState<{ k: string; v: string }[]>([{ k: "", v: "" }]); // 规格参数行
  const setParam = (i: number, key: "k" | "v", val: string) => setParams(params.map((r, j) => (j === i ? { ...r, [key]: val } : r)));

  async function doUpload(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    return data.url ?? null;
  }
  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try { const u = await doUpload(f); if (u) setProofUrl(u); } finally { setUploading(false); }
  }
  async function onAddImg(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || imgs.length >= 3) return;
    setUploadingImg(true);
    try { const u = await doUpload(f); if (u) setImgs((prev) => [...prev, u].slice(0, 3)); } finally { setUploadingImg(false); }
  }
  const removeImg = (i: number) => setImgs((prev) => prev.filter((_, j) => j !== i));

  if (!open) {
    return (
      <button
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        title={disabled ? disabledHint : undefined}
        className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100"
      >
        <Plus className="h-3.5 w-3.5" /> {triggerLabel ?? "我要卖货"}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setOpen(false)}>
      <form action={formAction} onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl border border-border p-5 md:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[16px] font-semibold">{selfOperated ? "上架商品 · 协会自营" : "上架商品 · 申请销售"}</h3>
          <button type="button" onClick={() => setOpen(false)} className="h-8 w-8 rounded-full hover:bg-surface inline-flex items-center justify-center text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
        <p className="text-[12px] text-muted-foreground mb-4">{selfOperated ? <>协会集采自营商品，提交后<b>直接上架</b>（无需审核）。请尽量填全，便于会员下单。</> : <>提交后进入协会审核。<b>同一品牌平台仅允许一家在售</b>，以最低价为准。</>}</p>
        <div className="space-y-3">
          <Field label="商品名称" required><input name="name" required placeholder="如：美巢墙锢界面剂" className={INPUT} /></Field>
          <Field label="商品效果图（1-3 张，第一张为封面，建议正方形）">
            <input type="hidden" name="imageUrl" value={imgs[0] ?? ""} />
            <input type="hidden" name="imageUrl2" value={imgs[1] ?? ""} />
            <input type="hidden" name="imageUrl3" value={imgs[2] ?? ""} />
            <div className="flex gap-2 flex-wrap">
              {imgs.map((u, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt={`商品图${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && <span className="absolute top-0.5 left-0.5 bg-foreground/70 text-background text-[9px] px-1 rounded">封面</span>}
                  <button type="button" onClick={() => removeImg(i)} className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-foreground/70 text-background inline-flex items-center justify-center"><X className="h-3 w-3" /></button>
                </div>
              ))}
              {imgs.length < 3 && (
                <label className="w-20 h-20 rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-1 text-[10px] text-muted-foreground cursor-pointer hover:border-foreground/30">
                  {uploadingImg ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
                  {uploadingImg ? "上传中" : "加图片"}
                  <input type="file" accept="image/*" className="hidden" onChange={onAddImg} />
                </label>
              )}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="品牌" required><input name="brand" required placeholder="如：美巢 / 海螺 / 自有品牌" className={INPUT} /></Field>
            <Field label="类别"><select name="category" defaultValue="主材" className={INPUT}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></Field>
          </div>
          {!selfOperated && (
            <>
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
            </>
          )}
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
          <div className="pt-1 border-t border-border" />
          <div className="text-[12px] font-semibold text-muted-foreground">商品详情（让买家更易下单 · 选填）</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="产地"><input name="origin" placeholder="如 广东佛山" className={INPUT} /></Field>
            <Field label="库存（0=现货）"><input name="stock" inputMode="numeric" placeholder="0" className={INPUT} /></Field>
            <Field label="货期 / 交期"><input name="leadTime" placeholder="现货 / 7天" className={INPUT} /></Field>
            <Field label="物流 / 运费"><input name="shipping" placeholder="厂家包邮 / 到付" className={INPUT} /></Field>
          </div>
          <Field label="售后服务"><input name="afterSale" placeholder="7天无理由 · 质保2年" className={INPUT} /></Field>
          <Field label="图文详情 / 卖点"><textarea name="description" rows={3} placeholder="材质、工艺、适用场景、核心卖点…" className="w-full rounded-xl border border-border bg-background p-3 text-[14px] leading-6 outline-none focus:border-foreground/30" /></Field>
          <div>
            <span className="text-[12px] font-medium">规格参数（选填）</span>
            <div className="mt-1.5 space-y-2">
              {params.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={r.k} onChange={(e) => setParam(i, "k", e.target.value)} name="paramK" placeholder="参数名（如 材质）" className={`${INPUT} flex-1`} />
                  <input value={r.v} onChange={(e) => setParam(i, "v", e.target.value)} name="paramV" placeholder="参数值（如 304不锈钢）" className={`${INPUT} flex-1`} />
                  <button type="button" onClick={() => setParams(params.length > 1 ? params.filter((_, j) => j !== i) : [{ k: "", v: "" }])} className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-surface inline-flex items-center justify-center shrink-0"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setParams([...params, { k: "", v: "" }])} className="mt-2 h-8 px-3 rounded-full border border-dashed border-border text-[12px] text-muted-foreground inline-flex items-center gap-1"><Plus className="h-3 w-3" /> 加一行参数</button>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={uploading} className="h-11 px-6 rounded-full bg-accent-tea text-white text-[14px] font-medium inline-flex items-center gap-1.5 disabled:opacity-50"><Plus className="h-4 w-4" /> {selfOperated ? "直接上架" : "提交审核"}</button>
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
