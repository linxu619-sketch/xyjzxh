import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/container";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { listCasesByEnterprise } from "@/lib/data/cases";

export default async function CasesList({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const e = await getEnterpriseBySlugOrId(tenant);
  if (!e) notFound();
  const cases = listCasesByEnterprise(e.id);

  return (
    <div className="overflow-x-hidden">
      <Container className="py-6 md:py-10">
        <Link href={`/biz/${tenant}`} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> 返回 {e.hero.brand}
        </Link>
        <h1 className="text-[22px] md:text-[30px] font-semibold tracking-tight">全部案例 <span className="text-[14px] font-normal text-muted-foreground">{cases.length} 个</span></h1>

        {cases.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-[13px] text-muted-foreground">
            暂无案例 · 可先 <Link href={`/biz/${tenant}/inquiry`} className="text-brand">在线咨询</Link>。
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-3">
            {cases.map((c) => (
              <Link key={c.id} href={`/biz/${tenant}/cases/${c.id}`} className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-foreground/5 active:scale-[0.99] hover:shadow-lg md:hover:-translate-y-1 transition-all">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.cover} alt={c.title} className="absolute inset-0 h-full w-full object-cover md:transition-transform md:duration-500 md:group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <div className="text-[13px] md:text-[14px] font-medium line-clamp-1">{c.title}</div>
                  <div className="text-[11px] opacity-80">{[c.area && `${c.area}㎡`, c.tag].filter(Boolean).join(" · ")}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
