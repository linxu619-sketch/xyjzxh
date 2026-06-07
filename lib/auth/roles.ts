/* ============================================================
   协会员工 角色权限表（RBAC）—— 单一事实源
   - 权限点 PERMISSIONS：对应后台各职能模块
   - 角色 STAFF_ROLES：每个角色拥有的权限集合
   - 员工可拥有「多个角色」，有效权限 = 各角色权限的并集（permissionsOf）
   ============================================================ */

// 权限点（key → 中文职能名）
export const PERMISSIONS = {
  members: "会员审核",
  reports: "工装报备审批",
  mediation: "纠纷调解处置",
  finance: "金融申请审批",
  claims: "保险理赔处置",
  supplies: "建材集采审核",
  news: "新闻发布",
  training: "培训管理",
  knowledge: "知识库管理",
  agreements: "协议 / 电子签管理",
  finance_products: "金融保险产品管理",
  users: "用户与员工管理",
} as const;

export type Permission = keyof typeof PERMISSIONS;
export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];

// 角色定义（key → 标签 + 色标 + 权限集合）
export type RoleDef = { label: string; tone: "brand" | "build" | "design" | "decor" | "tea" | "yellow" | "neutral"; permissions: Permission[] };

export const STAFF_ROLES: Record<string, RoleDef> = {
  super_admin: { label: "超级管理员", tone: "brand", permissions: [...ALL_PERMISSIONS] },
  // —— 党组织 ——
  party_secretary: { label: "党支部书记", tone: "decor", permissions: ["news", "training", "knowledge"] },
  // —— 执行机构 · 理事会领导层 ——
  president: { label: "会长", tone: "decor", permissions: [...ALL_PERMISSIONS] },
  vice_president: { label: "副会长", tone: "yellow", permissions: ["members", "reports", "mediation", "finance", "claims", "supplies", "news", "training", "knowledge", "agreements"] },
  secretary: { label: "秘书长", tone: "build", permissions: ["members", "reports", "mediation", "news", "training", "agreements", "users"] },
  // —— 执行机构 · 秘书处 / 综合办公室 ——
  exec_secretary: { label: "常务秘书长", tone: "build", permissions: ["members", "reports", "mediation", "supplies", "news", "training", "agreements", "users"] },
  office_director: { label: "办公室主任", tone: "yellow", permissions: ["news", "training", "agreements", "users"] },
  // —— 职能岗位 ——
  reviewer: { label: "审核员", tone: "design", permissions: ["members", "reports", "supplies"] },
  finance: { label: "金融保险专员", tone: "tea", permissions: ["finance", "claims", "finance_products"] },
  content: { label: "内容编辑", tone: "yellow", permissions: ["news", "knowledge", "training"] },
  support: { label: "客服支持", tone: "neutral", permissions: ["mediation"] },
  mediator: { label: "调解员", tone: "decor", permissions: ["mediation"] },
};

export const ROLE_KEYS = Object.keys(STAFF_ROLES);

export function roleLabel(key: string): string {
  return STAFF_ROLES[key]?.label ?? key;
}
export function roleTone(key: string): RoleDef["tone"] {
  return STAFF_ROLES[key]?.tone ?? "neutral";
}

// 多角色 → 有效权限并集
export function permissionsOf(roles: string[]): Permission[] {
  const set = new Set<Permission>();
  for (const r of roles) for (const p of STAFF_ROLES[r]?.permissions ?? []) set.add(p);
  // 保持 PERMISSIONS 声明顺序
  return ALL_PERMISSIONS.filter((p) => set.has(p));
}

export function hasPermission(roles: string[], perm: Permission): boolean {
  return roles.some((r) => (STAFF_ROLES[r]?.permissions ?? []).includes(perm));
}
