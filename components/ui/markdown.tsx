"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/cn";

/* 只读 Markdown 渲染（新闻 / 知识库正文等）。
   不依赖 @tailwindcss/typography（项目未装），直接给各元素映射 Tailwind 类，
   与全站设计 token 一致。客户端组件，但会随页面一起 SSR 出 HTML，不影响 SEO。
   注意：react-markdown 会往渲染函数透传 `node` 属性，必须剥掉，否则 React 会
   对 DOM 元素报未知属性告警。 */
const COMPONENTS: Components = {
  h1: ({ node, ...p }) => <h2 className="mt-7 mb-3 text-[20px] md:text-[22px] font-semibold tracking-tight leading-snug" {...p} />,
  h2: ({ node, ...p }) => <h2 className="mt-7 mb-3 text-[18px] md:text-[20px] font-semibold tracking-tight leading-snug" {...p} />,
  h3: ({ node, ...p }) => <h3 className="mt-5 mb-2 text-[16px] font-semibold tracking-tight" {...p} />,
  h4: ({ node, ...p }) => <h4 className="mt-4 mb-2 text-[15px] font-semibold" {...p} />,
  p: ({ node, ...p }) => <p className="my-3.5 leading-8" {...p} />,
  ul: ({ node, ...p }) => <ul className="my-3.5 pl-5 space-y-1.5 list-disc marker:text-brand" {...p} />,
  ol: ({ node, ...p }) => <ol className="my-3.5 pl-5 space-y-1.5 list-decimal marker:text-muted-foreground" {...p} />,
  li: ({ node, ...p }) => <li className="leading-7 pl-0.5" {...p} />,
  a: ({ node, ...p }) => <a className="text-brand underline underline-offset-2 hover:text-brand-dark break-words" target="_blank" rel="noreferrer" {...p} />,
  strong: ({ node, ...p }) => <strong className="font-semibold text-foreground" {...p} />,
  em: ({ node, ...p }) => <em className="italic" {...p} />,
  blockquote: ({ node, ...p }) => <blockquote className="my-4 border-l-[3px] border-brand/40 bg-surface/50 pl-4 py-1 text-muted-foreground" {...p} />,
  hr: () => <hr className="my-6 border-border" />,
  code: ({ node, ...p }) => <code className="rounded bg-surface px-1.5 py-0.5 text-[13px] font-mono" {...p} />,
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ node, src, alt }) => <img src={typeof src === "string" ? src : ""} alt={alt || ""} className="my-4 w-full rounded-2xl border border-border" />,
  table: ({ node, ...p }) => <div className="my-4 overflow-x-auto"><table className="w-full text-[14px] border-collapse" {...p} /></div>,
  th: ({ node, ...p }) => <th className="border border-border bg-surface px-3 py-2 text-left font-medium" {...p} />,
  td: ({ node, ...p }) => <td className="border border-border px-3 py-2 align-top" {...p} />,
};

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("text-foreground", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>{children}</ReactMarkdown>
    </div>
  );
}
