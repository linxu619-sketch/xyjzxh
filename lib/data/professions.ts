/* 工种 / 区域统一枚举 —— 注册、企业发岗、从业者找活资料、岗位匹配全部用这一套。
   此前注册表("独立工长/软装设计师")、发岗表("工长/普工")、名录三处取值不一致，
   会让"工种匹配"直接失效。统一到这里，单一事实来源。 */

export const PROFESSIONS = [
  "工长", "项目经理", "监理", "设计师", "软装设计师",
  "木工", "瓦工", "水电工", "油漆工", "安装工",
  "造价/预算", "防水", "普工", "其他",
] as const;
export type Profession = (typeof PROFESSIONS)[number];

// 信阳市主要辖区县（可接区域 / 工地区域多选用）
export const DISTRICTS = [
  "浉河区", "平桥区", "羊山新区", "罗山县", "光山县",
  "新县", "商城县", "固始县", "潢川县", "淮滨县", "息县",
] as const;

// 把旧的不规范工种值归一到统一枚举（用于历史数据匹配，不改库）
export function normalizeProfession(raw: string | null | undefined): string {
  const v = (raw ?? "").trim();
  if (!v) return "";
  if ((PROFESSIONS as readonly string[]).includes(v)) return v;
  // 常见旧值映射
  if (v.includes("独立工长") || v === "工长") return "工长";
  if (v.includes("软装")) return "软装设计师";
  if (v.includes("设计")) return "设计师";
  if (v.includes("造价") || v.includes("预算")) return "造价/预算";
  if (v.includes("水电")) return "水电工";
  if (v === "杂工") return "普工";
  return v; // 未知保留原值（仍可精确相等匹配）
}
