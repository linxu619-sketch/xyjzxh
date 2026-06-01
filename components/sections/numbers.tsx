import { Container } from "../container";
import { cn } from "@/lib/cn";
import { getEnterprises } from "@/lib/data/enterprises-source";
import { listPractitioners } from "@/lib/data/practitioners-source";
import { listReports } from "@/lib/data/reports";
import { listAllFinanceApps } from "@/lib/data/finance-source";
import { listInsuranceOrders } from "@/lib/data/insurance-orders";

const COLOR: Record<string, string> = {
  build: "text-cat-build",
  decor: "text-cat-decor",
  design: "text-cat-design",
  tea: "text-accent-tea",
};

export async function Numbers() {
  const enterprises = await getEnterprises();
  const practitioners = listPractitioners();
  const reports = listReports();
  const finance = listAllFinanceApps().length + listInsuranceOrders().length;

  const stats = [
    { label: "企业会员", value: String(enterprises.length), suffix: "家", color: "build" },
    { label: "个人会员", value: String(practitioners.length), suffix: "位", color: "design" },
    { label: "工装报备", value: String(reports.length), suffix: "项", color: "decor" },
    { label: "金融服务", value: String(finance), suffix: "单", color: "tea" },
  ];

  return (
    <section className="py-8 md:py-12">
      <Container>
        <div className="rounded-3xl border border-brand/10 bg-gradient-to-br from-brand-50 via-[#f3eeff] to-[#e6f7f1] p-5 md:p-8 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 md:gap-y-8 gap-x-4 md:gap-x-6">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={cn(
                  "relative",
                  i < stats.length - 1 && "md:border-r md:border-border md:pr-6",
                )}
              >
                <div className={cn("text-[28px] md:text-[56px] font-semibold tracking-tight leading-none tabular-nums", COLOR[s.color])}>
                  {s.value}
                  <span className="ml-1 text-[12px] md:text-[16px] font-normal text-muted-foreground align-top">{s.suffix}</span>
                </div>
                <div className="mt-1.5 md:mt-2 text-[11px] md:text-[13px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
