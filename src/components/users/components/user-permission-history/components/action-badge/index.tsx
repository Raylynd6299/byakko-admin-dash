import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { PermissionHistoryEntry } from "@/types/user.types";

interface ActionBadgeProps {
  action: PermissionHistoryEntry["action"];
}

export function ActionBadge({ action }: ActionBadgeProps): ReactElement {
  const { t } = useTranslation();
  const isGranted = action === "granted";
  
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: isGranted ? "var(--success-bg)" : "var(--danger-bg)",
        color:           isGranted ? "var(--success-fg)" : "var(--danger-fg)",
      }}
    >
      {isGranted ? <ArrowUpRight size={10} strokeWidth={2} /> : <ArrowDownRight size={10} strokeWidth={2} />}
      {action === "granted" ? t("users.detail.granted") : t("users.detail.revoked")}
    </span>
  );
}