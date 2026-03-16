import { ReactElement, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createUserSchema,
  editUserSchema,
  type CreateUserFormValues,
  type EditUserFormValues,
} from "@/schemas/user.schema";
import type { Client } from "@/types/client.types";
import type { User } from "@/types/user.types";

// ─── Mode discrimination ──────────────────────────────────────────────────────

interface CreateMode {
  mode:     "create";
  user?:    never;
  clients:  Client[];
  onSubmit: (values: CreateUserFormValues) => void;
}

interface EditMode {
  mode:     "edit";
  user:     User;
  clients?: never;
  onSubmit: (values: EditUserFormValues) => void;
}

type UserFormMode = CreateMode | EditMode;

// ─── Props ────────────────────────────────────────────────────────────────────

type UserFormProps = UserFormMode & {
  open:       boolean;
  onClose:    () => void;
  isLoading?: boolean;
};

// ─── Client Select (for create mode) ─────────────────────────────────────────

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

// ─── Create form ──────────────────────────────────────────────────────────────

function CreateForm({
  clients,
  onSubmit,
  onClose,
  isLoading,
}: {
  clients:    Client[];
  onSubmit:   (values: CreateUserFormValues) => void;
  onClose:    () => void;
  isLoading?: boolean;
}): ReactElement {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
  });

  const clientIdValue = watch("clientId");

  // Reset on unmount
  useEffect(() => (): void => { reset(); }, [reset]);

  return (
    <form
      id="user-create-form"
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
        label="Email"
        type="email"
        placeholder="user@example.com"
        error={errors.email?.message}
        disabled={isLoading}
        {...register("email")}
      />

      <Input
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        error={errors.password?.message}
        disabled={isLoading}
        {...register("password")}
      />

      <Input
        label="First Name"
        placeholder="John"
        error={errors.firstName?.message}
        disabled={isLoading}
        {...register("firstName")}
      />

      <Input
        label="Last Name"
        placeholder="Doe"
        error={errors.lastName?.message}
        disabled={isLoading}
        {...register("lastName")}
      />
    </form>
  );
}

// ─── Edit form ────────────────────────────────────────────────────────────────

function EditForm({
  user,
  onSubmit,
  onClose,
  isLoading,
}: {
  user:      User;
  onSubmit:  (values: EditUserFormValues) => void;
  onClose:   () => void;
  isLoading?: boolean;
}): ReactElement {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstName: user.firstName ?? "",
      lastName:  user.lastName ?? "",
    },
  });

  // Reset whenever the user changes
  useEffect(() => {
    reset({ firstName: user.firstName ?? "", lastName: user.lastName ?? "" });
  }, [user.id, reset, user.firstName, user.lastName]);

  return (
    <form
      id="user-edit-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      {/* Read-only email */}
      <div className="flex flex-col gap-1.5">
        <label
          className="text-xs font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          Email
        </label>
        <div
          className="rounded-md border px-3 py-2 text-sm"
          style={{
            backgroundColor: "var(--surface-3)",
            borderColor:     "var(--border-subtle)",
            color:           "var(--text-muted)",
          }}
        >
          {user.email}
        </div>
      </div>

      <Input
        label="First Name"
        placeholder="John"
        error={errors.firstName?.message}
        disabled={isLoading}
        {...register("firstName")}
      />

      <Input
        label="Last Name"
        placeholder="Doe"
        error={errors.lastName?.message}
        disabled={isLoading}
        {...register("lastName")}
      />
    </form>
  );
}

// ─── UserForm ─────────────────────────────────────────────────────────────────

export function UserForm({
  open,
  onClose,
  isLoading = false,
  ...modeProps
}: UserFormProps): ReactElement {
  const formId     = modeProps.mode === "create" ? "user-create-form" : "user-edit-form";
  const title      = modeProps.mode === "create" ? "New User" : `Edit ${modeProps.user.email}`;
  const submitLabel = modeProps.mode === "create" ? "Create User" : "Save Changes";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={
        modeProps.mode === "create"
          ? "Create a new user for a client."
          : "Update the user's profile information."
      }
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
            form={formId}
            size="sm"
            isLoading={isLoading}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      {modeProps.mode === "create" ? (
        <CreateForm
          clients={modeProps.clients}
          onSubmit={modeProps.onSubmit}
          onClose={onClose}
          isLoading={isLoading}
        />
      ) : (
        <EditForm
          user={modeProps.user}
          onSubmit={modeProps.onSubmit}
          onClose={onClose}
          isLoading={isLoading}
        />
      )}
    </Dialog>
  );
}