import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { PermissionHistoryEntry } from "@/types/user.types";
import { ActionBadge } from "../action-badge";

interface TimelineItemProps {
  entry:           PermissionHistoryEntry;
  permissionName: string;
}

export function TimelineItem({ entry, permissionName }: TimelineItemProps): ReactElement {
  const { t } = useTranslation();
  
  const performer = entry.performedByApi
    ? t("users.detail.grantedViaApi")
    : entry.performedByUserId
      ? `${t("users.detail.user")} ${entry.performedByUserId.slice(0, 8)}`
      : t("users.detail.history.system");

  return (
    <div className="flex items-start gap-3 py-3">
      {/* Dot */}
      <div
        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: entry.action === "granted" ? "var(--success)" : "var(--danger)" }}
      />
      
      {/* Content */}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <ActionBadge action={entry.action} />
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {permissionName}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
          <span>{new Date(entry.performedAt).toLocaleString()}</span>
          <span>•</span>
          <span>{performer}</span>
        </div>
      </div>
    </div>
  );
}