import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Sparkles, MessageSquareHeart } from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { getPlatformInfo } from "@/lib/runtime-config";

export const metadata = { title: "联系我们 · 信阳市建筑装饰装修协会" };

const DEPTS = [
  { name: "秘书处（综合）",       tel: "0376-6239899", mail: "xysjzzsxh2025@163.com" },
  { name: "会员部",              tel: "0376-6239899", mail: "xysjzzsxh2025@163.com" },
  { name: "技术委员会",          tel: "0376-6239899", mail: "xysjzzsxh2025@163.com" },
  { name: "调解委员会",          tel: "0376-6239899", mail: "xysjzzsxh2025@163.com" },
  { name: "金融保险委员会",      tel: "0376-6239899", mail: "xysjzzsxh2025@163.com" },
  { name: "AI 与数字化办公室",    tel: "0376-6239899", mail: "xysjzzsxh2025@163.com" },
];

export default async function ContactPage() {
  const info = await getPlatformInfo();
  return (
    <>
      <PageHeader
        eyebrow="ABOUT · 联系我们"
        tone="brand"
        title={<>联系协会</>}
        description="工作日 8:30 - 17:30 在岗；AI 助手 7×24 在线。媒体合作请直联秘书处。"
      />
      <Container className="py-12 max-w-5xl">
        {/* 主要联系 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="rounded-3xl bg-foreground text-background p-6 md:col-span-2 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/30 blur-2xl" />
            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Cell icon={Phone} label="总机" value={info.tel} />
              <Cell icon={Mail} label="邮箱" value={info.email} />
              <Cell icon={MapPin} label="地址" value={info.address} />
              <Cell icon={Clock} label="时间" value="周一至周五 8:30 - 17:30" />
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-background p-6">
            <Sparkles className="h-6 w-6 text-cat-decor" />
            <div className="mt-3 text-[15px] font-semibold">先问问 AI？</div>
            <p className="mt-1.5 text-[12px] text-muted-foreground leading-5">
              90% 的咨询问题 AI 小协 30 秒可答；如需人工，再转秘书处。
            </p>
            <Link href="/ai/advisor" className="mt-4 inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-foreground text-background text-[12px] font-medium">
              问问 AI 小协
            </Link>
          </div>
        </div>

        {/* 部门 */}
        <h2 className="text-[22px] font-semibold mb-4">各部门直拨</h2>
        <div className="rounded-3xl border border-border bg-background divide-y divide-border overflow-hidden mb-10">
          {DEPTS.map((d) => (
            <div key={d.name} className="px-5 py-4 flex items-center gap-4 hover:bg-surface/60 transition-colors">
              <div className="text-[14px] font-medium flex-1 min-w-0">{d.name}</div>
              <a href={`tel:${d.tel.replace(/-/g, "")}`} className="inline-flex items-center gap-1 text-[13px] text-brand hover:underline">
                <Phone className="h-3 w-3" /> {d.tel}
              </a>
              <a href={`mailto:${d.mail}`} className="hidden md:inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground">
                <Mail className="h-3 w-3" /> {d.mail}
              </a>
            </div>
          ))}
        </div>

        {/* 反馈表单 */}
        <div className="rounded-3xl border border-border bg-background p-7 md:p-10">
          <MessageSquareHeart className="h-7 w-7 text-cat-decor" />
          <h2 className="mt-4 text-[22px] font-semibold tracking-tight">给协会留个言</h2>
          <p className="mt-2 text-[13px] text-muted-foreground">建议、表扬、批评都欢迎，秘书处 3 个工作日内回复。</p>
          <form action="#" className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="姓名" className="h-11 rounded-xl border border-border px-4 text-[14px] outline-none focus:border-foreground/30" />
            <input placeholder="手机号" className="h-11 rounded-xl border border-border px-4 text-[14px] outline-none focus:border-foreground/30" />
            <input placeholder="邮箱 (可选)" className="h-11 rounded-xl border border-border px-4 text-[14px] outline-none focus:border-foreground/30 md:col-span-2" />
            <textarea rows={5} placeholder="您想说的内容…" className="rounded-xl border border-border px-4 py-3 text-[14px] outline-none focus:border-foreground/30 md:col-span-2" />
            <button className="h-12 rounded-full bg-foreground text-background font-medium md:col-span-2">提交反馈</button>
          </form>
        </div>
      </Container>
    </>
  );
}

function Cell({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="relative flex items-start gap-3">
      <Icon className="h-5 w-5 text-accent-yellow mt-0.5 shrink-0" />
      <div>
        <div className="text-[11px] text-background/60 tracking-wider uppercase">{label}</div>
        <div className="text-[15px] font-semibold mt-0.5">{value}</div>
      </div>
    </div>
  );
}
