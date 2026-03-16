import { ReactElement, useState } from "react";
import { Shield, ShieldOff } from "lucide-react";
import { DataTable, type Column } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button, BUTTON_VARIANT } from "@/components/ui/button";
import { useRevokePermission } from "@/hooks/mutations/useUserMutations";
import type { UserPermission } from "@/types/user.types";
import type { Permission } from "@/types/permission.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface UserPermissionListProps {
  permissions:     UserPermission[];
  permissionMap:   Map<string, Permission>; // permissionId → Permission
  userId:          string;
  clientId:        string;
  isLoading?:      boolean;
  isError?:        boolean;
  onRetry?:        () => void;
  onGrantClick?:   () => void;
}

// ─── Revoked badge ───────────────────────────────────────────────────────────

function RevokedBadge({ date }: { date: string }): ReactElement {
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs"
      style={{
        backgroundColor: "var(--danger-bg)",
        color:           "var(--danger-fg)",
      }}
    >
      <ShieldOff size={10} strokeWidth={1.5} />
      Revoked {new Date(date).toLocaleDateString()}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UserPermissionList({
  permissions,
  permissionMap,
  userId,
  clientId,
  isLoading,
  isError,
  onRetry,
  onGrantClick,
}: UserPermissionListProps): ReactElement {
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
      key:    "permission",
      header: "Permission",
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
      header: "Granted",
      width:  "w-32",
      render: (perm) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {new Date(perm.grantedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key:    "status",
      header: "Status",
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
            Active
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
              aria-label="Revoke permission"
              title="Revoke"
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
        emptyTitle="No permissions"
        emptyMessage="This user has no permissions granted yet."
        emptyIcon={Shield}
        emptyAction={
          onGrantClick ? (
            <Button size="sm" onClick={onGrantClick}>
              Grant Permission
            </Button>
          ) : undefined
        }
      />

      {/* Revoke confirm */}
      <ConfirmDialog
        open={Boolean(revokeId)}
        onClose={() => setRevokeId(null)}
        onConfirm={handleRevoke}
        title="Revoke Permission?"
        description={`This will remove access for permission "${permissionToRevoke?.permissionId ?? ""}". The user will no longer be able to perform this action.`}
        confirmLabel="Revoke"
        isLoading={revokeMutation.isPending}
      />
    </>
  );
}