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

  // 统一出口：把「生效门面」注入【请求头 x-face】，让 RSC（(main)/layout）首跳就能读到正确门面，
  // 不再依赖入站 cookie（cookie 仅由响应写、本次请求读不到，导致 ?face=xh 首跳失效）。
  // 同时仍写 cookie（后续导航维持）与响应头（调试 / 下游）。
  const respond = (effFace: Face, opts?: { rewrite?: URL; tenant?: string }): NextResponse => {
    const reqHeaders = new Headers(req.headers);
    reqHeaders.set("x-face", effFace);
    reqHeaders.set("x-pathname", url.pathname);  // 供 RSC（后台 shell 权限拦截）识别当前路径
    if (opts?.tenant) reqHeaders.set("x-tenant", opts.tenant);
    const init = { request: { headers: reqHeaders } };
    const res = opts?.rewrite
      ? NextResponse.rewrite(opts.rewrite, init)
      : NextResponse.next(init);
    res.cookies.set(COOKIE_FACE, effFace, { path: "/", sameSite: "lax" });
    res.headers.set("x-face", effFace);
    if (opts?.tenant) res.headers.set("x-tenant", opts.tenant);
    return res;
  };

  // 按路径强制识别门面（localhost / 局域网 IP 没有子域名，仅靠 host 识别不到 xh / tenant，
  // 所以只要落在 /xh* 或 /biz/* 路径上，就以路径为准设置 face）
  if (url.pathname === "/xh" || url.pathname.startsWith("/xh/")) {
    return respond("xh");
  }
  if (url.pathname.startsWith("/biz/")) {
    return respond("tenant");
  }

  // 登录页：门面跟随「要登录的角色」——协会/企业/从业者 → 协会门面，业主 → 消费者门面。
  // 否则 IP 裸 host 上 /login?role=association 会按 cookie 兜底成业主门面，
  // 头部错误地显示业主门户、点「我的/登录」跳到业主端。
  if (url.pathname === "/login") {
    const role = url.searchParams.get("role");
    if (role === "customer") return respond("consumer");
    if (role === "association" || role === "enterprise" || role === "practitioner") return respond("xh");
    // 无 role：沿用下方 host / cookie 逻辑
  }

  // 工作台路径：门面跟随所属端，避免在工作台里把 cookie 落成业主门面，
  // 离开工作台回公开页(/members 等)时表头错乱（IP 裸 host 无子域名时尤甚）。
  // 工作台自身用独立 shell、不读门面，此处仅为后续公开页导航维持正确门面 cookie。
  if (url.pathname.startsWith("/dashboard/customer")) return respond("consumer");
  if (
    url.pathname.startsWith("/dashboard/association") ||
    url.pathname.startsWith("/dashboard/enterprise") ||
    url.pathname.startsWith("/dashboard/practitioner") ||
    url.pathname.startsWith("/dashboard/pending")
  ) {
    return respond("xh");
  }

  // 协会 host —— 主页 / 重写到 /xh
  if (face === "xh") {
    const rewritten = url.clone();
    if (url.pathname === "/") rewritten.pathname = "/xh";
    return respond("xh", { rewrite: rewritten });
  }

  // 企业子站
  if (face === "tenant" && tenant) {
    const rewritten = url.clone();
    rewritten.pathname = `/biz/${tenant}${url.pathname === "/" ? "" : url.pathname}`;
    return respond("tenant", { rewrite: rewritten, tenant });
  }

  // —— 裸 host（IP 直连 / localhost）：无子域名分流，门面靠 cookie 维持 ——
  // 解决「协会门户点共用页面被判回业主门户」：从 /xh 进入后 cookie=xh，
  // 后续共用页面（/members 等）跟随 cookie 保持协会门面；
  // `?face=consumer|xh` 显式切换并落 cookie（「返回业主门户」按钮带 ?face=consumer，
  // 协会工作台「在册企业」卡片带 ?face=xh，确保从后台进 /members 留在协会门户）。
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
      return respond("xh", { rewrite: rewritten });
    }
    return respond("consumer");
  }

  // 明确的 consumer host（xyjzxh.com / www / lvh.me 根域等）
  return respond("consumer");
}

export const config = {
  matcher: [
    "/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml|.*\\.).*)",
  ],
};
