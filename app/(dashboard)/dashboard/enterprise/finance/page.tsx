import Link from "next/link";
import { Wallet, Umbrella, ArrowUpRight } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "金融保险 · 企业工作台" };

const FIN = [
  { id: "FL-202604-001", product: "建装贷",     bank: "中原银行", amount: "300 万", status: "已放款", rate: "3.65%", appliedAt: "2026-04-22" },
  { id: "FL-202605-008", product: "工程保函",   bank: "建设银行", amount: "120 万", status: "已出函", rate: "0.78%", appliedAt: "2026-05-12" },
  { id: "FL-202605-014", product: "工程款保理", bank: "信阳农商", amount: "85 万",  status: "审核中", rate: "5.8%",  appliedAt: "2026-05-26" },
];

const INS = [
  { id: "POL-2026-001", product: "工程履约保证保险", insurer: "平安产险", target: "金茂悦府 1602",           amount: "32 万",  status: "生效中", premium: "¥2,240",  start: "2026-05-20" },
  { id: "POL-2026-002", product: "建筑工人团意险",  insurer: "国寿财险", target: "项目人员 12 人",            amount: "960 万", status: "生效中", premium: "¥1,440",  start: "2026-05-20" },
  { id: "POL-2026-003", product: "工程履约保证保险", insurer: "平安产险", target: "茶都商务大厦 22F",         amount: "280 万", status: "理赔中", premium: "¥19,600", start: "2026-04-10" },
];

export default function EnterpriseFinance() {
  return (
    <EnterpriseShell
      title="金融 / 保险"
      subtitle="协会撮合 · 会员专属费率 · 一次申请同步推送多家"
      actions={
        <Link href="/finance" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5" /> 申请新产品
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl bg-gradient-to-br from-cat-design to-[#6d3df0] text-white p-6">
          <Wallet className="h-7 w-7 text-accent-yellow" />
          <div className="mt-3 text-[12px] text-white/70 tracking-wider uppercase">已获融资额度</div>
          <div className="mt-1 text-[40px] font-semibold tracking-tight leading-none">¥420 万</div>
          <div className="mt-2 text-[12px] text-white/70">2 笔已放 · 1 笔审核中</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-cat-decor to-[#e6531f] text-white p-6">
          <Umbrella className="h-7 w-7 text-accent-yellow" />
          <div className="mt-3 text-[12px] text-white/70 tracking-wider uppercase">在保保单 / 保额</div>
          <div className="mt-1 text-[40px] font-semibold tracking-tight leading-none">3 份 / ¥1,272 万</div>
          <div className="mt-2 text-[12px] text-white/70">本年理赔金额 ¥12.6 万</div>
        </div>
      </div>

      {/* 金融 */}
      <h2 className="text-[18px] font-semibold mb-3 flex items-center gap-2">
        <Wallet className="h-4 w-4 text-cat-design" /> 金融业务
      </h2>
      <div className="rounded-2xl border border-border bg-background overflow-x-auto mb-8">
        <table className="w-full text-[13px]">
          <thead className="bg-surface text-[12px] text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">单号</th>
              <th className="text-left px-5 py-3 font-medium">产品 / 机构</th>
              <th className="text-left px-5 py-3 font-medium">金额</th>
              <th className="text-left px-5 py-3 font-medium">利率 / 费率</th>
              <th className="text-left px-5 py-3 font-medium">申请时间</th>
              <th className="text-left px-5 py-3 font-medium">状态</th>
              <th className="text-right px-5 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {FIN.map((f) => (
              <tr key={f.id} className="hover:bg-surface/60">
                <td className="px-5 py-3 font-mono text-[12px]">{f.id}</td>
                <td className="px-5 py-3"><div className="font-medium">{f.product}</div><div className="text-[11px] text-muted-foreground">{f.bank}</div></td>
                <td className="px-5 py-3 font-semibold">{f.amount}</td>
                <td className="px-5 py-3 text-muted-foreground">{f.rate}</td>
                <td className="px-5 py-3 text-muted-foreground">{f.appliedAt}</td>
                <td className="px-5 py-3"><Badge tone={f.status === "已放款" ? "tea" : f.status === "已出函" ? "build" : "yellow"}>{f.status}</Badge></td>
                <td className="px-5 py-3 text-right"><button className="text-brand text-[12px] font-medium">详情 →</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 保险 */}
      <h2 className="text-[18px] font-semibold mb-3 flex items-center gap-2">
        <Umbrella className="h-4 w-4 text-cat-decor" /> 保险业务
      </h2>
      <div className="rounded-2xl border border-border bg-background overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="bg-surface text-[12px] text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">保单号</th>
              <th className="text-left px-5 py-3 font-medium">险种 / 公司</th>
              <th className="text-left px-5 py-3 font-medium">承保标的</th>
              <th className="text-left px-5 py-3 font-medium">保额</th>
              <th className="text-left px-5 py-3 font-medium">保费</th>
              <th className="text-left px-5 py-3 font-medium">生效日</th>
              <th className="text-left px-5 py-3 font-medium">状态</th>
              <th className="text-right px-5 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {INS.map((p) => (
              <tr key={p.id} className="hover:bg-surface/60">
                <td className="px-5 py-3 font-mono text-[12px]">{p.id}</td>
                <td className="px-5 py-3"><div className="font-medium">{p.product}</div><div className="text-[11px] text-muted-foreground">{p.insurer}</div></td>
                <td className="px-5 py-3 text-muted-foreground">{p.target}</td>
                <td className="px-5 py-3 font-semibold">{p.amount}</td>
                <td className="px-5 py-3 text-muted-foreground">{p.premium}</td>
                <td className="px-5 py-3 text-muted-foreground">{p.start}</td>
                <td className="px-5 py-3"><Badge tone={p.status === "生效中" ? "tea" : "decor"}>{p.status}</Badge></td>
                <td className="px-5 py-3 text-right"><button className="text-brand text-[12px] font-medium inline-flex items-center gap-1">详情 <ArrowUpRight className="h-3 w-3" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </EnterpriseShell>
  );
}
