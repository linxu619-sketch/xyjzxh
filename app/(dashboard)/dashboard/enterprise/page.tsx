import Link from "next/link";
import {
  ExternalLink, Sparkles, TrendingUp, AlertCircle, ChevronRight,
  Phone, MessageSquare, Eye, Camera,
} from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { StatCard, Panel } from "@/components/dashboard/widgets";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "企业工作台 · 信阳市建筑装修协会" };

const LEADS = [
  { name: "刘女士", area: "120㎡ · 浉河区",    from: "AI 装修顾问", budget: "30 万", hot: true,  phone: "138****8472" },
  { name: "陈先生", area: "168㎡ · 羊山新区",  from: "协会主站推荐", budget: "45 万", hot: true,  phone: "138****6611" },
  { name: "王女士", area: "98㎡ · 平桥区",     from: "子站表单",     budget: "20 万", hot: false, phone: "138****7720" },
  { name: "孙总",   area: "1200㎡ 工装",        from: "AI 估价",      budget: "180 万",hot: true,  phone: "138****2008" },
  { name: "周女士", area: "85㎡",                from: "口碑评价回流", budget: "16 万", hot: false, phone: "138****1188" },
];

const PROJECTS = [
  { id: "P-2026-0501", name: "金茂悦府 12 栋", progress: 42,  status: "施工中" as const, alert: "防水验收待业主签" },
  { id: "P-2026-0498", name: "茶都商务大厦 22F", progress: 68, status: "施工中" as const },
  { id: "P-2026-0524", name: "万象城海底捞餐饮空间", progress: 12, status: "施工中" as const },
  { id: "P-2026-0476", name: "御景湾别墅软装",     progress: 100, status: "已竣工" as const },
  { id: "P-2026-0508", name: "光山县中医院门诊楼", progress: 0,   status: "待审" as const },
];

