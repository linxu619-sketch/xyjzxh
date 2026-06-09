"use server";

import { revalidatePath } from "next/cache";
import { requireStaffPermission } from "@/lib/auth/guard";
import { setFeedbackStatus, type FeedbackStatus } from "@/lib/data/feedback-source";

export async function markFeedbackAction(formData: FormData) {
  await requireStaffPermission("users");
  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as FeedbackStatus;
  if (id && (status === "new" || status === "handled")) setFeedbackStatus(id, status);
  revalidatePath("/dashboard/association/feedback");
}
