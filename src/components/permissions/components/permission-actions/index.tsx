import { type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { Button, BUTTON_VARIANT } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useDeletePermission } from "@/hooks/mutations/usePermissionMutations";
import type { Permission } from "@/types/permission.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface PermissionActionsProps {
  permission: Permission;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PermissionActions({ permission }: PermissionActionsProps): ReactElement {
  const { t } = useTranslation();
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const deleteMutation = useDeletePermission();

  const handleDelete = (): void => {
    deleteMutation.mutate(
      { id: permission.id, clientId: permission.clientId },
      { onSuccess: () => setDeleteOpen(false) }
    );
  };

  return (
    <>
      <div
        className="flex items-center justify-end gap-1"
        onClick={(e): void => e.stopPropagation()}
      >
        <Button
          variant={BUTTON_VARIANT.GHOST}
          size="sm"
          onClick={() => setDeleteOpen(true)}
          aria-label={t("permissions.actions.delete")}
          title={t("permissions.actions.delete")}
          style={{ color: "var(--danger-fg)" }}
        >
          <Trash2 size={13} strokeWidth={1.5} />
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t("permissions.actions.deleteTitle")}
        description={t("permissions.actions.deleteConfirm")}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}