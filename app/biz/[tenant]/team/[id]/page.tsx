import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, Phone, MessageSquareText, BadgeCheck } from "lucide-react";
import { Container } from "@/components/container";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { getMember, listTeamByEnterprise } from "@/lib/data/team";
import { cn } from "@/lib/cn";

const BG: Record<string, string> = { build: "bg-cat-build", decor: "bg-cat-decor", design: "bg-cat-design", tea: "bg-accent-tea", brand: "bg-brand" };

export default async function TeamMemberDetail({ params }: { params: Promise<{ tenant: string; id: string }> }) {
  const { tenant, id } = await params;
  const e = await getEnterpriseBySlugOrId(tenant);
  if (!e) notFound();
  const m = getMember(Number(id));
  if (!m || m.enterpriseId !== e.id) notFound();
  const others = listTeamByEnterprise(e.id).filter((x) => x.id !== m.id).slice(0, 4);

  return (
    <div className="overflow-x-hidden">
      <Container className="py-6 md:py-10 max-w-3xl">
        <Link href={`/biz/${tenant}#team`} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> 返回 {e.hero.brand} · 团队
        </Link>

        {/* 成员卡 */}
        <div className="rounded-3xl border border-border bg-background p-6 md:p-8">
          <div className="flex items-center gap-4 md:gap-5">
            {m.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.photo} alt={m.name} className="h-20 w-20 md:h-24 md:w-24 rounded-3xl object-cover shrink-0" />
            ) : (
              <div className={cn("h-20 w-20 md:h-24 md:w-24 rounded-3xl text-white flex items-center justify-center text-[32px] md:text-[40px] font-semibold shrink-0", BG[e.color])}>
                {m.name.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-[22px] md:text-[28px] font-semibold tracking-tight">{m.name}</h1>
              <div className="mt-1 text-[14px] text-muted-foreground">{m.role}</div>
              {m.exp && <div className="mt-1 text-[12px] text-muted-foreground">{m.exp}</div>}
              <div className="mt-2 inline-flex items-center gap-1 text-[12px] text-accent-tea"><ShieldCheck className="h-3.5 w-3.5" />{e.hero.brand} · 协会认证</div>
            </div>
          </div>
          {(m.bio || m.exp) && (
            <div className="mt-5 pt-5 border-t border-border">
              <div className="text-[12px] tracking-wider text-muted-foreground uppercase mb-2 inline-flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5" />个人介绍</div>
              <p className="text-[14px] leading-7 text-foreground whitespace-pre-line">{m.bio || m.exp}</p>
            </div>
          )}
          <div className="mt-6 flex gap-2 flex-wrap">
            <Link href={`/biz/${tenant}/inquiry`} className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-foreground text-background text-[14px] font-medium">
              <MessageSquareText className="h-4 w-4" /> 找 TA 咨询
            </Link>
            <a href={`tel:${e.contact.tel.replace(/-/g, "")}`} className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full border border-border text-[14px] hover:bg-surface">
              <Phone className="h-4 w-4" /> {e.contact.tel}
            </a>
          </div>
        </div>

        {/* 其他成员 */}
        {others.length > 0 && (
          <div className="mt-10">
            <h2 className="text-[18px] md:text-[22px] font-semibold tracking-tight mb-4">团队其他成员</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {others.map((o) => (
                <Link key={o.id} href={`/biz/${tenant}/team/${o.id}`} className="rounded-3xl border border-border bg-background p-4 text-center hover:shadow-md transition-shadow">
                  {o.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={o.photo} alt={o.name} className="mx-auto h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <div className={cn("mx-auto h-14 w-14 rounded-full text-white flex items-center justify-center text-[20px] font-semibold", BG[e.color])}>
                      {o.name.slice(0, 1)}
                    </div>
                  )}
                  <div className="mt-2 text-[13px] font-semibold truncate">{o.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{o.role}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
