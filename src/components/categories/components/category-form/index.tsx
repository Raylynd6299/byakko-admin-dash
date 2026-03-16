import { ReactElement, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createCategorySchema, type CreateCategoryFormValues } from "@/schemas/category.schema";
import type { Client } from "@/types/client.types";
import type { Category } from "@/types/category.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CategoryFormProps {
  open:       boolean;
  onClose:    () => void;
  clients:    Client[];
  categories: Category[];        // all categories for parent select
  onSubmit:   (values: CreateCategoryFormValues) => void;
  isLoading?: boolean;
}

// ─── Client Select ─────────────────────────────────────────────────────────────

interface ClientSelectProps {
  clients:    Client[];
  value:      string;
  onChange:   (value: string) => void;
  error?:     string;
  disabled?:  boolean;
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

// ─── Parent Category Select ────────────────────────────────────────────────────

interface ParentSelectProps {
  categories: Category[];
  clientId:   string | null;
  value:      string;
  onChange:   (value: string) => void;
  disabled?:  boolean;
}

function ParentSelect({ categories, clientId, value, onChange, disabled }: ParentSelectProps): ReactElement {
  // Filter categories by client and group by parent
  const eligibleCategories = useMemo(() => {
    if (!clientId) return [];
    return categories.filter((c) => c.clientId === clientId);
  }, [categories, clientId]);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="parentId"
        className="text-xs font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        Parent Category
      </label>
      <select
        id="parentId"
        value={value}
        onChange={(e): void => onChange(e.target.value || undefined)}
        disabled={disabled || !clientId}
        className="w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors duration-150 focus:border-[var(--border-focus)]"
        style={{
          backgroundColor: "var(--input-bg)",
          borderColor:     "var(--input-border)",
          color:           "var(--text-primary)",
        }}
      >
        <option value="">None (root category)</option>
        {eligibleCategories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.path} — {c.name}
          </option>
        ))}
      </select>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        Optional. Create as a root category if not selected.
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
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
  });

  const clientIdValue = watch("clientId");
  const parentIdValue  = watch("parentId");

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  // Clear parentId when clientId changes
  useEffect(() => {
    setValue("parentId", undefined);
  }, [clientIdValue, setValue]);

  const handleParentChange = (value: string): void => {
    setValue("parentId", value || undefined);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New Category"
      description="Create a new permission category for a client."
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
            form="category-create-form"
            size="sm"
            isLoading={isLoading}
          >
            Create Category
          </Button>
        </>
      }
    >
      <form
        id="category-create-form"
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

        <Input
          label="Name"
          placeholder="Resource Management"
          error={errors.name?.message}
          disabled={isLoading}
          {...register("name")}
        />

        <Input
          label="Slug"
          placeholder="resource-management"
          hint="Lowercase alphanumeric with dashes"
          error={errors.slug?.message}
          disabled={isLoading}
          {...register("slug")}
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