import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { Container } from "@/components/container";
import { getSession } from "@/lib/auth/session";
import { CUSTOMER_TABS } from "@/lib/dashboard/nav";
import { CustomerBottomNav } from "./customer-bottom-nav";

export async function CustomerShell({
  title,
  subtitle,
  children,
  showHeader = true,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  showHeader?: boolean;
}) {
  const session = await getSession();
  if (!session || session.role !== "customer") {
    redirect("/login?role=customer");
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      {showHeader && (
        <div className="bg-foreground text-background pt-7 pb-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-cat-decor/30 blur-3xl" />
          <Container className="relative max-w-2xl">
            <div className="flex items-center justify-between">
              <Link href="/dashboard/customer" className="inline-flex items-center gap-1.5 text-[12px] text-background/70 hover:text-background">
                <ChevronLeft className="h-3.5 w-3.5" /> 返回我的
              </Link>
              <Link href="/" className="text-[12px] text-background/70 hover:text-background">
                信阳建装首页
              </Link>
            </div>
            <div className="mt-4">
              {title && <h1 className="text-[26px] md:text-[32px] font-semibold tracking-tight">{title}</h1>}
              {subtitle && <p className="mt-1.5 text-[12px] text-background/70">{subtitle}</p>}
            </div>
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px]">
              <ShieldCheck className="h-3 w-3 text-accent-yellow" /> {session.name} · 已加入消费保护
            </div>
          </Container>
        </div>
      )}

      <Container className="max-w-2xl pt-4">
        {children}
      </Container>

      <CustomerBottomNav tabs={CUSTOMER_TABS} />
    </div>
  );
}
