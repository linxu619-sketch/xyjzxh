"use server";

import { createFeedback } from "@/lib/data/feedback-source";

export type FeedbackResult = { ok: boolean; msg: string };

// 公开提交协会留言（无需登录）
export async function submitFeedbackAction(_prev: FeedbackResult, formData: FormData): Promise<FeedbackResult> {
  const content = String(formData.get("content") || "").trim();
  if (!content) return { ok: false, msg: "请填写留言内容" };
  try {
    createFeedback({
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      content,
    });
    return { ok: true, msg: "留言已提交，秘书处将在 3 个工作日内处理。感谢您的反馈！" };
  } catch (e) {
    return { ok: false, msg: e instanceof Error ? e.message : "提交失败，请稍后再试" };
  }
}
