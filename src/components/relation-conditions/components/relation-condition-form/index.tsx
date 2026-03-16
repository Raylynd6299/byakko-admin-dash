import { ReactElement, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createRelationConditionSchema,
  type CreateRelationConditionFormValues,
} from "@/schemas/relation-condition.schema";
import type { Client } from "@/types/client.types";
import type { Permission } from "@/types/permission.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface RelationConditionFormProps {
  open:        boolean;
  onClose:     () => void;
  clients:     Client[];
  permissions: Permission[];
  onSubmit:    (values: CreateRelationConditionFormValues) => void;
  isLoading?:  boolean;
}

// ─── Client Select ─────────────────────────────────────────────────────────────

interface ClientSelectProps {
  clients:   Client[];
  value:     string;
  onChange:  (value: string) => void;
  error?:    string;
  disabled?: boolean;
}

function ClientSelect({ clients, value, onChange, error, disabled }: ClientSelectProps): ReactElement {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="clientId"
        className="text-xs font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        Client
      </label>
      <select
        id="clientId"
        value={value}
        onChange={(e): void => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors duration-150 focus:border-[var(--border-focus)]"
        style={{
          backgroundColor: error ? "var(--danger-bg)" : "var(--input-bg)",
          borderColor:     error ? "var(--danger)" : "var(--input-border)",
          color:           "var(--text-primary)",
        }}
      >
        <option value="">Select a client…</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs" style={{ color: "var(--danger-fg)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Permission Select ────────────────────────────────────────────────────────

interface PermissionSelectProps {
  permissions: Permission[];
  clientId:    string | null;
  value:       string;
  onChange:    (value: string) => void;
  disabled?:   boolean;
}

function PermissionSelect({
  permissions,
  clientId,
  value,
  onChange,
  disabled,
}: PermissionSelectProps): ReactElement {
  const eligiblePermissions = useMemo(() => {
    if (!clientId) return [];
    return permissions.filter((p) => p.clientId === clientId);
  }, [permissions, clientId]);

  return (
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
        value={value}
        onChange={(e): void => onChange(e.target.value)}
        disabled={disabled || !clientId}
        className="w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors duration-150 focus:border-[var(--border-focus)]"
        style={{
          backgroundColor: "var(--input-bg)",
          borderColor:     "var(--input-border)",
          color:           "var(--text-primary)",
        }}
      >
        <option value="">Select a permission…</option>
        {eligiblePermissions.map((p) => (
          <option key={p.id} value={p.id}>
            {p.action}
          </option>
        ))}
      </select>
      {!clientId && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Select a client first.
        </p>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RelationConditionForm({
  open,
  onClose,
  clients,
  permissions,
  onSubmit,
  isLoading = false,
}: RelationConditionFormProps): ReactElement {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateRelationConditionFormValues>({
    resolver: zodResolver(createRelationConditionSchema),
  });

  const clientIdValue     = watch("clientId");
  const permissionIdValue = watch("permissionId");

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  // Clear permissionId when clientId changes
  useEffect(() => {
    setValue("permissionId", "");
  }, [clientIdValue, setValue]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New Relation Condition"
      description="Create a condition key for a permission."
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="relation-condition-create-form"
            size="sm"
            isLoading={isLoading}
          >
            Create Condition
          </Button>
        </>
      }
    >
      <form
        id="relation-condition-create-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <ClientSelect
          clients={clients}
          value={clientIdValue ?? ""}
          onChange={(v): void => setValue("clientId", v)}
          error={errors.clientId?.message}
          disabled={isLoading}
        />

        <PermissionSelect
          permissions={permissions}
          clientId={clientIdValue ?? null}
          value={permissionIdValue ?? ""}
          onChange={(v): void => setValue("permissionId", v)}
          disabled={isLoading}
        />

        <Input
          label="Condition Key"
          placeholder="user_id"
          hint="Lowercase alphanumeric with _ -"
          error={errors.conditionKey?.message}
          disabled={isLoading}
          {...register("conditionKey")}
        />

        <Input
          label="Description"
          placeholder="Optional description"
          error={errors.description?.message}
          disabled={isLoading}
          {...register("description")}
        />
      </form>
    </Dialog>
  );
}