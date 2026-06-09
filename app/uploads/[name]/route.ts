import { readFile } from "node:fs/promises";
import path from "node:path";

/* ============================================================
   动态服务上传文件 /uploads/<name>
   ------------------------------------------------------------
   改版 Next 的 `next start` 只静态服务「服务器启动时已存在」的
   public/ 文件；启动后新上传的文件不被静态服务（→ 404）。
   此 Route Handler 按请求实时从 public/uploads/ 读取，保证
   用户一上传即可访问（无需重启）。启动前就有的旧文件仍由静态
   服务优先命中，不会进入这里。
   ============================================================ */

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const safe = path.basename(name || ""); // 防目录穿越
  if (!safe || safe === "." || safe.includes("..")) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const buf = await readFile(path.join(process.cwd(), "public", "uploads", safe));
    const type = TYPES[path.extname(safe).toLowerCase()] ?? "application/octet-stream";
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
