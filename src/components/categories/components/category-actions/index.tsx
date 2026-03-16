import { ReactElement, useState } from "react";
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
          aria-label="Delete category"
          title="Delete"
          style={{ color: "var(--danger-fg)" }}
        >
          <Trash2 size={13} strokeWidth={1.5} />
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Delete "${category.name}"?`}
        description="This will permanently delete the category. Permissions using this category will lose their association."
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}