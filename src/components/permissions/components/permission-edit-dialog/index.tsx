import { type ReactElement, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconPicker } from "@/components/ui/icon-picker";
import { editPermissionSchema, type EditPermissionFormValues } from "@/schemas/permission.schema";
import type { Permission } from "@/types/permission.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface PermissionEditDialogProps {
  open:        boolean;
  onClose:     () => void;
  permission:  Permission;
  onSubmit:    (values: EditPermissionFormValues) => void;
  isLoading?:  boolean;
  error?:      string;
}

// ─── Component ────────────────────────────────────────────────────────────────

// A dedicated dialog, not inline row edit — the row is already a drag
// target once permission-ordering wires dnd-kit (PR3), and a row cannot
// cleanly be both a drag handle and a text field (D2).
export function PermissionEditDialog({
  open,
  onClose,
  permission,
  onSubmit,
  isLoading = false,
  error,
}: PermissionEditDialogProps): ReactElement {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditPermissionFormValues>({
    resolver: zodResolver(editPermissionSchema),
    defaultValues: { description: permission.description ?? "", icon: permission.icon ?? null },
  });

  const iconValue = watch("icon");

  // Reset to the current permission's description/icon each time the
  // dialog opens for a (possibly different) permission. A failed save
  // must NOT discard the admin's typed text, so this only runs on open,
  // not on every keystroke or re-render.
  useEffect(() => {
    if (open) reset({ description: permission.description ?? "", icon: permission.icon ?? null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, permission.id]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("permissions.edit.title")}
      description={t("permissions.edit.description", { action: permission.action })}
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="permission-edit-form"
            size="sm"
            isLoading={isLoading}
          >
            {t("common.save")}
          </Button>
        </>
      }
    >
      <form
        id="permission-edit-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <Input
          label={t("permissions.create.descriptionLabel")}
          placeholder={t("permissions.create.descriptionPlaceholder")}
          error={errors.description?.message}
          disabled={isLoading}
          {...register("description")}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            {t("permissions.icon")}
          </label>
          <IconPicker
            value={iconValue ?? null}
            onChange={(icon): void => setValue("icon", icon)}
            disabled={isLoading}
            aria-label={t("permissions.icon")}
          />
          {errors.icon && (
            <p className="text-xs" style={{ color: "var(--danger-fg)" }}>
              {errors.icon.message}
            </p>
          )}
        </div>

        {error && (
          <p className="text-xs" style={{ color: "var(--danger-fg)" }}>
            {error}
          </p>
        )}
      </form>
    </Dialog>
  );
}
