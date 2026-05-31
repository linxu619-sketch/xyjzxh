import "server-only";
import { SYSTEM_ADMIN } from "./system-admin";
import { findStaffByPhone } from "@/lib/data/users-seed";
import { findEnterpriseByContactPhone } from "@/lib/data/enterprises-source";
import { verifyPassword } from "./password";
import type { Session } from "./session";

export type LoginResult =
  | { ok: true; session: Omit<Session, "exp">; isSystemAdmin: boolean }
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

  // —— 协会数据库账号 ——
  const staff = findStaffByPhone(cleanPhone);
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
  return {
    ok: true,
    isSystemAdmin: false,
    session: {
      uid: `cust-${phone.slice(-4)}`,
      role: "customer",
      name: `用户 ${phone.slice(0, 3)}***${phone.slice(-4)}`,
      phone,
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
  return {
    ok: true,
    isSystemAdmin: false,
    session: {
      uid: `prac-${phone.slice(-4)}`,
      role: "practitioner",
      name: `张师傅 ${phone.slice(-4)}`,
      phone,
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

  // —— 真实绑定：手机号匹配到正式会员企业（入会通过后建档，联系电话即登录账号）——
  const ent = findEnterpriseByContactPhone(cleanPhone);
  if (ent) {
    return {
      ok: true,
      isSystemAdmin: false,
      session: {
        uid: `ent-${ent.id}`,
        role: "enterprise",
        name: ent.name,
        phone: cleanPhone,
        enterpriseId: ent.id,
      },
    };
  }

  // —— 演示回退：未匹配到正式会员企业 → 绑定到演示企业「名家装饰」(e002)，方便本地试用 ——
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
