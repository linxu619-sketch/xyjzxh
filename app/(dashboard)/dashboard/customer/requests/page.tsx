import Link from "next/link";
import { MessagesSquare, MapPin, ArrowUpRight, Phone } from "lucide-react";
import { CustomerShell } from "@/components/dashboard/customer-shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { listLeadsForCustomer, type LeadStatus } from "@/lib/data/leads";
import { getEnterprises } from "@/lib/data/enterprises-source";

export const metadata = { title: "我的需求 · 信阳市建筑装饰装修协会" };

const STATUS: Record<LeadStatus, { label: string; tone: "yellow" | "brand" | "build" | "tea" | "neutral" }> = {
  new: { label: "待企业联系", tone: "yellow" },
  contacting: { label: "沟通中", tone: "brand" },
  surveying: { label: "已约量房", tone: "build" },
  signed: { label: "已签约", tone: "tea" },
  lost: { label: "已结束", tone: "neutral" },
};

function fmt(ms: number) {
  if (!ms) return "";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function CustomerRequests() {
  const session = await getSession();
  const leads = session ? listLeadsForCustomer(session.uid, session.phone) : [];
  const ents = await getEnterprises();
  const entOf = (id: string) => ents.find((e) => e.id === id);

  return (
    <CustomerShell title="我的需求">
      <p className="text-[13px] text-muted-foreground mb-4 inline-flex items-center gap-1.5">
        <MessagesSquare className="h-4 w-4 text-brand" /> 你在各企业子站提交的需求 / 咨询都在这里，可跟踪企业处理进度。
      </p>

      {leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-[13px] text-muted-foreground">
          还没有提交过需求。去 <Link href="/members" className="text-brand">找装企</Link> 看看，进入企业子站可「提交需求 / 在线咨询」。
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((l) => {
            const ent = entOf(l.enterpriseId);
            const st = STATUS[l.status] ?? STATUS.new;
            return (
              <div key={l.id} className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[15px] font-semibold truncate">{ent?.hero.brand ?? ent?.name ?? "企业"}</span>
                    <Badge tone="neutral" className="shrink-0">{l.source}</Badge>
                  </div>
                  <Badge tone={st.tone} className="shrink-0">{st.label}</Badge>
                </div>
                <div className="text-[12px] text-muted-foreground">
                  {[l.type, l.style && l.style !== "不限" ? l.style : "", l.area && `${l.area}㎡`, l.budget && `预算 ${l.budget} 万`].filter(Boolean).join(" · ") || "装修需求"}
                </div>
                {l.address && <div className="text-[12px] text-muted-foreground mt-0.5 inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{l.address}</div>}
                {l.note && <p className="text-[12px] text-foreground mt-1.5 line-clamp-2 bg-surface rounded-lg px-2.5 py-1.5">{l.note}</p>}
                <div className="mt-2.5 pt-2.5 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>提交于 {fmt(l.createdAt)}</span>
                  <div className="flex items-center gap-3">
                    {ent?.contact.tel && <a href={`tel:${ent.contact.tel.replace(/-/g, "")}`} className="inline-flex items-center gap-1 text-brand"><Phone className="h-3 w-3" />联系</a>}
                    {ent && <Link href={`/biz/${ent.slug}`} className="inline-flex items-center gap-0.5 text-brand">企业子站 <ArrowUpRight className="h-3 w-3" /></Link>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CustomerShell>
  );
}
