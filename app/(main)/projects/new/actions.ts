"use server";

import { revalidatePath } from "next/cache";
import { createReport, type ReportInput } from "@/lib/data/reports";

export async function submitReportAction(input: ReportInput): Promise<{ code: string }> {
  const { code } = createReport(input);
  revalidatePath("/dashboard/association/reports");
  return { code };
}
