"use server";

import { revalidatePath } from "next/cache";
import { createReport, type ReportInput } from "@/lib/data/reports";
import { getSession } from "@/lib/auth/session";

export async function submitReportAction(input: ReportInput): Promise<{ code: string }> {
  const s = await getSession();
  const { code } = createReport(input, s?.uid);
  revalidatePath("/dashboard/association/reports");
  revalidatePath("/dashboard/enterprise/projects");
  return { code };
}
