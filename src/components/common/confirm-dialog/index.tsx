import { ReactElement } from "react";
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
  title        = "Are you sure?",
  description  = "This action cannot be undone.",
  confirmLabel = "Delete",
  isLoading    = false,
}: ConfirmDialogProps): ReactElement {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {description}
      </p>
    </Dialog>
  );
}
