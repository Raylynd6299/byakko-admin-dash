import { type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { Button, BUTTON_VARIANT } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { StatusBadge } from "@/components/common/status-badge";
import { useDeleteRelationCondition } from "@/hooks/mutations/useRelationConditionMutations";
import type { RelationCondition } from "@/types/relation-condition.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface RelationConditionActionsProps {
  condition: RelationCondition;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RelationConditionActions({
  condition,
}: RelationConditionActionsProps): ReactElement {
  const { t } = useTranslation();
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const deleteMutation = useDeleteRelationCondition();

  const handleDelete = (): void => {
    deleteMutation.mutate(
      { id: condition.id, clientId: condition.clientId },
      { onSuccess: () => setDeleteOpen(false) }
    );
  };

  return (
    <>
      <div
        className="flex items-center justify-end gap-2"
        onClick={(e): void => e.stopPropagation()}
      >
        <StatusBadge status={condition.isActive} />
        <Button
          variant={BUTTON_VARIANT.GHOST}
          size="sm"
          onClick={() => setDeleteOpen(true)}
          aria-label={t("relationConditions.actions.delete")}
          title={t("relationConditions.actions.delete")}
          style={{ color: "var(--danger-fg)" }}
        >
          <Trash2 size={13} strokeWidth={1.5} />
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t("relationConditions.actions.deleteTitle")}
        description={t("relationConditions.actions.deleteConfirm")}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}