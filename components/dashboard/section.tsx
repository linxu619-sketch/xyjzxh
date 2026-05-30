import { cn } from "@/lib/cn";

export function FilterBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "rounded-2xl border border-border bg-background p-3 md:p-4 flex flex-wrap items-center gap-2",
      className,
    )}>
      {children}
    </div>
  );
}

export function DataTable({
  head, rows, empty,
}: {
  head: string[];
  rows: React.ReactNode[][];
  empty?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead className="bg-surface text-[12px] text-muted-foreground">
          <tr>{head.map((h) => <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <tr><td colSpan={head.length} className="px-5 py-16 text-center text-muted-foreground">{empty ?? "暂无数据"}</td></tr>
          ) : rows.map((cells, i) => (
            <tr key={i} className="hover:bg-surface/60">
              {cells.map((c, j) => <td key={j} className="px-5 py-3 align-middle">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SettingsCard({
  title, desc, children, action,
}: {
  title: string;
  desc?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6 md:p-7">
      <div className="flex items-start justify-between gap-4 mb-5 flex-col md:flex-row">
        <div>
          <h3 className="text-[16px] font-semibold tracking-tight">{title}</h3>
          {desc && <p className="mt-1 text-[12px] text-muted-foreground max-w-xl">{desc}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function FormRow({
  label, hint, children, required,
}: {
  label: React.ReactNode; hint?: React.ReactNode; children: React.ReactNode; required?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-4 border-t border-border first:border-0 first:pt-0">
      <div>
        <div className="text-[13px] font-medium">{label}{required && <span className="text-cat-decor ml-0.5">*</span>}</div>
        {hint && <div className="mt-1 text-[11px] text-muted-foreground leading-5">{hint}</div>}
      </div>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}

export function Toggle({ defaultChecked, label, name }: { defaultChecked?: boolean; label?: string; name?: string }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <span className="relative inline-block w-10 h-6">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="absolute inset-0 rounded-full bg-border peer-checked:bg-brand transition-colors" />
        <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm peer-checked:translate-x-4 transition-transform" />
      </span>
      {label && <span className="text-[13px]">{label}</span>}
    </label>
  );
}

export function Input({ placeholder, defaultValue, type = "text", name, autoComplete }: { placeholder?: string; defaultValue?: string; type?: string; name?: string; autoComplete?: string }) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      defaultValue={defaultValue}
      autoComplete={autoComplete}
      className="w-full h-11 rounded-xl border border-border px-4 outline-none focus:border-foreground/30 text-[14px]"
    />
  );
}

export function Textarea({ placeholder, defaultValue, rows = 4, name }: { placeholder?: string; defaultValue?: string; rows?: number; name?: string }) {
  return (
    <textarea
      name={name}
      rows={rows}
      placeholder={placeholder}
      defaultValue={defaultValue}
      className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-foreground/30 text-[14px] leading-6"
    />
  );
}
