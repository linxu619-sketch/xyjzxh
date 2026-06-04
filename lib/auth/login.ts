import "server-only";
import { SYSTEM_ADMIN } from "./system-admin";
import { getStaffAuthByPhone } from "@/lib/data/staff-source";
import { findEnterpriseByContactPhone } from "@/lib/data/enterprises-source";
import { getPractitionerByPhone } from "@/lib/data/practitioners-source";
import { getAccountByPhone, upsertAccount } from "@/lib/data/accounts";
import { verifyPassword } from "./password";
import type { Session } from "./session";

export type LoginResult =
  | { ok: true; session: Omit<Session, "exp">; isSystemAdmin: boolean; pending?: boolean }
  | { ok: false; error: string };

/**
 * 统一密码登录
 * 1. 先比对系统管理员（写死，不入库）
 * 2. 再查 mock 协会员工库（未来替换为 association_staff 表）
 */
export async function loginWithPassword(
  phone: string,
  password: string,
): Promise<LoginResult> {
  const cleanPhone = phone.trim();
  if (!/^1\d{10}$/.test(cleanPhone)) {
    return { ok: false, error: "请输入正确的 11 位手机号" };
  }
  if (!password) return { ok: false, error: "请输入密码" };

  // —— 系统管理员 ——
  if (cleanPhone === SYSTEM_ADMIN.phone) {
    if (verifyPassword(password, SYSTEM_ADMIN.passwordHash)) {
      return {
        ok: true,
        isSystemAdmin: true,
        session: {
          uid: SYSTEM_ADMIN.id,
          role: "system_admin",
          name: SYSTEM_ADMIN.name,
          phone: SYSTEM_ADMIN.phone,
          staffRole: SYSTEM_ADMIN.staffRole,
        },
      };
    }
    return { ok: false, error: "密码错误" };
  }

  // —— 协会工作人员（数据库 association_staff）——
  const staff = getStaffAuthByPhone(cleanPhone);
  if (staff && staff.status !== "active") {
    return { ok: false, error: "该工作人员账号已被停用,请联系秘书处" };
  }
  if (staff && verifyPassword(password, staff.passwordHash)) {
    return {
      ok: true,
      isSystemAdmin: false,
      session: {
        uid: staff.id,
        role: "association",
        name: staff.name,
        phone: staff.phone,
        staffRole: staff.staffRole,
      },
    };
  }

  return { ok: false, error: "手机号或密码不正确" };
}

/**
 * 演示用：业主短信码登录（任意 11 位手机号 + 任意 6 位码即通过）
 * 接入 Supabase Auth + 短信网关后替换
 */
export async function loginCustomerWithSms(
  phone: string,
  code: string,
): Promise<LoginResult> {
  if (!/^1\d{10}$/.test(phone.trim())) {
    return { ok: false, error: "请输入正确的 11 位手机号" };
  }
  if (!/^\d{4,6}$/.test(code)) {
    return { ok: false, error: "请输入验证码" };
  }
  const clean = phone.trim();
  // 尊重协会「用户管理」的停用：被停用的业主账号拒绝登录
  const existing = getAccountByPhone(clean);
  if (existing && existing.role === "customer" && existing.status === "rejected") {
    return { ok: false, error: "该账号已被协会停用,如有疑问请联系协会" };
  }
  const name = existing?.name || `业主 ${clean.slice(0, 3)}***${clean.slice(-4)}`;
  // 登录即建/更新业主账号,便于在「用户管理」可见
  try { upsertAccount({ phone: clean, role: "customer", status: "active", name }); } catch { /* 演示库不可用时忽略 */ }
  return {
    ok: true,
    isSystemAdmin: false,
    session: {
      uid: `cust-${clean.slice(-4)}`,
      role: "customer",
      name,
      phone: clean,
    },
  };
}

/**
 * 演示用：从业者短信码登录
 */
