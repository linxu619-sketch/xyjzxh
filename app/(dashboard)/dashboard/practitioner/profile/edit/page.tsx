import { redirect } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { PractitionerShell } from "@/components/dashboard/practitioner-shell";
import { getSession } from "@/lib/auth/session";
import { getPractitionerByPhone } from "@/lib/data/practitioners-source";
import { effectivePractitionerPhone, isPractitionerPreview } from "@/lib/dashboard/preview";
import { MatchInfoForm } from "./MatchInfoForm";

export const metadata = { title: "个人资料 · 从业者门户" };

export default async function ProfileEdit() {
  const session = await getSession();
  if (!session || (session.role !== "practitioner" && !isPractitionerPreview(session))) {
    redirect("/login?role=practitioner");
  }
  const me = getPractitionerByPhone(effectivePractitionerPhone(session));

  return (
    <PractitionerShell title="个人资料" subtitle="实名以注册为准 · 其余可随时完善">
      {/* 实名信息：注册时已填，已核验，不在此修改 */}
      <div className="rounded-3xl bg-background border border-border p-5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[14px] font-semibold tracking-tight">实名信息</h3>
          <span className="inline-flex items-center gap-1 text-[11px] text-accent-tea"><BadgeCheck className="h-3.5 w-3.5" /> 已核验 · 注册时填写</span>
        </div>
        <div className="text-[13px]">
          <span className="text-muted-foreground">姓名</span> <b className="text-foreground">{me?.name ?? session.name}</b>
          {me?.kind && <> · <span className="text-muted-foreground">工种</span> <b className="text-foreground">{me.kind}</b></>}
          {me?.years ? <> · <span className="text-muted-foreground">从业</span> <b className="text-foreground">{me.years} 年</b></> : null}
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">实名与证件以注册为准，需变更请联系协会。以下资料可随时完善——越全，岗位推荐越准。</p>
      </div>
      <MatchInfoForm
        init={{
          canKinds: me?.canKinds ?? [],
          canDistricts: me?.canDistricts ?? [],
          birthYear: me?.birthYear ?? null,
          expectDaily: me?.expectDaily ?? null,
          expectDailyMax: me?.expectDailyMax ?? null,
          expectMonthMin: me?.expectMonthMin ?? null,
          expectMonthMax: me?.expectMonthMax ?? null,
          years: me?.years ?? 0,
          gender: me?.gender ?? "",
          hasCert: me?.hasCert ?? null,
          available: me?.available ?? true,
        }}
      />
    </PractitionerShell>
  );
}
