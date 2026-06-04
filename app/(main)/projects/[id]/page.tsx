import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, MapPin, Calendar, Wallet, CheckCircle2, Clock } from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_META } from "@/lib/data/projects";
import { getShowcaseProject } from "@/lib/data/projects-source";

const TYPE_TONE: Record<string, "build" | "decor" | "design" | "tea"> = {
  家装: "decor", 工装: "build", 公装: "design", 市政: "tea",
};

const TIMELINE = [
  { t: "提交报备", at: "2026-05-12 09:24", done: true },
  { t: "协会初审通过", at: "2026-05-12 14:10", done: true },
  { t: "省厅备案登记", at: "2026-05-13 08:30", done: true },
  { t: "开工", at: "2026-05-20 07:00", done: true },
  { t: "水电验收", at: "2026-06-05", done: true },
  { t: "泥木工验收", at: "2026-06-25", done: false },
  { t: "竣工初验", at: "2026-08-12", done: false },
  { t: "归档", at: "2026-08-20", done: false },
];

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getShowcaseProject(id);
  if (!p) notFound();

  return (
    <Container className="py-10 md:py-14">
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-5">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回报备列表
      </Link>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge tone={TYPE_TONE[p.type]}>{p.type}</Badge>
            <Badge tone={STATUS_META[p.status].tone as "brand"}>{STATUS_META[p.status].label}</Badge>
            {p.insured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f7f1] text-accent-tea px-2.5 py-0.5 text-[11px] font-medium">
                <ShieldCheck className="h-3 w-3" /> 已投保
              </span>
            )}
          </div>
          <h1 className="text-[28px] md:text-[40px] font-semibold tracking-tight leading-tight">{p.name}</h1>
          <div className="mt-3 text-[13px] text-muted-foreground flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />报备 {p.reportedAt}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{p.district}</span>
            <span className="font-mono">{p.id}</span>
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="text-[12px] text-muted-foreground">承建企业</div>
          <Link href={`/members/${p.enterpriseId}`} className="text-[16px] font-semibold hover:text-brand">{p.enterprise}</Link>
          <Button href="/ai/report" size="sm" variant="outline">问问 AI 小报</Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Metric label="面积" value={`${p.area}㎡`} icon={MapPin} />
        <Metric label="合同价" value={`${p.budget} 万`} icon={Wallet} />
        <Metric label="工期" value={`${p.startDate}\n→ ${p.endDate}`} icon={Calendar} small />
        <Metric label="进度" value={`${p.progress}%`} icon={Clock} />
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 时间线 */}
        <div className="lg:col-span-2 rounded-3xl border border-border bg-background p-6 md:p-8">
          <h2 className="text-[18px] font-semibold mb-6">报备 · 施工时间线</h2>
          <ol className="relative">
            <span className="absolute left-3 top-1 bottom-1 w-px bg-border" />
            {TIMELINE.map((t, i) => (
              <li key={i} className="relative pl-10 pb-6 last:pb-0">
                <span className={`absolute left-0 top-0.5 h-6 w-6 rounded-full flex items-center justify-center ${t.done ? "bg-accent-tea text-white" : "bg-surface text-muted-foreground border border-border"}`}>
                  {t.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3 w-3" />}
                </span>
                <div className={`text-[14px] ${t.done ? "font-medium" : "text-muted-foreground"}`}>{t.t}</div>
                <div className="text-[11px] text-muted-foreground">{t.at}</div>
              </li>
            ))}
          </ol>
        </div>

        {/* 侧栏 */}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-border p-6 bg-surface">
            <div className="text-[12px] text-muted-foreground tracking-wider uppercase">关联信息</div>
            <ul className="mt-3 space-y-2 text-[13px]">
              <li className="flex justify-between"><span className="text-muted-foreground">设计单位</span><span>雅舍设计事务所</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">监理单位</span><span>协会监理委</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">业主</span><span>刘女士 · C00284</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">关联保单</span><span className="text-brand">×2 →</span></li>
            </ul>
          </div>

          <div className="rounded-3xl border border-border p-6">
            <div className="text-[12px] text-muted-foreground tracking-wider uppercase">下一步</div>
            <ul className="mt-3 space-y-2 text-[13px]">
              <li>· 6 月 5 日前完成水电隐蔽验收</li>
              <li>· 6 月 8 日协会随机抽检</li>
              <li>· 6 月 10 日上传阶段照片</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-foreground text-background p-6">
            <div className="text-[12px] tracking-wider uppercase text-background/60">遇到问题？</div>
            <div className="mt-2 text-[15px] font-semibold">协会调解委员会 14 天介入</div>
            <Link href="/mediate" className="mt-4 inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-accent-yellow text-foreground text-[12px] font-medium">
              申请调解
            </Link>
          </div>
        </aside>
      </div>
    </Container>
  );
}

function Metric({ label, value, icon: Icon, small }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; small?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className={`mt-1.5 font-semibold tracking-tight whitespace-pre-line ${small ? "text-[14px] leading-5" : "text-[24px]"}`}>{value}</div>
    </div>
  );
}
