"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isPractitionerPreview } from "@/lib/dashboard/preview";
import { updatePractitionerMatchInfo } from "@/lib/data/practitioners-source";

export async function saveMatchInfoAction(fd: FormData) {
  const s = await getSession();
  if (isPractitionerPreview(s)) redirect("/dashboard/practitioner/profile?pv=1"); // 预览态只读
  if (!s || s.role !== "practitioner") throw new Error("无权限：仅从业者可编辑资料");

  const posInt = (k: string): number | null => {
    const n = Math.floor(Number(fd.get(k)));
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  const canKinds = fd.getAll("canKinds").map(String).filter(Boolean);
  const canDistricts = fd.getAll("canDistricts").map(String).filter(Boolean);
  let birthYear = posInt("birthYear");
  const nowY = new Date().getFullYear();
  if (birthYear && (birthYear < 1940 || birthYear > nowY - 14)) birthYear = null; // 明显非法忽略
  const expectDaily = posInt("expectDaily");
  const expectDailyMax = posInt("expectDailyMax");
  const expectMonthMin = posInt("expectMonthMin");
  const expectMonthMax = posInt("expectMonthMax");
  const years = Math.max(0, Math.floor(Number(fd.get("years")) || 0));
  const g = String(fd.get("gender") || "").trim();
  const gender = g === "男" || g === "女" ? g : "";
  const hasCert = fd.get("hasCert") != null;   // 勾选=持证
  const available = fd.get("available") != null; // 勾选=在接单

  updatePractitionerMatchInfo(s.phone, { birthYear, canKinds, canDistricts, expectDaily, expectDailyMax, expectMonthMin, expectMonthMax, years, gender, hasCert, available });

  revalidatePath("/dashboard/practitioner");
  revalidatePath("/dashboard/practitioner/profile");
  revalidatePath("/dashboard/practitioner/jobs");
  revalidatePath("/practitioners");
  redirect("/dashboard/practitioner/profile?saved=1");
}
