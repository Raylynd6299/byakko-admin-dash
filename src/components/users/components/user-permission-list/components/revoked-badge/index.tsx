import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { ShieldOff } from "lucide-react";

interface RevokedBadgeProps {
  date: string;
}

export function RevokedBadge({ date }: RevokedBadgeProps): ReactElement {
  const { t } = useTranslation();
  
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs"
      style={{
        backgroundColor: "var(--danger-bg)",
        color:           "var(--danger-fg)",
      }}
    >
      <ShieldOff size={10} strokeWidth={1.5} />
      {t("users.detail.revoked")} {new Date(date).toLocaleDateString()}
    </span>
  );
}