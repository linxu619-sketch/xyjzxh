import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { ShieldCheck, Star, Briefcase, MapPin, BadgeCheck, Crown } from "lucide-react";
import { Container } from "@/components/container";
import { GridQR } from "@/components/ui/grid-qr";
import { ShareButton } from "@/components/practitioner/share-button";
import { TierBadge } from "@/components/dashboard/practitioner-tier";
import { getPractitionerById } from "@/lib/data/practitioners-source";
import { practitionerLevel, metaOf } from "@/lib/data/member-tier";
import type { PractitionerTier } from "@/lib/data/member-tier";

export const metadata = { title: "电子名片 · 信阳市建筑装饰装修协会" };

export default async function PractitionerCard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = getPractitionerById(id);
  if (!me) notFound();

  const tier = me.tier as PractitionerTier;
  const level = practitionerLevel(tier);
  const isMax = tier === "专家会员";
  const perks = metaOf(tier)?.perks ?? [];

  const h = await headers();
  const host = h.get("host") ?? "xh.xyjzxh.com";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const shareUrl = `${proto}://${host}/practitioners/${id}`;
  const shareDisplay = `${host}/practitioners/${id}`;

  return (
    <div className="min-h-screen bg-surface py-8 md:py-14">
      <Container className="max-w-lg">
        {/* 名片主体 */}
        <div className="rounded-[28px] bg-background border border-border shadow-xl overflow-hidden">
          {/* 顶部协会背书 */}
          <div className="bg-foreground text-background px-6 py-4 flex items-center gap-2.5 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#f6c915]/25 blur-2xl" />
            <BadgeCheck className="relative h-5 w-5 text-accent-yellow shrink-0" />
            <div className="relative leading-tight">
              <div className="text-[13px] font-semibold">信阳市建筑装饰装修协会</div>
              <div className="text-[10px] text-background/60">个人会员 · 资历认证名片</div>
            </div>
          </div>

          {/* 头像 + 姓名 + 等级 */}
          <div className="px-6 pt-6 pb-5 text-center">
            <span className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-[#f6c915] to-[#e0a900] text-[#5a3e00] inline-flex items-center justify-center text-[30px] font-semibold shadow-lg">
              {me.name.slice(0, 1)}
            </span>
            <div className="mt-3 text-[22px] font-semibold tracking-tight">{me.name}</div>
            <div className="mt-1 text-[12px] text-muted-foreground inline-flex items-center gap-1.5 flex-wrap justify-center">
              <span>{me.kind}</span>
              {me.years > 0 && <><span>·</span><span>{me.years} 年从业</span></>}
              <span>·</span>
              <span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3" />{me.city}</span>
            </div>
            <div className="mt-3 flex items-center justify-center">
              <TierBadge tier={tier} level={level} isMax={isMax} size="lg" track />
            </div>
            <div className="mt-2 text-[11px]">
              {me.available
                ? <span className="inline-flex items-center gap-1 text-accent-tea font-medium"><span className="h-1.5 w-1.5 rounded-full bg-accent-tea" /> 正在接单</span>
                : <span className="text-muted-foreground">暂歇接单</span>}
            </div>
          </div>

          {/* 成就数据 */}
          <div className="px-6">
            <div className="grid grid-cols-3 gap-2 text-center rounded-2xl bg-surface p-3">
              <Stat icon={Star} iconClass="fill-[#FFB400] text-[#FFB400]" label="协会评分" value={me.rating.toFixed(1)} />
              <Stat icon={Briefcase} iconClass="text-cat-decor" label="累计接单" value={`${me.jobs}`} />
              <Stat icon={ShieldCheck} iconClass={me.insured ? "text-accent-tea" : "text-muted-foreground"} label="工伤险" value={me.insured ? "在保" : "未保"} />
            </div>
          </div>

          {/* 简介 */}
          {me.bio && (
            <div className="px-6 pt-4">
              <p className="text-[12.5px] leading-6 text-muted-foreground">{me.bio}</p>
            </div>
          )}

          {/* 等级权益 */}
          <div className="px-6 pt-4">
            <div className="text-[11px] text-muted-foreground mb-1.5 inline-flex items-center gap-1">
              {isMax ? <Crown className="h-3.5 w-3.5 text-[#e0a900]" /> : null}「{tier}」资历权益
            </div>
            <div className="flex flex-wrap gap-1.5">
              {perks.map((p) => (
                <span key={p} className="text-[11px] rounded-full bg-[#fff6d6] text-[#a37200] px-2.5 py-1">{p}</span>
              ))}
            </div>
          </div>

          {/* 认证 + 网格码 */}
          <div className="px-6 py-5 mt-4 border-t border-border flex items-center gap-4">
            {/* 协会认证印章 */}
            <div className="relative h-20 w-20 rounded-full border-2 border-party flex items-center justify-center shrink-0" style={{ transform: "rotate(-10deg)" }}>
              <span className="absolute text-party text-[20px] leading-none top-1.5">★</span>
              <span className="text-party text-[9px] font-bold text-center mt-5 px-1 leading-tight">信阳建装<br />协会认证</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> 已实名 · 协会审核入册</div>
              <div className="mt-1 text-[11px] text-muted-foreground leading-5">本名片由协会数据库核发，信息可凭下方链接公开查验。</div>
              <div className="mt-1.5 text-[10px] text-muted-foreground font-mono break-all">编号 {me.id}</div>
            </div>
            <div className="flex flex-col items-center shrink-0">
              <GridQR value={shareUrl} size={72} />
              <div className="text-[8px] text-muted-foreground mt-1">扫码 / 链接验证</div>
            </div>
          </div>
        </div>

        {/* 链接 + 分享 */}
        <div className="mt-4 rounded-2xl bg-background border border-border p-4">
          <div className="text-[11px] text-muted-foreground mb-1">名片链接（可分享给业主 / 同行 / 企业）</div>
          <div className="text-[12px] font-mono text-foreground break-all mb-3">{shareDisplay}</div>
          <ShareButton url={shareUrl} title={`${me.name} · ${tier} · 协会认证电子名片`} className="w-full inline-flex items-center justify-center gap-1.5 h-11 rounded-full bg-foreground text-background text-[14px] font-medium active:scale-[0.99] transition-transform" />
        </div>

        <div className="mt-5 text-center">
          <Link href="/practitioners" className="text-[12px] text-brand">← 返回从业者名录</Link>
        </div>
      </Container>
    </div>
  );
}

function Stat({ icon: Icon, iconClass, label, value }: {
  icon: React.ComponentType<{ className?: string }>; iconClass: string; label: string; value: string;
}) {
  return (
    <div>
      <div className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
        <Icon className={`h-3 w-3 ${iconClass}`} /> {label}
      </div>
      <div className="mt-0.5 text-[18px] font-semibold tracking-tight leading-none">{value}</div>
    </div>
  );
}
