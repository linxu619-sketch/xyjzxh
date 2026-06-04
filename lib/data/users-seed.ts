import "server-only";

/* ============================================================
   协会工作人员 mock 数据（替代真正数据库 association_staff 表）
   ------------------------------------------------------------
   接入 Supabase 后，本文件可删除；用 db/seed.sql 把这里的
   记录写入 association_staff 即可。密码均为 scrypt 哈希。
   ============================================================ */

export type SeedStaff = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  staffRole:
    | "super_admin" | "secretary" | "reviewer"
    | "finance" | "content" | "support" | "mediator";
  roles?: string[];  // 多角色（不填则默认 [staffRole]）
  passwordHash: string;
  status: "active" | "locked";
};

export const SEED_STAFF: SeedStaff[] = [
  {
    id: "as-001",
    name: "何平俊",
    phone: "13507610059",
    staffRole: "super_admin",
    // scrypt of "610059"
    passwordHash:
      "scrypt$ae75965c57b123e58c1323210f3c4ee4$758562605edb30d3e3e39e208bdbd525d35222aeaeb9775ff76701146e60d19f61a5fba6f048d9351558f3a84eca9292ae5a58a8d987c1a3a3cb173da3c1d813",
    status: "active",
  },
  // 协会秘书处虚拟工作人员（演示）；登录密码 = 手机号后 6 位
  { id: "as-002", name: "王建国", phone: "13803760012", staffRole: "secretary", roles: ["secretary", "reviewer"], passwordHash: "scrypt$cf8099a96658fc423394941b338d692b$cce195798e00dec8068c2e395fa2425112fad988f9086936e6c2f4d0fba820c28c0c8cc6d38f7f5fcde47caa3825c67c5f08e5e86a1c1dae1df7e893c0e1ae34", status: "active" },
  { id: "as-003", name: "李文博", phone: "13803760023", staffRole: "reviewer", roles: ["reviewer", "content"], passwordHash: "scrypt$e2097b2167b1a61325a9268188816139$7c61ba078e7ed63953d8e0a646734c2124603644887bdaff4a044075ccf5383858c5c56908a01265926ae2b69537668d71dfbed9a606439e124516c7da5629bb", status: "active" },
  { id: "as-004", name: "张慧敏", phone: "13803760034", staffRole: "finance", roles: ["finance", "support"], passwordHash: "scrypt$75e9606064f65f4b84045320d93282b7$5005d0047f23f2442b99f8aca55a54938bc6b618dbfd842dd7c1fc4099b543f2240c75d1c615fe4046ad4be60f2284ebe715f4f4631328630368224ca062f40a", status: "active" },
  { id: "as-005", name: "陈思远", phone: "13803760045", staffRole: "content", passwordHash: "scrypt$64152bbca8bbbcaa24dad062d81dc23d$42f46302571da628997a69b99113892989c7fb69cf33ce9fd3828555954d07518876a855ae8a4f05905974027f17e961bfdb6ecb1a0151104adc7da382f7be0b", status: "active" },
  { id: "as-006", name: "刘海涛", phone: "13803760056", staffRole: "support", passwordHash: "scrypt$fcc6c4345c5f1b1a99f484bc0ba66dd6$eb3ccff24da44f8773bb0e94583c43a90ac58083ef682609502050eeb05243a828541b300fedd70b3064076d9fc184c8f1944c2955ec0fd5b142b89d870a666a", status: "active" },
  { id: "as-007", name: "周晓梅", phone: "13803760067", staffRole: "reviewer", passwordHash: "scrypt$770aff0785597187809b05f71d14654b$9aa01a763ae734252d53db7032330a0976eecad1a89ee6f7e48d4c45d0f057d81cc1d9786319f6f8de2d570d3a7ea2ea88d57da496dd32385086d78319315115", status: "active" },
];

export function findStaffByPhone(phone: string): SeedStaff | undefined {
  return SEED_STAFF.find((s) => s.phone === phone && s.status === "active");
}