export default async function EnterpriseDashboard() {
  return (
    <EnterpriseShell
      title="名家装饰 · 工作台"
      subtitle="子站 mingjia.xyjzxh.com · 本月数据"
      actions={
        <>
          <a
            href="/biz/mingjia"
            target="_blank"
            rel="noreferrer"
            className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            打开子站 <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </>
      }
    >
      {/* 紧急提醒条 */}
      <div className="mb-5 rounded-2xl bg-gradient-to-r from-cat-decor to-[#e6531f] text-white p-4 flex items-center gap-3 shadow-md">
        <span className="relative h-9 w-9 rounded-xl bg-white/20 inline-flex items-center justify-center shrink-0">
          <AlertCircle className="h-5 w-5" />
          <span className="absolute inset-0 rounded-xl bg-white/20 animate-ping opacity-40" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold">3 项待处理 · 5 条新线索 · 2 项报备等审核</div>
          <div className="text-[11px] text-white/85 mt-0.5">业主 1 笔变更待审批 · 2 笔保单本月续费</div>
        </div>
        <Link
          href="/dashboard/enterprise/orders"
          className="hidden md:inline-flex items-center gap-1 text-[12px] font-medium bg-accent-yellow text-foreground h-9 px-4 rounded-full"
        >
          立即处理 <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="本月线索"     value="184"   sub="较上月" trend={{ dir: "up", value: "32" }} color="decor" />
        <StatCard label="子站访客"     value="9,284" sub="转化率 1.98%" trend={{ dir: "up", value: "18%" }} color="brand" />
        <StatCard label="进行中项目"   value="42"    sub="2 项待补材料" color="build" />
        <StatCard label="平均评分"     value="4.8"   sub="共 1,284 条" color="design" />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        {/* 最新线索 */}
        <Panel
          title="最新线索"
          className="lg:col-span-2"
          action={
            <Link href="/dashboard/enterprise/leads" className="text-[12px] text-brand inline-flex items-center gap-0.5">
              全部 5 条 <ChevronRight className="h-3 w-3" />
            </Link>
          }
        >
          <ul className="divide-y divide-border">
            {LEADS.map((l, i) => (
              <li key={i} className="py-3 flex items-center gap-3 text-[13px] active:bg-surface/60 transition-colors -mx-2 px-2 rounded-lg">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cat-decor to-[#e6531f] text-white inline-flex items-center justify-center text-[13px] font-semibold shrink-0">
                    {l.name.slice(0, 1)}
                  </div>
                  {l.hot && (
                    <span className="absolute -top-0.5 -right-0.5 text-[10px]">🔥</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium flex items-center gap-1.5">
                    {l.name}
                    <span className="text-muted-foreground font-normal text-[12px]">· {l.area}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                    <span>{l.from}</span>
                    <span>·</span>
                    <span className="text-cat-decor font-medium tabular-nums">¥{l.budget}</span>
                    <span className="hidden md:inline">· {l.phone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <a href={`tel:${l.phone.replace(/\D/g, "")}`} className="h-8 w-8 rounded-full hover:bg-cat-build-soft text-cat-build inline-flex items-center justify-center" title="拨打">
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                  <button className="h-8 w-8 rounded-full hover:bg-surface text-muted-foreground inline-flex items-center justify-center" title="微信消息">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        {/* 子站健康度 */}
        <Panel title="子站健康度">
          <div className="space-y-3 text-[13px]">
            <FunnelRow label="访客" value="9,284" total={9284} color="text-foreground" />
            <FunnelRow label="表单填写" value="632" total={9284} color="text-cat-build" />
            <FunnelRow label="量房" value="265" total={9284} color="text-cat-decor" />
            <FunnelRow label="签单" value="101" total={9284} color="text-accent-tea" />
          </div>
          <div className="mt-4 rounded-2xl bg-foreground text-background p-4 flex items-start gap-2.5 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cat-design/30 blur-2xl" />
            <Sparkles className="relative h-4 w-4 text-accent-yellow mt-0.5 shrink-0" />
            <div className="relative text-[12px] leading-5">
              <b>AI 小经：</b>本周末更新 3 套新案例，预计 +12% 停留时间。
            </div>
          </div>
        </Panel>

        {/* 项目进度 */}
        <Panel
          title="项目进度"
          className="lg:col-span-2"
          action={
            <Link href="/dashboard/enterprise/orders" className="text-[12px] text-brand inline-flex items-center gap-0.5">
              工作台 <ChevronRight className="h-3 w-3" />
            </Link>
          }
        >
          <ul className="divide-y divide-border">
            {PROJECTS.map((p) => (
              <li key={p.id} className="py-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{p.name}</div>
                    {p.alert && (
                      <div className="text-[10px] text-cat-decor mt-0.5 inline-flex items-center gap-0.5">
                        <AlertCircle className="h-2.5 w-2.5" /> {p.alert}
                      </div>
                    )}
                  </div>
                  <Badge tone={p.status === "已竣工" ? "tea" : p.status === "施工中" ? "decor" : "yellow"}>
                    {p.status}
                  </Badge>
                  <code className="text-[10px] font-mono text-muted-foreground shrink-0">{p.id.slice(-3)}</code>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        p.progress === 100 ? "bg-accent-tea" : "bg-cat-decor"
                      }`}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold tabular-nums shrink-0 w-10 text-right">{p.progress}%</span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        {/* AI 员工本月 */}
        <Panel title="AI 员工 · 本月">
          <ul className="space-y-3 text-[13px]">
            {[
              { who: "小装", topic: "C 端咨询",    n: 812,  color: "text-cat-decor" },
              { who: "小设", topic: "设计建议",    n: 416,  color: "text-cat-design" },
              { who: "小经", topic: "后台答疑",    n: 92,   color: "text-cat-build" },
            ].map((a) => (
              <li key={a.who} className="flex items-center justify-between">
                <span>
                  <b>{a.who}</b>
                  <span className="text-muted-foreground text-[11px] ml-1">· {a.topic}</span>
                </span>
                <span className={`font-semibold tabular-nums ${a.color}`}>{a.n}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">本月用量</span>
            <span className="font-semibold tabular-nums">1,320 / 1,000 次</span>
          </div>
          <Link href="/dashboard/enterprise/ai" className="mt-2 inline-flex items-center gap-1 text-[12px] text-brand">
            <Sparkles className="h-3 w-3" /> 配置专属 AI →
          </Link>
        </Panel>

        {/* 现场速览 */}
        <Panel
          title="今日施工 · 6 工地"
          className="lg:col-span-3"
          action={
            <Link href="/dashboard/enterprise/orders" className="text-[12px] text-brand">查看 → </Link>
          }
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { p: "金茂悦府 1602",  workers: 6, photos: 14, status: "进行中" },
              { p: "茶都商务 22F",   workers: 12, photos: 26, status: "进行中" },
              { p: "万象城海底捞",   workers: 8, photos: 18, status: "进行中" },
              { p: "南湖一号 402",   workers: 4, photos: 8, status: "进行中" },
              { p: "御景湾 801",     workers: 5, photos: 12, status: "进行中" },
              { p: "弦山街 A 栋",    workers: 3, photos: 6, status: "已停工" },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-border bg-background p-3">
                <div className="aspect-video rounded-xl bg-gradient-to-br from-cat-decor/30 to-surface mb-2" />
                <div className="text-[12px] font-semibold truncate">{s.p}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 inline-flex items-center gap-2">
                  <span className="inline-flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" /> {s.workers}人</span>
                  <span className="inline-flex items-center gap-0.5"><Camera className="h-2.5 w-2.5" /> {s.photos}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </EnterpriseShell>
  );
}

function FunnelRow({ label, value, total, color }: { label: string; value: string; total: number; color: string }) {
  const pct = (Number(value.replace(/[^\d]/g, "")) / total) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-muted-foreground text-[12px]">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`font-semibold tabular-nums ${color}`}>{value}</span>
          {pct < 100 && <span className="text-[10px] text-muted-foreground tabular-nums">{pct.toFixed(1)}%</span>}
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-surface overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cat-build to-cat-decor transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
