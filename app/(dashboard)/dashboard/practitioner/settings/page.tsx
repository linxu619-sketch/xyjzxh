import { redirect } from "next/navigation";

// 设置已并入「我的」(/dashboard/practitioner/profile)；此路径保留并重定向，兼容旧链接/书签。
export default function PractitionerSettings() {
  redirect("/dashboard/practitioner/profile");
}
