import Link from "next/link";
import { Container } from "@/components/container";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import {
  requiredAgreementsFor,
  type AgreementTarget,
} from "@/lib/data/agreements";
import { Badge } from "@/components/ui/badge";
import { AgreementsClient } from "./AgreementsClient";

export const metadata = { title: "签署协议 · 信阳市建筑装饰装修协会" };

export default async function RegisterAgreementsPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;

  const target: AgreementTarget =
    role === "enterprise" ? "enterprise" :
    role === "practitioner" ? "practitioner" :
    "customer";

  const targetLabel =
    target === "enterprise" ? "企业会员" :
    target === "practitioner" ? "行业从业者" : "C 端业主";

  const templates = requiredAgreementsFor(target);

  return (
    <Container className="py-6 md:py-12 max-w-6xl pb-28 md:pb-12">
      <Link
        href={`/register?role=${role ?? "customer"}`}
        className="inline-flex items-center gap-1.5 text-[12px] md:text-[13px] text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> 返回注册
      </Link>

      <div className="mb-6 md:mb-10">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge tone="brand">第 2 步 · 共 3 步</Badge>
          <Badge tone="tea"><ShieldCheck className="h-3 w-3 mr-1 inline" />协会担保签署</Badge>
        </div>
        <h1 className="text-[24px] md:text-[40px] font-semibold tracking-tight leading-tight">
          签署 {targetLabel} 必签协议
        </h1>
        <p className="mt-2 text-[12px] md:text-[14px] text-muted-foreground max-w-2xl leading-6">
          共 <b className="text-foreground">{templates.length}</b> 份。逐份阅读并签字 · 全部完成后进入下一步。
          签署过程将记录阅读时长 / 滚动比例 / 重点条款单独确认 / IP + 设备指纹，供协会审计与司法举证。
        </p>
      </div>

      <AgreementsClient
        templates={templates}
        nextHref={`/register?role=${role ?? "customer"}&agreed=1`}
      />

      {/* 法务说明 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Notice
          title="格式条款显著提示"
          text="重点条款独立标黄并必须勾选 · 满足《民法典》第 496 条说明义务"
        />
        <Notice
          title="可靠电子签名"
          text="签后内容哈希 + 时间戳 + 设备指纹一并存证 · 满足《电子签名法》第 13 条"
        />
        <Notice
          title="单独同意"
          text="敏感个人信息 / 跨境传输条款拆分单签 · 满足《PIPL》第 14/38 条"
        />
      </div>
    </Container>
  );
}

function Notice({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="text-[12px] font-semibold flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> {title}
      </div>
      <div className="text-[11px] text-muted-foreground mt-1.5 leading-5">{text}</div>
    </div>
  );
}
