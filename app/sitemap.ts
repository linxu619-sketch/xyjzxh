import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${SITE.domain}`;
  // 公开可索引页面（消费者门户 + 协会门户公开页）
  const paths: { p: string; pr: number }[] = [
    { p: "", pr: 1 },
    { p: "/members", pr: 0.9 },
    { p: "/supplies", pr: 0.8 },
    { p: "/review", pr: 0.8 },
    { p: "/insurance", pr: 0.7 },
    { p: "/finance", pr: 0.7 },
    { p: "/knowledge", pr: 0.7 },
    { p: "/practitioners", pr: 0.7 },
    { p: "/talents", pr: 0.6 },
    { p: "/news", pr: 0.7 },
    { p: "/services", pr: 0.7 },
    { p: "/about", pr: 0.5 },
    { p: "/xh", pr: 0.8 },
  ];
  return paths.map(({ p, pr }) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly" as const,
    priority: pr,
  }));
}
