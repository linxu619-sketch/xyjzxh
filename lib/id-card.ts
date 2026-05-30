// 中国大陆身份证号校验（GB 11643-1999）
// 仅返回 { ok, age, gender }；不在客户端持久化明文

const WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const CHECK_CODES = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];

export type IdCardResult = {
  ok: boolean;
  age?: number;
  gender?: "M" | "F";
  birthDate?: string;
  error?: string;
};

export function checkIdCard(raw: string): IdCardResult {
  const id = raw.trim().toUpperCase();
  if (!/^\d{17}[\dX]$/.test(id)) {
    return { ok: false, error: "身份证号格式不正确（应为 18 位）" };
  }

  // 出生日期
  const y = Number(id.slice(6, 10));
  const m = Number(id.slice(10, 12));
  const d = Number(id.slice(12, 14));
  const birth = new Date(y, m - 1, d);
  if (
    birth.getFullYear() !== y ||
    birth.getMonth() !== m - 1 ||
    birth.getDate() !== d ||
    y < 1900 ||
    y > new Date().getFullYear()
  ) {
    return { ok: false, error: "身份证号中的出生日期不合法" };
  }

  // 校验码
  let sum = 0;
  for (let i = 0; i < 17; i++) sum += Number(id[i]) * WEIGHTS[i];
  const expected = CHECK_CODES[sum % 11];
  if (expected !== id[17]) {
    return { ok: false, error: "身份证号校验码不匹配" };
  }

  // 性别
  const gender: "M" | "F" = Number(id[16]) % 2 === 1 ? "M" : "F";

  // 年龄
  const today = new Date();
  let age = today.getFullYear() - y;
  const dm = today.getMonth() - (m - 1);
  if (dm < 0 || (dm === 0 && today.getDate() < d)) age--;

  return {
    ok: true,
    age,
    gender,
    birthDate: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
  };
}

// 给敏感字段做哈希（仅前端展示用 · 服务端应用 crypto.scrypt 加盐）
export function maskIdCard(id: string): string {
  if (id.length !== 18) return "—";
  return id.slice(0, 6) + "********" + id.slice(14);
}
