import Link from "next/link";
import { Search, Clock, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { FilterBar } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "调解纠纷 · 协会工作台" };

type Case = {
  id: string; tag: "工期" | "质量" | "材料" | "合同";
  customer: string; enterprise: string; project: string;
  amount: string; submitted: string; deadline: string;
  status: "待受理" | "调解中" | "已结案";
  mediator: string; severity: "低" | "中" | "高";
  summary: string;
};

const CASES: Case[] = [
  { id: "M-2026-0078", tag: "工期", customer: "刘女士", enterprise: "名家装饰", project: "金茂悦府 1602",
    amount: "32 万", submitted: "今天 09:24", deadline: "6 月 12 日", status: "待受理", mediator: "—", severity: "中",
    summary: "工期延误 7 天，业主主张违约金 5%，企业承认部分责任。AI 小和建议：调取雨季施工记录。" },
  { id: "M-2026-0076", tag: "质量", customer: "陈先生", enterprise: "壹品装饰", project: "茶都商务大厦 22F",
    amount: "280 万", submitted: "昨天 17:08", deadline: "6 月 11 日", status: "调解中", mediator: "张主任", severity: "高",
    summary: "墙面瓷砖大面积空鼓，业主拒付尾款 84 万。已组织三方现场复核。" },
  { id: "M-2026-0075", tag: "材料", customer: "王女士", enterprise: "万家美装饰", project: "弦山街整装",
    amount: "16 万", submitted: "5 月 28 日", deadline: "6 月 11 日", status: "调解中", mediator: "李主任", severity: "中",
    summary: "约定 E0 板材实测 E1，业主要求拆改重做或减免 30%。AI 已起草和解意见。" },
  { id: "M-2026-0074", tag: "合同", customer: "周先生", enterprise: "佳和苑装饰", project: "息县别墅装修",
    amount: "86 万", submitted: "5 月 25 日", deadline: "—", status: "已结案", mediator: "张主任", severity: "低",
    summary: "合同含混条款致工程变更价款争议；最终协会主持下双方各让一半。" },
];

const TONE: Record<Case["tag"], "build" | "decor" | "design" | "tea"> = {
  工期: "decor", 质量: "build", 材料: "design", 合同: "tea",
};

const STATUS_TONE: Record<Case["status"], "yellow" | "brand" | "tea"> = {
  待受理: "yellow", 调解中: "brand", 已结案: "tea",
};

const SEV: Record<Case["severity"], string> = {
  低: "text-accent-tea", 中: "text-cat-decor", 高: "text-cat-decor font-semibold",
};

export default function MediationsAdmin() {
  const pending = CASES.filter((c) => c.status === "待受理");
  return (
    <AssociationShell
      title="调解纠纷"
      subtitle={`待受理 ${pending.length} 起 · 调解中 ${CASES.filter((c) => c.status === "调解中").length} 起 · 14 天结案率 94%`}
      actions={
        <Link href="/ai/mediate" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-accent-yellow" /> AI 小和
        </Link>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { l: "待受理", v: pending.length, icon: AlertTriangle, c: "text-cat-decor" },
          { l: "调解中", v: 1, icon: Clock, c: "text-brand" },
          { l: "已结案 (本月)", v: 12, icon: CheckCircle2, c: "text-accent-tea" },
          { l: "满意度", v: "4.7", icon: CheckCircle2, c: "text-cat-design" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-background p-5">
            <div className="text-[11px] text-muted-foreground tracking-wider uppercase">{s.l}</div>
            <div className={`mt-1 text-[28px] font-semibold tracking-tight ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <FilterBar className="mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <input placeholder="搜索案号 / 投诉人 / 企业" className="flex-1 bg-transparent outline-none text-[13px] py-1" />
        </div>
        <select className="h-9 rounded-full bg-surface text-[12px] px-3 border border-transparent">
          <option>类别：全部</option><option>工期</option><option>质量</option><option>材料</option><option>合同</option>
        </select>
        <select className="h-9 rounded-full bg-surface text-[12px] px-3 border border-transparent">
          <option>严重度：全部</option><option>低</option><option>中</option><option>高</option>
        </select>
      </FilterBar>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {CASES.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-background p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge tone={TONE[c.tag]}>{c.tag}</Badge>
                <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
                <span className={`text-[11px] ${SEV[c.severity]}`}>● {c.severity}级</span>
              </div>
              <code className="text-[11px] font-mono text-muted-foreground">{c.id}</code>
            </div>
            <div className="text-[15px] font-semibold">
              {c.customer} <span className="text-muted-foreground font-normal">vs</span> {c.enterprise}
            </div>
            <div className="text-[12px] text-muted-foreground mt-0.5">
              项目：{c.project} · 标的额 {c.amount} · 调解员：{c.mediator}
            </div>
            <div className="mt-3 rounded-xl bg-surface p-3 text-[12px] text-muted-foreground leading-5">
              {c.summary}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>提交：{c.submitted}</span>
              {c.deadline !== "—" && <span>14 天截止：{c.deadline}</span>}
            </div>
            <div className="mt-4 flex items-center gap-2">
              {c.status === "待受理" ? (
                <>
                  <button className="h-9 px-4 rounded-full bg-foreground text-background text-[12px] font-medium">受理 · 分配调解员</button>
                  <button className="h-9 px-4 rounded-full border border-border text-[12px]">转他人受理</button>
                </>
              ) : c.status === "调解中" ? (
                <>
                  <button className="h-9 px-4 rounded-full bg-accent-tea text-white text-[12px] font-medium">登记结案</button>
                  <button className="h-9 px-4 rounded-full border border-border text-[12px]">起草调解书</button>
                </>
              ) : (
                <button className="h-9 px-4 rounded-full bg-surface text-[12px]">查看调解书</button>
              )}
              <button className="ml-auto h-9 px-4 rounded-full bg-surface text-[12px] inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-cat-decor" /> AI 复盘
              </button>
            </div>
          </div>
        ))}
      </div>
    </AssociationShell>
  );
}
