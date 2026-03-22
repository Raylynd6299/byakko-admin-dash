import { type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { Shield, ShieldOff } from "lucide-react";
import { DataTable, type Column } from "@/components/common/data-table";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button, BUTTON_VARIANT } from "@/components/ui/button";
import { useRevokePermission } from "@/hooks/mutations/useUserMutations";
import { RevokedBadge } from "./components/revoked-badge";
import type { UserPermission } from "@/types/user.types";
import type { Permission } from "@/types/permission.types";
import type { Category } from "@/types/category.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface UserPermissionListProps {
  permissions:     UserPermission[];
  permissionMap:   Map<string, Permission>;
  categoryMap:     Map<string, Category>;
  userId:          string;
  clientId:        string;
  isLoading?:      boolean;
  isError?:        boolean;
  onRetry?:        () => void;
  onGrantClick?:   () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UserPermissionList({
  permissions,
  permissionMap,
  categoryMap,
  userId,
  clientId,
  isLoading,
  isError,
  onRetry,
  onGrantClick,
}: UserPermissionListProps): ReactElement {
  const { t } = useTranslation();
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const permissionToRevoke = permissions.find((p) => p.id === revokeId);

  const revokeMutation = useRevokePermission();

  const handleRevoke = (): void => {
    if (!permissionToRevoke) return;
    revokeMutation.mutate(
      {
        userId,
        input: {
          permissionId:     permissionToRevoke.permissionId,
          clientId,
          byApi:            false,
        },
      },
      { onSuccess: () => setRevokeId(null) }
    );
  };

  // ─── Columns ──────────────────────────────────────────────────────────────

  const columns: Column<UserPermission>[] = [
    {
      key:    "category",
      header: t("nav.categories"),
      width:  "w-40",
      render: (perm) => {
        const detail   = permissionMap.get(perm.permissionId);
        const category = detail ? categoryMap.get(detail.categoryId) : undefined;
        return (
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {category?.name ?? "—"}
          </span>
        );
      },
    },
    {
      key:    "permission",
      header: t("users.detail.permission"),
      render: (perm) => {
        const detail = permissionMap.get(perm.permissionId);
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
              {detail?.action ?? perm.permissionId}
            </span>
            {detail?.description && (
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {detail.description}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key:    "granted",
      header: t("users.detail.granted"),
      width:  "w-32",
      render: (perm) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {new Date(perm.grantedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key:    "status",
      header: t("users.detail.status"),
      width:  "w-28",
      render: (perm) =>
        perm.revokedAt ? (
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
        ),
    },
    {
      key:    "actions",
      header: "",
      width:  "w-20",
      render: (perm) =>
        perm.revokedAt ? null : (
          <div onClick={(e): void => e.stopPropagation()}>
            <Button
              variant={BUTTON_VARIANT.GHOST}
              size="sm"
              onClick={() => setRevokeId(perm.id)}
              aria-label={t("users.detail.revoke")}
              title={t("users.detail.revoke")}
              style={{ color: "var(--danger-fg)" }}
            >
              <ShieldOff size={13} strokeWidth={1.5} />
            </Button>
          </div>
        ),
    },
  ];

  return (
    <>
      <DataTable<UserPermission>
        data={permissions}
        columns={columns}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
        emptyTitle={t("users.detail.noPermissions")}
        emptyMessage={t("users.detail.noPermissionsGranted")}
        emptyIcon={Shield}
        emptyAction={
          onGrantClick ? (
            <Button size="sm" onClick={onGrantClick}>
              {t("users.detail.grantPermission")}
            </Button>
          ) : undefined
        }
      />

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