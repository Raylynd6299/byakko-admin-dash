import { ReactElement, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button, BUTTON_VARIANT } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { UserForm } from "@/components/users/components/user-form";
import { useUpdateUser, useDeleteUser } from "@/hooks/mutations/useUserMutations";
import type { User } from "@/types/user.types";
import type { EditUserFormValues } from "@/schemas/user.schema";

// ─── Props ────────────────────────────────────────────────────────────────────

interface UserActionsProps {
  user: User;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UserActions({ user }: UserActionsProps): ReactElement {
  const [editOpen,   setEditOpen]   = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const handleEdit = (values: EditUserFormValues): void => {
    updateMutation.mutate(
      {
        id:       user.id,
        clientId: user.clientId,
        input:    {
          firstName: values.firstName || undefined,
          lastName:  values.lastName  || undefined,
        },
      },
      { onSuccess: () => setEditOpen(false) }
    );
  };

  const handleDelete = (): void => {
    deleteMutation.mutate(
      { id: user.id, clientId: user.clientId },
      { onSuccess: () => setDeleteOpen(false) }
    );
  };

  return (
    <>
      <div
        className="flex items-center justify-end gap-1"
        onClick={(e): void => e.stopPropagation()}
      >
        {/* Edit */}
        <Button
          variant={BUTTON_VARIANT.GHOST}
          size="sm"
          onClick={() => setEditOpen(true)}
          aria-label="Edit user"
          title="Edit"
        >
          <Pencil size={13} strokeWidth={1.5} />
        </Button>

        {/* Delete */}
        <Button
          variant={BUTTON_VARIANT.GHOST}
          size="sm"
          onClick={() => setDeleteOpen(true)}
          aria-label="Delete user"
          title="Delete"
          style={{ color: "var(--danger-fg)" }}
        >
          <Trash2 size={13} strokeWidth={1.5} />
        </Button>
      </div>

      {/* Edit dialog */}
      <UserForm
        mode="edit"
        user={user}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEdit}
        isLoading={updateMutation.isPending}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Delete "${user.email}"?`}
        description="This will permanently delete the user and revoke all their permissions. This action cannot be undone."
        confirmLabel="Delete User"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}