import { ReactElement, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPermissionSchema, type CreatePermissionFormValues } from "@/schemas/permission.schema";
import type { Client } from "@/types/client.types";
import type { Category } from "@/types/category.types";
import type { Permission } from "@/types/permission.types";

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

// ─── Category Select ───────────────────────────────────────────────────────────

interface CategorySelectProps {
  categories: Category[];
  clientId:   string | null;
  value:      string;
  onChange:   (value: string) => void;
  disabled?:  boolean;
}

function CategorySelect({ categories, clientId, value, onChange, disabled }: CategorySelectProps): ReactElement {
  const eligibleCategories = useMemo(() => {
    if (!clientId) return [];
    return categories.filter((c) => c.clientId === clientId);
  }, [categories, clientId]);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="categoryId"
        className="text-xs font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        Category
      </label>
      <select
        id="categoryId"
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
        <option value="">Select a category…</option>
        {eligibleCategories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.path} — {c.name}
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

export function PermissionForm({
  open,
  onClose,
  clients,
  categories,
  onSubmit,
  isLoading = false,
}: PermissionFormProps): ReactElement {
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
      title="New Permission"
      description="Create a new permission for a client and category."
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
            form="permission-create-form"
            size="sm"
            isLoading={isLoading}
          >
            Create Permission
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
          label="Action"
          placeholder="read:users"
          hint="Lowercase alphanumeric with : _ -"
          error={errors.action?.message}
          disabled={isLoading}
          {...register("action")}
        />
      </form>
    </Dialog>
  );
}