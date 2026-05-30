import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Eye, User, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { getNews, NEWS_ITEMS } from "@/lib/data/news";

const TONE: Record<string, "build" | "decor" | "design" | "brand" | "tea"> = {
  build: "build", decor: "decor", design: "design", brand: "brand", tea: "tea",
};

export function generateStaticParams() {
  return NEWS_ITEMS.map((n) => ({ id: n.id }));
}

export default async function NewsDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = getNews(id);
  if (!n) notFound();

  const related = NEWS_ITEMS.filter((x) => x.id !== n.id && x.category === n.category).slice(0, 3);

  return (
    <Container className="py-10 md:py-14 max-w-3xl">
      <Link href="/news" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回新闻列表
      </Link>

      <Badge tone={TONE[n.color]}>{n.category}</Badge>
      <h1 className="mt-4 text-[32px] md:text-[44px] font-semibold tracking-tight leading-[1.15]">
        {n.title}
      </h1>
      <div className="mt-4 flex items-center gap-4 text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {n.date}</span>
        {n.author && <span className="inline-flex items-center gap-1"><User className="h-3 w-3" /> {n.author}</span>}
        <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {n.views.toLocaleString()} 阅读</span>
      </div>

      <article className="mt-8 prose prose-lg max-w-none text-[15px] leading-8 text-foreground">
        <p className="text-muted-foreground">{n.excerpt}</p>
        <p>
          为深入贯彻落实国家与河南省关于建筑装修行业高质量发展的部署，进一步规范本市建设工程市场秩序，
          经协会理事会审议通过，现就有关事项通知如下。
        </p>
        <h3 className="mt-8 text-[20px] font-semibold">一、适用范围</h3>
        <p>本通知适用于在信阳市行政区域内从事建筑装修活动的所有协会会员单位及关联方。</p>
        <h3 className="mt-8 text-[20px] font-semibold">二、主要内容</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>会员单位应在 5 个工作日内完成新规学习；</li>
          <li>本规范涉及隐蔽工程的部分自 6 月 1 日起作为协会调解仲裁的事实依据；</li>
          <li>协会平台同步上线 AI 小知"规范智能问答"，支持条款级检索。</li>
        </ul>
        <h3 className="mt-8 text-[20px] font-semibold">三、保障措施</h3>
        <p>
          协会技术委员会将组织 3 场宣贯会议，会员单位主管负责人应至少 1 人参会；同时，平台将自动比对
          各企业项目报备数据与新规要求，对偏差项主动推送预警。
        </p>
        <blockquote className="mt-6 border-l-4 border-brand pl-4 italic text-muted-foreground">
          本通知自发布之日起执行，原《2018 版》同期废止。
        </blockquote>
      </article>

      {/* 相关 */}
      {related.length > 0 && (
        <div className="mt-14 pt-10 border-t border-border">
          <h3 className="text-[20px] font-semibold tracking-tight">相关阅读</h3>
          <ul className="mt-4 divide-y divide-border">
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/news/${r.id}`} className="flex items-center justify-between gap-4 py-4 group">
                  <div>
                    <div className="text-[14px] font-medium group-hover:text-brand transition-colors">{r.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{r.date}</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Container>
  );
}
