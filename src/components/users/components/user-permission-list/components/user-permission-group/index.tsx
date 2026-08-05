import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight, Folder, Shield, ShieldOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, BUTTON_VARIANT } from "@/components/ui/button";
import { RevokedBadge } from "@/components/users/components/user-permission-list/components/revoked-badge";
import type { GroupedUserPermissions } from "@/components/users/components/user-permission-list/helpers";
import type { UserPermission } from "@/types/user.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface UserPermissionGroupProps {
  group:      GroupedUserPermissions;
  isExpanded: boolean;
  onToggle:   () => void;
  onRevoke:   (permission: UserPermission) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * A collapsible category group of a user's granted permissions. Mirrors
 * the Permisos screen's CategoryGroup collapse pattern verbatim (design
 * §7/§12) — controlled `isExpanded`, no local collapse state.
 */
export function UserPermissionGroup({
  group,
  isExpanded,
  onToggle,
  onRevoke,
}: UserPermissionGroupProps): ReactElement {
  const { t } = useTranslation();

  const categoryLabel = group.categoryName || group.categoryPath.replace(/\./g, " / ");

  return (
    <div className="mb-1">
      {/* Category header row */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2",
          "text-left text-xs font-semibold uppercase tracking-wider",
          "transition-colors duration-100 hover:bg-[var(--surface-3)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
        )}
        style={{ color: "var(--text-muted)" }}
      >
        <ChevronRight
          size={13}
          strokeWidth={2}
          className={cn("shrink-0 transition-transform duration-150", isExpanded && "rotate-90")}
        />
        <Folder size={13} strokeWidth={1.5} className="shrink-0" />
        <span className="truncate">{categoryLabel}</span>
        <span
          className="ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-normal"
          style={{
            backgroundColor: "var(--surface-3)",
            color:           "var(--text-muted)",
          }}
        >
          {group.rows.length}
        </span>
      </button>

      {/* Grant rows */}
      {isExpanded && (
        <div className="ml-4 border-l" style={{ borderColor: "var(--border-subtle)" }}>
          {group.rows.map((perm) => (
            <div
              key={perm.id}
              className={cn(
                "flex items-center gap-3 px-4 py-2",
                "border-b last:border-b-0",
                "hover:bg-[var(--surface-2)] transition-colors duration-75"
              )}
              style={{ borderColor: "var(--border-subtle)" }}
            >
              {/* Action */}
              <span
                className="min-w-0 flex-1 font-mono text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {perm.action}
              </span>

              {/* Granted date */}
              <span
                className="hidden shrink-0 text-xs sm:block"
                style={{ color: "var(--text-muted)" }}
              >
                {new Date(perm.grantedAt).toLocaleDateString()}
              </span>

              {/* Status */}
              <div className="shrink-0">
                {perm.revokedAt ? (
                  <RevokedBadge date={perm.revokedAt} />
                ) : (
                  <span
                    className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs"
                    style={{
                      backgroundColor: "var(--success-bg)",
                      color:           "var(--success-fg)",
                    }}
                  >
                    <Shield size={10} strokeWidth={1.5} />
                    {t("status.active")}
                  </span>
                )}
              </div>

              {/* Actions — revoke is only offered for still-active grants */}
              <div className="ml-auto shrink-0" onClick={(e): void => e.stopPropagation()}>
                {!perm.revokedAt && (
                  <Button
                    variant={BUTTON_VARIANT.GHOST}
                    size="sm"
                    onClick={() => onRevoke(perm)}
                    aria-label={t("users.detail.revoke")}
                    title={t("users.detail.revoke")}
                    style={{ color: "var(--danger-fg)" }}
                  >
                    <ShieldOff size={13} strokeWidth={1.5} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
