import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, CheckCircle2, XCircle, ShieldCheck, ArrowRight, Phone } from "lucide-react";
import { Container } from "@/components/container";
import { getSession } from "@/lib/auth/session";
import { getLatestApplicationByPhone } from "@/lib/data/applications";
import { logoutAction } from "@/app/(main)/login/actions";

export const metadata = { title: "入会审核进度 · 信阳市建筑装饰装修协会" };

const STEPS = [
  { t: "提交申请", d: "资料已提交" },
  { t: "协会审核", d: "秘书处核验资质，1-3 个工作日" },
  { t: "通过开通", d: "激活账号 · 开通工作台与子站" },
];

export default async function PendingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const app = getLatestApplicationByPhone(session.phone);
  const status = app?.status ?? "pending";
  const approved = status === "approved";
  const rejected = status === "rejected";
  // 审核中处于第 2 步，通过到第 3 步
  const activeStep = approved ? 2 : rejected ? 1 : 1;

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-foreground text-background pt-12 pb-16 relative overflow-hidden">
        <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-brand/30 blur-3xl" />
        <Container className="relative max-w-2xl">
          <Link href="/" className="text-[12px] text-background/70 hover:text-background">← 返回首页</Link>
          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px]">
            <ShieldCheck className="h-3 w-3 text-accent-yellow" /> {session.name} · {session.phone}
          </div>
          <h1 className="mt-4 text-[28px] md:text-[36px] font-semibold tracking-tight">
            {approved ? "入会审核已通过 🎉" : rejected ? "入会申请未通过" : "入会申请审核中"}
          </h1>
          <p className="mt-2 text-[13px] text-background/70 max-w-md leading-6">
            {approved
              ? "您的账号已激活为正式会员，请重新登录进入工作台。"
              : rejected
              ? "很抱歉，本次申请未通过。您可以补充资料后重新申请。"
              : "协会秘书处正在核验您的资料，通过后将自动开通工作台与子站。"}
          </p>
        </Container>
      </div>

      <Container className="max-w-2xl -mt-8 relative pb-16">
        {/* 进度 */}
        <div className="rounded-3xl border border-border bg-background p-6 md:p-8">
          <ol className="space-y-5">
            {STEPS.map((s, i) => {
              const done = i < activeStep || approved;
              const current = i === activeStep && !approved;
              return (
                <li key={s.t} className="flex items-start gap-3.5">
                  <span className={`h-8 w-8 rounded-full inline-flex items-center justify-center text-[13px] font-semibold shrink-0 ${
                    done ? "bg-accent-tea text-white" : current ? "bg-foreground text-background ring-4 ring-foreground/10" : "bg-surface text-muted-foreground"
                  }`}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </span>
                  <div className="flex-1">
                    <div className={`text-[15px] font-semibold ${current ? "text-foreground" : done ? "" : "text-muted-foreground"}`}>
                      {s.t}{current && <span className="ml-2 text-[11px] text-cat-decor inline-flex items-center gap-0.5"><Clock className="h-3 w-3" /> 进行中</span>}
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">{s.d}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* 操作 */}
        <div className="mt-5">
          {approved ? (
            <form action={logoutAction}>
              <button className="w-full h-12 rounded-full bg-accent-tea text-white font-medium inline-flex items-center justify-center gap-2">
                重新登录进入工作台 <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : rejected ? (
            <Link href="/join" className="block w-full h-12 rounded-full bg-foreground text-background font-medium inline-flex items-center justify-center gap-2">
              重新申请入会 <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="rounded-3xl border border-border bg-background p-5 text-[13px] text-muted-foreground leading-6">
              <div className="flex items-center gap-2 text-foreground font-semibold mb-1.5"><Clock className="h-4 w-4 text-cat-decor" /> 预计 1-3 个工作日</div>
              审核期间如有疑问，可致电协会秘书处 <a href="tel:03760000000" className="text-brand inline-flex items-center gap-0.5"><Phone className="h-3 w-3" /> 0376-000-0000</a>，或在
              <Link href="/ai/advisor" className="text-brand mx-1">AI 小协</Link>咨询入会进度。
            </div>
          )}
          <form action={logoutAction} className="mt-3">
            <button className="w-full h-11 rounded-full border border-border text-muted-foreground text-[13px] inline-flex items-center justify-center gap-1.5">
              <XCircle className="h-4 w-4" /> 退出登录
            </button>
          </form>
        </div>
      </Container>
    </div>
  );
}
