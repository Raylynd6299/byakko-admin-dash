import { type ReactElement, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, type SelectOption } from "@/components/ui/select";
import { createPermissionSchema, type CreatePermissionFormValues } from "@/schemas/permission.schema";
import type { Client } from "@/types/client.types";
import type { Category } from "@/types/category.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface PermissionFormProps {
  open:        boolean;
  onClose:     () => void;
  clients:     Client[];
  categories:  Category[];
  onSubmit:    (values: CreatePermissionFormValues) => void;
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
    { value: "", label: t("permissions.create.selectClient") },
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

// ─── Category Select ───────────────────────────────────────────────────────────

interface CategorySelectProps {
  categories: Category[];
  clientId:   string | null;
  value:      string;
  onChange:   (value: string) => void;
  disabled?:  boolean;
}

function CategorySelect({ categories, clientId, value, onChange, disabled }: CategorySelectProps): ReactElement {
  const { t } = useTranslation();

  const eligibleCategories = useMemo(() => {
    if (!clientId) return [];
    return categories.filter((c) => c.clientId === clientId);
  }, [categories, clientId]);

  const options: SelectOption<string>[] = [
    { value: "", label: t("permissions.create.selectCategory") },
    ...eligibleCategories.map((c) => ({ value: c.id, label: `${c.path} — ${c.name}` })),
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
        {t("categories.title")}
      </label>
      <Select
        value={value}
        options={options}
        onChange={onChange}
        disabled={disabled || !clientId}
        aria-label={t("categories.title")}
      />
      {!clientId && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {t("permissions.create.selectClient")}
        </p>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PermissionForm({
  open,
  onClose,
  clients,
  categories,
  onSubmit,
  isLoading = false,
}: PermissionFormProps): ReactElement {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreatePermissionFormValues>({
    resolver: zodResolver(createPermissionSchema),
  });

  const clientIdValue   = watch("clientId");
  const categoryIdValue = watch("categoryId");

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  // Clear categoryId when clientId changes
  useEffect(() => {
    setValue("categoryId", "");
  }, [clientIdValue, setValue]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("permissions.create.title")}
      description={t("permissions.create.description")}
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
            form="permission-create-form"
            size="sm"
            isLoading={isLoading}
          >
            {t("permissions.create.createButton")}
          </Button>
        </>
      }
    >
      <form
        id="permission-create-form"
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

        <CategorySelect
          categories={categories}
          clientId={clientIdValue ?? null}
          value={categoryIdValue ?? ""}
          onChange={(v): void => setValue("categoryId", v)}
          disabled={isLoading}
        />

        <Input
          label={t("permissions.action")}
          placeholder="read:users"
          hint={t("permissions.create.actionHint")}
          error={errors.action?.message}
          disabled={isLoading}
          {...register("action")}
        />

        <Input
          label={t("permissions.create.descriptionLabel")}
          placeholder={t("permissions.create.descriptionPlaceholder")}
          error={errors.description?.message}
          disabled={isLoading}
          {...register("description")}
        />
      </form>
    </Dialog>
  );
}