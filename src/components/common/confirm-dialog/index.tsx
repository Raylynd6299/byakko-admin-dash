import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open:          boolean;
  onClose:       () => void;
  onConfirm:     () => void;
  title?:        string;
  description?:  string;
  confirmLabel?: string;
  isLoading?:    boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  isLoading = false,
}: ConfirmDialogProps): ReactElement {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("confirmDialog.title");
  const resolvedDescription = description ?? t("confirmDialog.description");
  const resolvedConfirmLabel = confirmLabel ?? t("confirmDialog.delete");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={resolvedTitle}
      description={resolvedDescription}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {resolvedConfirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {resolvedDescription}
      </p>
    </Dialog>
  );
}
