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
   xh.lvh.me           → xh
   mingjia.lvh.me      → tenant=mingjia
   ------------------------------------------------------------
   裸 host（IP 直连 / localhost）没有子域名可分流：门面靠 cookie 维持，
   从 /xh 进入协会门户后，点击共用页面（/members 等）不会被判回业主门户；
   `?face=consumer|xh` 提供显式切换出口（协会页「返回业主门户」即用此）。
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

// 裸 host：IP 地址 / localhost / 127.0.0.1 —— 没有子域名分流能力，门面靠 cookie 维持
function isBareHost(bare: string): boolean {
  return bare === "localhost" || bare === "127.0.0.1" || /^\d{1,3}(\.\d{1,3}){3}$/.test(bare);
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl;
  const { face, tenant } = parseHost(host);

  // 按路径强制识别门面（localhost / 局域网 IP 没有子域名，仅靠 host 识别不到 xh / tenant，
  // 所以只要落在 /xh* 或 /biz/* 路径上，就以路径为准设置 face）
  if (url.pathname === "/xh" || url.pathname.startsWith("/xh/")) {
    const res = NextResponse.next();
    res.cookies.set(COOKIE_FACE, "xh", { path: "/", sameSite: "lax" });
    res.headers.set("x-face", "xh");
    return res;
  }
  if (url.pathname.startsWith("/biz/")) {
    const res = NextResponse.next();
    res.cookies.set(COOKIE_FACE, "tenant", { path: "/", sameSite: "lax" });
    res.headers.set("x-face", "tenant");
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

  // —— 裸 host（IP 直连 / localhost）：无子域名分流，门面靠 cookie 维持 ——
  // 解决「协会门户点共用页面被判回业主门户」：从 /xh 进入后 cookie=xh，
  // 后续共用页面（/members 等）跟随 cookie 保持协会门面；
  // `?face=consumer|xh` 显式切换并落 cookie（「返回业主门户」按钮带 ?face=consumer）。
  const bareHost = host.replace(/:\d+$/, "");
  if (isBareHost(bareHost)) {
    const faceParam = url.searchParams.get("face");
    const cookieFace = req.cookies.get(COOKIE_FACE)?.value;

    let sticky: Face = "consumer";
    if (faceParam === "xh") sticky = "xh";
    else if (faceParam === "consumer") sticky = "consumer";
    else if (cookieFace === "xh") sticky = "xh";

    if (sticky === "xh") {
      const rewritten = url.clone();
      if (url.pathname === "/") rewritten.pathname = "/xh"; // 裸 host 下首页跟随协会门面
      const res = NextResponse.rewrite(rewritten);
      res.cookies.set(COOKIE_FACE, "xh", { path: "/", sameSite: "lax" });
      res.headers.set("x-face", "xh");
      return res;
    }

    const res = NextResponse.next();
    res.cookies.set(COOKIE_FACE, "consumer", { path: "/", sameSite: "lax" });
    res.headers.set("x-face", "consumer");
    return res;
  }

  // 明确的 consumer host（xyjzxh.com / www / lvh.me 根域等）
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
