import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?:   string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title,
  message,
  onRetry,
}: ErrorStateProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: "var(--danger-bg)" }}
      >
        <AlertTriangle size={22} strokeWidth={1.5} style={{ color: "var(--danger-fg)" }} />
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
        {title ?? t("errorState.title")}
      </p>
      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
        {message ?? t("errorState.description")}
      </p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onRetry}>
            {t("errorState.tryAgain")}
          </Button>
        </div>
      )}
    </div>
  );
}
