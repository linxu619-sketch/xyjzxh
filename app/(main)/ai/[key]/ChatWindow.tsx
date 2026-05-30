"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles, RefreshCw, Square } from "lucide-react";
import { Container } from "@/components/container";
import { cn } from "@/lib/cn";

type Msg = { role: "user" | "assistant"; content: string };

const GRAD: Record<string, string> = {
  brand: "from-brand to-brand-600",
  build: "from-cat-build to-brand-600",
  decor: "from-cat-decor to-[#e6531f]",
  design: "from-cat-design to-[#6d3df0]",
  tea: "from-accent-tea to-[#008a63]",
  yellow: "from-[#ffd34d] to-[#ffae00]",
};

const BUBBLE_BG: Record<string, string> = {
  brand: "bg-brand-50",
  build: "bg-cat-build-soft",
  decor: "bg-cat-decor-soft",
  design: "bg-cat-design-soft",
  tea: "bg-[#e6f7f1]",
  yellow: "bg-[#fff6d6]",
};

export function ChatWindow({
  aiKey,
  ai,
  color,
  emoji,
  initialUserMessage,
}: {
  aiKey: string;
  ai: { name: string; role: string; greeting: string; suggested: string[] };
  color: string;
  emoji: string;
  initialUserMessage?: string | null;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: ai.greeting },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sentInitial = useRef(false);

  // 滚到底
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // textarea 自适应高度
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

  // 首次进入若有初始提问，自动发送
  useEffect(() => {
    if (sentInitial.current) return;
    if (initialUserMessage && initialUserMessage.trim()) {
      sentInitial.current = true;
      send(initialUserMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUserMessage]);

  async function send(text: string) {
    if (!text.trim() || pending) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setPending(true);

    const apiMessages = next.filter((m, i) => !(i === 0 && m.role === "assistant"));
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: aiKey, messages: apiMessages }),
        signal: ctrl.signal,
      });

      if (!res.body) {
        setMessages([...next, { role: "assistant", content: "（无响应）" }]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setMessages([...next, { role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: acc }]);
      }
    } catch (e: unknown) {
      const aborted = e instanceof Error && e.name === "AbortError";
      if (!aborted) {
        setMessages([...next, { role: "assistant", content: `[出错] ${String(e)}` }]);
      }
    } finally {
      setPending(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  function reset() {
    sentInitial.current = true; // 防止 init prop 触发再发一次
    abortRef.current?.abort();
    setMessages([{ role: "assistant", content: ai.greeting }]);
    setInput("");
  }

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* 顶部 AI 信息 */}
      <div className="border-b border-border bg-background/85 backdrop-blur-xl sticky top-16 lg:top-18 z-30">
        <Container>
          <div className="flex items-center justify-between py-3 md:py-4">
            <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
              <Link
                href="/ai"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface shrink-0"
                aria-label="返回 AI 大厅"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center text-white text-lg bg-gradient-to-br shrink-0", GRAD[color])}>
                {emoji}
              </div>
              <div className="leading-tight min-w-0">
                <div className="text-[14px] md:text-[15px] font-semibold truncate">{ai.name}</div>
                <div className="text-[10px] md:text-[11px] text-muted-foreground inline-flex items-center gap-1 truncate">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-tea animate-pulse shrink-0" /> <span className="truncate">{ai.role} · 在线</span>
                </div>
              </div>
            </div>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1 h-9 px-2.5 md:px-3 rounded-full text-[11px] md:text-[12px] text-muted-foreground hover:bg-surface shrink-0"
            >
              <RefreshCw className="h-3 w-3 md:h-3.5 md:w-3.5" /> <span className="hidden xs:inline">新会话</span>
            </button>
          </div>
        </Container>
      </div>

      {/* 对话区 */}
      <div className="flex-1 overflow-y-auto bg-surface">
        <Container className="py-4 md:py-8 max-w-3xl">
          <div className="space-y-3 md:space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-2 md:gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "assistant" && (
                  <div className={cn(
                    "h-7 w-7 md:h-8 md:w-8 rounded-xl flex items-center justify-center text-white text-sm md:text-base bg-gradient-to-br shrink-0",
                    GRAD[color],
                  )}>
                    {emoji}
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[82%] md:max-w-[78%] rounded-2xl px-3.5 md:px-4 py-2.5 md:py-3 text-[14px] leading-6 md:leading-7 whitespace-pre-wrap break-words",
                    m.role === "user"
                      ? "bg-foreground text-background rounded-br-sm"
                      : cn("text-foreground rounded-bl-sm", BUBBLE_BG[color]),
                  )}
                >
                  {m.content || (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "120ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "240ms" }} />
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* 建议问 — 仅未发送过任何消息时显示 */}
          {messages.length <= 1 && (
            <div className="mt-6 md:mt-8">
              <div className="text-[12px] text-muted-foreground mb-2.5">试试这些问题</div>
              <div className="flex flex-wrap gap-2">
                {ai.suggested.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 md:px-3.5 py-1.5 text-[12px] md:text-[13px] active:scale-[0.97] hover:border-foreground/30 transition-all"
                  >
                    <Sparkles className="h-3 w-3 text-cat-decor" /> {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Container>
      </div>

      {/* 输入栏 — 适配移动安全区 */}
      <div className="border-t border-border bg-background sticky bottom-0 pb-[env(safe-area-inset-bottom)]">
        <Container className="max-w-3xl">
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="pt-3 pb-2 flex items-end gap-2"
          >
            <textarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={`和 ${ai.name} 说点什么 …`}
              rows={1}
              className="flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-3 text-[14px] outline-none focus:border-foreground/30 max-h-40 leading-6"
            />
            {pending ? (
              <button
                type="button"
                onClick={stop}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cat-decor text-white shrink-0 active:scale-95 transition-transform"
                aria-label="停止生成"
              >
                <Square className="h-4 w-4 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className={cn(
                  "inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shrink-0 transition-all",
                  !input.trim() ? "bg-muted/30 cursor-not-allowed" : "bg-foreground hover:bg-brand active:scale-95",
                )}
                aria-label="发送"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </form>
          <div className="pb-2 text-[10px] md:text-[11px] text-muted-foreground text-center hidden sm:block">
            AI 仅提供建议，最终决策请以协会工作人员或专业意见为准 · Enter 发送 · Shift+Enter 换行
          </div>
          <div className="pb-2 text-[10px] text-muted-foreground text-center sm:hidden">
            AI 仅供参考
          </div>
        </Container>
      </div>
    </div>
  );
}
