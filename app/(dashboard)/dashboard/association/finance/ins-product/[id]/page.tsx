import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Power, Trash2, Umbrella } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getInsuranceProduct } from "@/lib/data/insurance-products";
import { updateInsuranceProductAction, toggleInsuranceProductAction, deleteInsuranceProductAction } from "../../actions";

export const metadata = { title: "编辑保险产品 · 协会工作台" };

const INS_TYPES = ["家装质保险", "工程履约险", "工人意外险", "公众责任险", "材料运输险", "其他"];
const INS_COLORS = [["decor", "红橙"], ["build", "蓝"], ["brand", "深蓝"], ["design", "紫"], ["tea", "青绿"], ["yellow", "黄"]];
const FIN_INPUT = "h-10 rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/30 w-full";

export default async function InsProductEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const p = id ? getInsuranceProduct(id) : undefined;
  if (!p) notFound();
  const self = `/dashboard/association/finance/ins-product/${p!.id}`;

  return (
    <AssociationShell title="编辑保险产品" subtitle={`${p!.name} · ${p!.insurer}`}>
      <Link href="/dashboard/association/finance#insurance" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回金融保险
      </Link>
      <div className="rounded-2xl border border-border bg-background p-5 md:p-6 max-w-2xl">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border">
          <span className="h-10 w-10 rounded-xl bg-surface inline-flex items-center justify-center shrink-0"><Umbrella className="h-5 w-5 text-cat-decor" /></span>
          <div className="flex-1"><div className="text-[15px] font-semibold">{p!.name}</div><div className="text-[11px] text-muted-foreground">ID {p!.id}</div></div>
          {p!.featured && <Badge tone="decor">主推</Badge>}
          <Badge tone={p!.status === "active" ? "tea" : "neutral"}>{p!.status === "active" ? "在架" : "已下架"}</Badge>
        </div>
        <form action={updateInsuranceProductAction} className="space-y-2.5">
          <input type="hidden" name="id" value={p!.id} />
          <input type="hidden" name="redirect" value={self} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <input name="name" defaultValue={p!.name} placeholder="产品名称" className={FIN_INPUT} />
            <input name="insurer" defaultValue={p!.insurer} placeholder="承保机构" className={FIN_INPUT} />
            <select name="type" defaultValue={INS_TYPES.includes(p!.type) ? p!.type : "其他"} className={FIN_INPUT}>{INS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
            <select name="color" defaultValue={p!.color} className={FIN_INPUT}>{INS_COLORS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
            <input name="priceLabel" defaultValue={p!.priceLabel} placeholder="价格" className={FIN_INPUT} />
            <input name="coverLabel" defaultValue={p!.coverLabel} placeholder="保额" className={FIN_INPUT} />
            <input name="forWhom" defaultValue={p!.forWhom} placeholder="适用对象" className={FIN_INPUT} />
            <label className="inline-flex items-center gap-2 text-[12px] px-1"><input type="checkbox" name="featured" value="1" defaultChecked={p!.featured} className="accent-brand" /> 设为主推</label>
          </div>
          <input name="highlights" defaultValue={p!.highlights.join("，")} placeholder="特性亮点(逗号/换行分隔)" className={FIN_INPUT} />
          <button className="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Save className="h-4 w-4" /> 保存修改</button>
        </form>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
          <form action={toggleInsuranceProductAction}>
            <input type="hidden" name="id" value={p!.id} />
            <input type="hidden" name="status" value={p!.status === "active" ? "off" : "active"} />
            <input type="hidden" name="redirect" value={self} />
            <button className="h-9 px-4 rounded-full bg-surface text-[12px] inline-flex items-center gap-1.5 hover:bg-surface-2"><Power className="h-3.5 w-3.5" /> {p!.status === "active" ? "下架" : "上架"}</button>
          </form>
          <form action={deleteInsuranceProductAction}>
            <input type="hidden" name="id" value={p!.id} />
            <button className="h-9 px-4 rounded-full text-cat-decor text-[12px] inline-flex items-center gap-1.5 hover:bg-cat-decor-soft"><Trash2 className="h-3.5 w-3.5" /> 删除</button>
          </form>
        </div>
      </div>
    </AssociationShell>
  );
}
