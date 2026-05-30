import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "服务条款 · 信阳市建筑装修协会" };

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="LEGAL · 法务"
        tone="brand"
        title={<>服务条款</>}
        description="您使用本平台即表示同意本服务条款的全部内容。最近一次更新：2026-05-30。"
      />
      <Container className="py-12 max-w-3xl prose prose-lg text-[15px] leading-8">
        <h2 className="text-[22px] font-semibold mt-0">第一条 适用范围</h2>
        <p>本条款适用于信阳市建筑装修协会运营的「xyzhxh.org」主站、子站、API、AI 助手矩阵。</p>
        <h2 className="text-[22px] font-semibold mt-10">第二条 用户类型</h2>
        <p>平台支持三类账号：协会工作人员、企业工作人员、C 端业主。三类账号独立运行、权限互不相干。</p>
        <h2 className="text-[22px] font-semibold mt-10">第三条 服务内容</h2>
        <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
          <li>会员目录、企业子站、在线下单；</li>
          <li>工装报备、协会调解、消费保险撮合；</li>
          <li>知识库、招聘、培训认证；</li>
          <li>AI 员工矩阵（小协 / 小装 / … 共 10 位）。</li>
        </ul>
        <h2 className="text-[22px] font-semibold mt-10">第四条 用户行为</h2>
        <p>您承诺不利用平台从事违法、虚假宣传、刷单、挂证、骚扰他人等行为；违者协会有权依《章程》予以警告、暂停、清退。</p>
        <h2 className="text-[22px] font-semibold mt-10">第五条 知识产权</h2>
        <p>平台 UI、商标、AI 员工人设由协会享有；用户上传内容版权归用户所有，但授予协会展示、检索、缓存的非独占权利。</p>
        <h2 className="text-[22px] font-semibold mt-10">第六条 免责</h2>
        <p>AI 员工的回答仅供参考，最终决策请以协会工作人员或专业意见为准；不可抗力造成的服务中断协会不承担违约责任。</p>
        <h2 className="text-[22px] font-semibold mt-10">第七条 争议解决</h2>
        <p>本条款适用中华人民共和国法律。如发生争议，由信阳市浉河区人民法院管辖。</p>
      </Container>
    </>
  );
}
