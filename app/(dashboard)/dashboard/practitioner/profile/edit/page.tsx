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
    <PractitionerShell title="完善找活资料" subtitle="资料越全，推的活越准">
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
