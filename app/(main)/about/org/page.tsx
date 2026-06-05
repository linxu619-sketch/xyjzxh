import Link from "next/link";
import { Building2, Users2, Award, Sparkles, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "组织架构 · 信阳市建筑装饰装修协会" };

type OrgItem = {
  name: string;
  desc?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: OrgItem[];
};

const ORG: OrgItem[] = [
  {
    name: "会员大会",
    desc: "协会最高权力机构，每 4 年换届",
    children: [
      {
        name: "理事会 · 31 人",
        desc: "会员大会闭会期间执行机构，每月召开一次例会",
        children: [
          { name: "会长办公会议", desc: "1 名会长 + 6 名副会长" },
          { name: "秘书处", desc: "1 名秘书长 + 4 名副秘书长 + 12 名干事", icon: Users2 },
          { name: "技术委员会", desc: "标准规范制定、案例评审", icon: Award },
          { name: "调解委员会", desc: "纠纷调解、消费者保护", icon: Building2 },
          { name: "金融保险委员会", desc: "对接金融保险机构", icon: Building2 },
          { name: "AI 与数字化办公室", desc: "AI 员工训练、平台运营", icon: Sparkles },
        ],
      },
      {
        name: "监事会 · 7 人",
        desc: "对理事会工作进行监督，向会员大会负责",
        children: [],
      },
    ],
  },
];

export default function OrgPage() {
  return (
    <>
      <PageHeader
        eyebrow="ABOUT · 组织架构"
        tone="brand"
        title={<>协会组织架构</>}
        description="自 2005 年成立以来，协会逐步形成「会员大会 — 理事会 — 秘书处 + 4 大委员会」的治理体系。"
      />
      <Container className="py-12 max-w-4xl">
        {ORG.map((node) => (
          <OrgNode key={node.name} node={node} level={0} />
        ))}

        <div className="mt-12 rounded-3xl bg-foreground text-background p-7 flex items-center gap-4">
          <Award className="h-7 w-7 text-accent-yellow" />
          <div className="flex-1">
            <div className="text-[18px] font-semibold">想了解领导班子？</div>
            <div className="text-[12px] text-background/70 mt-1">在「关于协会」总览页查看现任会长、秘书长与各委员会主任。</div>
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
  return (
    <div className={level === 0 ? "" : "mt-3"}>
      <div className={`rounded-2xl border border-border bg-background p-5 ${level > 0 ? "" : "bg-foreground text-background border-foreground"}`}>
        <div className="flex items-center gap-3">
          <span className={`h-10 w-10 rounded-xl inline-flex items-center justify-center ${level === 0 ? "bg-accent-yellow text-foreground" : "bg-brand-50 text-brand"}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <div className="text-[15px] font-semibold">{node.name}</div>
            {node.desc && <div className={`text-[12px] mt-0.5 ${level === 0 ? "text-background/70" : "text-muted-foreground"}`}>{node.desc}</div>}
          </div>
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
