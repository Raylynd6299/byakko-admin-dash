import { type ReactElement } from "react";

interface DetailFieldProps {
  icon:  React.ReactNode;
  label: string;
  value: React.ReactNode;
}

export function DetailField({ icon, label, value }: DetailFieldProps): ReactElement {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span style={{ color: "var(--text-muted)" }}>{icon}</span>
        <span
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </span>
      </div>
      <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {value}
      </div>
    </div>
  );
}