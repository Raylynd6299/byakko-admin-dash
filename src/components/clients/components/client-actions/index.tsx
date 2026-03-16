import { ReactElement, useState } from "react";
import { Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button, BUTTON_VARIANT } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ClientForm } from "@/components/clients/components/client-form";
import { useUpdateClient, useDeleteClient, useToggleClientActive } from "@/hooks/mutations/useClientMutations";
import type { Client } from "@/types/client.types";
import type { EditClientFormValues } from "@/schemas/client.schema";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ClientActionsProps {
  client: Client;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ClientActions({ client }: ClientActionsProps): ReactElement {
  const [editOpen,   setEditOpen]   = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();
  const toggleMutation = useToggleClientActive();

  const handleEdit = (values: EditClientFormValues): void => {
    updateMutation.mutate(
      {
        id:    client.id,
        input: {
          webhookUrl: values.webhookUrl || undefined,
          hmacSecret: values.hmacSecret || undefined,
        },
      },
      { onSuccess: () => setEditOpen(false) }
    );
  };

  const handleDelete = (): void => {
    deleteMutation.mutate(client.id, {
      onSuccess: () => setDeleteOpen(false),
    });
  };

  const handleToggle = (): void => {
    toggleMutation.mutate(client);
  };

  return (
    <>
      <div
        className="flex items-center justify-end gap-1"
        onClick={(e): void => e.stopPropagation()}
      >
        {/* Toggle active */}
        <Button
          variant={BUTTON_VARIANT.GHOST}
          size="sm"
          onClick={handleToggle}
          isLoading={toggleMutation.isPending}
          aria-label={client.isActive ? "Deactivate client" : "Activate client"}
          title={client.isActive ? "Deactivate" : "Activate"}
        >
          {client.isActive ? (
            <ToggleRight size={15} strokeWidth={1.5} style={{ color: "var(--success-fg)" }} />
          ) : (
            <ToggleLeft size={15} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
          )}
        </Button>

        {/* Edit */}
        <Button
          variant={BUTTON_VARIANT.GHOST}
          size="sm"
          onClick={() => setEditOpen(true)}
          aria-label="Edit client"
          title="Edit"
        >
          <Pencil size={13} strokeWidth={1.5} />
        </Button>

        {/* Delete */}
        <Button
          variant={BUTTON_VARIANT.GHOST}
          size="sm"
          onClick={() => setDeleteOpen(true)}
          aria-label="Delete client"
          title="Delete"
          style={{ color: "var(--danger-fg)" }}
        >
          <Trash2 size={13} strokeWidth={1.5} />
        </Button>
      </div>

      {/* Edit dialog */}
      <ClientForm
        mode="edit"
        client={client}
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
        title={`Delete "${client.name}"?`}
        description="This will permanently delete the client and revoke its API key. All associated data will be lost."
        confirmLabel="Delete Client"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
