"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  addKnowledge,
  updateKnowledge,
  deleteKnowledge,
  setKnowledgeEnabled,
} from "@/lib/ai/knowledge-source";

const PATH = "/dashboard/association/ai/knowledge";

async function ensure() {
  const s = await getSession();
  if (!s || (s.role !== "association" && s.role !== "system_admin")) {
    throw new Error("无权限：仅协会工作人员可维护知识库");
  }
}

function parseKeywords(s: string): string[] {
  return s.split(/[,，、\s]+/).map((x) => x.trim()).filter(Boolean);
}

function back(emp: string): never {
  revalidatePath(PATH);
  redirect(`${PATH}?emp=${encodeURIComponent(emp)}`);
}

export async function addKnowledgeAction(fd: FormData) {
  await ensure();
  const emp = String(fd.get("emp") || "");
  const title = String(fd.get("title") || "").trim();
  const content = String(fd.get("content") || "").trim();
  if (emp && title && content) {
    addKnowledge({
      employeeKey: emp,
      title,
      content,
      keywords: parseKeywords(String(fd.get("keywords") || "")),
      source: String(fd.get("source") || "").trim() || undefined,
    });
  }
  back(emp);
}

export async function updateKnowledgeAction(fd: FormData) {
  await ensure();
  const emp = String(fd.get("emp") || "");
  const id = String(fd.get("id") || "");
  if (id) {
    updateKnowledge(id, {
      title: String(fd.get("title") || "").trim(),
      content: String(fd.get("content") || "").trim(),
      keywords: parseKeywords(String(fd.get("keywords") || "")),
      source: String(fd.get("source") || "").trim() || undefined,
    });
  }
  back(emp);
}

export async function deleteKnowledgeAction(fd: FormData) {
  await ensure();
  const emp = String(fd.get("emp") || "");
  const id = String(fd.get("id") || "");
  if (id) deleteKnowledge(id);
  back(emp);
}

export async function toggleKnowledgeAction(fd: FormData) {
  await ensure();
  const emp = String(fd.get("emp") || "");
  const id = String(fd.get("id") || "");
  if (id) setKnowledgeEnabled(id, String(fd.get("enabled") || "") === "1");
  back(emp);
}
