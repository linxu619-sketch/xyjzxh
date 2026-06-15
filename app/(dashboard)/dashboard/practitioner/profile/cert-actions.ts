"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isPractitionerPreview } from "@/lib/dashboard/preview";
import { addCert, deleteCert } from "@/lib/data/practitioner-certs";

async function requirePractitioner() {
  const s = await getSession();
  if (isPractitionerPreview(s)) redirect("/dashboard/practitioner/profile?pv=1"); // 预览态只读
  if (!s || s.role !== "practitioner") throw new Error("无权限：仅从业者可管理证书");
  return s;
}

export async function addCertAction(fd: FormData) {
  const s = await requirePractitioner();
  const title = String(fd.get("title") || "").trim();
  const imageUrl = String(fd.get("imageUrl") || "").trim();
  const issued = String(fd.get("issued") || "").trim();
  if (!title || !imageUrl) redirect("/dashboard/practitioner/profile?certerr=1");
  // 本人上传默认待协会核验
  addCert({ phone: s.phone, title, imageUrl, source: "upload", issued, verifyStatus: "pending" });
  revalidatePath("/dashboard/practitioner/profile");
  redirect("/dashboard/practitioner/profile?certok=1");
}

export async function deleteCertAction(fd: FormData) {
  const s = await requirePractitioner();
  const id = Number(fd.get("id") || 0);
  if (id) deleteCert(id, s.phone);
  revalidatePath("/dashboard/practitioner/profile");
  redirect("/dashboard/practitioner/profile");
}
