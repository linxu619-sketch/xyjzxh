import Link from "next/link";
import { requireLogin } from "@/lib/auth/guard";
import { FileCheck2, ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STATUS_META } from "@/lib/data/projects";
import { listShowcaseProjects } from "@/lib/data/projects-source";

export const metadata = { title: "工装报备 · 信阳市建筑装饰装修协会" };

const TYPE_TONE: Record<string, "build" | "decor" | "design" | "tea"> = {
  家装: "decor", 工装: "build", 公装: "design", 市政: "tea",
};

export default async function ProjectsPage() {
  await requireLogin();
  const PROJECTS = listShowcaseProjects();
  return (
    <>
      <PageHeader
        eyebrow="工装报备 · PROJECTS"
        tone="build"
        title={<>工装报备 · 信阳一网通办</>}
        description={<>信阳已与省厅数据打通，企业 <b>一次填报</b> 即同步省级监管，平均审批 <b>≤24h</b>。</>}
        actions={
          <>
            <Button href="/projects/new" size="md" variant="secondary">
              新建报备
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/ai/report" size="md" variant="outline">
              AI 预审帮我填
            </Button>
          </>
        }
      />

      {/* 数据条 */}
      <Container className="py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { l: "报备方式", v: "省厅直连", c: "build" },
            { l: "AI 预审", v: "查漏补缺", c: "tea" },
            { l: "审批时效", v: "≤24h", c: "brand" },
            { l: "资金保障", v: "可购履约险", c: "decor" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-border bg-background p-5">
              <div className="text-[11px] text-muted-foreground tracking-wider uppercase">{s.l}</div>
              <div className={`mt-1 text-[28px] font-semibold tracking-tight ${
                s.c === "build" ? "text-cat-build" :
                s.c === "decor" ? "text-cat-decor" :
                s.c === "brand" ? "text-brand" : "text-accent-tea"
              }`}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* 列表 */}
        <div className="mt-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight">最近报备</h2>
          </div>

          {/* 移动端卡片 */}
          <div className="md:hidden space-y-3">
            {PROJECTS.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="block rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge tone={TYPE_TONE[p.type]}>{p.type}</Badge>
                  <Badge tone={STATUS_META[p.status].tone as "brand"}>{STATUS_META[p.status].label}</Badge>
                  {p.insured && <span className="inline-flex items-center gap-0.5 text-[10px] text-accent-tea"><ShieldCheck className="h-3 w-3" />已投保</span>}
                </div>
                <div className="text-[14px] font-semibold">{p.name}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {p.enterprise} · {p.area}㎡ · 预算 {p.budget}万 · {p.district}
                </div>
                {p.progress > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full bg-surface">
                      <div className="h-full rounded-full bg-cat-decor" style={{ width: `${p.progress}%` }} />
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground">进度 {p.progress}%</div>
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* PC 表格：整行可点进详情页（全平台列表铁律） */}
          <div className="hidden md:block rounded-2xl border border-border bg-background overflow-hidden">
            <div className="grid grid-cols-[110px_1.6fr_72px_1.2fr_1fr_92px_110px_24px] gap-3 px-5 py-3 bg-surface text-[12px] text-muted-foreground">
              <span>报备号</span><span>项目名称</span><span>类型</span><span>企业</span><span>面积 / 预算</span><span>状态</span><span>进度</span><span />
            </div>
            <div className="divide-y divide-border">
              {PROJECTS.map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`} className="grid grid-cols-[110px_1.6fr_72px_1.2fr_1fr_92px_110px_24px] gap-3 items-center px-5 py-3 text-[13px] hover:bg-surface/60 transition-colors">
                  <span className="font-mono text-[12px] text-muted-foreground truncate">{p.id}</span>
                  <span className="font-medium truncate">{p.name}{p.insured && <ShieldCheck className="h-3.5 w-3.5 inline ml-1.5 text-accent-tea" />}</span>
                  <span><Badge tone={TYPE_TONE[p.type]}>{p.type}</Badge></span>
                  <span className="text-muted-foreground truncate">{p.enterprise}</span>
                  <span className="text-muted-foreground">{p.area}㎡ · {p.budget}万</span>
                  <span><Badge tone={STATUS_META[p.status].tone as "brand"}>{STATUS_META[p.status].label}</Badge></span>
                  <span><span className="block h-1.5 w-24 rounded-full bg-surface"><span className="block h-full rounded-full bg-cat-decor" style={{ width: `${p.progress}%` }} /></span></span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-3xl bg-foreground text-background p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <FileCheck2 className="h-8 w-8 text-accent-yellow mt-0.5" />
            <div>
              <div className="text-[18px] md:text-[22px] font-semibold">不知道报备怎么填？</div>
              <div className="text-[13px] text-background/70 mt-1">让 AI 报备助手帮你预审材料和填写表单，常见错误一键提示。</div>
            </div>
          </div>
          <Link href="/ai/report" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-accent-yellow text-foreground font-medium">
            找 AI 小报 →
          </Link>
        </div>
      </Container>
    </>
  );
}
