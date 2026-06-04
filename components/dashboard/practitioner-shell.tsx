import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings, ChevronLeft, ShieldCheck } from "lucide-react";
import { Container } from "@/components/container";
import { getSession } from "@/lib/auth/session";
import { PRACTITIONER_TABS } from "@/lib/dashboard/nav";
import { CustomerBottomNav } from "./customer-bottom-nav";
import { isPractitionerPreview } from "@/lib/dashboard/preview";

export async function PractitionerShell({
  title, subtitle, children, showHeader = true,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  showHeader?: boolean;
}) {
  const session = await getSession();
  const preview = isPractitionerPreview(session);
  if (!session || (session.role !== "practitioner" && !preview)) {
    redirect("/login?role=practitioner");
  }
  if (session.role === "practitioner" && session.pending) redirect("/dashboard/pending");

  return (
    <div className="min-h-screen bg-surface pb-24">
      {preview && (
        <div className="bg-[#fff6d6] text-[#a37200] text-[12px] px-4 py-2.5 flex items-center justify-between gap-2">
          <span>👁 从业者门户预览 · 协会只读体验</span>
          <Link href="/dashboard/association" className="underline font-medium shrink-0">返回协会工作台</Link>
        </div>
      )}
      {showHeader && (
        <div className="bg-foreground text-background pt-7 pb-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-cat-design/30 blur-3xl" />
          <Container className="relative max-w-2xl">
            <div className="flex items-center justify-between">
              <Link href="/dashboard/practitioner" className="inline-flex items-center gap-1.5 text-[12px] text-background/70 hover:text-background">
                <ChevronLeft className="h-3.5 w-3.5" /> 返回我的
              </Link>
              <Link href="/dashboard/practitioner/settings" className="h-9 w-9 rounded-full bg-white/10 inline-flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="设置">
                <Settings className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4">
              {title && <h1 className="text-[26px] md:text-[32px] font-semibold tracking-tight">{title}</h1>}
              {subtitle && <p className="mt-1.5 text-[12px] text-background/70">{subtitle}</p>}
            </div>
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px]">
              <ShieldCheck className="h-3 w-3 text-accent-yellow" /> {session.name} · 协会认证从业者
            </div>
          </Container>
        </div>
      )}

      <Container className="max-w-2xl pt-4">{children}</Container>

      <CustomerBottomNav tabs={PRACTITIONER_TABS} />
    </div>
  );
}
