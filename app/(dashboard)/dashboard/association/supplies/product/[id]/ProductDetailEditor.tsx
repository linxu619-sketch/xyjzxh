"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { updateProductDetailAction } from "../../actions";
import type { ProductParam } from "@/lib/data/supplies-source";

const INPUT = "w-full h-10 rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/30";

export function ProductDetailEditor(props: {
  id: number; description: string; params: ProductParam[]; origin: string; leadTime: string; shipping: string; afterSale: string; stock: number;
}) {
  const [rows, setRows] = useState<ProductParam[]>(props.params.length ? props.params : [{ k: "", v: "" }]);
  const setRow = (i: number, key: "k" | "v", val: string) => setRows(rows.map((r, j) => (j === i ? { ...r, [key]: val } : r)));

  return (
    <form action={updateProductDetailAction} className="space-y-3">
      <input type="hidden" name="id" value={props.id} />
      <label className="block">
        <span className="text-[12px] font-medium">图文详情 / 卖点描述</span>
        <textarea name="description" defaultValue={props.description} rows={4} placeholder="材质、工艺、适用场景、核心卖点、对比优势…" className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-[13px] leading-6 outline-none focus:border-foreground/30" />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <Field label="产地"><input name="origin" defaultValue={props.origin} placeholder="如 广东佛山" className={INPUT} /></Field>
        <Field label="库存（0=现货/不限）"><input name="stock" type="number" min="0" defaultValue={props.stock || ""} placeholder="0" className={INPUT} /></Field>
        <Field label="货期 / 交期"><input name="leadTime" defaultValue={props.leadTime} placeholder="如 现货当天发 / 7个工作日" className={INPUT} /></Field>
        <Field label="物流 / 运费"><input name="shipping" defaultValue={props.shipping} placeholder="如 厂家包邮 / 运费到付" className={INPUT} /></Field>
      </div>
      <Field label="售后服务"><input name="afterSale" defaultValue={props.afterSale} placeholder="如 7天无理由 · 质保2年 · 协会监管" className={INPUT} /></Field>

      <div>
        <div className="text-[12px] font-medium mb-1.5">规格参数表</div>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={r.k} onChange={(e) => setRow(i, "k", e.target.value)} name="paramK" placeholder="参数名（如 材质）" className={`${INPUT} flex-1`} />
              <input value={r.v} onChange={(e) => setRow(i, "v", e.target.value)} name="paramV" placeholder="参数值（如 304 不锈钢）" className={`${INPUT} flex-1`} />
              <button type="button" onClick={() => setRows(rows.length > 1 ? rows.filter((_, j) => j !== i) : [{ k: "", v: "" }])} className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-surface inline-flex items-center justify-center shrink-0"><X className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setRows([...rows, { k: "", v: "" }])} className="mt-2 h-8 px-3 rounded-full border border-dashed border-border text-[12px] text-muted-foreground inline-flex items-center gap-1"><Plus className="h-3 w-3" /> 加一行参数</button>
      </div>

      <button type="submit" className="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium">保存商品详情</button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-[12px] font-medium">{label}</span><div className="mt-1">{children}</div></label>;
}
