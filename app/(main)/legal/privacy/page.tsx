import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "隐私政策 · 信阳市建筑装饰装修协会" };

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="LEGAL · 法务"
        tone="brand"
        title={<>隐私政策</>}
        description="本政策约定信阳市建筑装饰装修协会平台如何收集、使用、共享、保护您的个人信息。本政策最近一次更新于 2026-05-30。"
      />
      <Container className="py-12 max-w-3xl prose prose-lg text-[15px] leading-8">
        <h2 className="text-[22px] font-semibold mt-0">一、我们收集哪些信息</h2>
        <p>我们仅在为您提供服务、改进体验、保障安全的必要范围内收集信息：</p>
        <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
          <li>注册信息：手机号、姓名 / 称呼、所在城市；</li>
          <li>认证信息：企业资质文件、营业执照、身份证；</li>
          <li>业务信息：工装报备表单、保单、调解卷宗、评价内容；</li>
          <li>设备信息：设备型号、IP、操作日志、浏览器指纹（仅安全用途）；</li>
          <li>AI 对话内容：用于改善 AI 员工质量，可在「设置 → 隐私」关闭。</li>
        </ul>
        <h2 className="text-[22px] font-semibold mt-10">二、我们如何使用</h2>
        <p>信息仅用于以下目的：账号识别、业务办理、安全防护、统计分析（脱敏后）、监管报送（仅工装报备相关字段）。</p>
        <h2 className="text-[22px] font-semibold mt-10">三、我们与谁共享</h2>
        <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
          <li>河南省建设行业监管平台：仅工装报备字段，依《建筑法》第 X 条；</li>
          <li>合作金融 / 保险机构：仅经您单独授权后；</li>
          <li>云服务商：阿里云 / Vercel / Supabase（签订 DPA）；</li>
          <li>Anthropic：AI 对话内容（已对手机号等做脱敏）。</li>
        </ul>
        <h2 className="text-[22px] font-semibold mt-10">四、您的权利</h2>
        <p>您可随时通过「我的 → 设置」查询、更正、导出、删除自己的信息；如对处理结果有异议，可联系协会秘书处 0376-000-0000。</p>
        <h2 className="text-[22px] font-semibold mt-10">五、变更</h2>
        <p>本政策更新时，我们将在首页与登录页醒目位置提示，并保留 30 天异议期。</p>
      </Container>
    </>
  );
}
