import { redirect } from "next/navigation";

// 企业页面已统一为 /biz 子站模板：旧的会员档案路径重定向到该企业子站。
export default async function MemberProfileRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/biz/${id}`);
}
