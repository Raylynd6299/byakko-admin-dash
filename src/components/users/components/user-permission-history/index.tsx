import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { History, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import type { PermissionHistoryEntry } from "@/types/user.types";
import type { Permission } from "@/types/permission.types";
import type { Category } from "@/types/category.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface UserPermissionHistoryProps {
  history:        PermissionHistoryEntry[];
  permissionMap:  Map<string, Permission>;
  categoryMap:    Map<string, Category>;
  isLoading?:     boolean;
  isError?:       boolean;
  onRetry?:       () => void;
}

// ─── Action badge ──────────────────────────────────────────────────────────────

function ActionBadge({ action }: { action: PermissionHistoryEntry["action"] }): ReactElement {
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

// ─── Timeline item ────────────────────────────────────────────────────────────

interface TimelineItemProps {
  entry:           PermissionHistoryEntry;
  permissionName:  string;
  categoryName?:   string;
}

function TimelineItem({ entry, permissionName, categoryName }: TimelineItemProps): ReactElement {
  const { t } = useTranslation();
  
  const performer = entry.performedByApi
    ? t("users.detail.grantedViaApi")
    : entry.performedByUserId
      ? `${t("users.detail.user")} ${entry.performedByUserId.slice(0, 8)}`
      : t("users.detail.history.system");

  return (
    <div
      className="flex items-start gap-3 px-4 py-3"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
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
          {categoryName && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              · {categoryName}
            </span>
          )}
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

// ─── Component ────────────────────────────────────────────────────────────────

export function UserPermissionHistory({
  history,
  permissionMap,
  categoryMap,
  isLoading,
  isError,
  onRetry,
}: UserPermissionHistoryProps): ReactElement {
  const { t } = useTranslation();

  if (isError) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded"
            style={{ backgroundColor: "var(--surface-2)" }}
          />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <EmptyState
        title={t("users.detail.noHistory")}
        message={t("users.detail.noHistoryDescription")}
        icon={History}
      />
    );
  }

  return (
    <div
      className="rounded-xl border"
      style={{
        backgroundColor: "var(--surface-1)",
        borderColor:     "var(--border-default)",
      }}
    >
      <div
        className="border-b px-4 py-3"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {t("users.detail.history")}
        </h3>
      </div>
      <div>
        {history.map((entry) => {
          const perm     = permissionMap.get(entry.permissionId);
          const category = perm ? categoryMap.get(perm.categoryId) : undefined;
          return (
            <TimelineItem
              key={entry.id}
              entry={entry}
              permissionName={perm?.action ?? entry.permissionId.slice(0, 8)}
              categoryName={category?.name}
            />
          );
        })}
      </div>
    </div>
  );
}