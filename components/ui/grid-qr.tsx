/* 网格码（装饰性二维码）——用稳定伪随机点阵替代真二维码，避免引入大库。
   用于电子签证书、从业者电子名片等「官方文书」视觉；真正的验证靠下方明文链接。
   注：非可扫码二维码，仅作证书风格装饰 + 防伪观感。 */
export function GridQR({ value, size = 88, label = "XH" }: { value: string; size?: number; label?: string }) {
  const cells = 21;
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
        if ((x < 8 && y < 8) || (x > cells - 9 && y < 8) || (x < 8 && y > cells - 9)) return null;
        const v = ((seed * (i + 7)) ^ (i * 1234567)) & 1;
        if (v) return <rect key={i} x={x} y={y} width={1} height={1} fill="black" />;
        return null;
      })}
      <rect x={cells * 0.42} y={cells * 0.42} width={cells * 0.16} height={cells * 0.16} fill="white" />
      <text x={cells * 0.5} y={cells * 0.55} textAnchor="middle" fontSize="2" fontWeight="bold" fill="black">{label}</text>
    </svg>
  );
}
