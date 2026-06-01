import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "xyzhxh_session";
const TTL_DAYS = 7;

// 生产环境必须在 .env.local / Vercel 环境变量中设置 SESSION_SECRET
// dev 默认值仅用于本地调试，请勿用于生产
const DEV_SECRET = "xyzhxh-dev-secret-please-change-in-production-99d3c4";

function secret() {
  return process.env.SESSION_SECRET || DEV_SECRET;
}

export type SessionRole =
  | "system_admin"
  | "association"
  | "enterprise"
  | "practitioner"
  | "customer";

export type Session = {
  uid: string;
  role: SessionRole;
  name: string;
  phone: string;
  staffRole?: string;
  enterpriseId?: string;
  pending?: boolean; // 入会审核中的账号：可登录但只看审核进度页，不解锁工作台
  exp: number;
};

function sign(payload: Session): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(token: string): Session | null {
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Session;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSession(s: Omit<Session, "exp">) {
  const exp = Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000;
  const jar = await cookies();
  jar.set(COOKIE, sign({ ...s, exp }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(exp),
  });
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const tok = jar.get(COOKIE)?.value;
  return tok ? verify(tok) : null;
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
