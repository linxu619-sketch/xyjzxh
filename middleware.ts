import { NextRequest, NextResponse } from "next/server";

/* ============================================================
   域名 → 路由 / 门面 映射
   ------------------------------------------------------------
   xyjzxh.com          → 消费者门户   ( face=consumer · /  )
   xh.xyjzxh.com       → 协会门户     ( face=xh       · /xh )
   xxx.xyjzxh.com      → 企业子站     ( face=tenant   · /biz/xxx )
   ------------------------------------------------------------
   开发环境同样规则：
   localhost           → consumer
   xh.localhost        → xh
   mingjia.localhost   → tenant=mingjia
   ============================================================ */

const ROOT_DOMAIN = "xyjzxh.com";
const ASSOC_HOST = "xh";

const DEV_ROOTS = ["localhost", "lvh.me", "nip.io", "127.0.0.1"];
const COOKIE_FACE = "xy_face";

type Face = "consumer" | "xh" | "tenant";

function parseHost(host: string): { face: Face; tenant?: string } {
  const bare = host.replace(/:\d+$/, "");

  // 生产
  if (bare === ROOT_DOMAIN || bare === `www.${ROOT_DOMAIN}`) return { face: "consumer" };
  if (bare === `${ASSOC_HOST}.${ROOT_DOMAIN}`) return { face: "xh" };
  if (bare.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = bare.slice(0, -1 - ROOT_DOMAIN.length);
    return { face: "tenant", tenant: sub };
  }

  // 开发
  for (const r of DEV_ROOTS) {
    if (bare === r) return { face: "consumer" };
    if (bare === `${ASSOC_HOST}.${r}`) return { face: "xh" };
    if (bare.endsWith(`.${r}`)) {
      const sub = bare.slice(0, -1 - r.length);
      if (sub === "www") return { face: "consumer" };
      return { face: "tenant", tenant: sub };
    }
  }

  // 兜底（IP 直连等）按 consumer
  return { face: "consumer" };
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl;
  const { face, tenant } = parseHost(host);

  // 已经在 /biz/* 或 /xh/* 路径上直接放行
  if (url.pathname.startsWith("/biz/") || url.pathname.startsWith("/xh/") || url.pathname === "/xh") {
    const res = NextResponse.next();
    res.cookies.set(COOKIE_FACE, face, { path: "/", sameSite: "lax" });
    return res;
  }

  // 协会 host —— 主页 / 重写到 /xh
  if (face === "xh") {
    const rewritten = url.clone();
    if (url.pathname === "/") {
      rewritten.pathname = "/xh";
    }
    // 其他路径不动；header / 通过 cookie 知道当前 face
    const res = NextResponse.rewrite(rewritten);
    res.cookies.set(COOKIE_FACE, "xh", { path: "/", sameSite: "lax" });
    res.headers.set("x-face", "xh");
    return res;
  }

  // 企业子站
  if (face === "tenant" && tenant) {
    const rewritten = url.clone();
    rewritten.pathname = `/biz/${tenant}${url.pathname === "/" ? "" : url.pathname}`;
    const res = NextResponse.rewrite(rewritten);
    res.cookies.set(COOKIE_FACE, "tenant", { path: "/", sameSite: "lax" });
    res.headers.set("x-tenant", tenant);
    res.headers.set("x-face", "tenant");
    return res;
  }

  // 消费者 / bare host
  const res = NextResponse.next();
  res.cookies.set(COOKIE_FACE, "consumer", { path: "/", sameSite: "lax" });
  res.headers.set("x-face", "consumer");
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml|.*\\.).*)",
  ],
};
