import { type ReactElement } from "react";

interface PageHeaderProps {
  title:        string;
  description?: string;
  action?:      React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps): ReactElement {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <h1
          className="text-lg font-semibold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h1>
        {description && (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
