"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ShieldCheck, AlertCircle, CheckCircle2, Clock, FileText, Eye,
  ChevronRight, IdCard, UserX,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { AgreementTemplate } from "@/lib/data/agreements";
import { checkIdCard } from "@/lib/id-card";

/* ============================================================
   单个协议签署组件
   ------------------------------------------------------------
   合规要件（一并强制执行）：
   1. 必须滚动到底（防"秒签"）
   2. 必须达到最少阅读秒数 minReadSeconds
   3. 必须勾选所有重点条款（民法典第 496 条）
   4. 必须输入真实姓名（实名）
   5. 全部满足才能"签字提交"
   ============================================================ */

export function SignAgreement({
  template,
  onSigned,
  signerRealName: nameProp,
}: {
  template: AgreementTemplate;
  onSigned?: (info: SignResult) => void;
  signerRealName?: string;
}) {
  const [scrolledPct, setScrolledPct] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [acknowledged, setAcknowledged] = useState<number[]>([]);
  const [name, setName] = useState(nameProp ?? "");
  const [idCard, setIdCard] = useState("");
  const [signed, setSigned] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 涉及敏感个人信息的协议须实名 + 身份证 + 年龄校验
  const requiresIdCard = template.requiresSeparateConsent || template.category === "consent_sensitive" || template.category === "insurance" || template.category === "data_processing";

  const idCheck = useMemo(() => {
    if (!requiresIdCard) return { ok: true } as ReturnType<typeof checkIdCard>;
    if (idCard.length < 18) return { ok: false } as ReturnType<typeof checkIdCard>;
    return checkIdCard(idCard);
  }, [idCard, requiresIdCard]);

  const isUnderage = requiresIdCard && idCheck.ok && typeof idCheck.age === "number" && idCheck.age < 18;

  // 计时器
  useEffect(() => {
    if (signed) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [signed]);

  // 滚动百分比
  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 0) {
      setScrolledPct(100);
      return;
    }
    const pct = Math.min(100, Math.round((el.scrollTop / max) * 100));
    setScrolledPct(pct);
  }

  // 初始触发
  useEffect(() => {
    onScroll();
  }, []);

  const scrolledOk = scrolledPct >= 95;
  const timeOk = seconds >= template.minReadSeconds;
  const ackOk = acknowledged.length === template.highlights.length;
  const nameOk = name.trim().length >= 2;
  const idOk = !requiresIdCard || (idCheck.ok && !isUnderage);
  const canSign = scrolledOk && timeOk && ackOk && nameOk && idOk;

  function toggle(i: number) {
    setAcknowledged((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );
  }

  async function submit() {
    if (!canSign) return;
    setSigned(true);

    // 身份证号客户端做 SHA-256 之后再上送 · 明文不出本机
    let idCardHash: string | undefined;
    if (requiresIdCard && idCard) {
      const enc = new TextEncoder().encode(idCard);
      const buf = await crypto.subtle.digest("SHA-256", enc);
      idCardHash = "sha256:" + Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }

    const result: SignResult = {
      templateId: template.id,
      templateCode: template.code,
      templateVersion: template.version,
      signerRealName: name.trim(),
      signerIdCardHash: idCardHash,
      readSeconds: seconds,
      scrollCompletionPct: scrolledPct,
      highlightsAcknowledged: acknowledged,
      signedAt: new Date().toISOString(),
    };
    onSigned?.(result);
  }

  if (signed) {
    return (
      <div className="rounded-3xl border border-accent-tea/30 bg-[#e6f7f1] p-6 text-center">
        <CheckCircle2 className="h-10 w-10 mx-auto text-accent-tea" />
        <div className="mt-3 text-[16px] font-semibold text-accent-tea">已签署 · {template.title}</div>
        <div className="mt-1 text-[12px] text-muted-foreground">
          签署人 {name} · v{template.version} · 阅读 {seconds}s · 已生成存证号
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-background overflow-hidden">
      {/* 顶部信息条 */}
      <div className="px-5 py-3 border-b border-border bg-surface flex items-center gap-2 flex-wrap">
        <FileText className="h-4 w-4 text-cat-build" />
        <div className="text-[13px] font-semibold flex-1 truncate">{template.title}</div>
        <span className="text-[10px] text-muted-foreground tabular-nums">v{template.version}</span>
        {template.requiresSeparateConsent && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-cat-decor-soft text-cat-decor px-2 py-0.5 text-[10px] font-medium">
            PIPL · 单独同意
          </span>
        )}
        {template.required && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-50 text-brand px-2 py-0.5 text-[10px] font-medium">
            必签
          </span>
        )}
      </div>

      {/* 协议正文（可滚动） */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="h-[280px] md:h-[360px] overflow-y-auto px-5 py-4 border-b border-border text-[13px] leading-7"
        style={{ scrollbarWidth: "thin" }}
      >
        <article className="prose prose-sm max-w-none whitespace-pre-wrap font-serif">
          {template.content}
        </article>
        <div className="mt-6 pt-4 border-t border-border text-[11px] text-muted-foreground">
          起草：{template.draftedBy}{template.reviewedBy && ` · 法务核验：${template.reviewedBy}`}
          {template.approvedBy && ` · 批准：${template.approvedBy}（${template.approvedAt}）`}
        </div>
      </div>

      {/* 进度条 */}
      <div className="px-5 pt-3">
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="h-3 w-3" /> 阅读 {scrolledPct}%
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" /> {seconds}s / 最少 {template.minReadSeconds}s
          </div>
          <div className="ml-auto inline-flex items-center gap-1">
            {scrolledOk ? (
              <CheckCircle2 className="h-3 w-3 text-accent-tea" />
            ) : (
              <AlertCircle className="h-3 w-3 text-cat-decor" />
            )}
            <span className={scrolledOk && timeOk ? "text-accent-tea" : "text-muted-foreground"}>
              {!scrolledOk ? "请滚动到底" : !timeOk ? `请至少阅读 ${template.minReadSeconds}s` : "可以签署"}
            </span>
          </div>
        </div>
        <div className="mt-1.5 h-1 rounded-full bg-surface overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              scrolledOk && timeOk ? "bg-accent-tea" : "bg-cat-decor",
            )}
            style={{ width: `${Math.max(scrolledPct, (seconds / template.minReadSeconds) * 100 / 2)}%` }}
          />
        </div>
      </div>

      {/* 重点条款（必须单独勾选） */}
      <div className="px-5 py-4 border-b border-border">
        <div className="text-[12px] font-semibold mb-2 inline-flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-cat-decor" />
          重点条款须单独确认（民法典 §496）
        </div>
        <ul className="space-y-2">
          {template.highlights.map((h, i) => {
            const checked = acknowledged.includes(i);
            return (
              <li key={i}>
                <label className="flex items-start gap-2.5 cursor-pointer p-2 -m-2 rounded-lg active:bg-surface">
                  <span
                    className={cn(
                      "h-5 w-5 rounded-md border-2 inline-flex items-center justify-center mt-0.5 shrink-0 transition-colors",
                      checked
                        ? "border-cat-decor bg-cat-decor"
                        : "border-border bg-background",
                    )}
                  >
                    {checked && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(i)}
                    className="sr-only"
                  />
                  <span className="text-[13px] leading-5 flex-1">{h}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 实名签字 */}
      <div className="px-5 py-4 border-b border-border space-y-4">
        <label className="block">
          <span className="text-[12px] font-semibold">在此签字 (实名 · 与身份证一致)</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入您的真实姓名"
            autoComplete="name"
            className="mt-2 w-full h-12 rounded-xl border border-border px-4 outline-none focus:border-foreground/30 text-[15px] font-serif"
            style={{ fontFamily: "'Kaiti', 'STKaiti', 'KaiTi', serif" }}
          />
          {!nameOk && name.length > 0 && (
            <div className="mt-1 text-[10px] text-cat-decor">至少输入 2 个字符</div>
          )}
        </label>

        {requiresIdCard && (
          <label className="block">
            <span className="text-[12px] font-semibold flex items-center gap-1.5">
              <IdCard className="h-3.5 w-3.5 text-cat-decor" />
              身份证号
              <span className="text-[10px] text-muted-foreground font-normal">
                · 本协议涉敏感信息，须实名 + 年龄校验
              </span>
            </span>
            <input
              value={idCard}
              onChange={(e) => setIdCard(e.target.value.toUpperCase())}
              placeholder="18 位身份证号"
              maxLength={18}
              autoComplete="off"
              className={cn(
                "mt-2 w-full h-12 rounded-xl border px-4 outline-none text-[15px] font-mono tracking-wider transition-colors",
                idCard.length === 0
                  ? "border-border"
                  : idCheck.ok && !isUnderage
                  ? "border-accent-tea bg-[#e6f7f1]/30"
                  : "border-cat-decor",
              )}
            />
            {idCard.length >= 18 && idCheck.error && (
              <div className="mt-1 text-[11px] text-cat-decor inline-flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {idCheck.error}
              </div>
            )}
            {idCheck.ok && !isUnderage && idCheck.age && (
              <div className="mt-1 text-[11px] text-accent-tea inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                校验通过 · {idCheck.age} 岁 {idCheck.gender === "M" ? "男" : "女"} ·
                身份证号已脱敏（仅哈希入库）
              </div>
            )}
            {isUnderage && (
              <div className="mt-2 rounded-xl bg-cat-decor-soft p-3 text-[12px] text-cat-decor flex items-start gap-2 leading-5">
                <UserX className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <b>未满 18 周岁不能签署本协议</b>《民法典》第 19/20 条规定
                  限制民事行为能力人订立合同须法定代理人同意 / 追认。
                  请由您的法定监护人代为签署或联系协会客服。
                </div>
              </div>
            )}
          </label>
        )}
      </div>

      {/* 签字按钮 */}
      <div className="px-5 py-4 bg-surface/40 flex items-center gap-3">
        <button
          onClick={submit}
          disabled={!canSign}
          className={cn(
            "flex-1 h-12 rounded-full text-[14px] font-semibold inline-flex items-center justify-center gap-1.5 transition-all",
            canSign
              ? "bg-foreground text-background active:scale-[0.99]"
              : "bg-muted/30 text-muted-foreground cursor-not-allowed",
          )}
        >
          {canSign ? "签字提交" : "请先满足上方条件"}
          {canSign && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <div className="px-5 py-2 text-[10px] text-muted-foreground bg-surface/40 text-center">
        签署后将生成存证：内容哈希 + 时间戳 + 设备指纹 + IP · 可在「我的协议」查询
      </div>
    </div>
  );
}

export type SignResult = {
  templateId: string;
  templateCode: string;
  templateVersion: string;
  signerRealName: string;
  signerIdCardHash?: string;
  readSeconds: number;
  scrollCompletionPct: number;
  highlightsAcknowledged: number[];
  signedAt: string;
};
