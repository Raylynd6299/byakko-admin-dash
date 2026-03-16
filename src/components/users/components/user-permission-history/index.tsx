import { ReactElement } from "react";
import { History, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import type { PermissionHistoryEntry } from "@/types/user.types";
import type { Permission } from "@/types/permission.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface UserPermissionHistoryProps {
  history:        PermissionHistoryEntry[];
  permissionMap:  Map<string, Permission>;
  isLoading?:     boolean;
  isError?:       boolean;
  onRetry?:       () => void;
}

// ─── Action badge ──────────────────────────────────────────────────────────────

function ActionBadge({ action }: { action: PermissionHistoryEntry["action"] }): ReactElement {
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
      {action === "granted" ? "Granted" : "Revoked"}
    </span>
  );
}

// ─── Timeline item ────────────────────────────────────────────────────────────

interface TimelineItemProps {
  entry:           PermissionHistoryEntry;
  permissionName: string;
}

function TimelineItem({ entry, permissionName }: TimelineItemProps): ReactElement {
  const performer = entry.performedByApi
    ? "API"
    : entry.performedByUserId
      ? `User ${entry.performedByUserId.slice(0, 8)}`
      : "System";

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

// ─── Component ────────────────────────────────────────────────────────────────

export function UserPermissionHistory({
  history,
  permissionMap,
  isLoading,
  isError,
  onRetry,
}: UserPermissionHistoryProps): ReactElement {
  if (isError) {
    return <ErrorState message="Could not load permission history." onRetry={onRetry} />;
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
        title="No history"
        message="No permission changes have been recorded for this user."
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
          Permission History
        </h3>
      </div>
      <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
        {history.map((entry) => {
          const perm = permissionMap.get(entry.permissionId);
          return (
            <TimelineItem
              key={entry.id}
              entry={entry}
              permissionName={perm?.action ?? entry.permissionId.slice(0, 8)}
            />
          );
        })}
      </div>
    </div>
  );
}