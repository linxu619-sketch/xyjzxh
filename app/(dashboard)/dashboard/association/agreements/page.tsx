import Link from "next/link";
import {
  FileText, Plus, Search, ShieldCheck,
  AlertCircle, Clock, Database, ExternalLink,
} from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { DataTable } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { listAgreementTemplates, listSignatures } from "@/lib/data/agreements-source";
import { ExportAuditButton } from "./ExportAuditButton";

export const metadata = { title: "协议管理 · 协会工作台" };

const CATEGORY_LABEL: Record<string, string> = {
  membership: "入会 / 服务",
  privacy: "隐私",
  data_processing: "DPA",
  consent_sensitive: "敏感同意",
  consent_cross_border: "跨境同意",
  insurance: "保险授权",
  supervisor: "监管 / 共享",
  ndma: "保密 / 反舞弊",
  compliance: "合规",
};

const TARGET_LABEL: Record<string, string> = {
  enterprise: "企业",
  enterprise_staff: "企业员工",
  practitioner: "从业者",
  customer: "业主",
  association_staff: "协会员工",
  public: "全用户",
};

export default function AssociationAgreements() {
  const AGREEMENT_TEMPLATES = listAgreementTemplates();
  const AGREEMENT_SIGNATURES = listSignatures();
  const published = AGREEMENT_TEMPLATES.filter((t) => t.status === "published");
  const drafts = AGREEMENT_TEMPLATES.filter((t) => t.status === "draft");
  const archived = AGREEMENT_TEMPLATES.filter((t) => t.status === "archived");

  return (
    <AssociationShell
      title="协议 / 电子签管理"
      subtitle={`${published.length} 份生效 · ${drafts.length} 份草稿 · 累计签署 ${AGREEMENT_SIGNATURES.length + 12482} 份`}
      actions={
        <>
          <Link href="#new" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform">
            <Plus className="h-3.5 w-3.5" /> 新建协议
          </Link>
        </>
      }
    >
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { l: "生效协议",   v: published.length, c: "text-accent-tea" },
          { l: "本月新签",   v: 482, c: "text-cat-build" },
          { l: "累计签署",   v: "12,605", c: "text-cat-decor" },
          { l: "PIPL 单独同意", v: published.filter((t) => t.requiresSeparateConsent).length, c: "text-cat-design" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-background p-5">
            <div className="text-[11px] text-muted-foreground tracking-wider uppercase">{s.l}</div>
            <div className={`mt-1 text-[28px] font-semibold tracking-tight tabular-nums ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* 合规告警 */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-cat-decor to-[#e6531f] text-white p-4 flex items-center gap-3 shadow-md">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <div className="flex-1 text-[12px] leading-5">
          <b>合规告警：</b>2 份协议（DPA / Privacy）下次升级时所有已签用户须重新签 ·
          建议在升级前 7 天通过 AI 小协批量通知。
        </div>
        <button className="h-9 px-4 rounded-full bg-accent-yellow text-foreground text-[11px] font-semibold shrink-0">
          预演通知
        </button>
      </div>

      {/* 模板列表 */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { l: `已发布 (${published.length})`, active: true },
          { l: `草稿 (${drafts.length})` },
          { l: `已归档 (${archived.length})` },
          { l: "签署记录" },
          { l: "合规审计" },
        ].map((t, i) => (
          <button key={t.l} className={`shrink-0 h-9 px-4 rounded-full text-[13px] font-medium ${i === 0 ? "bg-foreground text-background" : "bg-background border border-border text-muted-foreground"}`}>
            {t.l}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-background p-3 md:p-4 flex items-center gap-2 mb-4">
        <Search className="h-4 w-4 text-muted-foreground ml-2 shrink-0" />
        <input placeholder="搜索协议名 / 编号 / 分类" className="flex-1 bg-transparent outline-none text-[14px] py-1" />
      </div>

      {/* 列表只看+点进详情；新版/归档等操作在详情页内做（全平台列表铁律） */}
      <DataTable
        head={["编号 / 标题", "面向", "分类", "版本", "最少阅读", "PIPL", "更新"]}
        rows={published.map((t) => [
          <Link key="t" href={`/dashboard/association/agreements/${t.id}`} className="block hover:text-brand">
            <code className="text-[10px] font-mono text-muted-foreground">{t.code}</code>
            <div className="font-medium text-[13px] mt-0.5">{t.title}</div>
          </Link>,
          <Badge key="g" tone="brand">{TARGET_LABEL[t.target]}</Badge>,
          <span key="c" className="text-[12px] text-muted-foreground">{CATEGORY_LABEL[t.category]}</span>,
          <span key="v" className="font-mono text-[12px] tabular-nums">v{t.version}</span>,
          <span key="r" className="text-[12px] text-muted-foreground tabular-nums">{t.minReadSeconds}s</span>,
          t.requiresSeparateConsent ? (
            <Badge key="p" tone="decor"><ShieldCheck className="h-2.5 w-2.5 mr-1 inline" />单独同意</Badge>
          ) : <span key="p" className="text-muted-foreground text-[11px]">—</span>,
          <span key="u" className="text-[11px] text-muted-foreground">{t.approvedAt ?? "—"}</span>,
        ])}
      />

      {/* 审计导出 */}
      <div className="mt-6 rounded-3xl border border-border bg-background p-6 flex items-center gap-4 flex-col md:flex-row">
        <div className="flex-1">
          <h3 className="text-[15px] font-semibold">合规审计导出</h3>
          <p className="text-[12px] text-muted-foreground mt-1 leading-5">
            监管 / 司法机关要求出示时，一键导出全部签署记录 CSV（含哈希、IP、设备指纹、阅读时长等存证字段）。
          </p>
        </div>
        <ExportAuditButton />
      </div>

      {/* 签署存证流程图 */}
      <div className="mt-8 rounded-3xl border border-border bg-background p-6">
        <h3 className="text-[16px] font-semibold tracking-tight mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent-tea" />
          签署存证流水线（合规要件）
        </h3>
        <ol className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { n: 1, t: "显著提示", d: "重点条款标黄 + 必须单独勾选" },
            { n: 2, t: "充分阅读", d: "滚动到底 + 最少阅读时长" },
            { n: 3, t: "实名签字", d: "姓名 + 手机短信码 + 人脸（可选）" },
            { n: 4, t: "存证生成", d: "内容哈希 + 时间戳 + IP + UA" },
            { n: 5, t: "第三方背书", d: "e签宝回单 + PDF 归档 + 区块链（可选）" },
          ].map((s, i, arr) => (
            <li key={s.n} className="relative">
              <div className="rounded-2xl bg-surface p-4">
                <div className="text-[28px] font-semibold text-brand leading-none tabular-nums">0{s.n}</div>
                <div className="mt-2 text-[13px] font-semibold">{s.t}</div>
                <div className="mt-1 text-[11px] text-muted-foreground leading-4">{s.d}</div>
              </div>
              {i < arr.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-2 h-px w-4 bg-border" />
              )}
            </li>
          ))}
        </ol>
      </div>

      {/* 第三方对接 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-border bg-background p-6">
          <Database className="h-6 w-6 text-cat-build" />
          <h3 className="mt-3 text-[15px] font-semibold">电子签提供方</h3>
          <p className="mt-1 text-[12px] text-muted-foreground">将协议接入第三方电子签名平台，获得司法可采信回单</p>
          <ul className="mt-3 space-y-2 text-[12px]">
            <li className="flex items-center justify-between"><span>e签宝</span><Badge tone="tea">已对接</Badge></li>
            <li className="flex items-center justify-between"><span>上上签</span><Badge tone="neutral">未对接</Badge></li>
            <li className="flex items-center justify-between"><span>法大大</span><Badge tone="neutral">未对接</Badge></li>
            <li className="flex items-center justify-between"><span>原生（开发态）</span><Badge tone="yellow">演示</Badge></li>
          </ul>
        </div>
        <div className="rounded-3xl bg-foreground text-background p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cat-design/30 blur-2xl" />
          <ShieldCheck className="relative h-6 w-6 text-accent-yellow" />
          <h3 className="relative mt-3 text-[15px] font-semibold">区块链存证（可选）</h3>
          <p className="relative mt-1 text-[12px] text-background/70">
            把签署 hash 上链到信阳司法链 · 互联网法院直接可信 · 审判效率 +60%
          </p>
          <span className="relative mt-4 inline-flex items-center gap-1 h-10 px-5 rounded-full bg-white/15 text-white text-[12px] font-medium opacity-80">
            申请接入 · 即将开放 <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </div>

      {/* 法规索引 */}
      <div className="mt-6 rounded-3xl border border-border bg-surface p-6">
        <h3 className="text-[15px] font-semibold mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-cat-build" />
          法规索引 · 协议必须满足
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-[12px]">
          <RegRow law="《电子签名法》第 13、14 条" req="可靠电子签名要件" />
          <RegRow law="《民法典》第 496 条" req="格式条款显著提示与说明" />
          <RegRow law="《民法典》第 497 条" req="禁止不合理免责条款" />
          <RegRow law="《PIPL》第 14 条" req="敏感信息单独同意" />
          <RegRow law="《PIPL》第 17、18 条" req="充分告知 + 撤回机制" />
          <RegRow law="《PIPL》第 38、39 条" req="跨境传输单独同意" />
          <RegRow law="《消费者权益保护法》第 26 条" req="不得加重消费者责任" />
          <RegRow law="《网络安全法》第 21、24 条" req="日志 ≥ 6 月 + 实名" />
          <RegRow law="《建筑法》《建设工程质量管理条例》" req="质量保证义务不可免除" />
        </div>
      </div>
    </AssociationShell>
  );
}

function RegRow({ law, req }: { law: string; req: string }) {
  return (
    <div className="flex items-start gap-2">
      <Clock className="h-3 w-3 text-cat-build mt-1 shrink-0" />
      <div>
        <div className="font-medium text-foreground">{law}</div>
        <div className="text-muted-foreground text-[11px]">{req}</div>
      </div>
    </div>
  );
}
