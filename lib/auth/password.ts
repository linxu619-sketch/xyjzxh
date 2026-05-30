import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// 密码以 scrypt 哈希存储；plaintext 永不入库 / 永不入源码。
// 格式：scrypt$<salt-hex>$<derived-hex>
const KEY_LEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, KEY_LEN).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, hash] = parts;
  if (!salt || !hash) return false;
  let expected: Buffer;
  try {
    expected = Buffer.from(hash, "hex");
  } catch {
    return false;
  }
  const derived = scryptSync(password, salt, KEY_LEN);
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}
