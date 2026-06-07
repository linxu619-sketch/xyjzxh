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

/* ------------------------------------------------------------
   演示短信验证码 —— 短信网关尚未接入前的临时固定码。
   接入真实网关后：改为下发随机码并按手机号校验，删除此常量。
   ------------------------------------------------------------ */
export const DEMO_SMS_CODE = "123456";

/** 演示阶段校验短信验证码：必须等于固定码 123456 */
function checkSmsCode(code: string): { ok: true } | { ok: false; error: string } {
  const c = code.trim();
  if (!c) return { ok: false, error: "请输入短信验证码" };
  if (c !== DEMO_SMS_CODE) return { ok: false, error: `验证码错误（演示请输入 ${DEMO_SMS_CODE}）` };
  return { ok: true };
}

/**
 * 该手机号是否属于「协会工作人员 / 系统管理员」。
 * 企业 / 从业者 / 业主登录路径用它把这些号码挡掉，避免协会会长等被演示兜底
 * 误绑成企业(名家 e002)或其它身份——协会职员必须走「协会」密码登录。
 */
function isAssociationPhone(phone: string): boolean {
  const p = phone.trim();
  return p === SYSTEM_ADMIN.phone || !!getStaffAuthByPhone(p);
}
const ASSOC_PHONE_ERR = "该手机号是协会工作人员账号，请选择「协会」用密码登录";

/* ------------------------------------------------------------
   密码登录防爆破 —— 进程内限流(单实例够用;多实例上线后换 Redis/库)
   规则:同一手机号 10 分钟内密码错误满 5 次 → 锁定 10 分钟。
   成功登录即清零。仅作用于真实密码路径(系统管理员 / 协会职员)。
   ------------------------------------------------------------ */
const MAX_FAILS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const failStore = new Map<string, { fails: number; first: number; until: number }>();

function isLocked(phone: string): number {
  const e = failStore.get(phone);
  if (!e) return 0;
  const now = Date.now();
  if (e.until > now) return Math.ceil((e.until - now) / 60000); // 剩余锁定分钟
  return 0;
}
function recordFail(phone: string): void {
  const now = Date.now();
  const e = failStore.get(phone);
  if (!e || now - e.first > WINDOW_MS) {
    failStore.set(phone, { fails: 1, first: now, until: 0 });
    return;
  }
  e.fails += 1;
  if (e.fails >= MAX_FAILS) e.until = now + WINDOW_MS;
}
function clearFail(phone: string): void {
  failStore.delete(phone);
}

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

  // 防爆破:锁定中直接拒绝
  const lockMin = isLocked(cleanPhone);
  if (lockMin > 0) {
    return { ok: false, error: `密码错误次数过多,请 ${lockMin} 分钟后再试` };
  }

  // —— 系统管理员 ——
  if (cleanPhone === SYSTEM_ADMIN.phone) {
    if (verifyPassword(password, SYSTEM_ADMIN.passwordHash)) {
      clearFail(cleanPhone);
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
    recordFail(cleanPhone);
    return { ok: false, error: "密码错误" };
  }

  // —— 协会工作人员（数据库 association_staff）——
  const staff = getStaffAuthByPhone(cleanPhone);
  if (staff && staff.status !== "active") {
    return { ok: false, error: "该工作人员账号已被停用,请联系秘书处" };
  }
  if (staff && verifyPassword(password, staff.passwordHash)) {
    clearFail(cleanPhone);
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

  recordFail(cleanPhone);
  return { ok: false, error: "手机号或密码不正确" };
}

/**
 * 演示用：业主短信码登录（任意 11 位手机号 + 任意 6 位码即通过）
 * 接入短信网关后替换
 */
export async function loginCustomerWithSms(
  phone: string,
  code: string,
): Promise<LoginResult> {
  if (!/^1\d{10}$/.test(phone.trim())) {
    return { ok: false, error: "请输入正确的 11 位手机号" };
  }
  const sms = checkSmsCode(code);
  if (!sms.ok) return sms;
  const clean = phone.trim();
  if (isAssociationPhone(clean)) return { ok: false, error: ASSOC_PHONE_ERR };
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
  const sms = checkSmsCode(code);
  if (!sms.ok) return sms;
  const cleanPhone = phone.trim();
  if (isAssociationPhone(cleanPhone)) return { ok: false, error: ASSOC_PHONE_ERR };

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
  if (isAssociationPhone(cleanPhone)) return { ok: false, error: ASSOC_PHONE_ERR };

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

  // 已注册为业主 / 个人会员的手机号：不要被演示兜底绑成企业(名家)，提示用对应身份登录
  if (acct && (acct.role === "individual" || acct.role === "customer")) {
    return { ok: false, error: `该手机号已注册为${acct.role === "individual" ? "个人会员" : "业主"}，请用对应身份登录` };
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

/**
 * 演示用：企业短信验证码登录
 * 账号解析与密码登录完全一致，仅把「密码校验」换成「短信验证码校验」(演示固定 123456)。
 * 接入数据库 + 短信网关后替换。
 */
export async function loginEnterpriseWithSms(
  phone: string,
  code: string,
): Promise<LoginResult> {
  if (!/^1\d{10}$/.test(phone.trim())) {
    return { ok: false, error: "请输入正确的 11 位手机号" };
  }
  const sms = checkSmsCode(code);
  if (!sms.ok) return sms;
  const cleanPhone = phone.trim();
  if (isAssociationPhone(cleanPhone)) return { ok: false, error: ASSOC_PHONE_ERR };

  // —— 账号体系：企业会员账号（短信登录不校验密码）——
  const acct = getAccountByPhone(cleanPhone);
  if (acct && acct.role === "enterprise") {
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

  // 已注册为业主 / 个人会员的手机号：不要被演示兜底绑成企业(名家)，提示用对应身份登录
  if (acct && (acct.role === "individual" || acct.role === "customer")) {
    return { ok: false, error: `该手机号已注册为${acct.role === "individual" ? "个人会员" : "业主"}，请用对应身份登录` };
  }

  // —— 真实绑定回退：手机号匹配到正式会员企业 ——
  const ent = findEnterpriseByContactPhone(cleanPhone);
  if (ent) {
    return {
      ok: true,
      isSystemAdmin: false,
      session: { uid: `ent-${ent.id}`, role: "enterprise", name: ent.name, phone: cleanPhone, enterpriseId: ent.id },
    };
  }

  // —— 演示回退：未注册账号 → 绑定到演示企业「名家装饰」(e002) ——
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
