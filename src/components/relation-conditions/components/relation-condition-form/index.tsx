import { type ReactElement, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, type SelectOption } from "@/components/ui/select";
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
  const { t } = useTranslation();

  const options: SelectOption<string>[] = [
    { value: "", label: t("relationConditions.create.selectClient") },
    ...clients.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
        {t("clients.client")}
      </label>
      <div style={error ? { backgroundColor: "var(--danger-bg)" } : undefined}>
        <Select
          value={value}
          options={options}
          onChange={onChange}
          disabled={disabled}
          aria-label={t("clients.client")}
          buttonClassName={error ? "border-[var(--danger)]" : undefined}
        />
      </div>
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
  const { t } = useTranslation();

  const eligiblePermissions = useMemo(() => {
    if (!clientId) return [];
    return permissions.filter((p) => p.clientId === clientId);
  }, [permissions, clientId]);

  const options: SelectOption<string>[] = [
    { value: "", label: t("relationConditions.create.selectPermission") },
    ...eligiblePermissions.map((p) => ({ value: p.id, label: p.action })),
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
        {t("relationConditions.permission")}
      </label>
      <Select
        value={value}
        options={options}
        onChange={onChange}
        disabled={disabled || !clientId}
        aria-label={t("relationConditions.permission")}
      />
      {!clientId && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {t("relationConditions.create.selectClient")}
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
  const { t } = useTranslation();

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
      title={t("relationConditions.create.title")}
      description={t("relationConditions.create.description")}
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
            form="relation-condition-create-form"
            size="sm"
            isLoading={isLoading}
          >
            {t("relationConditions.create.createButton")}
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
          label={t("relationConditions.conditionKey")}
          placeholder="user_id"
          hint={t("relationConditions.create.keyHint")}
          error={errors.conditionKey?.message}
          disabled={isLoading}
          {...register("conditionKey")}
        />

        <Input
          label={t("relationConditions.description")}
          placeholder={t("relationConditions.create.descriptionPlaceholder")}
          error={errors.description?.message}
          disabled={isLoading}
          {...register("description")}
        />
      </form>
    </Dialog>
  );
}