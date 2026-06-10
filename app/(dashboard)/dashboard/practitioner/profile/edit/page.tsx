import { redirect } from "next/navigation";
import { PractitionerShell } from "@/components/dashboard/practitioner-shell";
import { getSession } from "@/lib/auth/session";
import { getPractitionerByPhone } from "@/lib/data/practitioners-source";
import { effectivePractitionerPhone, isPractitionerPreview } from "@/lib/dashboard/preview";
import { MatchInfoForm } from "./MatchInfoForm";

export const metadata = { title: "完善找活资料 · 从业者门户" };

export default async function ProfileEdit() {
  const session = await getSession();
  if (!session || (session.role !== "practitioner" && !isPractitionerPreview(session))) {
    redirect("/login?role=practitioner");
  }
  const me = getPractitionerByPhone(effectivePractitionerPhone(session));

  return (
    <PractitionerShell title="完善找活资料" subtitle="资料越全，给你推的活越准 · 双方不做无用功">
      <p className="mb-4 text-[12px] text-muted-foreground leading-5">
        填好「能做的工种、年龄、期望日薪、可接区域」，找活页就只把<b className="text-foreground">你会做、够格、够价、就近</b>的岗位推给你。
      </p>
      <MatchInfoForm
        init={{
          canKinds: me?.canKinds ?? [],
          canDistricts: me?.canDistricts ?? [],
          birthYear: me?.birthYear ?? null,
          expectDaily: me?.expectDaily ?? null,
          expectDailyMax: me?.expectDailyMax ?? null,
          years: me?.years ?? 0,
          gender: me?.gender ?? "",
          hasCert: me?.hasCert ?? null,
          available: me?.available ?? true,
        }}
      />
    </PractitionerShell>
  );
}
