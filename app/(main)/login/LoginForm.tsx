"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ROLE_META, type Role } from "@/lib/auth";
import {
  loginAssociationAction,
  loginEnterpriseAction,
  loginEnterpriseSmsAction,
  loginCustomerAction,
  loginPractitionerAction,
  type ActionResult,
} from "./actions";
import {
  Building2, UserRound, ShieldCheck, ArrowRight, Sparkles, AlertCircle,
  Lock, KeyRound, HardHat, Smartphone, UserPlus,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { PasswordInput } from "@/components/ui/password-input";

const ICONS = {
  association: ShieldCheck,
  enterprise: Building2,
  practitioner: HardHat,
  customer: UserRound,
};

type Method = "password" | "sms";

// 各身份支持的登录方式：协会仅密码；企业可切换密码/短信；从业者、业主走短信验证码。
function methodsFor(role: Role): Method[] {
  if (role === "enterprise") return ["password", "sms"];
  if (role === "association") return ["password"];
  return ["sms"]; // practitioner / customer
}

const INITIAL: ActionResult = { ok: false };

export function LoginForm({ roles, initialRole, next }: { roles: Role[]; initialRole?: string; next?: string }) {
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "";
  const [role, setRole] = useState<Role>(
    initialRole && roles.includes(initialRole as Role) ? (initialRole as Role) : roles[0],
  );
  // 当前登录方式（仅企业可在密码/短信间切换；其余身份固定为各自唯一方式）
  const [method, setMethod] = useState<Method>(methodsFor(role)[0]);

  function pickRole(r: Role) {
    setRole(r);
    setMethod(methodsFor(r)[0]); // 切身份时回到该身份默认登录方式
  }

  const supported = methodsFor(role);
  const effMethod: Method = supported.includes(method) ? method : supported[0];
  const isSms = effMethod === "sms";

  const meta = ROLE_META[role];
  const Icon = ICONS[role];

  const hasCustomer = roles.includes("customer");
  // 协会门户登录页（含企业/从业者）才展示「申请入会」入口；纯业主登录页不引导入会
  const showMemberReg = roles.includes("enterprise") || roles.includes("practitioner");
  const intro =
    roles.length === 1 && hasCustomer
      ? "业主账号一键登录 · 下单、评价、买保险、申请调解都在这里。"
      : hasCustomer
        ? "四套账号独立运行 · 同一手机号可在不同身份下分别注册。"
        : "协会 / 企业 / 从业者 账号独立运行 · 同一手机号可在不同身份下分别注册。";

  const action =
    role === "association" ? loginAssociationAction :
    role === "enterprise" ? (isSms ? loginEnterpriseSmsAction : loginEnterpriseAction) :
    role === "practitioner" ? loginPractitionerAction :
    loginCustomerAction;

  const [state, formAction, pending] = useActionState(action, INITIAL);

  return (
    <div className="space-y-5 md:space-y-7">
      {/* 顶部统一注册入口 —— 仅含「企业 / 从业者」两类会员 */}
      {showMemberReg && (
        <div className="rounded-2xl border border-border bg-surface/60 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span className="h-9 w-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <UserPlus className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="text-[14px] font-semibold">还不是会员？申请入会</div>
              <div className="text-[12px] text-muted-foreground">面向企业会员与个人从业者两类，协会秘书处 1-3 个工作日审核</div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href="/register?role=enterprise"
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-foreground text-background text-[13px] font-medium hover:bg-brand transition-colors"
            >
              <Building2 className="h-3.5 w-3.5" /> 企业注册
            </Link>
            <Link
              href="/register?role=practitioner"
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-border bg-background text-[13px] font-medium hover:border-foreground/30 transition-colors"
            >
              <HardHat className="h-3.5 w-3.5" /> 从业者注册
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 md:gap-8 items-stretch">
        {/* 左侧文案 */}
        <div className="lg:col-span-2 flex flex-col justify-center">
          <div className="text-[11px] md:text-[12px] tracking-[0.2em] text-brand uppercase font-medium">SIGN IN</div>
          <h1 className="mt-2 md:mt-3 text-[28px] md:text-[52px] font-semibold tracking-tight leading-[1.1] md:leading-[1.05]">
            欢迎回来
          </h1>
          <p className="mt-2 md:mt-4 text-[12px] md:text-[15px] text-muted-foreground max-w-md leading-5 md:leading-7">
            {intro}
          </p>

          {/* 移动端：横向 chip 滑动 */}
          <div className="md:hidden mt-4 -mx-5 px-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-2 pb-1">
              {roles.map((r) => {
                const M = ROLE_META[r];
                const I = ICONS[r];
                const active = r === role;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => pickRole(r)}
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
            {roles.map((r) => {
              const M = ROLE_META[r];
              const I = ICONS[r];
              const active = r === role;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => pickRole(r)}
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
          {safeNext && <input type="hidden" name="next" value={safeNext} />}
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
                设备优先级：{meta.devicePriority} · {isSms ? "短信验证码登录" : "密码登录"}
              </div>
            </div>
          </div>

          {/* 登录方式切换 —— 仅企业可在「密码 / 短信验证码」之间选择 */}
          {supported.length > 1 && (
            <div className="mb-5 inline-flex rounded-xl bg-surface p-1 text-[13px] font-medium self-start">
              <button
                type="button"
                onClick={() => setMethod("password")}
                className={cn(
                  "inline-flex items-center gap-1.5 h-9 px-4 rounded-lg transition-colors",
                  !isSms ? "bg-background shadow-sm text-foreground" : "text-muted-foreground",
                )}
              >
                <Lock className="h-3.5 w-3.5" /> 密码登录
              </button>
              <button
                type="button"
                onClick={() => setMethod("sms")}
                className={cn(
                  "inline-flex items-center gap-1.5 h-9 px-4 rounded-lg transition-colors",
                  isSms ? "bg-background shadow-sm text-foreground" : "text-muted-foreground",
                )}
              >
                <Smartphone className="h-3.5 w-3.5" /> 验证码登录
              </button>
            </div>
          )}

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

          {isSms ? (
            <SmsCodeField />
          ) : (
            <label className="block mb-2">
              <span className="text-[12px] font-medium">密码</span>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <PasswordInput
                  name="password"
                  required
                  placeholder={role === "association" ? "管理员密码" : "登录密码"}
                  autoComplete="current-password"
                  className="w-full h-12 rounded-xl border border-border pl-10 outline-none focus:border-foreground/30 text-[15px]"
                />
              </div>
            </label>
          )}

          {!isSms && (
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
                <b className="text-foreground">企业工作人员</b> 用注册手机号登录，支持密码或短信验证码；
                首次登录由企业 owner 在「团队管理」中开通。
              </>
            )}
            {role === "customer" && (
              <>
                <b className="text-foreground">业主</b> 演示模式：任意 11 位手机号 + 验证码 <b className="text-foreground">123456</b> 即可登录。
                生产环境将接入短信网关。
              </>
            )}
            {role === "practitioner" && (
              <>
                <b className="text-foreground">行业从业者</b>（工长 / 师傅 / 设计师 / 监理）演示：任意 11 位手机号 + 验证码 <b className="text-foreground">123456</b> 即可登录到从业者门户。
                注册需提供身份证 + 行业身份。
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function SmsCodeField() {
  const [countdown, setCountdown] = useState(0);
  const [sent, setSent] = useState(false);
  function sendCode() {
    if (countdown > 0) return;
    setSent(true);
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
          inputMode="numeric"
          placeholder="演示验证码 123456"
          className="flex-1 h-12 rounded-xl border border-border px-4 outline-none focus:border-foreground/30 text-[15px]"
        />
        <button
          type="button"
          onClick={sendCode}
          disabled={countdown > 0}
          className="h-12 px-5 rounded-xl bg-surface text-[13px] font-medium hover:bg-surface-2 disabled:opacity-50 whitespace-nowrap"
        >
          {countdown > 0 ? `${countdown}s 后重发` : "发送验证码"}
        </button>
      </div>
      <span className="mt-1.5 block text-[11px] text-muted-foreground">
        {sent ? "短信网关尚未接入，演示阶段请直接输入 123456" : "演示阶段验证码固定为 123456（短信网关接入后下发真实验证码）"}
      </span>
    </label>
  );
}
