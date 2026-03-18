import { type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { Button, BUTTON_VARIANT } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useDeleteCategory } from "@/hooks/mutations/useCategoryMutations";
import type { Category } from "@/types/category.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CategoryActionsProps {
  category: Category;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoryActions({ category }: CategoryActionsProps): ReactElement {
  const { t } = useTranslation();
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const deleteMutation = useDeleteCategory();

  const handleDelete = (): void => {
    deleteMutation.mutate(
      { id: category.id, clientId: category.clientId },
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
          aria-label={t("categories.actions.delete")}
          title={t("categories.actions.delete")}
          style={{ color: "var(--danger-fg)" }}
        >
          <Trash2 size={13} strokeWidth={1.5} />
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t("categories.actions.deleteTitle")}
        description={t("categories.actions.deleteConfirm")}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}