import "server-only";

/* ============================================================
   系统级管理员（编译进程序，永不入库）
   ------------------------------------------------------------
   该账号是平台最高权限，专为协会平台运维持有人保留。
   - 不通过任何注册流程产生
   - 不写入任何数据库表
   - 密码以 scrypt 哈希形式硬编码，源码无法反推明文
   - 登录路径与协会工作人员相同（/login → 协会 tab），但
     登录后默认进入「系统管理员」视图（/dashboard/association?sys=1）
   ------------------------------------------------------------
   如需变更密码，请使用以下脚本生成新 hash 并替换：
     node -e "const c=require('crypto');const s=c.randomBytes(16).toString('hex');console.log('scrypt$'+s+'$'+c.scryptSync(process.argv[1],s,64).toString('hex'))" 新密码
   ============================================================ */

export const SYSTEM_ADMIN = {
  id: "sysadmin-001",
  name: "林旭",
  phone: "18221670728",
  role: "system_admin" as const,
  staffRole: "platform_owner" as const,
  // scrypt(plaintext_password) — plaintext 不在源码内
  passwordHash:
    "scrypt$62d76c6225b257a34f6a6ac1749ad24c$6adca0e81c2f304b9465d221e23e4b7bc715482a178ca671b932d872356c1d66d5dd2db980c9fd4f69bba384b25257ecf0ede4a561415bde6a130354e1465805",
};