export async function loginPractitionerWithSms(
  phone: string,
  code: string,
): Promise<LoginResult> {
  if (!/^1\d{10}$/.test(phone.trim())) {
    return { ok: false, error: "请输入正确的 11 位手机号" };
  }
  if (!/^\d{4,6}$/.test(code)) {
    return { ok: false, error: "请输入验证码" };
  }
  const cleanPhone = phone.trim();

  // —— 账号体系：个人会员账号 ——
  const acct = getAccountByPhone(cleanPhone);
  if (acct && acct.role === "individual") {
    if (acct.status === "active") {
      return {
        ok: true,
        isSystemAdmin: false,
        session: { uid: `prac-${acct.memberRef ?? cleanPhone}`, role: "practitioner", name: acct.name || `师傅 ${cleanPhone.slice(-4)}`, phone: cleanPhone },
      };
    }
    // pending / rejected → 登录后落审核进度页
    return {
      ok: true,
      isSystemAdmin: false,
      pending: true,
      session: { uid: `prac-pending-${cleanPhone.slice(-4)}`, role: "practitioner", name: acct.name || `申请人 ${cleanPhone.slice(-4)}`, phone: cleanPhone, pending: true },
    };
  }

  // —— 演示回退：未注册账号 → 临时从业者身份（兼容旧演示登录）——
  const p = getPractitionerByPhone(cleanPhone);
  return {
    ok: true,
    isSystemAdmin: false,
    session: {
      uid: p ? `prac-${p.id}` : `prac-${cleanPhone.slice(-4)}`,
      role: "practitioner",
      name: p?.name ?? `师傅 ${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
    },
  };
}

/**
 * 演示用：企业员工密码登录
 * 接入数据库后替换为 enterprise_staff 表查询
 */
export async function loginEnterpriseWithPassword(
  phone: string,
  password: string,
): Promise<LoginResult> {
  if (!/^1\d{10}$/.test(phone.trim())) {
    return { ok: false, error: "请输入正确的 11 位手机号" };
  }
  if (password.length < 6) {
    return { ok: false, error: "密码长度不能少于 6 位" };
  }
  const cleanPhone = phone.trim();

  // —— 账号体系：企业会员账号 ——
  const acct = getAccountByPhone(cleanPhone);
  if (acct && acct.role === "enterprise") {
    // 设过密码则校验；未设密码（历史账号）放行
    if (acct.passwordHash && !verifyPassword(password, acct.passwordHash)) {
      return { ok: false, error: "密码错误" };
    }
    if (acct.status === "active") {
      return {
        ok: true,
        isSystemAdmin: false,
        session: { uid: `ent-${acct.memberRef ?? cleanPhone}`, role: "enterprise", name: acct.name || "企业会员", phone: cleanPhone, enterpriseId: acct.memberRef ?? undefined },
      };
    }
    // pending / rejected → 审核进度页
    return {
      ok: true,
      isSystemAdmin: false,
      pending: true,
      session: { uid: `ent-pending-${cleanPhone.slice(-4)}`, role: "enterprise", name: acct.name || "申请企业", phone: cleanPhone, pending: true },
    };
  }

  // —— 真实绑定回退：手机号匹配到正式会员企业（兼容入会建档但无账号的情况）——
  const ent = findEnterpriseByContactPhone(cleanPhone);
  if (ent) {
    return {
      ok: true,
      isSystemAdmin: false,
      session: { uid: `ent-${ent.id}`, role: "enterprise", name: ent.name, phone: cleanPhone, enterpriseId: ent.id },
    };
  }

  // —— 演示回退：未注册账号 → 绑定到演示企业「名家装饰」(e002)，方便本地试用 ——
  return {
    ok: true,
    isSystemAdmin: false,
    session: {
      uid: `ent-${cleanPhone.slice(-4)}`,
      role: "enterprise",
      name: `企业用户 ${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      enterpriseId: "e002",
    },
  };
}
