import "server-only";
import { verifyPassword } from "./password";
import { SYSTEM_ADMIN } from "./system-admin";
import { getStaffAuthByPhone } from "@/lib/data/staff-source";
import type { Session } from "./session";

/**
 * 高危操作（删除账号 / 删除工作人员等）前的「本人密码二次核验」。
 * 校验的是**当前登录管理员本人**的登录密码：
 *  - 系统超级管理员(system_admin) → 校验内置超管密码哈希；
 *  - 协会职员(association) → 校验其本人登录密码哈希。
 * 这样既满足「删除需输入超级管理员密码」的诉求（平台所有者即超管），
 * 又不必把超管主密码外泄给被授权的职员（职员用本人密码核验）。
 * 密码仅在服务端校验，绝不入库、绝不回显。
 */
export function verifyAdminPassword(session: Session, password: string): boolean {
  if (!password) return false;
  if (session.role === "system_admin") {
    return verifyPassword(password, SYSTEM_ADMIN.passwordHash);
  }
  const auth = getStaffAuthByPhone(session.phone);
  return !!auth?.passwordHash && verifyPassword(password, auth.passwordHash);
}
