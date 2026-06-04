import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Library, FileText, Sparkles, ShieldCheck, CalendarDays, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { listKnowledge, getKnowledgeArticle } from "@/lib/data/knowledge-source";

export const metadata = { title: "资料详情 · 知识库 · 信阳市建筑装饰装修协会" };

export default async function KnowledgeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const k = getKnowledgeArticle(id);
  if (!k) notFound();
  const related = listKnowledge().filter((x) => x.id !== k.id && x.category === k.category).slice(0, 4);

  return (
    <Container className="py-6 md:py-10 max-w-3xl">
      <Link href="/knowledge" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回知识库
      </Link>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Badge tone="design">{k.category}</Badge>
        {k.hot && <Badge tone="decor">热门</Badge>}
        <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />{k.date}</span>
        {k.size && <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground"><FileText className="h-3.5 w-3.5" />{k.size}</span>}
      </div>

      <h1 className="text-[22px] md:text-[30px] font-semibold tracking-tight leading-tight">{k.title}</h1>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {k.tags.map((t) => (
          <span key={t} className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] text-muted-foreground">{t}</span>
        ))}
      </div>

      {/* 摘要 / 说明 */}
      <div className="mt-5 rounded-2xl border border-border bg-surface p-5">
        <div className="text-[12px] tracking-wider text-muted-foreground uppercase mb-2 inline-flex items-center gap-1.5"><Library className="h-3.5 w-3.5" />内容摘要</div>
        <p className="text-[14px] leading-7 text-foreground">{k.excerpt}</p>
        <p className="mt-3 text-[13px] leading-7 text-muted-foreground">
          本资料由 {`信阳市建筑装饰装修协会`}技术委员会审核维护。完整正文 / 附件可在线浏览或下载；如需条文解读、适用范围或与本地政策的衔接，建议直接咨询 AI 小知，获取针对性解答。
        </p>
      </div>

      {/* 正文要点 · 在线阅读 */}
      {k.content && k.content.length > 0 && (
        <div className="mt-5 rounded-2xl border border-border bg-background p-5 md:p-6">
          <div className="text-[12px] tracking-wider text-muted-foreground uppercase mb-4 inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />正文要点 · 在线阅读</div>
          <div className="space-y-5">
            {k.content.map((sec, i) => (
              <div key={i}>
                <h3 className="text-[15px] font-semibold tracking-tight inline-flex items-center gap-2">
                  <span className="h-5 w-5 rounded-md bg-brand-50 text-brand text-[11px] font-semibold inline-flex items-center justify-center tabular-nums">{i + 1}</span>
                  {sec.h}
                </h3>
                <ul className="mt-2 space-y-1.5 pl-7">
                  {sec.points.map((p, j) => (
                    <li key={j} className="text-[13px] leading-6 text-muted-foreground relative before:content-['·'] before:absolute before:-left-3.5 before:text-brand before:font-bold">{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-5 pt-4 border-t border-border text-[11px] text-muted-foreground">以上为协会技术委员会整理的要点摘录,便于快速查阅;完整官方原文以发布机构正式文本为准。</p>
        </div>
      )}

      {/* 操作 */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/ai/know" className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-foreground text-background text-[14px] font-medium hover:bg-brand transition-colors">
          <Sparkles className="h-4 w-4 text-accent-yellow" /> 问 AI 小知
        </Link>
        <span className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full border border-border text-[14px] text-muted-foreground opacity-70">
          <FileText className="h-4 w-4" /> 下载 PDF 原文 · 即将开放
        </span>
      </div>

      <div className="mt-4 text-[12px] text-muted-foreground inline-flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> 协会技术委员会审核 · 持续更新
      </div>

      {/* 相关 */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-[16px] md:text-[18px] font-semibold tracking-tight mb-3">同类资料</h2>
          <div className="rounded-2xl border border-border bg-background divide-y divide-border overflow-hidden">
            {related.map((r) => (
              <Link key={r.id} href={`/knowledge/${r.id}`} className="flex items-center gap-3 p-4 hover:bg-surface/60 transition-colors">
                <span className="h-9 w-9 rounded-xl bg-cat-design-soft text-cat-design shrink-0 inline-flex items-center justify-center"><Library className="h-4 w-4" /></span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium line-clamp-1">{r.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{r.excerpt}</div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
