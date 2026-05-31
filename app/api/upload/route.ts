import { writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const OK_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg"]);

// 接收单张图片，存到 public/uploads/，返回可访问 URL。
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "请求格式错误" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "未收到文件" }, { status: 400 });
  if (!file.type.startsWith("image/")) return Response.json({ error: "仅支持图片格式" }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "图片不能超过 8MB" }, { status: 400 });

  let ext = (file.name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!OK_EXT.has(ext)) ext = "jpg";

  const name = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  return Response.json({ url: `/uploads/${name}`, name: file.name });
}
