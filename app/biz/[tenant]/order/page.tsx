import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ShieldCheck, ArrowLeft, Phone, Sparkles, CheckCircle2, Check,
  Clock, Mail, MapPin, Send, MessageSquareText, AlertCircle,
} from "lucide-react";
import { Container } from "@/components/container";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { submitLeadAction } from "./actions";
import { cn } from "@/lib/cn";

const BG: Record<string, string> = {
  build: "bg-cat-build", decor: "bg-cat-decor", design: "bg-cat-design",
};
const SOFT: Record<string, string> = {
  build: "bg-cat-build-soft text-cat-build",
  decor: "bg-cat-decor-soft text-cat-decor",
  design: "bg-cat-design-soft text-cat-design",
};

const TRUST_BULLETS = [
  { icon: ShieldCheck, t: "协会留痕",       d: "信息双向加密 · 调解时可作证据" },
  { icon: Clock,       t: "30 分钟回电",   d: "平均响应 28 分钟 · 协会监督" },
  { icon: CheckCircle2,t: "纳入消费保险", d: "签约即可加购家装质保险" },
];

export default async function OrderPage({
  params, searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ ok?: string; err?: string; service?: string }>;
}) {
  const { tenant } = await params;
  const { ok, err, service } = await searchParams;
  const noteDefault = service ? `意向服务：${service}。` : "";
  const e = await getEnterpriseBySlugOrId(tenant);
  if (!e) notFound();

  return (
    <Container className="py-6 md:py-12 max-w-5xl pb-28 md:pb-12">
      <Link
        href={`/biz/${tenant}`}
        className="inline-flex items-center gap-1.5 text-[12px] md:text-[13px] text-muted-foreground hover:text-foreground mb-4 md:mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> 返回 {e.hero.brand}
      </Link>

      {/* Hero */}
      <div className="rounded-3xl bg-foreground text-background p-6 md:p-10 mb-6 relative overflow-hidden">
        <div className={cn("absolute -right-10 -top-10 h-40 md:h-56 w-40 md:w-56 rounded-full opacity-30 blur-2xl", BG[e.color])} />
        <div className="relative flex items-center gap-2 mb-3 flex-wrap">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-white", BG[e.color])}>
            <ShieldCheck className="h-3 w-3" /> 协会保护中
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-background/60">
            <code className="font-mono">{e.id}</code> · {e.contact.tel}
          </span>
        </div>
        <h1 className="relative text-[26px] sm:text-[32px] md:text-[40px] font-semibold tracking-tight leading-tight">
          提交需求到<br className="sm:hidden" /> {e.hero.brand}
        </h1>
        <p className="relative mt-2 md:mt-3 text-[13px] md:text-[14px] text-background/70 max-w-md leading-6">
          填写后由企业 30 分钟内回电；信息在协会平台留痕，并自动同步消费保险。
        </p>

        {/* 进度指示 */}
        <ol className="relative mt-6 flex items-center gap-1 text-[11px]">
          {[
            { n: 1, t: "提交需求", active: true },
            { n: 2, t: "企业回电" },
            { n: 3, t: "上门量房" },
            { n: 4, t: "正式签约" },
          ].map((s, i, arr) => (
            <li key={s.n} className="flex items-center gap-1 shrink-0">
              <span className={cn(
                "h-6 w-6 rounded-full inline-flex items-center justify-center text-[10px] font-semibold",
                s.active ? "bg-accent-yellow text-foreground ring-4 ring-accent-yellow/30" : "bg-white/10 text-background/60",
              )}>
                {s.n}
              </span>
              <span className={cn("text-[10px]", s.active ? "font-semibold text-accent-yellow" : "text-background/60")}>
                {s.t}
              </span>
              {i < arr.length - 1 && <span className="h-px w-4 md:w-8 bg-white/15" />}
            </li>
          ))}
        </ol>
      </div>

      {/* AI 横幅 */}
      <Link
        href={`/ai/decor?style=${encodeURIComponent(e.tags[0] ?? "")}`}
        className={cn("block rounded-2xl p-4 mb-6 flex items-center gap-3 active:scale-[0.99] transition-transform", SOFT[e.color])}
      >
        <Sparkles className="h-5 w-5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold">不想填表？让 AI 小装 30 秒帮你算</div>
          <div className="text-[11px] opacity-75 mt-0.5">结果可一键发给本企业</div>
        </div>
        <span className="text-[11px] font-medium shrink-0">立即试 →</span>
      </Link>

      {/* 提交结果提示 */}
      {ok && (
        <div className="mb-6 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div className="text-[13px]">
            <b>需求已提交！</b>{e.hero.brand} 将在 30 分钟内回电。信息已在协会平台留痕，可在「业主端 → 我的项目」追踪。
          </div>
        </div>
      )}
      {err && (
        <div className="mb-6 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="text-[13px]"><b>提交失败：</b>请填写称呼并确认手机号为 11 位。</div>
        </div>
      )}

      {/* 表单 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <form action={submitLeadAction} className="rounded-3xl border border-border bg-background p-5 md:p-8 space-y-5">
          <input type="hidden" name="tenant" value={tenant} />
          <input type="hidden" name="enterpriseId" value={e.id} />
          {/* 基础信息 */}
          <Section title="基础信息">
            <Row>
              <Field label="您的称呼" required>
                <input
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="例：刘女士"
                  className="form-input"
                />
              </Field>
              <Field label="手机号" required hint="协会平台加密存储 · 不会被卖给第三方">
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="1[0-9]{10}"
                  required
                  autoComplete="tel"
                  placeholder="11 位手机号"
                  className="form-input"
                />
              </Field>
            </Row>
          </Section>

          {/* 项目信息 */}
          <Section title="项目信息">
            <Row>
              <Field label="项目类型" required>
                <select name="type" className="form-input" defaultValue="">
                  <option value="" disabled>请选择类型</option>
                  {e.category === "build" && (
                    <>
                      <option>市政工程</option>
                      <option>公共建筑</option>
                      <option>住宅地产</option>
                      <option>厂房产业园</option>
                    </>
                  )}
                  {e.category === "decor" && (
                    <>
                      <option>家装 · 整装</option>
                      <option>家装 · 半包</option>
                      <option>工装 · 办公</option>
                      <option>工装 · 商业</option>
                    </>
                  )}
                  {e.category === "design" && (
                    <>
                      <option>住宅设计</option>
                      <option>商业空间</option>
                      <option>软装陈列</option>
                      <option>景观园林</option>
                    </>
                  )}
                </select>
              </Field>
              <Field label="风格偏好">
                <SegmentChips name="style" options={["不限", "现代极简", "新中式", "原木", "北欧", "美式"]} />
              </Field>
            </Row>

            <Row>
              <Field label="面积 (㎡)">
                <input
                  name="area"
                  type="number"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="例：120"
                  className="form-input"
                />
              </Field>
              <Field label="预算 (万元)">
                <input
                  name="budget"
                  type="number"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="例：30"
                  className="form-input"
                />
              </Field>
            </Row>

            <Field label="期望开工时间">
              <input
                name="startMonth"
                type="month"
                className="form-input"
              />
            </Field>

            <Field label="项目地址" hint="区/县精确即可，回访量房会再次确认">
              <input
                name="address"
                placeholder="例：信阳市浉河区 xx 小区 x 栋 x 单元"
                className="form-input"
              />
            </Field>

            <Field label="补充需求" hint="风格 / 痛点 / 家庭成员 / 特殊要求">
              <textarea
                name="note"
                rows={4}
                defaultValue={noteDefault}
                placeholder="想做开放式厨房，主卧需要独立衣帽间，预算偏紧但希望先做基础工程…"
                className="form-input"
              />
            </Field>
          </Section>

          {/* 增值 */}
          <Section title="增值（可选）">
            <div className="space-y-2.5">
              <CheckRow
                name="insurance"
                title="加入家装质保险"
                desc="299 起 · 10 年质保 · 签约后激活"
                defaultChecked
              />
              <CheckRow
                name="supervisor"
                title="协会监理介入"
                desc="第三方现场监理 · 隐蔽工程必到 · 关键节点验收"
              />
              <CheckRow
                name="escrow"
                title="协会监管账户托管"
                desc="按施工进度释放款项 · 防跑路 / 烂尾"
              />
            </div>
          </Section>

          {/* 协议 */}
          <label className="flex items-start gap-2.5 text-[12px] text-muted-foreground pt-2">
            <input type="checkbox" defaultChecked required className="mt-0.5 accent-brand" />
            <span>
              我同意将信息提交给 <b className="text-foreground">{e.name}</b>，并由
              <b className="text-foreground mx-1">信阳市建筑装饰装修协会</b>
              进行平台留痕。详见
              <Link href="/legal/privacy" className="text-brand mx-1">隐私政策</Link>
              。
            </span>
          </label>

          {/* 提交 */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className={cn(
                "flex-1 h-12 md:h-14 rounded-full text-white font-medium inline-flex items-center justify-center gap-2 active:scale-[0.99] text-[14px]",
                BG[e.color],
              )}
            >
              提交需求 <Send className="h-4 w-4" />
            </button>
            <a
              href={`tel:${e.contact.tel.replace(/-/g, "")}`}
              className="h-12 md:h-14 px-5 rounded-full border border-foreground/15 inline-flex items-center justify-center gap-2 text-foreground font-medium text-[14px]"
            >
              <Phone className="h-4 w-4" /> 直接致电
            </a>
          </div>
          <div className="text-center text-[11px] text-muted-foreground">
            提交后会收到 <b className="text-foreground">受理短信</b>，可在「业主端 → 我的项目」追踪
          </div>
        </form>

        {/* 侧栏：信任 + 备注 */}
        <aside className="space-y-3">
          <div className="rounded-3xl border border-border bg-background p-5">
            <div className="text-[11px] tracking-wider uppercase text-muted-foreground mb-3">为什么填表更优</div>
            <ul className="space-y-3 text-[12px]">
              {TRUST_BULLETS.map((b) => {
                const Ic = b.icon;
                return (
                  <li key={b.t} className="flex items-start gap-2.5">
                    <Ic className="h-4 w-4 text-accent-tea shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-foreground">{b.t}</div>
                      <div className="text-muted-foreground mt-0.5 leading-5">{b.d}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-3xl bg-foreground text-background p-5">
            <MessageSquareText className="h-5 w-5 text-accent-yellow" />
            <div className="mt-3 text-[14px] font-semibold">想先聊一下？</div>
            <p className="mt-1.5 text-[11px] text-background/70 leading-5">不强制留电话 · 协会平台留痕 · 平均 30 秒响应</p>
            <Link
              href={`/biz/${tenant}/inquiry`}
              className="mt-4 inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-accent-yellow text-foreground text-[12px] font-medium"
            >
              <MessageSquareText className="h-3.5 w-3.5" /> 在线咨询
            </Link>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 text-[12px] text-muted-foreground space-y-2">
            <div className="text-[11px] tracking-wider uppercase">{e.hero.brand} 联系</div>
            <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {e.contact.tel}</div>
            <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {e.contact.addr}</div>
            <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> contact@{tenant}.xyjzxh.com</div>
          </div>
        </aside>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: var(--background);
          font-size: 15px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        textarea.form-input {
          height: auto;
          padding: 12px 14px;
          line-height: 22px;
        }
        .form-input:focus {
          outline: none;
          border-color: var(--brand);
          box-shadow: 0 0 0 4px rgba(38, 124, 124, 0.14);
        }
      `}</style>
    </Container>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[12px] tracking-wider uppercase text-muted-foreground mb-3">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium">
        {label}{required && <span className="text-cat-decor ml-0.5">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && <div className="mt-1.5 text-[10px] text-muted-foreground">{hint}</div>}
    </label>
  );
}

function SegmentChips({ name, options }: { name: string; options: string[] }) {
  return (
    <div className="-mx-1 px-1 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {options.map((o, i) => (
        <label key={o} className="shrink-0 cursor-pointer">
          <input type="radio" name={name} value={o} defaultChecked={i === 0} className="sr-only peer" />
          <span className="inline-flex items-center h-10 px-3.5 rounded-full bg-surface text-muted-foreground text-[13px] peer-checked:bg-foreground peer-checked:text-background peer-checked:font-semibold border border-transparent peer-checked:border-foreground transition-colors">
            {o}
          </span>
        </label>
      ))}
    </div>
  );
}

function CheckRow({ name, title, desc, defaultChecked }: { name: string; title: string; desc: string; defaultChecked?: boolean }) {
  return (
    <label className="block cursor-pointer">
      <div className="group rounded-2xl border border-border p-4 flex items-start gap-3 transition-colors has-[:checked]:border-foreground has-[:checked]:bg-surface">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="sr-only" />
        <span className="h-5 w-5 rounded-md border-2 border-border inline-flex items-center justify-center mt-0.5 shrink-0 transition-colors group-has-[:checked]:bg-foreground group-has-[:checked]:border-foreground">
          <Check className="h-3.5 w-3.5 text-background opacity-0 group-has-[:checked]:opacity-100" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold">{title}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5 leading-5">{desc}</div>
        </div>
      </div>
    </label>
  );
}
