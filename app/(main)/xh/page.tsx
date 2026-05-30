import { Hero } from "@/components/sections/hero";
import { Categories } from "@/components/sections/categories";
import { Numbers } from "@/components/sections/numbers";
import { Services } from "@/components/sections/services";
import { AiTeam } from "@/components/sections/ai-team";
import { News } from "@/components/sections/news";
import { Cta } from "@/components/sections/cta";

export const metadata = {
  title: "协会门户 · 信阳市建筑装修协会",
  description:
    "协会为企业、从业者、合作伙伴提供的官方门户 · 工装报备、会员目录、建材集采、AI 助手、知识库、培训等一站式服务。",
};

// 协会门户（xh.xyjzxh.com）首页 — 面向 B 端（企业 + 从业者 + 合作机构）
export default function AssociationHome() {
  return (
    <>
      <Hero />
      <Numbers />
      <Categories />
      <Services />
      <AiTeam />
      <News />
      <Cta />
    </>
  );
}
