import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6">
      <div className="text-[12px] tracking-widest text-muted-foreground uppercase">Tenant</div>
      <h1 className="mt-3 text-[40px] font-semibold tracking-tight">企业子站不存在</h1>
      <p className="mt-3 max-w-md text-[14px] text-muted-foreground">
        这个二级域名 / 路径还没有对应的企业入驻。你可以在协会主站浏览全部已入驻企业。
      </p>
      <Link href="/members" className="mt-7 inline-flex h-11 items-center px-5 rounded-full bg-foreground text-background text-[14px] font-medium">
        浏览全部会员企业
      </Link>
    </div>
  );
}
