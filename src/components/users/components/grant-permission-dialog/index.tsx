import { ReactElement, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/queries/usePermissions";
import { useGrantPermission } from "@/hooks/mutations/useUserMutations";
import { grantPermissionSchema, type GrantPermissionFormValues } from "@/schemas/user.schema";
import type { User, UserPermission } from "@/types/user.types";
import type { Permission } from "@/types/permission.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface GrantPermissionDialogProps {
  open:        boolean;
  onClose:     () => void;
  user:        User;
  grantedKeys: Set<string>; // permissionIds already granted
}

// ─── Permission Option ─────────────────────────────────────────────────────────

function PermissionOption({ perm, disabled }: { perm: Permission; disabled: boolean }): ReactElement {
  return (
    <option
      key={perm.id}
      value={perm.id}
      disabled={disabled}
    >
      {perm.action} {perm.description ? `— ${perm.description}` : ""}
    </option>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GrantPermissionDialog({
  open,
  onClose,
  user,
  grantedKeys,
}: GrantPermissionDialogProps): ReactElement {
  const [selectedId, setSelectedId] = useState<string>("");

  const { data: allPermissions = [], isLoading } = usePermissions();

  // Filter by client
  const permissions = allPermissions.filter((p) => p.clientId === user.clientId);

  const grantMutation = useGrantPermission();

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) setSelectedId("");
  }, [open]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GrantPermissionFormValues>({
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

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedId(e.target.value);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Grant Permission"
      description={`Grant a permission to ${user.email}`}
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={grantMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="grant-permission-form"
            size="sm"
            isLoading={grantMutation.isPending}
            disabled={!selectedId}
          >
            Grant
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
          <label
            htmlFor="permissionId"
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Permission
          </label>
          <select
            id="permissionId"
            value={selectedId}
            onChange={handleSelectChange}
            disabled={isLoading || grantMutation.isPending}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors duration-150 focus:border-[var(--border-focus)]"
            style={{
              backgroundColor: errors.permissionId ? "var(--danger-bg)" : "var(--input-bg)",
              borderColor:     errors.permissionId ? "var(--danger)" : "var(--input-border)",
              color:           "var(--text-primary)",
            }}
            {...register("permissionId")}
          >
            <option value="">Select a permission…</option>
            {permissions.map((p) => (
              <PermissionOption
                key={p.id}
                perm={p}
                disabled={grantedKeys.has(p.id)}
              />
            ))}
          </select>
          {errors.permissionId && (
            <p className="text-xs" style={{ color: "var(--danger-fg)" }}>
              {errors.permissionId.message}
            </p>
          )}
          {permissions.some((p) => grantedKeys.has(p.id)) && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Grayed-out permissions are already granted.
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
            Granted via API (not by a user)
          </label>
        </div>
      </form>
    </Dialog>
  );
}