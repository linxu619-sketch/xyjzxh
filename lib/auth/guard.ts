import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession, type Session } from "./session";

/**
 * 要求已登录才能访问当前页 —— 未登录则跳登录页并带 ?next= 回跳。
 * 供「会员服务/资料」浏览页（知识库全文、报备、建材、人才/从业者等）
 * 与「办事/提交」页（报备、评价、调解、投保、下单）统一使用。
 * 当前路径来自 middleware 注入的 x-pathname。
 */
export async function requireLogin(): Promise<Session> {
  const session = await getSession();
  if (session) return session;
  const path = (await headers()).get("x-pathname") || "/";
  redirect(`/login?next=${encodeURIComponent(path)}`);
}
