import Link from "next/link";
import { ArrowLeft, Users2, Phone, Pause, Play, Clock, MapPin } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getTraining, listEnrollmentsByTraining } from "@/lib/data/training";
import { setTrainingStatusAction } from "../actions";

export const metadata = { title: "培训详情 · 协会工作台" };

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function TrainingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = getTraining(Number(id));
  if (!t) {
    return (
      <AssociationShell title="培训详情">
        <Link href="/dashboard/association/training" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> 返回培训管理</Link>
        <div className="mt-6 rounded-2xl border border-border bg-background p-10 text-center text-[14px] text-muted-foreground">未找到该课程。</div>
      </AssociationShell>
    );
  }
  const enrolls = listEnrollmentsByTraining(t.id);

  return (
    <AssociationShell title="培训详情" subtitle={`${t.title} · ${enrolls.length} 人报名`}>
      <Link href="/dashboard/association/training" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回培训管理</Link>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone="design">{t.category}</Badge>
            <span className="text-[16px] font-semibold">{t.title}</span>
            <Badge tone={t.status === "open" ? "tea" : "neutral"}>{t.status === "open" ? "在招" : "已结束"}</Badge>
          </div>
          <form action={setTrainingStatusAction}>
            <input type="hidden" name="id" value={t.id} />
            <input type="hidden" name="status" value={t.status === "open" ? "closed" : "open"} />
            <button className="h-9 px-4 rounded-full border border-border text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-surface">
              {t.status === "open" ? <><Pause className="h-3.5 w-3.5" /> 结束报名</> : <><Play className="h-3.5 w-3.5" /> 重新开放</>}
            </button>
          </form>
        </div>
        <dl className="divide-y divide-border text-[14px]">
          <Row k="讲师 / 主办" v={t.instructor} />
          <Row k="时间" v={t.schedule || "待定"} icon="clock" />
          <Row k="地点" v={t.location || "—"} icon="map" />
          <Row k="名额 / 费用" v={`${t.capacity > 0 ? `${enrolls.length}/${t.capacity} 人` : `${enrolls.length} 人（不限）`} · ${t.fee}`} />
          <Row k="课程说明" v={t.detail || "—"} />
        </dl>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold inline-flex items-center gap-1.5"><Users2 className="h-4 w-4" /> 报名学员（{enrolls.length}）</div>
        {enrolls.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">还没有人报名。从业者在「培训」报名后会出现在这里。</div>
        ) : (
          <ul className="divide-y divide-border">
            {enrolls.map((e) => (
              <li key={e.id} className="px-5 py-3.5 flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-cat-design-soft text-cat-design inline-flex items-center justify-center text-[12px] font-semibold shrink-0">{e.name.slice(0, 1)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{e.name}</div>
                  <a href={`tel:${e.phone}`} className="text-[12px] text-brand inline-flex items-center gap-1"><Phone className="h-3 w-3" />{e.phone}</a>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">{fmt(e.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AssociationShell>
  );
}

function Row({ k, v, icon }: { k: string; v: string; icon?: "clock" | "map" }) {
  return (
    <div className="px-5 py-3 flex justify-between gap-4">
      <dt className="text-muted-foreground shrink-0 inline-flex items-center gap-1">
        {icon === "clock" && <Clock className="h-3.5 w-3.5" />}{icon === "map" && <MapPin className="h-3.5 w-3.5" />}{k}
      </dt>
      <dd className="text-right break-all whitespace-pre-wrap">{v || "—"}</dd>
    </div>
  );
}
