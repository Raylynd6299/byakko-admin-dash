import { type ReactElement, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, type SelectOption } from "@/components/ui/select";
import { usePermissions } from "@/hooks/queries/usePermissions";
import { useGrantPermission } from "@/hooks/mutations/useUserMutations";
import { grantPermissionSchema, type GrantPermissionFormValues } from "@/schemas/user.schema";
import type { User } from "@/types/user.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface GrantPermissionDialogProps {
  open:        boolean;
  onClose:     () => void;
  user:        User;
  grantedKeys: Set<string>; // permissionIds already granted
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GrantPermissionDialog({
  open,
  onClose,
  user,
  grantedKeys,
}: GrantPermissionDialogProps): ReactElement {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string>("");

  const { data: allPermissions = [], isLoading } = usePermissions();

  // Filter by client
  const permissions = allPermissions.filter((p) => p.clientId === user.clientId);

  const grantMutation = useGrantPermission();

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) setSelectedId("");
  }, [open]);

  const { register, handleSubmit } = useForm<GrantPermissionFormValues>({
    resolver: zodResolver(grantPermissionSchema),
  });

  const onSubmit = (values: GrantPermissionFormValues): void => {
    grantMutation.mutate(
      {
        userId: user.id,
        input: {
          permissionId: values.permissionId,
          clientId:     user.clientId,
          byApi:        values.byApi ?? false,
        },
      },
      { onSuccess: () => onClose() }
    );
  };

  // Build select options - only show non-granted permissions
  const availablePermissions = permissions.filter((p) => !grantedKeys.has(p.id));

  const permissionOptions: SelectOption<string>[] = [
    { value: "", label: t("users.detail.selectPermission") },
    ...availablePermissions.map((p) => ({
      value: p.id,
      label: p.description ? `${p.action} — ${p.description}` : p.action,
    })),
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("users.detail.grantPermissionTitle")}
      description={t("users.detail.grantPermissionDescription", { email: user.email })}
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={grantMutation.isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="grant-permission-form"
            size="sm"
            isLoading={grantMutation.isPending}
            disabled={!selectedId}
          >
            {t("users.detail.grantButton")}
          </Button>
        </>
      }
    >
      <form
        id="grant-permission-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            {t("users.detail.permission")}
          </label>
          <Select
            value={selectedId}
            options={permissionOptions}
            onChange={setSelectedId}
            disabled={isLoading || grantMutation.isPending}
            aria-label={t("users.detail.permission")}
          />
          {permissions.some((p) => grantedKeys.has(p.id)) && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {t("users.detail.alreadyGranted")}
            </p>
          )}
        </div>

        {/* byApi checkbox - optional */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="byApi"
            className="h-4 w-4 rounded"
            style={{ accentColor: "var(--accent)" }}
            {...register("byApi")}
          />
          <label
            htmlFor="byApi"
            className="text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("users.detail.grantedViaApi")}
          </label>
        </div>
      </form>
    </Dialog>
  );
}