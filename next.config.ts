import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 构建输出目录:默认 .next;隔离构建实测时用 NEXT_DIST_DIR 切到独立目录,
  // 不影响正在运行的 dev 服务(dev 进程未设此环境变量,仍用 .next)。
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // 隐藏开发模式左下角 Next.js 「N」 徽章
  devIndicators: false,
  // 允许局域网设备访问 dev 资源 / 热更新(HMR)，消除跨源 WebSocket 握手失败
  // 局域网 IP 变了就改这里（可加多个）
  allowedDevOrigins: ["192.168.31.74"],
};

export default nextConfig;
