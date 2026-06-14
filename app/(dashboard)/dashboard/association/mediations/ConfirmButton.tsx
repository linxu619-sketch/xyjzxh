"use client";

/* 提交前二次确认的按钮（用于「驳回」等不可轻易撤销的处置）。
   取消则阻止表单提交。 */
export function ConfirmButton({ confirmText, className, children }: { confirmText: string; className?: string; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => { if (!window.confirm(confirmText)) e.preventDefault(); }}
    >
      {children}
    </button>
  );
}
