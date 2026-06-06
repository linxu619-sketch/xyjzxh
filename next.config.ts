import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// 全站安全响应头。
// 注意:CSP 只约束 frame-ancestors / object-src / base-uri / form-action —
// 不限制 script/style/connect,以免破坏 Next 内联引导脚本与 dev 热更新(HMR)。
// HSTS 仅生产下发(dev 走 http,下发也会被浏览器忽略,这里干脆按环境隔离)。
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'",
  },
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig: NextConfig = {
  // 构建输出目录:默认 .next;隔离构建实测时用 NEXT_DIST_DIR 切到独立目录,
  // 不影响正在运行的 dev 服务(dev 进程未设此环境变量,仍用 .next)。
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // 隐藏开发模式左下角 Next.js 「N」 徽章
  devIndicators: false,
  // 允许局域网设备访问 dev 资源 / 热更新(HMR)，消除跨源 WebSocket 握手失败
  // 局域网 IP 变了就改这里（可加多个）
  allowedDevOrigins: ["192.168.31.74", "47.103.147.2"],
  // 全站安全响应头
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
