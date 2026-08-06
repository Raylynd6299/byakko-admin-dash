import { type ReactElement, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, type SelectOption } from "@/components/ui/select";
import { slugify } from "@/lib/slugify";
import { createCategorySchema, type CreateCategoryFormValues } from "@/schemas/category.schema";
import type { Client } from "@/types/client.types";
import type { Category } from "@/types/category.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CategoryFormProps {
  open:       boolean;
  onClose:    () => void;
  clients:    Client[];
  categories: Category[];        // all categories for parent select
  onSubmit:   (values: CreateCategoryFormValues) => Promise<void>;
  isLoading?: boolean;
}

// ─── Select wrappers ────────────────────────────────────────────────────────

interface ClientSelectProps {
  clients:    Client[];
  value:      string;
  onChange:   (value: string) => void;
  error?:     string;
  disabled?:  boolean;
}

function ClientSelect({ clients, value, onChange, error, disabled }: ClientSelectProps): ReactElement {
  const { t } = useTranslation();

  const options: SelectOption<string>[] = [
    { value: "", label: t("categories.create.selectClient") },
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

// ─── Parent Category Select ────────────────────────────────────────────────────

interface ParentSelectProps {
  categories: Category[];
  clientId:   string | null;
  value:      string;
  onChange:   (value: string) => void;
  disabled?:  boolean;
}

// Existing useMemo below is recorded debt (R4) — not extended, not
// mirrored, not removed as part of adding search.
function ParentSelect({ categories, clientId, value, onChange, disabled }: ParentSelectProps): ReactElement {
  const { t } = useTranslation();

  // Filter categories by client
  const eligibleCategories = useMemo(() => {
    if (!clientId) return [];
    return categories.filter((c) => c.clientId === clientId);
  }, [categories, clientId]);

  const options: SelectOption<string>[] = [
    { value: "", label: t("categories.create.none") },
    ...eligibleCategories.map((c) => ({ value: c.id, label: `${c.path} — ${c.name}` })),
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
        {t("categories.create.parent")}
      </label>
      <Select
        // Remounts on client change — the cheapest way to guarantee the
        // Select's internal filter text is cleared alongside parentId
        // without adding a controlled-filter prop to the shared primitive.
        key={clientId ?? "no-client"}
        value={value}
        options={options}
        onChange={onChange}
        disabled={disabled || !clientId}
        aria-label={t("categories.create.parent")}
        searchable
      />
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {t("categories.create.parentHint")}
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoryForm({
  open,
  onClose,
  clients,
  categories,
  onSubmit,
  isLoading = false,
}: CategoryFormProps): ReactElement {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
  });

  const clientIdValue = watch("clientId");
  const parentIdValue  = watch("parentId");

  // Once the admin edits the slug manually, name changes must never
  // overwrite it — an explicit keystroke is a stronger signal of intent
  // than a value inferred from another field.
  const [slugTouched, setSlugTouched] = useState<boolean>(false);

  // Reset form when dialog closes; the touched flag is per form
  // instance and must reset when the form is reopened.
  useEffect(() => {
    if (!open) {
      reset();
      setSlugTouched(false);
    }
  }, [open, reset]);

  // Clear parentId when clientId changes
  useEffect(() => {
    setValue("parentId", undefined);
  }, [clientIdValue, setValue]);

  const handleParentChange = (value: string): void => {
    setValue("parentId", value || undefined);
  };

  const handleFormSubmit = async (values: CreateCategoryFormValues): Promise<void> => {
    try {
      await onSubmit(values);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        const body: unknown = err.response.data;
        const message =
          body && typeof body === "object" && "message" in body && typeof body.message === "string"
            ? body.message
            : t("categories.create.slugConflict");
        setError("slug", { message });
        return;
      }
      throw err;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("categories.create.title")}
      description={t("categories.create.description")}
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
            form="category-create-form"
            size="sm"
            isLoading={isLoading}
          >
            {t("categories.create.createButton")}
          </Button>
        </>
      }
    >
      <form
        id="category-create-form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex flex-col gap-4"
      >
        <ClientSelect
          clients={clients}
          value={clientIdValue ?? ""}
          onChange={(v): void => setValue("clientId", v)}
          error={errors.clientId?.message}
          disabled={isLoading}
        />

        <Input
          label={t("categories.name")}
          placeholder="Resource Management"
          error={errors.name?.message}
          disabled={isLoading}
          {...register("name", {
            onChange: (e: React.ChangeEvent<HTMLInputElement>): void => {
              if (!slugTouched) {
                setValue("slug", slugify(e.target.value), { shouldValidate: false });
              }
            },
          })}
        />

        <Input
          label={t("categories.slug")}
          placeholder="resource-management"
          hint={t("categories.create.title")}
          error={errors.slug?.message}
          disabled={isLoading}
          {...register("slug", {
            // Clearing the slug to empty is the escape hatch: it
            // re-enables auto-fill on the next name keystroke.
            onChange: (e: React.ChangeEvent<HTMLInputElement>): void => {
              setSlugTouched(e.target.value !== "");
            },
          })}
        />

        <ParentSelect
          categories={categories}
          clientId={clientIdValue ?? null}
          value={parentIdValue ?? ""}
          onChange={handleParentChange}
          disabled={isLoading}
        />
      </form>
    </Dialog>
  );
}
