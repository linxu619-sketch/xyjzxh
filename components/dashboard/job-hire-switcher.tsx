import Link from "next/link";
import { Hammer, Briefcase } from "lucide-react";

// 从业者端「找活(零工) / 找工作(招聘)」切换条
export function JobHireSwitcher({ active }: { active: "gig" | "hire" }) {
  const tab = (key: "gig" | "hire", href: string, Icon: React.ComponentType<{ className?: string }>, label: string) => (
    <Link href={href} className={`flex-1 h-10 rounded-full inline-flex items-center justify-center gap-1.5 text-[13px] font-medium transition-colors ${active === key ? "bg-foreground text-background" : "text-muted-foreground"}`}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </Link>
  );
  return (
    <div className="mb-4 p-1 rounded-full bg-surface border border-border flex gap-1">
      {tab("gig", "/dashboard/practitioner/jobs", Hammer, "找活 · 零工")}
      {tab("hire", "/dashboard/practitioner/hire", Briefcase, "找工作 · 招聘")}
    </div>
  );
}
