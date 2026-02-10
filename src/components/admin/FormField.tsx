import { ReactNode } from "react";

export function FormField({
  label,
  help,
  required,
  children,
}: {
  label: string;
  help?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {help && <p className="text-xs text-muted">{help}</p>}
      {children}
    </div>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4 rounded-lg border border-[#e5e5dc] bg-white p-5">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
