import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { MediateForm } from "./MediateForm";

export const metadata = { title: "申请调解 · 信阳市建筑装饰装修协会" };

export default async function MediatePage({ searchParams }: { searchParams: Promise<{ submitted?: string }> }) {
  const { submitted } = await searchParams;

  if (submitted === "1") {
    return (
      <Container className="py-16 md:py-24 max-w-xl text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-[#e6f7f1] text-accent-tea inline-flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-[26px] md:text-[32px] font-semibold tracking-tight">调解申请已提交</h1>
        <p className="mt-3 text-[14px] text-muted-foreground leading-7">
          协会调解委员会将在 14 天内介入处理，进展会通过电话与你联系。
        </p>
      </Container>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="MEDIATION · 协会调解"
        tone="decor"
        title={<>装修纠纷 <br className="md:hidden" />协会帮你调解</>}
        description="提交纠纷情况，协会调解委员会中立介入、14 天先行处理。所有材料保密。"
      />
      <Container className="py-12 max-w-2xl">
        <div className="rounded-2xl bg-surface p-4 flex items-start gap-2.5 text-[12px] text-muted-foreground mb-6">
          <ShieldCheck className="h-4 w-4 text-accent-tea mt-0.5 shrink-0" />
          建议先准备好证据（合同、聊天记录、照片、验收单）。协会保持中立、不预判责任。
        </div>
        <MediateForm />
      </Container>
    </>
  );
}
