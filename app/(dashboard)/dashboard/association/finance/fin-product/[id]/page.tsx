import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Power, Trash2, Wallet } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getFinanceProduct } from "@/lib/data/finance-source";
import { updateFinanceProductAction, toggleFinanceProductAction, deleteFinanceProductAction } from "../../actions";

export const metadata = { title: "编辑金融产品 · 协会工作台" };

const FIN_TYPES = ["信用贷", "抵押贷", "经营贷", "保函", "供应链金融", "分期", "票据贴现", "其他"];
const FIN_COLORS = [["brand", "深蓝"], ["build", "蓝"], ["decor", "红橙"], ["design", "紫"], ["tea", "青绿"]];
const FIN_INPUT = "h-10 rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/30 w-full";

export default async function FinProductEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const p = id ? getFinanceProduct(id) : undefined;
  if (!p) notFound();
  const self = `/dashboard/association/finance/fin-product/${p!.id}`;

  return (
    <AssociationShell title="编辑金融产品" subtitle={`${p!.name} · ${p!.provider}`}>
      <Link href="/dashboard/association/finance#products" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回金融保险
      </Link>
      <div className="rounded-2xl border border-border bg-background p-5 md:p-6 max-w-2xl">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border">
          <span className="h-10 w-10 rounded-xl bg-surface inline-flex items-center justify-center shrink-0"><Wallet className="h-5 w-5 text-cat-build" /></span>
          <div className="flex-1"><div className="text-[15px] font-semibold">{p!.name}</div><div className="text-[11px] text-muted-foreground">ID {p!.id}</div></div>
          <Badge tone={p!.status === "active" ? "tea" : "neutral"}>{p!.status === "active" ? "在架" : "已下架"}</Badge>
        </div>
        <form action={updateFinanceProductAction} className="space-y-2.5">
          <input type="hidden" name="id" value={p!.id} />
          <input type="hidden" name="redirect" value={self} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <input name="name" defaultValue={p!.name} placeholder="产品名称" className={FIN_INPUT} />
            <input name="provider" defaultValue={p!.provider} placeholder="合作机构" className={FIN_INPUT} />
            <select name="type" defaultValue={FIN_TYPES.includes(p!.type) ? p!.type : "其他"} className={FIN_INPUT}>{FIN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
            <select name="color" defaultValue={p!.color} className={FIN_INPUT}>{FIN_COLORS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
            <input name="rateLabel" defaultValue={p!.rateLabel} placeholder="利率" className={FIN_INPUT} />
            <input name="amountLabel" defaultValue={p!.amountLabel} placeholder="额度" className={FIN_INPUT} />
            <input name="termLabel" defaultValue={p!.termLabel} placeholder="期限" className={FIN_INPUT} />
            <input name="forWhom" defaultValue={p!.forWhom} placeholder="适用对象" className={FIN_INPUT} />
          </div>
          <input name="highlights" defaultValue={p!.highlights.join("，")} placeholder="特性亮点(逗号/换行分隔)" className={FIN_INPUT} />
          <button className="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Save className="h-4 w-4" /> 保存修改</button>
        </form>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
          <form action={toggleFinanceProductAction}>
            <input type="hidden" name="id" value={p!.id} />
            <input type="hidden" name="status" value={p!.status === "active" ? "off" : "active"} />
            <input type="hidden" name="redirect" value={self} />
            <button className="h-9 px-4 rounded-full bg-surface text-[12px] inline-flex items-center gap-1.5 hover:bg-surface-2"><Power className="h-3.5 w-3.5" /> {p!.status === "active" ? "下架" : "上架"}</button>
          </form>
          <form action={deleteFinanceProductAction}>
            <input type="hidden" name="id" value={p!.id} />
            <button className="h-9 px-4 rounded-full text-cat-decor text-[12px] inline-flex items-center gap-1.5 hover:bg-cat-decor-soft"><Trash2 className="h-3.5 w-3.5" /> 删除</button>
          </form>
        </div>
      </div>
    </AssociationShell>
  );
}
