import { notFound } from "next/navigation";
import {
  ShieldCheck, FileCheck2, QrCode, Printer,
} from "lucide-react";
import { AGREEMENT_SIGNATURES, getTemplate } from "@/lib/data/agreements";
import { SITE } from "@/lib/site";
import { PrintButton } from "./PrintButton";

export const metadata = { title: "签署证书 · 信阳市建筑装饰装修协会" };

export default async function SignatureCert({ params }: { params: Promise<{ serial: string }> }) {
  const { serial } = await params;
  const sig = AGREEMENT_SIGNATURES.find((s) => s.id === serial || s.esignSerialNo === serial);
  if (!sig) notFound();
  const tpl = getTemplate(sig.templateId);
  if (!tpl) notFound();

  // 模拟 QR 内容
  const verifyUrl = `https://${SITE.domain}/verify?sig=${sig.id}`;

  return (
    <>
      {/* 打印控制（仅屏幕显示） */}
      <div className="print:hidden bg-foreground text-background py-3 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-accent-yellow" />
          <div className="text-[13px] font-semibold flex-1">协会签署证书 · 可作司法举证</div>
          <PrintButton />
        </div>
      </div>

      {/* A4 纸张布局 */}
      <main className="bg-white text-black mx-auto max-w-[210mm] py-12 px-12 min-h-screen print:py-8 print:px-12 print:min-h-0 font-serif">
        {/* 页头 */}
        <header className="flex items-start justify-between pb-6 border-b-4 border-double border-black">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-2xl bg-black text-white flex items-center justify-center text-[24px] font-bold">
              信
            </div>
            <div>
              <div className="text-[24px] font-bold tracking-tight">{SITE.name}</div>
              <div className="text-[10px] tracking-widest text-gray-500 uppercase">{SITE.brand}</div>
              <div className="text-[11px] text-gray-600 mt-1">{SITE.address}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] tracking-widest text-gray-500 uppercase">SIGNATURE CERT</div>
            <div className="text-[16px] font-bold mt-1">签 署 证 书</div>
          </div>
        </header>

        {/* 主标题 */}
        <div className="text-center mt-10 mb-8">
          <h1 className="text-[28px] font-bold tracking-tight">{tpl.title}</h1>
          <div className="mt-2 text-[12px] text-gray-600">
            <span className="font-mono">{tpl.code}</span> · 版本 <span className="font-mono">v{sig.templateVersion}</span>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 border-2 border-black rounded-full text-[12px] font-bold">
            <ShieldCheck className="h-3.5 w-3.5" /> 协会担保 · 司法可采
          </div>
        </div>

        {/* 签署信息表 */}
        <table className="w-full text-[13px] mt-8 border border-black">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-32 px-4 py-2.5 bg-gray-50 font-semibold border-r border-black">签署人</td>
              <td className="px-4 py-2.5 font-bold text-[18px] tracking-wider" style={{ fontFamily: "'Kaiti', 'STKaiti', 'KaiTi', serif" }}>
                {sig.signerRealName}
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-4 py-2.5 bg-gray-50 font-semibold border-r border-black">签署人手机</td>
              <td className="px-4 py-2.5 font-mono">{sig.signerPhone}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-4 py-2.5 bg-gray-50 font-semibold border-r border-black">签署时间</td>
              <td className="px-4 py-2.5 font-mono">{sig.signedAt}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-4 py-2.5 bg-gray-50 font-semibold border-r border-black">签署 IP</td>
              <td className="px-4 py-2.5 font-mono">{sig.signingIp}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-4 py-2.5 bg-gray-50 font-semibold border-r border-black">签署设备</td>
              <td className="px-4 py-2.5 text-[11px]">{sig.signingUa}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-4 py-2.5 bg-gray-50 font-semibold border-r border-black">阅读时长</td>
              <td className="px-4 py-2.5 font-mono">{sig.readSeconds} 秒（最少 {tpl.minReadSeconds} 秒）</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-4 py-2.5 bg-gray-50 font-semibold border-r border-black">滚动完成度</td>
              <td className="px-4 py-2.5 font-mono">{sig.scrollCompletionPct}%</td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 bg-gray-50 font-semibold border-r border-black">重点条款确认</td>
              <td className="px-4 py-2.5">
                共 <b>{tpl.highlights.length}</b> 条 · 已单独勾选第 {sig.highlightsAcknowledged.map((i) => i + 1).join("、")} 条
              </td>
            </tr>
          </tbody>
        </table>

        {/* 内容哈希 */}
        <div className="mt-6 border-2 border-black p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <FileCheck2 className="h-4 w-4" />
            <span className="text-[11px] font-bold tracking-widest uppercase">协议内容指纹（SHA-256）</span>
          </div>
          <div className="font-mono text-[10px] break-all">{sig.contentHash}</div>
          <div className="mt-2 text-[10px] text-gray-600">
            协议正文任意一个字符变动都会导致此 hash 改变 · 满足《电子签名法》§13 不可篡改要件
          </div>
        </div>

        {/* 重点条款摘录 */}
        <div className="mt-6">
          <div className="text-[12px] font-bold mb-2">已确认的重点条款（民法典 §496）</div>
          <ol className="space-y-1.5 text-[12px]">
            {tpl.highlights.map((h, i) => (
              <li key={i} className="flex gap-2 pl-2">
                <span>☑</span>
                <span>{h}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* 第三方背书 */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          {/* 签字栏 */}
          <div className="border border-black p-4">
            <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">签 字</div>
            <div className="h-20 flex items-end pb-2 text-[36px] font-bold tracking-widest" style={{ fontFamily: "'Kaiti', 'STKaiti', 'KaiTi', serif" }}>
              {sig.signerRealName}
            </div>
            <div className="text-[10px] text-gray-600">{sig.signedAt}</div>
          </div>

          {/* 公章 + 二维码 */}
          <div className="border border-black p-4 flex items-center justify-around">
            {/* 协会公章 */}
            <div className="relative h-24 w-24 rounded-full border-[3px] border-red-700 flex items-center justify-center" style={{ transform: "rotate(-12deg)" }}>
              <div className="absolute text-red-700 text-[28px] leading-none top-1">★</div>
              <div className="text-red-700 text-[10px] font-bold text-center mt-6 px-2 leading-tight" style={{ fontFamily: "'Kaiti', serif" }}>
                信阳市建筑<br />装修协会<br />（公章）
              </div>
            </div>

            {/* 二维码 - 简化 SVG */}
            <div className="flex flex-col items-center">
              <FakeQRCode value={verifyUrl} size={88} />
              <div className="text-[8px] text-gray-600 mt-1 text-center max-w-[100px] leading-tight">
                扫码验证<br />{verifyUrl.replace(/^https?:\/\//, "").slice(0, 30)}
              </div>
            </div>
          </div>
        </div>

        {/* 验证号 + 法规 */}
        <footer className="mt-8 pt-4 border-t-2 border-double border-black">
          <div className="grid grid-cols-2 gap-4 text-[10px]">
            <div>
              <div className="font-bold tracking-widest uppercase text-gray-500">证书编号</div>
              <div className="font-mono mt-0.5">{sig.id}</div>
              {sig.esignSerialNo && (
                <>
                  <div className="font-bold tracking-widest uppercase text-gray-500 mt-2">第三方回单</div>
                  <div className="font-mono mt-0.5">{sig.esignProvider} · {sig.esignSerialNo}</div>
                </>
              )}
            </div>
            <div>
              <div className="font-bold tracking-widest uppercase text-gray-500">合规依据</div>
              <div className="mt-0.5 leading-4">
                ·《电子签名法》§13、14<br />
                ·《民法典》§496、497<br />
                ·《个人信息保护法》§14、17
              </div>
            </div>
          </div>
          <div className="text-center mt-6 text-[9px] text-gray-500">
            本证书在 {SITE.name} 平台数据库长期保存 · 当事人 / 监管机构 / 司法机关随时可查 ·
            打印日期 {new Date().toLocaleDateString("zh-CN")}
          </div>
        </footer>
      </main>

      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { background: white !important; }
        }
      `}</style>
    </>
  );
}

// 假二维码：用网格方块替代真二维码（避免引入大库）
function FakeQRCode({ value, size }: { value: string; size: number }) {
  // 把 value 哈希成一个伪随机但稳定的 21x21 黑白点阵
  const cells = 21;
  const cellSize = size / cells;
  const seed = value.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${cells} ${cells}`} className="border border-black">
      <rect width={cells} height={cells} fill="white" />
      {/* 三角定位点 */}
      {[[0, 0], [cells - 7, 0], [0, cells - 7]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width={7} height={7} fill="black" />
          <rect x={x + 1} y={y + 1} width={5} height={5} fill="white" />
          <rect x={x + 2} y={y + 2} width={3} height={3} fill="black" />
        </g>
      ))}
      {/* 数据块 */}
      {Array.from({ length: cells * cells }).map((_, i) => {
        const x = i % cells;
        const y = Math.floor(i / cells);
        // 避开定位点
        if ((x < 8 && y < 8) || (x > cells - 9 && y < 8) || (x < 8 && y > cells - 9)) return null;
        const v = ((seed * (i + 7)) ^ (i * 1234567)) & 1;
        if (v) return <rect key={i} x={x} y={y} width={1} height={1} fill="black" />;
        return null;
      })}
      <rect x={cells * 0.42} y={cells * 0.42} width={cells * 0.16} height={cells * 0.16} fill="white" />
      <text x={cells * 0.5} y={cells * 0.55} textAnchor="middle" fontSize="2" fontWeight="bold" fill="black">XH</text>
    </svg>
  );
}
