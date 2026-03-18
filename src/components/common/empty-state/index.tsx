import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title?:    string;
  message?:  string;
  icon?:     LucideIcon;
  action?:   React.ReactNode;
}

export function EmptyState({
  title,
  message,
  icon:   Icon = Inbox,
  action,
}: EmptyStateProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: "var(--surface-3)" }}
      >
        <Icon size={22} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
        {title ?? t("emptyState.noResults")}
      </p>
      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
        {message ?? t("emptyState.nothingHere")}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
