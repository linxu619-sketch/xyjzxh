import Link from "next/link";
import { Container } from "@/components/container";
import { ROLE_META, type Role } from "@/lib/auth";
import { Building2, UserRound, ShieldCheck, CheckCircle2, HardHat } from "lucide-react";
import { requiredAgreementsFor, type AgreementTarget } from "@/lib/data/agreements";
import { RegisterWizard } from "./RegisterWizard";

export const metadata = { title: "注册 · 信阳市建筑装饰装修协会" };

type RegRole = "enterprise" | "practitioner" | "customer";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ role?: string; submitted?: string }> }) {
  const { role: r, submitted } = await searchParams;
  const role: RegRole = r === "enterprise" ? "enterprise" : r === "practitioner" ? "practitioner" : "customer";
  const meta = ROLE_META[role as Role];
  const target: AgreementTarget = role as AgreementTarget;
  const templates = requiredAgreementsFor(target).map((t) => ({ id: t.id, title: t.title, version: t.version }));
  const isMember = role === "enterprise" || role === "practitioner";

  if (submitted === "1") {
    return (
      <Container className="py-16 md:py-24 max-w-xl text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-[#e6f7f1] text-accent-tea inline-flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-[26px] md:text-[32px] font-semibold tracking-tight">
          {role === "customer" ? "注册已提交" : "入会申请已提交"}
        </h1>
        <p className="mt-3 text-[14px] text-muted-foreground leading-7">
          {role === "customer" ? "我们已收到你的注册信息。" : "协会秘书处将在 1-3 个工作日内完成审核，结果会通过手机通知你。"}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="h-11 px-6 rounded-full bg-foreground text-background text-[14px] font-medium inline-flex items-center justify-center">返回首页</Link>
          <Link href={`/login?role=${role}`} className="h-11 px-6 rounded-full border border-border text-[14px] font-medium inline-flex items-center justify-center">去登录</Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12 md:py-20 max-w-3xl">
      {isMember ? (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link href="/register?role=enterprise" className={`shrink-0 px-3.5 h-9 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5 ${role === "enterprise" ? "bg-foreground text-background" : "bg-surface text-muted-foreground hover:bg-surface-2"}`}>
            <Building2 className="h-3.5 w-3.5" /> 企业会员
          </Link>
          <Link href="/register?role=practitioner" className={`shrink-0 px-3.5 h-9 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5 ${role === "practitioner" ? "bg-foreground text-background" : "bg-surface text-muted-foreground hover:bg-surface-2"}`}>
            <HardHat className="h-3.5 w-3.5" /> 个人会员
          </Link>
          <span className="hidden md:inline-flex ml-auto items-center gap-1 text-[12px] text-muted-foreground shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> 会员资格由秘书处审核开通
          </span>
        </div>
      ) : (
        <div className="mb-6 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <UserRound className="h-3.5 w-3.5" /> 业主账号注册（消费者）
        </div>
      )}

      <h1 className="text-[28px] sm:text-[36px] md:text-[44px] font-semibold tracking-tight leading-tight">
        {role === "customer" ? "注册业主账号" : role === "enterprise" ? "申请企业会员" : "申请个人会员"}
      </h1>
      <p className="mt-2 mb-6 text-[13px] md:text-[14px] text-muted-foreground max-w-xl">
        {role === "practitioner"
          ? "面向独立设计师、项目经理、监理、独立工长等专业个人。三步完成：填写资料 → 签署协议 → 提交审核。"
          : role === "enterprise"
            ? "面向本地建筑、装修与设计企业。三步完成：填写资料 → 签署协议 → 提交审核。"
            : meta.desc}
      </p>

      <RegisterWizard role={role} agreements={templates} />
    </Container>
  );
}
