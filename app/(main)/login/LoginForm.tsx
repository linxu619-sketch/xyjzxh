"use client";

import { use, useActionState, useState } from "react";
import Link from "next/link";
import { ROLE_META, type Role } from "@/lib/auth";
import {
  loginAssociationAction,
  loginEnterpriseAction,
  loginCustomerAction,
  loginPractitionerAction,
  type ActionResult,
} from "./actions";
import {
  Building2, UserRound, ShieldCheck, ArrowRight, Sparkles, AlertCircle,
  Lock, KeyRound, HardHat,
} from "lucide-react";
import { cn } from "@/lib/cn";

const ICONS = {
  association: ShieldCheck,
  enterprise: Building2,
  practitioner: HardHat,
  customer: UserRound,
};

const INITIAL: ActionResult = { ok: false };

export function LoginForm({ initial }: { initial: Promise<{ role?: string }> }) {
  const params = use(initial);
  const [role, setRole] = useState<Role>(
    (params.role as Role) && ROLE_META[params.role as Role] ? (params.role as Role) : "association",
  );

  const meta = ROLE_META[role];
  const Icon = ICONS[role];

  const action =
    role === "association" ? loginAssociationAction :
    role === "enterprise" ? loginEnterpriseAction :
    role === "practitioner" ? loginPractitionerAction :
    loginCustomerAction;

  const [state, formAction, pending] = useActionState(action, INITIAL);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 md:gap-8 items-stretch">
      {/* 左侧文案 */}
      <div className="lg:col-span-2 flex flex-col justify-center">
        <div className="text-[11px] md:text-[12px] tracking-[0.2em] text-brand uppercase font-medium">SIGN IN</div>
        <h1 className="mt-2 md:mt-3 text-[28px] md:text-[52px] font-semibold tracking-tight leading-[1.1] md:leading-[1.05]">
          欢迎回来
        </h1>
        <p className="mt-2 md:mt-4 text-[12px] md:text-[15px] text-muted-foreground max-w-md leading-5 md:leading-7">
          四套账号独立运行 · 同一手机号可在不同身份下分别注册。
        </p>

        {/* 移动端：横向 chip 滑动 */}
        <div className="md:hidden mt-4 -mx-5 px-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2 pb-1">
            {(Object.keys(ROLE_META) as Role[]).map((r) => {
              const M = ROLE_META[r];
              const I = ICONS[r];
              const active = r === role;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full text-[12px] font-medium border transition-colors",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-muted-foreground",
                  )}
                >
                  <I className="h-3.5 w-3.5" />
                  {M.short}
                </button>
              );
            })}
          </div>
        </div>

        {/* 桌面：卡片栈 */}
        <div className="hidden md:block mt-8 space-y-3 max-w-md">
          {(Object.keys(ROLE_META) as Role[]).map((r) => {
            const M = ROLE_META[r];
            const I = ICONS[r];
            const active = r === role;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "w-full text-left rounded-2xl p-4 border transition-all flex items-center gap-3 active:scale-[0.99]",
                  active
                    ? "border-foreground/20 bg-surface shadow-sm"
                    : "border-border hover:border-foreground/10",
                )}
              >
                <span className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center text-white",
                  M.tone === "brand" && "bg-brand",
                  M.tone === "build" && "bg-cat-build",
                  M.tone === "decor" && "bg-cat-decor",
                  M.tone === "design" && "bg-cat-design",
                )}>
                  <I className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold">{M.label}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{M.desc}</div>
                </div>
                <div className={cn(
                  "h-4 w-4 rounded-full border-2 transition-colors",
                  active ? "border-foreground bg-foreground" : "border-border",
                )} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 右侧表单 */}
      <form
        action={formAction}
        className="lg:col-span-3 rounded-3xl border border-border bg-background p-5 md:p-10 flex flex-col"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center text-white",
            meta.tone === "brand" && "bg-brand",
            meta.tone === "build" && "bg-cat-build",
            meta.tone === "decor" && "bg-cat-decor",
            meta.tone === "design" && "bg-cat-design",
          )}>
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[18px] font-semibold">以「{meta.label}」身份登录</div>
            <div className="text-[12px] text-muted-foreground">
              设备优先级：{meta.devicePriority} · {(role === "customer" || role === "practitioner") ? "短信验证码登录" : "密码登录"}
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {state.error && (
          <div className="mb-4 rounded-xl bg-cat-decor-soft text-cat-decor px-4 py-3 text-[13px] flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            {state.error}
          </div>
        )}

        {/* 手机号 */}
        <label className="block mb-4">
          <span className="text-[12px] font-medium">手机号</span>
          <input
            name="phone"
            type="tel"
            required
            placeholder="11 位手机号"
            autoComplete="tel"
            className="mt-1.5 w-full h-12 rounded-xl border border-border px-4 outline-none focus:border-foreground/30 text-[15px]"
          />
        </label>

        {(role === "customer" || role === "practitioner") ? (
          <CustomerCodeField />
        ) : (
          <label className="block mb-2">
            <span className="text-[12px] font-medium">密码</span>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                name="password"
                type="password"
                required
                placeholder={role === "association" ? "管理员密码" : "登录密码"}
                autoComplete="current-password"
                className="mt-1.5 w-full h-12 rounded-xl border border-border pl-10 pr-4 outline-none focus:border-foreground/30 text-[15px]"
              />
            </div>
          </label>
        )}

        {(role !== "customer" && role !== "practitioner") && (
          <div className="mb-6 flex items-center justify-between text-[12px]">
            <label className="inline-flex items-center gap-1.5 text-muted-foreground">
              <input type="checkbox" className="accent-brand" defaultChecked /> 7 天免登录
            </label>
            <span className="text-muted-foreground/70">忘记密码？联系协会</span>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-full bg-foreground text-background font-medium hover:bg-brand transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {pending ? "登录中…" : <>登录 <ArrowRight className="h-4 w-4" /></>}
        </button>

        <div className="mt-4 flex items-center justify-between text-[12px] text-muted-foreground">
          {role !== "association" ? (
            <Link href={`/register?role=${role}`} className="hover:text-foreground">
              没有账号？立即注册 →
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1">
              <KeyRound className="h-3 w-3" /> 协会账号由秘书处统一开通
            </span>
          )}
          <Link href="/ai/advisor" className="inline-flex items-center gap-1 hover:text-foreground">
            <Sparkles className="h-3 w-3 text-cat-decor" /> 问问 AI 小协
          </Link>
        </div>

        <div className="mt-6 pt-5 border-t border-border text-[11px] text-muted-foreground leading-5">
          {role === "association" && (
            <>
              <b className="text-foreground">协会工作人员</b> 用平台分配的手机号 + 密码登录；
              系统管理员账号永不公开。
            </>
          )}
          {role === "enterprise" && (
            <>
              <b className="text-foreground">企业工作人员</b> 用注册时填写的手机号 + 密码登录；
              首次登录由企业 owner 在「团队管理」中开通。
            </>
          )}
          {role === "customer" && (
            <>
              <b className="text-foreground">业主</b> 演示模式：任意 11 位手机号 + 任意 4-6 位验证码即可登录。
              生产环境将接入短信网关。
            </>
          )}
          {role === "practitioner" && (
            <>
              <b className="text-foreground">行业从业者</b>（工长 / 师傅 / 设计师 / 监理）演示：任意 11 位手机号 + 任意验证码即可登录到从业者门户。
              注册需提供身份证 + 行业身份。
            </>
          )}
        </div>
      </form>
    </div>
  );
}

function CustomerCodeField() {
  const [countdown, setCountdown] = useState(0);
  function sendCode() {
    if (countdown > 0) return;
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
  }
  return (
    <label className="block mb-6">
      <span className="text-[12px] font-medium">短信验证码</span>
      <div className="mt-1.5 flex gap-2">
        <input
          name="code"
          required
          placeholder="任意 4-6 位（演示）"
          className="flex-1 h-12 rounded-xl border border-border px-4 outline-none focus:border-foreground/30 text-[15px]"
        />
        <button
          type="button"
          onClick={sendCode}
          disabled={countdown > 0}
          className="h-12 px-5 rounded-xl bg-surface text-[13px] font-medium hover:bg-surface-2 disabled:opacity-50"
        >
          {countdown > 0 ? `${countdown}s 后重发` : "发送验证码"}
        </button>
      </div>
    </label>
  );
}
