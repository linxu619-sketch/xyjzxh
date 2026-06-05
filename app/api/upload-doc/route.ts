import { writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 30 * 1024 * 1024; // 30MB
const OK_EXT = new Set(["pdf", "doc", "docx"]);
const OK_TYPE = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

// 接收单个 PDF/DOC/DOCX，存到 public/uploads/，返回可访问 URL（知识库原文）。
export async function POST(req: Request) {
  let form: FormData;
  try { form = await req.formData(); } catch { return Response.json({ error: "请求格式错误" }, { status: 400 }); }
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "未收到文件" }, { status: 400 });

  const ext = (file.name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!OK_EXT.has(ext) && !OK_TYPE.has(file.type)) {
    return Response.json({ error: "仅支持 PDF / DOC / DOCX" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) return Response.json({ error: "文件不能超过 30MB" }, { status: 400 });

  const safeExt = OK_EXT.has(ext) ? ext : "pdf";
  const name = `${randomUUID()}.${safeExt}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  const sizeMB = file.size / (1024 * 1024);
  const sizeText = sizeMB >= 1 ? `${sizeMB.toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
  return Response.json({ url: `/uploads/${name}`, name: file.name, size: sizeText });
}
