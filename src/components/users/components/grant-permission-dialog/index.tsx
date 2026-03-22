import { type ReactElement, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, type SelectOption } from "@/components/ui/select";
import { usePermissions } from "@/hooks/queries/usePermissions";
import { useCategories } from "@/hooks/queries/useCategories";
import { useGrantPermission } from "@/hooks/mutations/useUserMutations";
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

  const [categoryId, setCategoryId]     = useState<string>("");
  const [permissionId, setPermissionId] = useState<string>("");
  const [byApi, setByApi]               = useState<boolean>(false);

  const { data: allCategories = [] } = useCategories();
  const { data: allPermissions = [], isLoading } = usePermissions();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCategoryId("");
      setPermissionId("");
      setByApi(false);
    }
  }, [open]);

  // Reset permission selection whenever category changes
  useEffect(() => {
    setPermissionId("");
  }, [categoryId]);

  const grantMutation = useGrantPermission();

  // Narrow to this user's client
  const clientCategories = allCategories
    .filter((c) => c.clientId === user.clientId)
    .sort((a, b) => a.path.localeCompare(b.path));

  const clientPermissions = allPermissions.filter((p) => p.clientId === user.clientId);

  // Permissions for the selected category, excluding already-granted ones
  const availablePermissions = clientPermissions.filter(
    (p) => p.categoryId === categoryId && !grantedKeys.has(p.id)
  );

  // ── Select options ────────────────────────────────────────────────────────

  const categoryOptions: SelectOption<string>[] = [
    { value: "", label: t("users.detail.selectCategory") },
    ...clientCategories.map((c) => ({
      value: c.id,
      label: `${c.name} — ${c.slug}`,
    })),
  ];

  const permissionOptions: SelectOption<string>[] = [
    { value: "", label: t("users.detail.selectPermission") },
    ...availablePermissions.map((p) => ({
      value: p.id,
      label: p.description ? `${p.action} — ${p.description}` : p.action,
    })),
  ];

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleGrant = (): void => {
    if (!permissionId) return;

    grantMutation.mutate(
      {
        userId: user.id,
        input: {
          permissionId,
          clientId: user.clientId,
          byApi,
        },
      },
      { onSuccess: () => onClose() }
    );
  };

  const canGrant = Boolean(categoryId) && Boolean(permissionId);

  const hasNoPermissionsInCategory =
    Boolean(categoryId) &&
    clientPermissions.filter((p) => p.categoryId === categoryId).length > 0 &&
    availablePermissions.length === 0;

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
            size="sm"
            onClick={handleGrant}
            isLoading={grantMutation.isPending}
            disabled={!canGrant}
          >
            {t("users.detail.grantButton")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">

        {/* Step 1 — Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            {t("nav.categories")}
          </label>
          <Select
            value={categoryId}
            options={categoryOptions}
            onChange={setCategoryId}
            disabled={isLoading || grantMutation.isPending}
            aria-label={t("nav.categories")}
          />
        </div>

        {/* Step 2 — Permission (only when category selected) */}
        {categoryId && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              {t("users.detail.permission")}
            </label>
            {hasNoPermissionsInCategory ? (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {t("users.detail.allPermissionsGranted")}
              </p>
            ) : (
              <Select
                value={permissionId}
                options={permissionOptions}
                onChange={setPermissionId}
                disabled={isLoading || grantMutation.isPending}
                aria-label={t("users.detail.permission")}
              />
            )}
          </div>
        )}

        {/* byApi checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="grant-by-api"
            checked={byApi}
            onChange={(e) => setByApi(e.target.checked)}
            className="h-4 w-4 rounded"
            style={{ accentColor: "var(--accent)" }}
          />
          <label
            htmlFor="grant-by-api"
            className="text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("users.detail.grantedViaApi")}
          </label>
        </div>

      </div>
    </Dialog>
  );
}
