import Link from "next/link";
import { Building2, Users2, Award, Sparkles, ArrowUpRight, Flag, ShieldCheck, Briefcase } from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "组织机构 · 信阳市建筑装饰装修协会" };

type OrgItem = {
  tag?: string;          // 机构类别（党组织 / 权力机构 / 执行机构 / 监督机构）
  name: string;
  desc?: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;         // 设置后该节点显示「查看专栏」链接（如党支部 → 党建专栏）
  children?: OrgItem[];
};

// 协会治理结构：党组织 — 权力机构 — 执行机构 — 监督机构
const ORG: OrgItem[] = [
  {
    tag: "党组织",
    name: "党支部",
    desc: "发挥政治引领与战斗堡垒作用，把党建工作融入协会运行。",
    icon: Flag,
    href: "/party",
  },
  {
    tag: "权力机构",
    name: "会员（代表）大会",
    desc: "协会最高权力机构，审议重大事项、选举与罢免理事 / 监事。",
    icon: Users2,
  },
  {
    tag: "执行机构",
    name: "理事会",
    desc: "会员（代表）大会闭会期间的执行机构，向会员大会负责。",
    icon: Building2,
    children: [
      { name: "领导层", desc: "会长、副会长、秘书长", icon: Award },
      { name: "秘书处", desc: "常务秘书长", icon: Briefcase },
      { name: "综合办公室", desc: "办公室主任", icon: Building2 },
    ],
  },
  {
    tag: "监督机构",
    name: "监事会",
    desc: "对理事会及其成员履职情况进行监督，向会员（代表）大会负责。",
    icon: ShieldCheck,
  },
];

export default function OrgPage() {
  return (
    <>
      <PageHeader
        eyebrow="ABOUT · 组织机构"
        tone="brand"
        title={<>协会组织机构</>}
        description="协会按「党组织 — 权力机构（会员大会）— 执行机构（理事会）— 监督机构（监事会）」搭建治理体系，党建引领、权责清晰、运行规范。"
      />
      <Container className="py-12 max-w-4xl">
        <div className="space-y-4">
          {ORG.map((node) => (
            <OrgNode key={node.name} node={node} level={0} />
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-foreground text-background p-7 flex items-center gap-4">
          <Award className="h-7 w-7 text-accent-yellow" />
          <div className="flex-1">
            <div className="text-[18px] font-semibold">想了解现任领导班子？</div>
            <div className="text-[12px] text-background/70 mt-1">在「关于协会」查看会长、秘书长等任职信息与协会联系方式。</div>
          </div>
          <Link href="/about" className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-accent-yellow text-foreground text-[13px] font-medium">
            查看 <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </Container>
    </>
  );
}

function OrgNode({ node, level }: { node: OrgItem; level: number }) {
  const Icon = node.icon ?? Building2;
  const top = level === 0;
  return (
    <div className={top ? "" : "mt-3"}>
      <div className={`rounded-2xl border p-5 ${top ? "bg-foreground text-background border-foreground" : "bg-background border-border"}`}>
        <div className="flex items-center gap-3">
          <span className={`h-10 w-10 rounded-xl inline-flex items-center justify-center shrink-0 ${top ? "bg-accent-yellow text-foreground" : "bg-brand-50 text-brand"}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            {node.tag && (
              <span className="inline-block mb-1 rounded-full bg-background/15 px-2 py-0.5 text-[10px] tracking-wider uppercase">
                {node.tag}
              </span>
            )}
            <div className="text-[15px] font-semibold">{node.name}</div>
            {node.desc && <div className={`text-[12px] mt-0.5 ${top ? "text-background/70" : "text-muted-foreground"}`}>{node.desc}</div>}
          </div>
          {node.href && (
            <Link href={node.href} className="ml-auto shrink-0 inline-flex items-center gap-1 h-8 px-3.5 rounded-full bg-accent-yellow text-foreground text-[12px] font-medium">
              党建专栏 <ArrowUpRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="pl-6 border-l-2 border-dashed border-border ml-5 mt-3 space-y-3">
          {node.children.map((child) => (
            <OrgNode key={child.name} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
