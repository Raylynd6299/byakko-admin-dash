import { type ReactElement, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Shield, SearchX } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRevokePermission } from "@/hooks/mutations/useUserMutations";
import { UserPermissionGroup } from "./components/user-permission-group";
import { buildUserGroups, filterUserPermissions } from "./helpers";
import type { UserPermission } from "@/types/user.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface UserPermissionListProps {
  permissions:           UserPermission[];
  userId:                string;
  clientId:              string;
  isLoading?:            boolean;
  isError?:              boolean;
  onRetry?:              () => void;
  onGrantClick?:         () => void;
  // Reports the post-filter (hide-revoked + search) row count upward, so
  // the page-level header count and this list's group headers derive from
  // the SAME computation and can never disagree (design §12).
  onVisibleCountChange?: (count: number) => void;
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ListSkeleton(): ReactElement {
  return (
    <div className="space-y-3 p-3">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-1">
          <div
            className="h-7 w-48 animate-pulse rounded-md"
            style={{ backgroundColor: "var(--surface-3)" }}
          />
          <div className="ml-6 space-y-1">
            {[1, 2].map((j) => (
              <div
                key={j}
                className="h-8 animate-pulse rounded"
                style={{ backgroundColor: "var(--surface-2)" }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UserPermissionList({
  permissions,
  userId,
  clientId,
  isLoading,
  isError,
  onRetry,
  onGrantClick,
  onVisibleCountChange,
}: UserPermissionListProps): ReactElement {
  const { t } = useTranslation();
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");
  // ON by default (design §12) — an admin auditing access should see the
  // active set first, not the full grant/revoke history.
  const [hideRevoked, setHideRevoked] = useState<boolean>(true);

  // Collapse state lifted here, same shape as the Permisos screen (§7):
  // COLLAPSED ids, `new Set(prev)` on toggle, derived expansion.
  const [collapsedIds, setCollapsedIds] = useState<ReadonlySet<string>>(new Set());

  const permissionToRevoke = permissions.find((p) => p.id === revokeId);
  const revokeMutation = useRevokePermission();

  const handleRevoke = (): void => {
    if (!permissionToRevoke) return;
    revokeMutation.mutate(
      {
        userId,
        input: {
          permissionId: permissionToRevoke.permissionId,
          clientId,
          byApi:         false,
        },
      },
      { onSuccess: () => setRevokeId(null) }
    );
  };

  const handleToggleCollapse = (categoryId: string): void => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const isFiltering = Boolean(query);
  const visibleRows = filterUserPermissions(permissions, { hideRevoked, query });
  const groups = buildUserGroups(visibleRows);

  // Reports the count upward whenever it changes. `visibleRows.length` (not
  // the array itself) is the dependency — only the count matters to the
  // caller, and this keeps the page header in sync with zero duplicated
  // filtering logic on the page side.
  useEffect(() => {
    onVisibleCountChange?.(visibleRows.length);
  }, [visibleRows.length, onVisibleCountChange]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
      >
        <ListSkeleton />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div
        className="rounded-xl border"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
      >
        <ErrorState onRetry={onRetry} />
      </div>
    );
  }

  // ── Empty (no grants at all) ─────────────────────────────────────────────
  if (permissions.length === 0) {
    return (
      <div
        className="rounded-xl border"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
      >
        <EmptyState
          icon={Shield}
          title={t("users.detail.noPermissions")}
          message={t("users.detail.noPermissionsGranted")}
          action={
            onGrantClick ? (
              <Button size="sm" onClick={onGrantClick}>
                {t("users.detail.grantPermission")}
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <>
      <div
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
      >
        {/* Search + hide-revoked toggle */}
        <div
          className="flex flex-wrap items-center gap-3 border-b px-4 py-2.5"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-2)" }}
        >
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("users.detail.searchPermissions")}
            leftIcon={<Search size={13} />}
            className="max-w-64 flex-1"
            aria-label={t("users.detail.searchPermissions")}
          />
          <label
            className="flex items-center gap-1.5 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <input
              type="checkbox"
              checked={hideRevoked}
              onChange={(e) => setHideRevoked(e.target.checked)}
            />
            {t("users.detail.hideRevoked")}
          </label>
        </div>

        {isFiltering && groups.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={t("permissions.search.noResultsTitle")}
            message={t("permissions.search.noResultsMessage", { query })}
            action={
              <Button variant="outline" size="sm" onClick={() => setQuery("")}>
                {t("permissions.search.clear")}
              </Button>
            }
          />
        ) : (
          <div className="p-2">
            {groups.map((group) => {
              // Matching groups auto-expand while filtering, derived —
              // never written to collapse state — so the admin's collapse
              // choice survives once the filter clears (§7/§12).
              const isExpanded = isFiltering ? true : !collapsedIds.has(group.categoryId);
              return (
                <UserPermissionGroup
                  key={group.categoryId}
                  group={group}
                  isExpanded={isExpanded}
                  onToggle={() => handleToggleCollapse(group.categoryId)}
                  onRevoke={(perm) => setRevokeId(perm.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Revoke confirm */}
      <ConfirmDialog
        open={Boolean(revokeId)}
        onClose={() => setRevokeId(null)}
        onConfirm={handleRevoke}
        title={t("users.detail.revokePermission")}
        description={t("users.detail.revokeConfirm")}
        isLoading={revokeMutation.isPending}
      />
    </>
  );
}
