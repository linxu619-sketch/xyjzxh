import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Database } from "lucide-react";
import { getEnterprises, lastDataSource } from "@/lib/data/enterprises-source";
import { MembersExplorer } from "./MembersExplorer";

export const metadata = { title: "会员目录 · 信阳市建筑装饰装修协会" };

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const enterprises = await getEnterprises();
  const source = lastDataSource();
  return (
    <>
      <PageHeader
        eyebrow="MEMBERS · 会员目录"
        tone="brand"
        title={<>{enterprises.length.toLocaleString()} 家协会认证企业<br className="md:hidden" /> 一处直达</>}
        description="所有入驻企业均经资质核验、信用评估与现场核查，按品类、区域、口碑自由筛选。点击企业可访问其专属子站。"
        actions={
          <Badge tone={source === "sqlite" ? "tea" : "yellow"} className="!inline-flex !items-center !gap-1">
            <Database className="h-3 w-3" />
            {source === "sqlite" ? "数据来自 SQLite" : "数据来自 Mock"}
          </Badge>
        }
      />
      <Container className="py-10 md:py-14">
        <MembersExplorer all={enterprises} initial={searchParams} />
      </Container>
    </>
  );
}
