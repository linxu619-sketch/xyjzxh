import { Container } from "@/components/container";
import { getEnterprises } from "@/lib/data/enterprises-source";
import { listGalleryCases } from "@/lib/data/cases";
import { MembersExplorer } from "./MembersExplorer";

export const metadata = {
  title: "挑一家靠谱的装修公司 · 信阳建装",
  description: "信阳本地通过协会资质核验、信用评估与现场核查的装修 / 建筑 / 设计企业，看真实案例、按口碑挑，点进去直接约。",
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const enterprises = await getEnterprises();
  const params = await searchParams;

  // 每家企业取最多 3 张案例封面作为卡片主视觉
  const coverByEnt: Record<string, string[]> = {};
  for (const c of listGalleryCases({ limit: 400 })) {
    if (!c.cover) continue;
    (coverByEnt[c.enterpriseId] ||= []);
    if (coverByEnt[c.enterpriseId].length < 3) coverByEnt[c.enterpriseId].push(c.cover);
  }

  return (
    <>
      <Container className="pt-12 md:pt-20 pb-2">
        <div className="text-[12px] tracking-[0.2em] text-muted-foreground uppercase mb-4">信阳本地 · 协会认证</div>
        <h1 className="text-[34px] sm:text-[44px] md:text-[56px] font-semibold tracking-tight leading-[1.05]">
          挑一家靠谱的<br className="sm:hidden" />装修公司
        </h1>
        <p className="mt-5 text-[15px] md:text-[16px] leading-7 text-muted-foreground max-w-xl">
          {enterprises.length} 家通过资质核验、信用评估与现场核查的本地企业。看他们的真实案例，按品类、区域、口碑挑，点进去直接约。
        </p>
      </Container>
      <Container className="py-8 md:py-12">
        <MembersExplorer all={enterprises} covers={coverByEnt} initial={params} />
      </Container>
    </>
  );
}
