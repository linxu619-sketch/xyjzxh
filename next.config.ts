import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 隐藏开发模式左下角 Next.js 「N」 徽章
  devIndicators: false,
  // 允许局域网设备访问 dev 资源 / 热更新(HMR)，消除跨源 WebSocket 握手失败
  // 局域网 IP 变了就改这里（可加多个）
  allowedDevOrigins: ["192.168.31.74"],
};

export default nextConfig;
